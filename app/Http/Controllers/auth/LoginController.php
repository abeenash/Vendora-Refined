<?php

namespace App\Http\Controllers\auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class LoginController extends Controller
{
    public function index(){
        return Inertia::render("auth/Login");
    }

    public function store(Request $request){

        $request->validate([
            'email'=>'required|email',
            'password'=>'required'
        ]);

        $credentials = $request->only('email','password');

        if(!Auth::attempt($credentials)){
            return back()->with('status','Invalid login details!');
        }

        $request->session()->regenerate();

        return redirect()->route('dashboard');
    }
}
