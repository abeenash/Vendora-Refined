<?php

namespace App\Policies;

use App\Models\{User, Customer};

class CustomerPolicy
{
    /**
     * Admin can view all customers list
     * Salesperson can only view their customers list
     */

    public function viewAny(User $user)
    {
        return in_array($user->role, ['admin', 'salesperson']);
    }

    public function view(User $user, Customer $customer)
    {
        if ($customer->trashed() && $user->role !== 'admin') {
            return false;
        }
        return $user->role === 'admin' || $customer->user_id === $user->id;
    }

    /**
     * Salespeople can create sales
     */
    public function create(User $user)
    {
        return $user->role === 'salesperson' || $user->role === 'admin';
    }

    /**
     * Only admin can update customers
     */
    public function update(User $user, Customer $customer)
    {
        return $user->role === 'admin';
    }

    /**
     * Both can delete but the delete by salesperson is just unassigned flagged
     */
    public function delete(User $user, Customer $customer)
    {
        if ($customer->trashed() && $user->role !== 'admin') {
            return false;
        }
        return $user->role === 'admin' || $user->role === 'salesperson';
    }
}
