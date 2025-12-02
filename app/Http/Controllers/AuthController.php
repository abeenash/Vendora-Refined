<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\{Auth, Hash};


class AuthController extends Controller
{
    public function forcePasswordReset()
    {
        return Inertia::render('auth/ForcePasswordReset');
    }

    public function updatePassword(Request $request)
    {
        $request->validate([
            'password' => [
                'required',
                'string',
                'confirmed',
                'min:8',
                'regex:/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/'
            ],
        ],[
            'password.regex' => 'Password must include at least 1 uppercase, 1 lowercase, 1 number, and 1 special character.',
        ]);

        /** @var \App\Models\User $user */
        $user = Auth::user();
        $user->password = Hash::make($request->password);
        $user->first_login = false; //the most important step
        $user->save();

        return redirect()->route('dashboard.salesperson');
    }
}
