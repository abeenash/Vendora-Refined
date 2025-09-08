<?php

namespace App\Http\Controllers\auth;

use App\Http\Controllers\Controller;
// use Illuminate\Foundation\Auth\User;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class RegisterController extends Controller
{
    public function index(){
        return Inertia::render("auth/Register");
    }

    public function store(Request $request){
        $request->validate([
            'fullname'=>'required|string|max:255',
            'username'=>'required|string|max:255|unique:users,username',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|confirmed|min:8|regex:/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/',
            'role' => 'required|string',
        ]);
        // dd($request->all());

        $user = User::create([
            'name'=>$request->fullname,
            'username'=>$request->username,
            'email'=>$request->email,
            'password'=>Hash::make($request->password),
            'role'=>$request->role,
        ]);

        Auth::attempt($request->only('email','password'));

        return redirect('/dashboard');
    }

}
