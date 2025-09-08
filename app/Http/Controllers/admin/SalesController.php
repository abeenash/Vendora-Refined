<?php

namespace App\Http\Controllers\admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\{Sale, Product, Customer, User};
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon; //Carbon is a PHP library for working with dates and times

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

        $sales->getCollection()->transform(function ($sale) {
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


        return Inertia::render("admin/Sales", [
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
        return Inertia::render("admin/AddSales", [
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

        return redirect()
            ->route('sales.index')
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
        return redirect()
            ->back()
            ->with('success', 'Sale deleted successfully.');
    }

    public function getWeeklySales()
    {
        $sales = DB::table('sales')
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('SUM(total_price) as total'))
            ->where('created_at', '>=', Carbon::now()->subDays(6)) //this will get the last 7 days. Also, here carbon is used to get the current date and time.
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get();

        return response()->json($sales);
    }
}
