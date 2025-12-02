<?php

namespace App\Policies;

use App\Models\{User, Payment};

class PaymentPolicy
{
    // everyone with admin or salesperson can view list
    public function viewAny(User $user)
    {
        return in_array($user->role, ['admin', 'salesperson']);
    }

    // admin sees everything; salesperson sees only payments for their sales
    public function view(User $user, Payment $payment)
    {
        if ($user->role === 'admin')
            return true;
        return $payment->sale->user_id === $user->id;
    }

    // salesperson + admin can record a payment
    public function create(User $user)
    {
        return in_array($user->role, ['admin', 'salesperson']);
    }

    // no one updates payments — they record new ones instead
    public function update(User $user, Payment $payment)
    {
        return false;
    }

    // admin can verify, salesperson cannot
    public function verify(User $user, Payment $payment)
    {
        return $user->role === 'admin';
    }

    // admin deletes a payment (soft delete)
    public function delete(User $user, Payment $payment)
    {
        return $user->role === 'admin';
    }

}
