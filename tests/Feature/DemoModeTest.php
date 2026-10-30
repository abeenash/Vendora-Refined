<?php

// Public demo mode: rolling demo data + protection of the shared demo logins.

use App\Models\{Category, Product, Sale, User};
use App\Services\DemoReset;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class DemoModeTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
        config(['vendora.demo' => true]);
    }

    private function admin(): User
    {
        return User::where('email', 'admin@vendora.com')->firstOrFail();
    }

    public function test_reset_moves_the_demo_history_forward_to_today(): void
    {
        //seed "10 days ago", as if the site was deployed then
        $this->travel(-10)->days();
        $this->seed(DatabaseSeeder::class);
        $this->travelBack();
        $this->assertTrue(Sale::max('created_at') < now()->subDays(9));

        $this->artisan('demo:refresh')->assertSuccessful();

        $this->assertTrue(now()->diffInHours(Sale::max('created_at'), true) < 48, 'latest sale should be recent');
        $this->assertFalse(DemoReset::isStale());
        $this->assertSame(35, Product::count());
    }

    public function test_reset_undoes_visitor_changes_but_keeps_the_logins(): void
    {
        $this->seed(DatabaseSeeder::class);
        $admin = $this->admin();

        //a visitor messes around
        Category::create(['name' => 'Vandalism']);
        User::create(['name' => 'Visitor', 'username' => 'visitor', 'email' => 'v@t.test', 'password' => 'x', 'role' => 'salesperson']);
        $admin->update(['name' => 'Hacked', 'password' => Hash::make('changed')]);

        app(DemoReset::class)->run();

        $this->assertNull(Category::where('name', 'Vandalism')->first());
        $this->assertNull(User::where('email', 'v@t.test')->first());
        $this->assertSame($admin->id, $this->admin()->id, 'same id, so signed-in visitors stay signed in');
        $this->assertSame('Suman Maharjan', $this->admin()->name);
        $this->assertTrue(Hash::check('password', $this->admin()->password));
    }

    public function test_logins_exist_even_if_the_business_seed_dies(): void
    {
        //what happened on the first deploy: the slow business seed never finished,
        //and because the logins were in the same transaction nobody could sign in
        $this->app->bind(\Database\Seeders\DemoBusinessSeeder::class, fn() => new class extends \Database\Seeders\DemoBusinessSeeder {
            public function run(): void
            {
                throw new \RuntimeException('container stopped mid-seed');
            }
        });

        try {
            app(DemoReset::class)->run();
            $this->fail('the simulated crash should propagate');
        } catch (\RuntimeException $e) {
            $this->assertSame('container stopped mid-seed', $e->getMessage());
        }

        $this->assertTrue(Hash::check('password', $this->admin()->password), 'admin can sign in');
        $this->assertNotNull(User::where('email', 'sales@vendora.com')->first());
        $this->assertSame(0, Product::count(), 'half-built business data was rolled back');
        $this->assertTrue(DemoReset::isStale(), 'so the next run tries again');
    }

    public function test_if_stale_skips_when_already_refreshed_today(): void
    {
        $this->seed(DatabaseSeeder::class);
        $this->artisan('demo:refresh')->assertSuccessful();
        $saleCount = Sale::count();

        $this->artisan('demo:refresh --if-stale')->expectsOutputToContain('already from today')->assertSuccessful();
        $this->assertSame($saleCount, Sale::count());
    }

    public function test_reset_refuses_to_run_outside_demo_mode(): void
    {
        config(['vendora.demo' => false]);
        $this->seed(DatabaseSeeder::class);
        $before = Sale::count();

        $this->artisan('demo:refresh')->assertFailed();
        $this->assertSame($before, Sale::count());
    }

    public function test_login_page_shows_demo_accounts_only_in_demo_mode(): void
    {
        $this->get('/login')->assertInertia(fn($page) => $page->where('demo.accounts.0.email', 'admin@vendora.com'));

        config(['vendora.demo' => false]);
        $this->get('/login')->assertInertia(fn($page) => $page->where('demo', null));
    }

    public function test_demo_logins_cannot_be_locked(): void
    {
        $this->seed(DatabaseSeeder::class);
        $admin = $this->admin();
        $sales = User::where('email', 'sales@vendora.com')->firstOrFail();

        $this->actingAs($admin)->put('/settings/password', [
            'current_password' => 'password', 'password' => 'NewPass1!', 'password_confirmation' => 'NewPass1!',
        ])->assertSessionHas('error');
        $this->assertTrue(Hash::check('password', $admin->fresh()->password));

        $this->actingAs($admin)->put('/editprofile', ['name' => 'Me', 'username' => 'admin', 'email' => 'mine@t.test']);
        $this->assertSame('admin@vendora.com', $admin->fresh()->email);

        $this->actingAs($admin)->delete("/manageusers/{$sales->id}")->assertSessionHas('error');
        $this->assertModelExists($sales);
    }
}
