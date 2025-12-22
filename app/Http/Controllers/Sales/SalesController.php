<?php

namespace App\Http\Controllers\Sales;

use App\Events\LowStockEvent;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\{Sale, Product, Customer, User};
use Illuminate\Support\Facades\{Auth, DB};
use Carbon\Carbon; //Carbon is a PHP library for working with dates and times
use Barryvdh\DomPDF\Facade\Pdf; //this is a facade for the dompdf library

class SalesController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', Sale::class);

        $user = Auth::user();

        $sales = Sale::with(['customer', 'items.product'])
            ->when($user->role !== 'admin', function ($query) use ($user) {
                //salesperson only sees their own sales
                $query->where('user_id', $user->id);
            })
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('sale_number', 'like', "%{$search}%")
                        ->orWhereHas('customer', fn($c) => $c->where('name', 'like', "%{$search}%"));
                });
            })

            ->orderBy('id', 'desc')
            ->paginate(5)
            ->withQueryString();

        $sales->getCollection()->transform(function ($sale) { //transform() will modify the collection into
            return [
                'id' => $sale->id,
                'sale_id' => $sale->sale_number,
                'customer_name' => $sale->customer?->name ?? 'Walk-in Customer',
                'date' => $sale->created_at->format('Y-m-d'),
                'items_count' => $sale->items->count(),
                'items_summary' => $sale->items->map(fn($item) => $item->product->name . ' x' . $item->quantity)->join(', '),
                'total_price' => $sale->total_price,
                'status' => $sale->status,

            ];
        });


        return Inertia::render("sales/Sales", [
            "sales" => $sales,
            "search" => $request->search,
            "flash" => [
                'success' => session('success')
            ]
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $this->authorize('create', Sale::class);

        return Inertia::render("sales/AddSales", [
            "products" => Product::all(),
            "customers" => Customer::all(),
            "users" => User::all(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */

    public function store(Request $request)
    {

        $this->authorize('create', Sale::class);

        $validated = $request->validate([
            'customer_id' => 'nullable|exists:customers,id',
            'user_id' => 'required|exists:users,id',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        return DB::transaction(function () use ($validated, $request) {

            // Generate sale number
            $nextId = Sale::max('id') + 1;
            $saleNumber = 'SALE-' . str_pad($nextId, 5, '0', STR_PAD_LEFT);

            // Create the sale record
            $sale = Sale::create([
                'sale_number' => $saleNumber,
                'customer_id' => $validated['customer_id'] ?? null,
                'user_id' => Auth::user()->role === 'admin'
                    ? $validated['user_id']
                    : Auth::id(),
                'status' => $request->input('status', 'Pending'),
                'total_price' => 0
            ]);

            $total = 0;

            foreach ($validated['items'] as $item) {

                // Lock the product to avoid race conditions
                $product = Product::lockForUpdate()->findOrFail($item['product_id']);

                // Check if stock is enough
                if ($item['quantity'] > $product->stock) {
                    throw \Illuminate\Validation\ValidationException::withMessages([
                        'items' => ["Insufficient stock for {$product->name} (Available: {$product->stock})"]
                    ]);
                }

                $price = $product->price;
                $subtotal = $price * $item['quantity'];

                // Create the item under the sale
                $sale->items()->create([
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'price' => $price,
                    'subtotal' => $subtotal
                ]);

                //stock logging, so old stock info is needed
                $oldStock = $product->stock;

                // Deduct stock
                $product->stock -= $item['quantity'];
                $product->save();

                app(\App\Services\StockService::class)->record(
                    $product,
                    $oldStock,
                    $product->stock,
                    'sale',
                    "Stock deducted because of Sale {$sale->sale_number}"
                );

                $total += $subtotal;

            }

            // Update final sale total
            $sale->update(['total_price' => $total]);

            return redirect()->route('sales.index')
                ->with('success', 'Sale created successfully.');


        });
    }

    /**
     * Display the specified resource.
     */
    public function show(Sale $sale)
    {
        $this->authorize('view', $sale);
        return $sale->load('items.product', 'customer', 'user');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Sale $sale)
    {
        $this->authorize('delete', $sale);

        $sale->delete();
        return redirect()->back()
            ->with('success', 'Sale deleted successfully.');
    }

    private function fetchWeeklySales()
    {
        return DB::table('sales')
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('SUM(total_price) as total'))
            ->where('created_at', '>=', Carbon::now()->subDays(6)) //this will get the last 7 days. Also, here carbon is used to get the current date and time.
            ->groupBy(DB::raw('DATE(created_at)'))
            ->orderBy('date')
            ->get();
    }

    private function fetchMonthlySales($year)
    {
        return DB::table('sales')
            ->select(
                DB::raw('DATE_FORMAT(created_at, "%Y-%m") as month'),
                DB::raw('SUM(total_price) as total')
            )
            ->whereYear('created_at', $year)
            ->groupBy(DB::raw('DATE_FORMAT(created_at, "%Y-%m")'))
            ->orderBy('month', 'asc')
            ->get();
    }

    private function fetchYearlySales()
    {
        return DB::table('sales')
            ->select(
                DB::raw('YEAR(created_at) as year'),
                DB::raw('SUM(total_price) as total')
            )
            ->groupBy(DB::raw('YEAR(created_at)'))
            ->orderBy('year', 'asc')
            ->get();
    }

    //for the custom range
    private function fetchCustomRangeSales($start, $end)
    {
        return DB::table('sales')
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(total_price) as total')
            )
            ->whereDate('created_at', '>=', $start)
            ->whereDate('created_at', '<=', $end)
            ->groupBy(DB::raw('DATE(created_at)'))
            ->orderBy('date', 'asc')
            ->get();
    }

    public function getWeeklySales()
    {
        return response()->json($this->fetchWeeklySales());
    }

    public function getMonthlySales($year)
    {
        return response()->json($this->fetchMonthlySales($year));
    }

    public function getYearlySales()
    {
        return response()->json($this->fetchYearlySales());
    }

    public function getCustomSales(Request $request)
    {
        $request->validate([
            'start' => 'required|date',
            'end' => 'required|date|after_or_equal:start'
        ]);

        $start = $request->start;
        $end = $request->end;

        return response()->json(
            $this->fetchCustomRangeSales($start, $end)
        );
    }

    public function availableYears()
    {
        $years = Sale::selectRaw('YEAR(created_at) as year')
            ->distinct()
            ->orderBy('year', 'desc')
            ->pluck('year');

        return response()->json($years);
    }

    public function exportSalesPdf($period, $year = null, Request $request)
    {
        if ($period === "weekly") {
            $data = $this->fetchWeeklySales();
        } elseif ($period === "monthly") {
            $data = $this->fetchMonthlySales($year);
        } elseif ($period === "yearly") {
            $data = $this->fetchYearlySales();
        } elseif ($period === "custom") {
            $request->validate([
                'start' => 'required|date',
                'end' => 'required|date|after_or_equal:start'
            ]);

            $data = $this->fetchCustomRangeSales($request->start, $request->end);
        }

        //ensure that all rows behave like objects in Blade
        $data = collect($data)->map(function ($row) {
            if (isset($row->date)) {
                $row->date = Carbon::createFromFormat('Y-m-d', $row->date);
            }
            return (object) $row;
        });

        $pdf = PDF::loadview('reports.sales', [
            'data' => $data,
            'period' => $period
        ]);

        return $pdf->download("sales_report_{$period}.pdf");
    }

    //function to get the top selling products
    public function topProducts()
    {
        $data = DB::table('sale_items')
            ->join('products', 'sale_items.product_id', '=', 'products.id')
            ->join('sales', 'sale_items.sale_id', '=', 'sales.id')
            ->where('sales.created_at', '>=', now()->subDays(30))
            ->select(
                'products.name as product_name',
                DB::raw('SUM(sale_items.quantity) as total_qty')
            )
            ->groupBy('products.name')
            ->orderByDesc('total_qty')
            ->limit(5)
            ->get();

        return response()->json($data);
    }

    //function to get the revenue by category
    public function revenueByCategory()
    {
        $data = DB::table('sale_items')
            ->join('products', 'sale_items.product_id', '=', 'products.id')
            ->join('categories', 'products.category_id', '=', 'categories.id')
            ->join('sales', 'sale_items.sale_id', '=', 'sales.id')
            ->select(
                'categories.name as category',
                DB::raw('SUM(sale_items.quantity * sale_items.price) as revenue')
            )
            ->groupBy('categories.name')
            ->orderBy('revenue')
            ->get();

        return response()->json($data);
    }

    //function to get the monthly sales comparison (this month vs last month)
    public function compareMonthly()
    {
        $currentMonth = now()->format('Y-m');
        $prevMonth = now()->subMonth()->format('Y-m');

        $current = DB::table('sales')
            ->whereRaw("DATE_FORMAT(created_at, '%Y-%m') = ?", [$currentMonth])
            ->sum('total_price');

        $previous = DB::table('sales')
            ->whereraw("DATE_FORMAT(created_at, '%Y-%m') = ?", [$prevMonth])
            ->sum('total_price');

        return response()->json([
            "current_month" => $current,
            "previous_month" => $previous
        ]);
    }


}
