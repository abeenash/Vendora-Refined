<?php

namespace App\Http\Controllers\Profile;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class SettingsController extends Controller
{
    public function index()
    {
        return Inertia::render("profile/Settings");
    }

    public function updatePassword(Request $request)
    {
        //a visitor changing the shared demo password would lock everyone else out
        if (Auth::user()->isDemoAccount()) {
            return redirect()->route('settings')->with('error', 'Password changes are turned off for the public demo accounts.');
        }

        $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => [
                'required',
                'string',
                'confirmed',
                'min:8',
                'different:current_password',
                //same rule as the first-login password reset
                'regex:/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/',
            ],
        ], [
            'current_password.current_password' => 'Your current password is incorrect.',
            'password.different' => 'The new password must be different from the current one.',
            'password.regex' => 'Password must include at least 1 uppercase, 1 lowercase, 1 number, and 1 special character.',
        ]);

        /** @var \App\Models\User $user */
        $user = Auth::user();
        $user->password = Hash::make($request->password);
        $user->save();

        //sign out every other browser/device that was logged in with the old password
        if (config('session.driver') === 'database') {
            DB::table(config('session.table', 'sessions'))
                ->where('user_id', $user->id)
                ->where('id', '!=', $request->session()->getId())
                ->delete();
        }

        return redirect()->route('settings')->with('success', 'Password updated.');
    }
}
