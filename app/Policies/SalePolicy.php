<?php

namespace App\Policies;

use App\Models\Sale;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class SalePolicy
{
    /**
     * Admin can view all sales list
     * Salesperson can only view their sales list
     */
    public function viewAny(User $user)
    {
        return in_array($user->role, ['admin', 'salesperson']);
    }

    /**
     * Sales admin can see everything
     * Salesperson can see only their own sales
     */
    public function view(User $user, Sale $sale): bool
    {
        return $user->role === 'admin' || $sale->user_id = $user->id;
    }

    /**
     * Salespeople can create sales
     */
    public function create(User $user)
    {
        return $user->role === 'salesperson' || $user->role === 'admin';
    }

    /**
     * Only admin can update sales entries
     */
    public function update(User $user, Sale $sale)
    {
        return $user->role === 'admin';
    }

    /**
     * Only admin can delete
     */
    public function delete(User $user, Sale $sale)
    {
        return $user->role === 'admin';
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Sale $sale): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Sale $sale): bool
    {
        return false;
    }
}
