<?php

namespace App\Http\Controllers\Sales;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\{Sale, Product, Customer, User};
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon; //Carbon is a PHP library for working with dates and times
use Barryvdh\DomPDF\Facade\Pdf; //this is a facade for the dompdf library
class SalesController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $sales = Sale::with(['customer', 'items.product'])
            ->when($request->search, function ($query, $search) {
                $query->where('sale_number', 'like', "%{$search}%")
                    ->orWhereHas('customer', fn($query) => $query->where('name', 'like', "%{$search}%"));
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
        $validated = $request->validate([
            'customer_id' => 'nullable|exists:customers,id',
            'user_id' => 'required|exists:users,id',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        //To generate sale number
        $nextId = Sale::max('id') + 1;

        $saleNumber = 'SALE-' . str_pad($nextId, 5, '0', STR_PAD_LEFT);


        $sale = Sale::create([
            'sale_number' => $saleNumber,
            'customer_id' => $request->customer_id,
            'user_id' => Auth::id(),
            'status' => $request->input('status', 'Pending'),
            'total_price' => 0,
        ]);

        $total = 0;
        foreach ($validated['items'] as $item) {
            $product = Product::findOrFail($item['product_id']);
            $price = $product->price; //current price
            $subtotal = $price * $item['quantity'];

            $sale->items()->create([
                'product_id' => $item['product_id'],
                'quantity' => $item['quantity'],
                'price' => $price,
                'subtotal' => $subtotal,
            ]);

            $total += $subtotal;
        }

        $sale->update(['total_price' => $total]);

        return redirect()->route('sales.index')
            ->with('success', 'Sale created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
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
        $sale->delete();
        return redirect()->back()
            ->with('success', 'Sale deleted successfully.');
    }

    private function fetchWeeklySales()
    {
        return DB::table('sales')
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('SUM(total_price) as total'))
            ->where('created_at', '>=', Carbon::now()->subDays(6)) //this will get the last 7 days. Also, here carbon is used to get the current date and time.
            ->groupBy('date')
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
            ->whereYear('created_at',$year)
            ->groupBy('month')
            ->orderBy('month', 'asc')
            ->get();
    }

    private function fetchYearlySales(){
        return DB::table('sales')
            ->select(
                DB::raw('YEAR(created_at) as year'),
                DB::raw('SUM(total_price) as total')
            )
            ->groupBy('year')
            ->orderBy('year', 'asc')
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

    public function getYearlySales(){
        return response()->json($this->fetchYearlySales());
    }

    public function availableYears(){
        $years = Sale::selectRaw('YEAR(created_at) as year')
            ->distinct()
            ->orderBy('year','desc')
            ->pluck('year');

        return response()->json($years);
    }

    public function exportSalesPdf($period,$year=null)
    {
        if ($period === "monthly") {
            $data = $this->fetchMonthlySales($year);
        } elseif ($period === "weekly") {
            $data = $this->fetchWeeklySales();
        } elseif($period === "yearly"){
            $data = $this->fetchYearlySales();
        }

        //ensure that all rows behave like objects in Blade
        $data = collect($data)->map(function($row){
            return (object) $row;
        });

        $pdf = PDF::loadview('reports.sales', [
            'data' => $data,
            'period' => $period
        ]);

        return $pdf->download("sales_report_{$period}.pdf");
    }

    //let's get the top selling products visually
    public function topProducts(){
        $data = DB::table('sale_items')
        ->join('products','sale_items.product_id','=','products.id')
        ->join('sales','sale_items.sale_id','=','sales.id')
        ->where('sales.created_at','>=',now()->subDays(30))
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
}
