<?php

namespace App\Http\Controllers\auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\{Auth, Hash};
use Inertia\Inertia;

class RegisterController extends Controller
{
    public function index()
    {
        return Inertia::render("auth/Register");
    }

    public function store(Request $request)
    {
        $request->validate([
            'fullname' => 'required|string|max:255',
            'username' => 'required|string|max:255|unique:users,username',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|confirmed|min:8|regex:/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/',
        ]);

        $user = User::create([
            'name' => $request->fullname,
            'username' => $request->username,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            //never trust a role sent by the browser, otherwise anyone could register as admin
            'role' => 'salesperson',
        ]);

        Auth::login($user);

        return redirect()->route($user->dashboardRoute());
    }
}
