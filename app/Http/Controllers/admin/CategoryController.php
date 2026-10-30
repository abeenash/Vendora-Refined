<?php

namespace App\Http\Controllers\admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Category;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        $categories = Category::query()
            ->when($request->search, function ($query, $search) {
                $query->whereLike('name', "%{$search}%");
            })
            ->orderBy('id', 'desc')
            ->paginate(5)
            ->withQueryString(); 

        return Inertia::render("categories/Categories", [
            'categories' => $categories,
            'search' => $request->search,
            //flash (success + error) is shared globally in AppServiceProvider
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('categories/AddCategories');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:categories,name,NULL,id,deleted_at,NULL',
        ]);

        //re-creating an archived category brings the old one back (the name is unique in the database)
        $archived = Category::onlyTrashed()->where('name', $request->name)->first();
        if ($archived) {
            $archived->restore();
            return redirect()
                ->route('categories.index')
                ->with('success', 'Category ' . $archived->name . ' was restored from the archive.');
        }

        Category::create($request->only('name'));
        return redirect()
            ->route('categories.index')
            ->with('success', 'Category ' . $request->name . ' added successfully!');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Category $category)
    {
        return Inertia::render('categories/UpdateCategories', [
            'category' => $category
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Category $category)
    {
        //archived names count too: the database index is unique across all rows
        $request->validate([
            'name' => 'required|string|max:255|unique:categories,name,' . $category->id,
        ], [
            'name.unique' => 'That name is already used by another (possibly archived) category.',
        ]);

        $category->update($request->only('name'));
        return redirect()
            ->route('categories.index')
            ->with('success', 'Category ' . $request->name . ' has been updated!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Category $category)
    {
        //products you can still sell must be moved or deleted first
        $active = $category->products()->count();
        if ($active > 0) {
            return redirect()
                ->back()
                ->with('error', "Category {$category->name} still has {$active} " . str('product')->plural($active) . '. Move or delete them first.');
        }

        //only archived products (kept for sales history) remain: archive the category with them
        if ($category->products()->onlyTrashed()->exists()) {
            $category->delete();
            return redirect()
                ->back()
                ->with('success', 'Category ' . $category->name . ' was archived (its old products still appear on past invoices).');
        }

        $category->forceDelete();
        return redirect()
            ->back()
            ->with('success', 'Category ' . $category->name . ' has been deleted!');
    }
}
