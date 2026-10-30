<?php

namespace App\Http\Controllers\Products;

use App\Http\Controllers\Controller;
use App\Models\{Product,Category};
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;


class ProductController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Product::class);
        $products = Product::with('category')
            ->when($request->search, function ($query, $search) {
                //grouped, otherwise the ORs would bypass the soft-delete filter
                $query->where(fn($q) => $q->whereLike('name', "%{$search}%")
                    ->orWhereLike('sku', "%{$search}%")
                    ->orWhereHas('category', fn($query) => $query->whereLike('name', "%{$search}%")));
            })
            ->orderBy('id', 'desc')
            ->paginate(5)
            ->withQueryString();

        /** @var \App\Models\User $user */
        $user = Auth::user();

        return Inertia::render('products/Products', [
            'products' => $products,
            'search' => $request->search,
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
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:products,name,NULL,id,deleted_at,NULL',
            'description' => 'required|string',
            'sku' => 'required|string|max:255|unique:products',
            'category_id' => 'required|exists:categories,id,deleted_at,NULL',
            'price' => 'required|numeric|min:0|max:999999.99',
            'stock' => 'required|integer|min:0',
            'min_stock' => 'nullable|integer|min:0'
        ]);

        $validated['min_stock'] ??= 0;

        $product = Product::create($validated);

        if ($product->stock > 0) {
            app(\App\Services\StockService::class)->record($product, 0, $product->stock, 'adjustment', 'Opening stock');
        }
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
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:products,name,' . $product->id . ',id,deleted_at,NULL',
            'description' => 'required|string',
            'sku' => 'required|string|max:255|unique:products,sku,' . $product->id,
            'category_id' => 'required|exists:categories,id,deleted_at,NULL',
            'price' => 'required|numeric|min:0|max:999999.99',
            'stock' => 'required|integer|min:0',
            'min_stock' => 'nullable|integer|min:0'
        ]);

        $validated['min_stock'] ??= 0;

        $oldStock = $product->stock; //get the current stock

        $product->update($validated);

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

        //never sold or ordered: nothing refers to it, so remove it for real (with its own stock log)
        if (!$product->hasHistory()) {
            DB::transaction(function () use ($product) {
                $product->stockMovements()->delete();
                $product->forceDelete();
            });

            return redirect()
                ->back()
                ->with('success', 'Product ' . $product->name . ' deleted successfully!');
        }

        //soft delete: the product disappears from lists and new sales, but old invoices keep it
        $product->delete();
        return redirect()
            ->back()
            ->with('success', 'Product ' . $product->name . ' has sales or purchase history, so it was archived (hidden) instead of deleted.');
    }
}
