<?php

namespace App\Http\Controllers\admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index(Request $request)
    {
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

        return Inertia::render('admin/Products', [
            'products' => $products,
            'search' => $request->search,
            'flash' => [
                'success' => session('success')
            ]
        ]);
    }

    public function store(Request $request)
    {
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

        return Inertia::render('admin/AddProducts', [
            'categories' => $categories
        ]);
    }


    public function edit(Product $product)
    {
        return Inertia::render('admin/UpdateProducts', [
            'product' => $product,
            'categories' => Category::all()
        ]);
    }

    public function update(Request $request, Product $product)
    {
        $request->validate([
            'name' => 'required|string',
            'description' => 'required',
            'sku' => 'required|string|unique:products,sku,' . $product->id,
            'category_id' => 'required|exists:categories,id',
            'price' => 'required|numeric',
            'stock' => 'required|integer',
            'min_stock' => 'nullable|integer'
        ]);

        $product->update($request->all());

        return redirect()
            ->route('products.index')
            ->with('success', 'Product ' . $request->name . ' updated successfully!');
    }
    public function destroy(Product $product)
    {
        $product->delete();
        return redirect()
            ->back()
            ->with('success', 'Product ' . $product->name . ' deleted successfully!');
    }
}
