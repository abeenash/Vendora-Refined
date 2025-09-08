<?php

namespace App\Http\Controllers\admin;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ManageCustomerController extends Controller
{
    public function index()
    {

        $customers = Customer::with('user')->get();


        $customers->transform(function ($customer) {
            return [
                'id' => $customer->id,
                'name' => $customer->name,
                'email' => $customer->email,
                'phone' => $customer->phone,
                'address' => $customer->address,
                'assigned_salesperson' => $customer->user ? $customer->user->name : null,
            ];
        });

        return Inertia::render("admin/ManageCustomer", [
            "customers" => $customers,
            "flash" => [
                'success' => session('success')
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render("admin/AddCustomers", [
            "customers" => Customer::all(),
            "salespersons" => User::where('role', 'salesperson')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:customers,email',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:255',
            'user_id' => 'nullable|exists:users,id',
        ]);

        $customer = Customer::create($validated);

        return redirect()
            ->route('managecustomers.index')
            ->with('success', 'Customer added successfully!');
    }

    public function edit(Customer $customer)
    {
        return Inertia::render("admin/UpdateCustomers", [
            "customer" => [
                "id" => $customer->id,
                "name" => $customer->name,
                "email" => $customer->email,
                "phone" => $customer->phone,
                "address" => $customer->address,
                "user_id" => $customer->user_id,
            ],
            "salespersons" => User::where('role', 'salesperson')->get(),
        ]);
    }


    public function update(Request $request, Customer $customer)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:customers,email,' . $customer->id,
            'phone' => 'nullable|string',
            'address' => 'nullable|string',
            'user_id' => 'nullable|exists:users,id',
        ]);

        $customer->update($validated);

        return redirect()
            ->route('managecustomers.index')
            ->with('success', 'Customer updated successfully!');
    }

    public function destroy(Customer $customer)
    {
        $customer->delete();
        return redirect()
            ->back()
            ->with('success', 'Customer named ' . $customer->name . ' has been deleted!');
    }
}
