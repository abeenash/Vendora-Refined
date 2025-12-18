<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\{Customer, User};
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class ManageCustomerController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Customer::class);

        $user = Auth::user();

        $customers = Customer::with('user')
            ->when($user->role === 'admin', function ($query) {
                $query->withTrashed();
            })
            ->when($user->role !== 'admin', function ($query) use ($user) {
                //salesperson only sees their own sales
                $query->where('user_id', $user->id);
            })
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
                'deleted_at' => $customer->deleted_at,
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

        $this->authorize('create', Customer::class);

        return Inertia::render("customers/AddCustomers", [
            "customers" => Customer::all(),
            "salespersons" => User::where('role', 'salesperson')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('create', Customer::class);

        $validated = $request->validate(
            [
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:customers,email',
                'phone' => 'required|string|phone:NP|unique:customers,phone',
                'address' => 'required|string|max:255',
                'user_id' => 'nullable|exists:users,id',
            ],
            [
                'phone.phone' => 'Please enter a valid phone number.',
                'phone.unique' => 'This phone number is already registered.'
            ]
        );

        //normalizing after validation for consistency
        $validated['phone'] = (string) phone($validated['phone'], 'NP')->formatE164();

        $user = Auth::user();

        if ($user->role !== 'admin') {
            $validated['user_id'] = $user->id;
        } else {
            if (empty($validated['user_id'])) {
                return back()->withErrors([
                    'user_id' => 'Please assign a salesperson.'
                ]);
            }
        }

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
        $this->authorize('update', $managecustomer);

        $validated = $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:customers,email,' . $managecustomer->id,
            'phone' => 'nullable|string|phone:NP|unique:customers,phone,' . $managecustomer->id,
            'address' => 'nullable|string',
            'user_id' => 'nullable|exists:users,id',
        ]);

        if (!empty($validated['phone'])) {
            $validated['phone'] = (string) phone($validated['phone'], 'NP')->formatE164();
        }

        $managecustomer->update($validated);

        return redirect()
            ->route('managecustomers.index')
            ->with('success', 'Customer updated successfully!');
    }

    public function destroy(Customer $managecustomer)
    {
        $this->authorize('delete', $managecustomer);

        $user = Auth::user();

        if ($user->role === 'admin') {
            $managecustomer->forceDelete();

            return redirect()
                ->back()
                ->with('success', 'Customer named ' . $managecustomer->name . ' has been deleted permanently!');
        }

        //salesperson just delete which is a soft delete
        $managecustomer->delete();

        return redirect()
            ->back()
            ->with('success', 'Customer named ' . $managecustomer->name . ' removed from your list!');
    }
}
