<?php

namespace App\Http\Controllers\Sales;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Sale;

class SaleController extends Controller
{
    public function index()
    {
        return Inertia::render("admin/Sale");
    }

    public function updateStatus(Request $request, Sale $sale){
        $request->validate([
            'status'=>'required|in:Pending,Completed,Cancelled',
        ]);

        $sale->update([
            'status'=>$request->status,
        ]);

        return back();
    }
}
