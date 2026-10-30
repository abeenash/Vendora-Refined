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
        return $user->role === 'admin' || (int) $sale->user_id === (int) $user->id;
    }

    /**
     * Admin can change any sale's status, a salesperson only their own
     */
    public function updateStatus(User $user, Sale $sale): bool
    {
        return $this->view($user, $sale);
    }

    /**
     * Payments can be recorded by the admin or the salesperson who made the sale,
     * as long as the sale isn't cancelled
     */
    public function createPayment(User $user, Sale $sale): bool
    {
        return $sale->status !== 'Cancelled' && $this->view($user, $sale);
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
