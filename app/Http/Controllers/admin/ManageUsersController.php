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
                $query->where('name', 'like', "%{$search}%");
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
            "flash" => [
                'success' => session('success')
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('users/AddUser');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'username' => 'required|string|max:255|unique:users',
            'email' => 'required|email|unique:users',
            'phone' => 'required|nullable|string|max:20'
        ]);

        //1. Generate password
        $plainPassword = Str::random(10);

        //2. Create user
        $user = User::create([
            'name' => $request->name,
            'username' => $request->username,
            'email' => $request->email,
            'phone' => $request->phone,
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

    public function edit(User $manageuser)
    {
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
        $request->validate([
            'name' => 'required|string',
            'username' => 'required|string|unique:users,username,' . $manageuser->id,
            'email' => 'required|email|unique:users,email,' . $manageuser->id,
            'phone' => 'required|string|unique:users,phone,' . $manageuser->id,
        ]);

        $manageuser->update($request->all());

        return redirect()
            ->route('manageusers.index')
            ->with('success', 'User details updated successfully!');
    }

    public function destroy(User $manageuser)
    {
        $manageuser->delete();
        return redirect()
            ->back()
            ->with('success', 'User named' . $manageuser->name . ' has been deleted!');
    }
}
