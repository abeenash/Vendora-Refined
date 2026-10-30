<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'username',
        'email',
        'phone',
        'password',
        'role',
        'last_login',
        'first_login',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'last_login' => 'datetime',
            //MySQL returns 0/1, Postgres returns true/false; the cast makes both a real bool
            'first_login' => 'boolean',
        ];
    }

    public function isAdmin()
    {
        return $this->role === 'admin';
    }

    public function isSalesperson()
    {
        return $this->role === 'salesperson';
    }

    public function sales()
    {
        return $this->hasMany(Sale::class);
    }

    public function stockMovements(){
        return $this->hasMany(StockMovement::class);
    }

    //one of the public demo logins (only matters when DEMO_MODE=true)
    public function isDemoAccount(): bool
    {
        return config('vendora.demo') && in_array($this->email, config('vendora.demo_accounts'), true);
    }

    public function dashboardRoute(): string
    {
        return $this->isAdmin() ? 'dashboard.admin' : 'dashboard.salesperson';
    }
}
