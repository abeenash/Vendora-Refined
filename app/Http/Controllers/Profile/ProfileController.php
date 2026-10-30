<?php

namespace App\Http\Controllers\Profile;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ProfileController extends Controller
{
    public function index(){
        $user = Auth::user();

        return Inertia::render("profile/EditProfile", [
            'profile' => $user->only('name', 'username', 'email', 'phone', 'role'),
            //salespeople log in with the email the admin gave them, so only the admin can change their own
            //(and nobody can on the public demo: it is the shared login)
            'canEditEmail' => $user->isAdmin() && !$user->isDemoAccount(),
        ]);
    }

    public function update(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        $rules = [
            'name' => ['required', 'string', 'max:255'],
            'username' => ['required', 'string', 'max:255', 'alpha_dash', Rule::unique('users', 'username')->ignore($user->id)],
            'phone' => ['nullable', 'string', 'phone:NP', Rule::unique('users', 'phone')->ignore($user->id)],
        ];
        if ($user->isAdmin() && !$user->isDemoAccount()) {
            $rules['email'] =['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)];
        }

        $validated = $request->validate($rules, [
            'phone.phone' => 'Please enter a valid Nepali phone number.',
        ]);

        if (!empty($validated['phone'])) {
            $validated['phone'] = (string) phone($validated['phone'], 'NP')->formatE164();
        }

        $user->update($validated);

        return redirect()->route('editprofile')->with('success', 'Profile updated.');
    }
}
