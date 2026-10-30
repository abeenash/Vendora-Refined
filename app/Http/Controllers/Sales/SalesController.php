<?php

namespace App\Http\Controllers\Sales;

use App\Http\Controllers\Controller;
use App\Services\SalesReport;
use App\Services\StockService;
use App\Support\SqlDate;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\{Sale, Product, Customer, User};
use Illuminate\Support\Facades\{Auth, DB};
use Illuminate\Validation\ValidationException;
use Carbon\Carbon; //Carbon is a PHP library for working with dates and times
use Barryvdh\DomPDF\Facade\Pdf; //this is a facade for the dompdf library

class SalesController extends Controller
{
    //how long a customer has to pay an invoice when no due date is given
    private const DEFAULT_PAYMENT_TERM_DAYS = 30;

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
                    $q->whereLike('sale_number', "%{$search}%")
                        ->orWhereHas('customer', fn($c) => $c->whereLike('name', "%{$search}%"));
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
                'items_summary' => $sale->items->map(fn($item) => ($item->product?->name ?? 'Deleted product') . ' x' . $item->quantity)->join(', '),
                'total_price' => $sale->total_price,
                'status' => $sale->status,
                'payment_status' => $sale->payment_status,
                'total_paid' => $sale->total_paid,
            ];
        });


        return Inertia::render("sales/Sales", [
            "sales" => $sales,
            "search" => $request->search,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $this->authorize('create', Sale::class);

        $user = Auth::user();

        $customers = $user->role === 'admin'
            ? Customer::all()
            : Customer::where('user_id', $user->id)->get();

        return Inertia::render("sales/AddSales", [
            "products" => Product::where('stock', '>', 0)->get(),
            "customers" => $customers,
            "users" => User::select('id', 'name', 'role')->get(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */

    public function store(Request $request, StockService $stock)
    {

        $this->authorize('create', Sale::class);

        $user = Auth::user();

        $validated = $request->validate([
            'customer_id' => 'nullable|exists:customers,id,deleted_at,NULL',
            'user_id' => 'nullable|exists:users,id',
            'status' => 'nullable|in:Pending,Completed',
            'due_date' => 'nullable|date|after_or_equal:today',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id,deleted_at,NULL',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        //a salesperson can only sell to their own customers
        if (!empty($validated['customer_id']) && $user->role !== 'admin') {
            $owns = Customer::whereKey($validated['customer_id'])->where('user_id', $user->id)->exists();
            if (!$owns) {
                throw ValidationException::withMessages(['customer_id' => 'This customer is not assigned to you.']);
            }
        }

        DB::transaction(function () use ($validated, $user, $stock) {

            // Create the sale record
            $sale = Sale::create([
                'customer_id' => $validated['customer_id'] ?? null,
                'user_id' => $user->role === 'admin'
                    ? ($validated['user_id'] ?? $user->id)
                    : $user->id,
                'status' => $validated['status'] ?? 'Pending',
                'due_date' => $validated['due_date'] ?? today()->addDays(self::DEFAULT_PAYMENT_TERM_DAYS),
                'total_price' => 0
            ]);

            //derived from the auto-increment id, so two people saving at once can't get the same number
            $sale->sale_number = 'SALE-' . str_pad($sale->id, 5, '0', STR_PAD_LEFT);

            $total = 0;

            foreach ($validated['items'] as $item) {

                // Lock the product to avoid race conditions
                $product = Product::lockForUpdate()->findOrFail($item['product_id']);

                // Check if stock is enough
                if ($item['quantity'] > $product->stock) {
                    throw ValidationException::withMessages([
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

                // Deduct stock (and log it)
                $stock->adjust($product->id, -$item['quantity'], 'sale', "Stock deducted because of Sale {$sale->sale_number}");

                $total += $subtotal;
            }

            // Update final sale total
            $sale->total_price = $total;
            $sale->save();
        });

        return redirect()->route('sales.index')
            ->with('success', 'Sale created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Sale $sale)
    {
        $this->authorize('view', $sale);
        return $sale->load('items.product', 'customer', 'user', 'payments');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Sale $sale, StockService $stock)
    {
        $this->authorize('delete', $sale);

        //money has been received against this sale, so it is part of the books now
        if ($sale->payments()->exists()) {
            return redirect()->back()
                ->with('error', "Sale {$sale->sale_number} has payments recorded and can't be deleted.");
        }

        DB::transaction(function () use ($sale, $stock) {
            //a cancelled sale already gave its stock back
            if ($sale->status !== 'Cancelled') {
                $stock->restoreSale($sale, 'return', "Stock returned because Sale {$sale->sale_number} was deleted");
            }
            $sale->delete();
        });

        return redirect()->back()
            ->with('success', 'Sale deleted successfully.');
    }

    //revenue only counts sales that weren't cancelled
    private function revenue()
    {
        return DB::table('sales')->where('status', '!=', 'Cancelled');
    }

    private function fetchWeeklySales()
    {
        return $this->revenue()
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('SUM(total_price) as total'))
            ->where('created_at', '>=', Carbon::now()->startOfDay()->subDays(6)) //this will get the last 7 days. Also, here carbon is used to get the current date and time.
            ->groupBy(DB::raw('DATE(created_at)'))
            ->orderBy(DB::raw('DATE(created_at)'), 'asc')
            ->get();
    }

    private function fetchMonthlySales($year)
    {
        $month = SqlDate::yearMonth('created_at');

        return $this->revenue()
            ->select(
                DB::raw("$month as month"),
                DB::raw('SUM(total_price) as total')
            )
            ->whereYear('created_at', $year)
            ->groupBy(DB::raw($month))
            ->orderBy('month', 'asc')
            ->get();
    }

    private function fetchYearlySales()
    {
        $year = SqlDate::year('created_at');

        return $this->revenue()
            ->select(
                DB::raw("$year as year"),
                DB::raw('SUM(total_price) as total')
            )
            ->groupBy(DB::raw($year))
            ->orderBy('year', 'asc')
            ->get();
    }

    //for the custom range
    private function fetchCustomRangeSales($start, $end)
    {
        return $this->revenue()
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
        $year = SqlDate::year('created_at');

        $years = Sale::selectRaw("$year as year")
            ->distinct()
            ->orderBy('year', 'desc')
            ->pluck('year');

        return response()->json($years);
    }

    //period + its parameters, validated the same way for the page and the PDF
    private function reportFor(Request $request, ?string $period = null, ?string $year = null): array
    {
        $request->merge(array_filter(['period' => $period, 'year' => $year], fn($v) => $v !== null));

        $data = $request->validate([
            'period' => ['required', 'in:' . implode(',', SalesReport::PERIODS)],
            'year' => ['nullable', 'integer', 'between:2000,2100'],
            'start' => ['required_if:period,custom', 'nullable', 'date'],
            'end' => ['required_if:period,custom', 'nullable', 'date', 'after_or_equal:start'],
        ], [
            'start.required_if' => 'Pick a start date for the custom range.',
            'end.required_if' => 'Pick an end date for the custom range.',
        ]);

        return SalesReport::make($data['period'], isset($data['year']) ? (int) $data['year'] : null, $data['start'] ?? null, $data['end'] ?? null);
    }

    //GET /api/sales/report?period=weekly|monthly|yearly|custom&year=&start=&end=
    public function report(Request $request)
    {
        return response()->json($this->reportFor($request));
    }

    public function exportSalesPdf(Request $request, string $period, ?string $year = null)
    {
        //always JSON errors, so the page never saves an HTML error page as a ".pdf"
        $request->headers->set('Accept', 'application/json');
        $report = $this->reportFor($request, $period, $year);

        $user = Auth::user();
        $reference = 'VR-' . now()->format('Ymd-His') . '-' . strtoupper(substr($period, 0, 1));

        $pdf = PDF::loadView('reports.sales', [
            'report' => $report,
            'reference' => $reference,
            'generatedBy' => $user?->name ?? 'Vendora',
            'generatedAt' => now(),
        ])
            ->setPaper('a4')
            //embed only the glyphs used instead of the whole monospace font (~490 KB -> a few dozen KB)
            ->setOption('isFontSubsettingEnabled', true);

        return $pdf->download("vendora_sales_{$period}_{$report['from']}_to_{$report['to']}.pdf");
    }


    //function to get the top selling products
    public function topProducts()
    {
        $data = DB::table('sale_items')
            ->join('products', 'sale_items.product_id', '=', 'products.id')
            ->join('sales', 'sale_items.sale_id', '=', 'sales.id')
            ->where('sales.status', '!=', 'Cancelled')
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
            ->where('sales.status', '!=', 'Cancelled')
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
        $current = $this->revenue()
            ->whereBetween('created_at', [now()->startOfMonth(), now()->endOfMonth()])
            ->sum('total_price');

        $previous = $this->revenue()
            ->whereBetween('created_at', [now()->subMonthNoOverflow()->startOfMonth(), now()->subMonthNoOverflow()->endOfMonth()])
            ->sum('total_price');

        return response()->json([
            "current_month" => $current,
            "previous_month" => $previous
        ]);
    }


}
