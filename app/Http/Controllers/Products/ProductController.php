<?php

namespace App\Http\Controllers\Products;

use App\Http\Controllers\Controller;
use App\Models\{Product,Category};
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;


class ProductController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Product::class);
        $products = Product::with('category')
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('sku', 'like', "%{$search}%")
                    ->orWhereHas('category', fn($query) => $query->where('name', 'like', "%{$search}%"));
            })
            // ->get()
            ->orderBy('id', 'desc')
            ->paginate(5)
            ->withQueryString();

        /** @var \App\Models\User $user */
        $user = Auth::user();

        return Inertia::render('products/Products', [
            'products' => $products,
            'search' => $request->search,
            'flash' => [
                'success' => session('success')
            ],
            'can' => [
                'create' => $user->can('create', new Product),
                'update' => $user->can('update', new Product),
                'delete' => $user->can('delete', new Product),
            ]
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('create', Product::class);
        $request->validate([
            'name' => 'required|string|unique:products',
            'description' => 'required',
            'sku' => 'required|string|unique:products',
            'category_id' => 'required|exists:categories,id',
            'price' => 'required|numeric',
            'stock' => 'required|integer',
            'min_stock' => 'nullable|integer'
        ]);


        Product::create($request->all());
        return redirect()
            ->route('products.index')
            ->with('success', 'Product ' . $request->name . ' added successfully!');
    }

    public function create()
    {
        $categories = Category::all();

        return Inertia::render('products/AddProducts', [
            'categories' => $categories
        ]); //this returns
    }


    public function edit(Product $product)
    {
        return Inertia::render('products/UpdateProducts', [
            'product' => $product,
            'categories' => Category::all()
        ]);
    }


    public function update(Request $request, Product $product)
    {
        $this->authorize('update', $product);
        $request->validate([
            'name' => 'required|string',
            'description' => 'required',
            'sku' => 'required|string|unique:products,sku,' . $product->id,
            'category_id' => 'required|exists:categories,id',
            'price' => 'required|numeric',
            'stock' => 'required|integer',
            'min_stock' => 'nullable|integer'
        ]);

        $oldStock = $product->stock; //get the current stock

        $product->update($request->all());

        if($oldStock != $product->stock){
            app(\App\Services\StockService::class)->record(
                $product,
                $oldStock,
                $product->stock,
                'adjustment',
                "Manual stock update by admin"
            );
        }

        return redirect()
            ->route('products.index')
            ->with('success', 'Product ' . $request->name . ' updated successfully!');
    }
    public function destroy(Product $product)
    {
        $this->authorize('delete', $product);
        $product->delete();
        return redirect()
            ->back()
            ->with('success', 'Product ' . $product->name . ' deleted successfully!');
    }
}
