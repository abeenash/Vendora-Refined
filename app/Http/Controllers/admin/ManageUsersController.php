<?php

namespace App\Http\Controllers\admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class ManageUsersController extends Controller
{
    public function index(Request $request)
    {
        $users = User::where('role', 'salesperson')
            ->when($request->search, function ($query, $search) {
                $query->whereLike('name', "%{$search}%");
            })
            ->orderBy('id', 'desc')
            ->paginate(5)
            ->withQueryString();


        $users->getCollection()->transform(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'email' => $user->email,
                'phone' => $user->phone,
                'status' => $user->last_login ? 'Active' : 'Inactive',
                'last_login' => $user->last_login ? $user->last_login->diffForHumans() : 'Never',
                'raw_last_login' => $user->last_login, //in case we need to display the exact
            ];
        });

        return Inertia::render('users/ManageUsers', [
            "users" => $users,
            "search" => $request->search,
            "generatedPassword" => session('generatedPassword'),
        ]);
    }

    public function create()
    {
        return Inertia::render('users/AddUser');
    }

    public function store(Request $request)
    {
        $validated = $request->validate(
            [
                'name' => 'required|string|max:255',
                'username' => 'required|string|max:255|unique:users',
                'email' => 'required|email|unique:users',
                'phone' => 'required|string|phone:NP|unique:users,phone',
            ],
            [
                'phone.phone' => 'Please enter a valid phone number.',
                'phone.unique' => 'This phone number is already registered.'
            ]
        );

        $validated['phone'] = (string) phone($validated['phone'], 'NP')->formatE164();

        //1. Generate password
        $plainPassword = Str::random(10);

        //2. Create user
        $user = User::create([
            'name' => $validated['name'],
            'username' => $validated['username'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'role' => 'salesperson',
            'password' => Hash::make($plainPassword),
            'first_login' => true,
        ]);

        //3. Return password to frontend (Inertia)
        return redirect()
            ->route('manageusers.index')
            ->with([
                'generatedPassword' => $plainPassword,
                'success' => 'Salesperson created successfully!'
            ]);
    }

    //this screen only manages salespeople; admins can't be edited or deleted through it
    private function ensureSalesperson(User $user): void
    {
        abort_unless($user->role === 'salesperson', 403, 'Only salesperson accounts can be managed here.');
    }

    //the shared demo logins must keep working for the next visitor
    private function demoGuard(User $user)
    {
        return $user->isDemoAccount()
            ? redirect()->route('manageusers.index')->with('error', "{$user->name} is a public demo login, so it can't be changed or deleted here. Add a new salesperson to try this out.")
            : null;
    }

    public function edit(User $manageuser)
    {
        $this->ensureSalesperson($manageuser);

        return Inertia::render('users/UpdateUser', [
            "user" => [
                "id" => $manageuser->id,
                "name" => $manageuser->name,
                "username" => $manageuser->username,
                "email" => $manageuser->email,
                "phone" => $manageuser->phone,
            ]
        ]);
    }

    public function update(Request $request, User $manageuser)
    {
        $this->ensureSalesperson($manageuser);
        if ($blocked = $this->demoGuard($manageuser)) {
            return $blocked;
        }

        $validated = $request->validate([
            'name' => 'required|string',
            'username' => 'required|string|unique:users,username,' . $manageuser->id,
            'email' => 'required|email|unique:users,email,' . $manageuser->id,
            'phone' => 'required|string|phone:NP|unique:users,phone,' . $manageuser->id,
        ], [
            'phone.phone' => 'Please enter a valid phone number.',
            'phone.unique' => 'This phone number is already registered.'
        ]);

        $validated['phone'] = (string) phone($validated['phone'], 'NP')->formatE164();

        $manageuser->update($validated);

        return redirect()
            ->route('manageusers.index')
            ->with('success', 'User details updated successfully!');
    }

    public function destroy(User $manageuser)
    {
        $this->ensureSalesperson($manageuser);
        if ($blocked = $this->demoGuard($manageuser)) {
            return $blocked;
        }

        //their sales, payments and stock logs stay; the foreign keys just set the user to NULL
        $manageuser->delete();
        return redirect()
            ->back()
            ->with('success', 'User named ' . $manageuser->name . ' has been deleted!');
    }
}
