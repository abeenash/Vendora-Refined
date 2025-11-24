<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ManageCustomerController extends Controller
{
    public function index(Request $request)
    {

        $customers = Customer::with('user')
            ->when($request->search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%");
            })
            ->orderBy('id', 'desc')
            ->paginate(5)
            ->withQueryString();


        $customers->getCollection()->transform(function ($customer) {
            return [
                'id' => $customer->id,
                'name' => $customer->name,
                'email' => $customer->email,
                'phone' => $customer->phone,
                'address' => $customer->address,
                'assigned_salesperson' => $customer->user ? $customer->user->name : null,
            ];
        });

        return Inertia::render("customers/ManageCustomer", [
            "customers" => $customers,
            "search" => $request->search,
            "flash" => [
                'success' => session('success')
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render("customers/AddCustomers", [
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
            'address' => 'required|string|max:255',
            'user_id' => 'nullable|exists:users,id',
        ]);

        Customer::create($validated);

        return redirect()
            ->route('managecustomers.index')
            ->with('success', 'Customer added successfully!');
    }

    public function edit(Customer $managecustomer)
    {
        return Inertia::render("customers/UpdateCustomers", [
            "customer" => [
                "id" => $managecustomer->id,
                "name" => $managecustomer->name,
                "email" => $managecustomer->email,
                "phone" => $managecustomer->phone,
                "address" => $managecustomer->address,
                "user_id" => $managecustomer->user_id,
            ],
            "salespersons" => User::where('role', 'salesperson')->get(),
        ]);
    }

    public function update(Request $request, Customer $managecustomer)
    {
        $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:customers,email,' . $managecustomer->id,
            'phone' => 'nullable|string|unique:customers,phone,' . $managecustomer->id,
            'address' => 'nullable|string',
            'user_id' => 'nullable|exists:users,id',
        ]);

        $managecustomer->update($request->all());

        return redirect()
            ->route('managecustomers.index')
            ->with('success', 'Customer updated successfully!');
    }

    public function destroy(Customer $managecustomer)
    {
        $managecustomer->delete();
        return redirect()
            ->back()
            ->with('success', 'Customer named ' . $managecustomer->name . ' has been deleted!');
    }
}
