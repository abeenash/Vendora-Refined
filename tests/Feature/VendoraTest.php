<?php

// Regression suite for Vendora's business rules.
// Runs on in-memory SQLite (see phpunit.xml): `php artisan test`

use App\Models\{Category, Customer, GRN, Payment, Product, PurchaseOrder, Sale, StockMovement, Supplier, SupplierBill, User};
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class VendoraTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $sp;
    protected User $sp2;
    protected Category $cat;
    protected Product $product;
    protected Customer $customer;
    protected Supplier $supplier;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();

        $mk = fn($u, $role) => User::create([
            'name' => ucfirst($u), 'username' => $u, 'email' => "$u@t.test",
            'password' => 'Password1!', 'role' => $role, 'first_login' => false,
        ]);
        $this->admin = $mk('admin', 'admin');
        $this->sp = $mk('sp', 'salesperson');
        $this->sp2 = $mk('sp2', 'salesperson');

        $this->cat = Category::create(['name' => 'Electronics']);
        $this->product = Product::create([
            'name' => 'Mouse', 'sku' => 'M-1', 'description' => 'x',
            'category_id' => $this->cat->id, 'price' => 100, 'stock' => 10, 'min_stock' => 2,
        ]);
        $this->customer = Customer::create([
            'name' => 'Ram', 'email' => 'ram@t.test', 'phone' => '+9779841000000',
            'address' => 'KTM', 'user_id' => $this->sp->id,
        ]);
        $this->supplier = Supplier::create(['name' => 'Acme', 'email' => 'a@acme.test', 'phone' => '9800000000']);
    }

    private function makeSale(User $by, int $qty = 2, string $status = 'Pending', ?Customer $customer = null): Sale
    {
        $customer ??= $by->role === 'admin' || $by->is($this->sp) ? $this->customer : null;

        $this->actingAs($by)->post('/sales', [
            'customer_id' => $customer?->id, 'user_id' => $by->id, 'status' => $status,
            'items' => [['product_id' => $this->product->id, 'quantity' => $qty]],
        ])->assertSessionHasNoErrors();
        return Sale::latest('id')->firstOrFail();
    }

    private function pay(User $by, Sale $sale, $amount, array $extra = [])
    {
        return $this->actingAs($by)->postJson("/api/sales/{$sale->id}/payments", $extra + [
            'amount' => $amount, 'payment_method' => 'cash', 'payment_date' => now()->toDateString(),
        ]);
    }

    private function makePo(int $qty = 5, float $price = 60): PurchaseOrder
    {
        $this->actingAs($this->admin)->post('/purchase-orders', [
            'supplier_id' => $this->supplier->id, 'order_date' => now()->toDateString(),
            'items' => [['product_id' => $this->product->id, 'quantity_ordered' => $qty, 'unit_price' => $price]],
        ])->assertSessionHasNoErrors();
        return PurchaseOrder::latest('id')->firstOrFail();
    }

    private function receive(PurchaseOrder $po, int $qty)
    {
        return $this->actingAs($this->admin)->post("/purchase-orders/{$po->id}/grn", [
            'items' => [['id' => $po->items()->first()->id, 'qty_received' => $qty]],
        ]);
    }

    /* ---------------- 1. Pages render ---------------- */

    public static function adminPages(): array
    {
        return array_map(fn($u) => [$u], [
            '/dashboard/admin', '/products', '/products/create', '/categories', '/categories/create',
            '/sales', '/sales/create', '/managecustomers', '/managecustomers/create', '/manageusers',
            '/manageusers/create', '/stock-movements', '/suppliers', '/suppliers/{supplier}',
            '/purchase-orders', '/purchase-orders/{po}', '/supplier-bills', '/receivables', '/payables',
            '/salesreport', '/editprofile', '/settings',
        ]);
    }

    #[DataProvider('adminPages')]
    public function test_admin_page_renders(string $url): void
    {
        $po = $this->makePo();
        $url = str_replace(['{supplier}', '{po}'], [$this->supplier->id, $po->id], $url);
        $this->actingAs($this->admin)->get($url)->assertOk();
    }

    public static function salespersonPages(): array
    {
        return array_map(fn($u) => [$u], ['/dashboard/salesperson', '/products', '/sales', '/sales/create', '/managecustomers', '/managecustomers/create', '/stock-movements', '/receivables']);
    }

    #[DataProvider('salespersonPages')]
    public function test_salesperson_page_renders(string $url): void
    {
        $this->actingAs($this->sp)->get($url)->assertOk();
    }

    public static function adminOnlyPages(): array
    {
        return array_map(fn($u) => [$u], ['/categories', '/suppliers', '/purchase-orders', '/supplier-bills', '/payables', '/salesreport', '/manageusers']);
    }

    #[DataProvider('adminOnlyPages')]
    public function test_salesperson_is_blocked_from_admin_page(string $url): void
    {
        $this->actingAs($this->sp)->get($url)->assertForbidden();
    }

    /* ---------------- 2. Authorization ---------------- */

    public function test_salesperson_cannot_delete_category(): void
    {
        $this->actingAs($this->sp)->delete("/categories/{$this->cat->id}")->assertForbidden();
    }

    public function test_salesperson_cannot_create_category(): void
    {
        $this->actingAs($this->sp)->post('/categories', ['name' => 'Hacked'])->assertForbidden();
    }

    public function test_salesperson_cannot_delete_supplier(): void
    {
        $this->actingAs($this->sp)->delete("/suppliers/{$this->supplier->id}")->assertForbidden();
    }

    public function test_salesperson_cannot_view_another_salespersons_sale(): void
    {
        $sale = $this->makeSale($this->sp2);
        $this->actingAs($this->sp)->get("/sales/{$sale->id}")->assertForbidden();
    }

    public function test_salesperson_cannot_change_status_of_another_salespersons_sale(): void
    {
        $sale = $this->makeSale($this->sp2);
        $this->actingAs($this->sp)->patch("/sales/{$sale->id}/status", ['status' => 'Completed'])->assertForbidden();
    }

    public function test_salesperson_cannot_sell_to_another_salespersons_customer(): void
    {
        $this->actingAs($this->sp2)->post('/sales', [
            'customer_id' => $this->customer->id,
            'items' => [['product_id' => $this->product->id, 'quantity' => 1]],
        ])->assertSessionHasErrors('customer_id');
    }

    public function test_salesperson_cannot_delete_another_salespersons_customer(): void
    {
        $this->actingAs($this->sp2)->delete("/managecustomers/{$this->customer->id}")->assertForbidden();
    }

    public function test_admin_cannot_delete_admin_through_user_management(): void
    {
        $this->actingAs($this->admin)->delete("/manageusers/{$this->admin->id}")->assertForbidden();
        $this->assertModelExists($this->admin);
    }

    public function test_guest_cannot_read_sales_report_api(): void
    {
        $this->getJson('/api/sales/weekly')->assertUnauthorized();
        $this->getJson('/api/sales/top-products')->assertUnauthorized();
        $this->getJson('/api/sales/report/pdf/weekly')->assertUnauthorized();
    }

    public function test_salesperson_cannot_read_company_reports(): void
    {
        $this->actingAs($this->sp)->getJson('/api/sales/weekly')->assertForbidden();
    }

    public function test_login_is_rate_limited(): void
    {
        for ($i = 0; $i < 5; $i++) {
            $this->post('/login', ['email' => 'sp@t.test', 'password' => 'wrong']);
        }
        $this->post('/login', ['email' => 'sp@t.test', 'password' => 'wrong'])->assertStatus(429);
    }

    /* ---------------- 3. Sales & stock ---------------- */

    public function test_sale_deducts_stock_and_logs_movement(): void
    {
        $sale = $this->makeSale($this->sp, 3);
        $this->assertSame(7, $this->product->fresh()->stock);
        $this->assertEquals(300, $sale->total_price);
        $this->assertSame('SALE-' . str_pad($sale->id, 5, '0', STR_PAD_LEFT), $sale->sale_number);
        $this->assertNotNull($sale->due_date);
        $this->assertSame(1, StockMovement::where('type', 'sale')->count());
    }

    public function test_sale_rejects_quantity_above_stock(): void
    {
        $this->actingAs($this->sp)->post('/sales', [
            'items' => [['product_id' => $this->product->id, 'quantity' => 99]],
        ])->assertSessionHasErrors('items');
        $this->assertSame(10, $this->product->fresh()->stock);
        $this->assertSame(0, Sale::count());
    }

    public function test_sale_rejects_unknown_status(): void
    {
        $this->actingAs($this->sp)->post('/sales', [
            'status' => 'Shipped',
            'items' => [['product_id' => $this->product->id, 'quantity' => 1]],
        ])->assertSessionHasErrors('status');
    }

    public function test_cancelling_sale_restores_stock(): void
    {
        $sale = $this->makeSale($this->sp, 4);
        $this->actingAs($this->admin)->patch("/sales/{$sale->id}/status", ['status' => 'Cancelled']);
        $this->assertSame(10, $this->product->fresh()->stock);
        $this->assertSame(1, StockMovement::where('type', 'cancel')->count());
    }

    public function test_cancelled_sale_cannot_be_reopened(): void
    {
        $sale = $this->makeSale($this->sp, 4);
        $this->actingAs($this->admin)->patch("/sales/{$sale->id}/status", ['status' => 'Cancelled']);
        $this->actingAs($this->admin)->patch("/sales/{$sale->id}/status", ['status' => 'Pending'])
            ->assertSessionHasErrors('status');
        $this->assertSame('Cancelled', $sale->fresh()->status);
    }

    public function test_sale_with_payments_cannot_be_cancelled_or_deleted(): void
    {
        $sale = $this->makeSale($this->sp, 2);
        $this->pay($this->sp, $sale, 50)->assertCreated();

        $this->actingAs($this->admin)->patch("/sales/{$sale->id}/status", ['status' => 'Cancelled'])
            ->assertSessionHasErrors('status');
        $this->actingAs($this->admin)->delete("/sales/{$sale->id}");

        $this->assertModelExists($sale);
        $this->assertSame(8, $this->product->fresh()->stock);
    }

    public function test_deleting_sale_restores_stock(): void
    {
        $sale = $this->makeSale($this->sp, 4);
        $this->actingAs($this->admin)->delete("/sales/{$sale->id}");
        $this->assertModelMissing($sale);
        $this->assertSame(10, $this->product->fresh()->stock);
    }

    public function test_deleting_cancelled_sale_does_not_restore_stock_twice(): void
    {
        $sale = $this->makeSale($this->sp, 4);
        $this->actingAs($this->admin)->patch("/sales/{$sale->id}/status", ['status' => 'Cancelled']);
        $this->actingAs($this->admin)->delete("/sales/{$sale->id}");
        $this->assertSame(10, $this->product->fresh()->stock);
    }

    public function test_product_rejects_negative_price_and_stock(): void
    {
        $this->actingAs($this->admin)->post('/products', [
            'name' => 'Bad', 'sku' => 'B-1', 'description' => 'x', 'category_id' => $this->cat->id,
            'price' => -50, 'stock' => -5,
        ])->assertSessionHasErrors(['price', 'stock']);
    }

    public function test_cancelled_sales_are_not_counted_as_revenue(): void
    {
        $this->makeSale($this->sp, 1);
        $cancelled = $this->makeSale($this->sp, 2);
        $this->actingAs($this->admin)->patch("/sales/{$cancelled->id}/status", ['status' => 'Cancelled']);

        //SUM() comes back as "100.00" on Postgres/MySQL and 100 on SQLite, so compare the value
        $this->assertEquals(100, $this->actingAs($this->admin)->getJson('/api/sales/weekly')->assertOk()->json('0.total'));
    }

    public function test_report_endpoints_work(): void
    {
        $this->makeSale($this->sp, 1);
        $year = now()->year;
        foreach (["/api/sales/monthly/$year", '/api/sales/yearly', '/api/sales/available-years', '/api/sales/compare-monthly', '/api/sales/top-products', '/api/sales/revenue-category'] as $url) {
            $this->actingAs($this->admin)->getJson($url)->assertOk();
        }
        $this->actingAs($this->admin)->getJson('/api/sales/available-years')->assertExactJson([$year]);
    }

    public function test_sales_report_fills_every_day_and_excludes_cancelled_sales(): void
    {
        $this->makeSale($this->sp, 2);                       // 200
        $cancelled = $this->makeSale($this->sp, 3);          // 300, cancelled below
        $this->actingAs($this->admin)->patch("/sales/{$cancelled->id}/status", ['status' => 'Cancelled']);

        $report = $this->actingAs($this->admin)->getJson('/api/sales/report?period=weekly')->assertOk()->json();

        $this->assertCount(7, $report['rows']);              // all 7 days, even the empty ones
        $this->assertEquals(200, $report['summary']['revenue']);
        $this->assertSame(1, $report['summary']['orders']);
        $this->assertSame(2, $report['summary']['units']);
        $this->assertSame(1, $report['summary']['cancelled']);
        $this->assertSame('Mouse', $report['top_products'][0]['name']);
        $this->assertSame('Ram', $report['top_customers'][0]['name']);
    }

    public function test_custom_report_needs_a_valid_range(): void
    {
        $this->actingAs($this->admin)->getJson('/api/sales/report?period=custom')->assertUnprocessable()->assertJsonValidationErrors(['start', 'end']);
        $this->actingAs($this->admin)->getJson('/api/sales/report?period=custom&start=2026-05-10&end=2026-05-01')->assertUnprocessable()->assertJsonValidationErrors('end');
        $this->actingAs($this->admin)->getJson('/api/sales/report?period=hourly')->assertUnprocessable();
    }

    public function test_every_pdf_export_returns_a_real_pdf(): void
    {
        $this->makeSale($this->sp, 2);
        $year = now()->year;
        $from = now()->subDays(10)->toDateString();
        $to = now()->toDateString();

        foreach (["weekly", "monthly/$year", "monthly", "yearly", "custom?start=$from&end=$to"] as $path) {
            $res = $this->actingAs($this->admin)->get("/api/sales/report/pdf/$path")->assertOk();
            $this->assertSame('application/pdf', $res->headers->get('content-type'), $path);
            $this->assertStringStartsWith('%PDF', $res->getContent(), $path);
        }
    }

    public function test_bad_pdf_request_is_a_json_error_not_a_file(): void
    {
        //used to be a redirect the browser saved as a broken .pdf
        $this->actingAs($this->admin)->get('/api/sales/report/pdf/custom')->assertUnprocessable()->assertJsonValidationErrors('start');
    }

    /* ---------------- 4. Payments (receivables) ---------------- */

    public function test_salesperson_can_record_payment_on_own_sale(): void
    {
        $sale = $this->makeSale($this->sp, 2);
        $this->pay($this->sp, $sale, 50)->assertCreated();
        $this->assertSame('partially_paid', $sale->fresh()->payment_status);

        $this->pay($this->sp, $sale, 150)->assertCreated();
        $this->assertSame('paid', $sale->fresh()->payment_status);
    }

    public function test_salesperson_cannot_pay_another_salespersons_sale(): void
    {
        $sale = $this->makeSale($this->sp2, 2);
        $this->pay($this->sp, $sale, 50)->assertForbidden();
    }

    public function test_overpayment_is_rejected(): void
    {
        $sale = $this->makeSale($this->sp, 2); // total 200
        $this->pay($this->admin, $sale, 5000)->assertUnprocessable()->assertJsonValidationErrors('amount');
    }

    public function test_invalid_payment_method_is_rejected_cleanly(): void
    {
        $sale = $this->makeSale($this->sp, 2);
        $this->pay($this->admin, $sale, 10, ['payment_method' => 'bitcoin'])->assertUnprocessable();
    }

    public function test_payment_on_cancelled_sale_is_rejected(): void
    {
        $sale = $this->makeSale($this->sp, 2);
        $this->actingAs($this->admin)->patch("/sales/{$sale->id}/status", ['status' => 'Cancelled']);
        $this->pay($this->admin, $sale, 10)->assertForbidden();
    }

    public function test_receivables_are_scoped_to_the_salesperson(): void
    {
        $this->makeSale($this->sp, 1);
        $this->makeSale($this->sp2, 1);

        $this->actingAs($this->sp)->get('/receivables')->assertOk()
            ->assertInertia(fn($page) => $page->has('rows.data', 1)->where('summary.outstanding_invoices', 1));
        $this->actingAs($this->admin)->get('/receivables')->assertOk()
            ->assertInertia(fn($page) => $page->has('rows.data', 2));
    }

    public function test_cancelled_and_paid_sales_are_not_receivable(): void
    {
        $paid = $this->makeSale($this->sp, 1);
        $this->pay($this->sp, $paid, 100)->assertCreated();
        $cancelled = $this->makeSale($this->sp, 1);
        $this->actingAs($this->admin)->patch("/sales/{$cancelled->id}/status", ['status' => 'Cancelled']);

        $this->actingAs($this->admin)->get('/receivables')
            ->assertInertia(fn($page) => $page->has('rows.data', 0));
        $this->assertEquals(0, $this->actingAs($this->admin)->getJson('/api/reports/receivables/aging')->assertOk()->json('data.current'));
    }

    /* ---------------- 5. Purchasing: PO / GRN ---------------- */

    public function test_admin_can_create_purchase_order(): void
    {
        $po = $this->makePo(5, 60);
        $this->assertEquals(300, $po->total);
        $this->assertSame('ordered', $po->status);
        $this->assertSame('PO-' . now()->format('Y') . '-' . str_pad($po->id, 4, '0', STR_PAD_LEFT), $po->po_number);
        $this->assertEquals(300, $po->items()->first()->total_price);
    }

    public function test_salesperson_cannot_create_purchase_order(): void
    {
        $this->actingAs($this->sp)->post('/purchase-orders', [
            'supplier_id' => $this->supplier->id, 'order_date' => now()->toDateString(),
            'items' => [['product_id' => $this->product->id, 'quantity_ordered' => 5, 'unit_price' => 60]],
        ])->assertForbidden();
    }

    public function test_grn_partial_then_full_receipt(): void
    {
        $po = $this->makePo(5);
        $this->receive($po, 2)->assertSessionHasNoErrors();
        $this->assertSame('partially_received', $po->fresh()->status);

        $this->receive($po, 3)->assertSessionHasNoErrors();
        $this->assertSame('received', $po->fresh()->status);
        $this->assertSame(15, $this->product->fresh()->stock);
        $this->assertSame(2, GRN::count());
        $this->assertSame(2, StockMovement::where('type', 'restock')->count());
    }

    public function test_grn_cannot_over_receive(): void
    {
        $po = $this->makePo(5);
        $this->receive($po, 6)->assertSessionHasErrors('items');
        $this->assertSame(10, $this->product->fresh()->stock);
        $this->assertSame(0, GRN::count());
    }

    public function test_grn_rejected_on_cancelled_po(): void
    {
        $po = $this->makePo();
        $this->actingAs($this->admin)->post("/purchase-orders/{$po->id}/cancel");
        $this->receive($po, 3)->assertSessionHasErrors('items');
        $this->assertSame(10, $this->product->fresh()->stock);
    }

    public function test_grn_cannot_receive_items_of_another_po(): void
    {
        $po1 = $this->makePo();
        $po2 = $this->makePo();
        $this->actingAs($this->admin)->post("/purchase-orders/{$po1->id}/grn", [
            'items' => [['id' => $po2->items()->first()->id, 'qty_received' => 1]],
        ])->assertSessionHasErrors('items');
        $this->assertSame(10, $this->product->fresh()->stock);
    }

    public function test_partially_received_po_cannot_be_cancelled_but_can_be_closed(): void
    {
        $po = $this->makePo(5);
        $this->receive($po, 2);
        $this->actingAs($this->admin)->post("/purchase-orders/{$po->id}/cancel");
        $this->assertSame('partially_received', $po->fresh()->status);
        $this->actingAs($this->admin)->post("/purchase-orders/{$po->id}/close");
        $this->assertSame('closed', $po->fresh()->status);
    }

    /* ---------------- 6. Supplier bills & payables ---------------- */

    private function bill(PurchaseOrder $po, $amount, string $number = 'B-1')
    {
        return $this->actingAs($this->admin)->post('/supplier-bills', [
            'bill_number' => $number, 'supplier_id' => $this->supplier->id, 'purchase_order_id' => $po->id,
            'bill_date' => now()->toDateString(), 'due_date' => now()->addDays(15)->toDateString(), 'total_amount' => $amount,
        ]);
    }

    public function test_bill_cannot_exceed_received_goods(): void
    {
        $po = $this->makePo(5, 60);
        $this->receive($po, 2); // 120 received
        $this->bill($po, 200)->assertSessionHasErrors('total_amount');
        $this->bill($po, 120)->assertSessionHasNoErrors();
        $this->bill($po, 1, 'B-2')->assertSessionHasErrors('total_amount');
    }

    public function test_supplier_payment_updates_bill_and_rejects_overpayment(): void
    {
        $po = $this->makePo(5, 60);
        $this->receive($po, 5);
        $this->bill($po, 300);
        $bill = SupplierBill::firstOrFail();

        $payUrl = "/supplier-bills/{$bill->id}/payments";
        $data = ['method' => 'cash', 'paid_at' => now()->toDateString()];
        $this->actingAs($this->admin)->post($payUrl, $data + ['amount' => 100])->assertSessionHasNoErrors();
        $this->assertSame('partially_paid', $bill->fresh()->status);

        $this->actingAs($this->admin)->post($payUrl, $data + ['amount' => 500])->assertSessionHasErrors('amount');
        $this->actingAs($this->admin)->post($payUrl, $data + ['amount' => 200])->assertSessionHasNoErrors();
        $this->assertSame('paid', $bill->fresh()->status);

        $this->actingAs($this->admin)->get('/payables')->assertInertia(fn($page) => $page->has('rows.data', 0));
    }

    /* ---------------- 7. Referential integrity (history must survive) ---------------- */

    public function test_category_with_products_cannot_be_deleted(): void
    {
        $this->makeSale($this->sp, 2);
        $this->actingAs($this->admin)->delete("/categories/{$this->cat->id}")->assertSessionHas('error');
        $this->assertModelExists($this->cat);
        $this->assertSame(1, DB::table('sale_items')->count());
    }

    public function test_empty_category_can_be_deleted(): void
    {
        $empty = Category::create(['name' => 'Empty']);
        $this->actingAs($this->admin)->delete("/categories/{$empty->id}");
        $this->assertModelMissing($empty);
    }

    public function test_unused_product_is_really_deleted_and_frees_its_category(): void
    {
        //the reported bug: create category -> add product -> delete product -> category still "has products"
        $cat = Category::create(['name' => 'Smartphones']);
        $this->actingAs($this->admin)->post('/products', [
            'name' => 'Phone X', 'sku' => 'PX-1', 'description' => 'x', 'category_id' => $cat->id, 'price' => 100, 'stock' => 5,
        ])->assertSessionHasNoErrors();
        $phone = Product::where('sku', 'PX-1')->firstOrFail();

        $this->actingAs($this->admin)->delete("/products/{$phone->id}");
        $this->assertModelMissing($phone);
        $this->assertSame(0, StockMovement::where('product_id', $phone->id)->count());

        $this->actingAs($this->admin)->delete("/categories/{$cat->id}")->assertSessionHas('success');
        $this->assertNull(Category::withTrashed()->find($cat->id));
    }

    public function test_category_with_only_archived_products_is_archived_and_can_be_restored(): void
    {
        $this->makeSale($this->sp, 1);
        $this->actingAs($this->admin)->delete("/products/{$this->product->id}");
        $this->assertSoftDeleted($this->product);

        $this->actingAs($this->admin)->delete("/categories/{$this->cat->id}")->assertSessionHas('success');
        $this->assertSoftDeleted($this->cat);
        //history still knows the category
        $this->assertSame('Electronics', Product::withTrashed()->find($this->product->id)->category->name);

        //creating it again restores it instead of failing on the unique name
        $this->actingAs($this->admin)->post('/categories', ['name' => 'Electronics'])->assertSessionHasNoErrors();
        $this->assertNotSoftDeleted($this->cat);
    }

    public function test_deleting_sold_product_archives_it_and_keeps_history(): void
    {
        $this->makeSale($this->sp, 2);
        $this->actingAs($this->admin)->delete("/products/{$this->product->id}");
        $this->assertSoftDeleted($this->product);
        $this->assertSame(1, DB::table('sale_items')->count());
        //the sales list still renders the archived product's name
        $this->actingAs($this->admin)->get('/sales')->assertOk()
            ->assertInertia(fn($page) => $page->where('sales.data.0.items_summary', 'Mouse x2'));
    }

    public function test_archived_product_cannot_be_sold(): void
    {
        $this->product->delete();
        $this->actingAs($this->sp)->post('/sales', [
            'items' => [['product_id' => $this->product->id, 'quantity' => 1]],
        ])->assertSessionHasErrors('items.0.product_id');
    }

    public function test_deleting_salesperson_keeps_their_sales_and_payments(): void
    {
        $sale = $this->makeSale($this->sp, 2);
        $this->pay($this->sp, $sale, 10)->assertCreated();
        $this->actingAs($this->admin)->delete("/manageusers/{$this->sp->id}");

        $this->assertModelMissing($this->sp);
        $this->assertSame(1, Sale::count());
        $this->assertSame(1, Payment::count());
        $this->assertNull(Payment::first()->recorded_by);
    }

    public function test_supplier_with_purchase_orders_cannot_be_deleted(): void
    {
        $this->makePo();
        $this->actingAs($this->admin)->delete("/suppliers/{$this->supplier->id}")->assertSessionHas('error');
        $this->assertModelExists($this->supplier);
    }

    public function test_admin_deleting_customer_with_sales_archives_them(): void
    {
        $this->makeSale($this->sp, 1);
        $this->actingAs($this->admin)->delete("/managecustomers/{$this->customer->id}");
        $this->assertSoftDeleted($this->customer);
        $this->assertSame($this->customer->id, Sale::first()->customer_id);
    }

    /* ---------------- 8. Auth flow ---------------- */

    public function test_first_login_user_is_forced_to_reset_password(): void
    {
        $this->sp->update(['first_login' => true]);
        $this->actingAs($this->sp->fresh())->get('/products')->assertRedirect('/force-password-reset');
    }

    public function test_password_reset_redirects_to_the_users_own_dashboard(): void
    {
        $this->admin->update(['first_login' => true]);
        $this->actingAs($this->admin->fresh())->post('/force-password-reset', [
            'password' => 'NewPass1!', 'password_confirmation' => 'NewPass1!',
        ])->assertRedirect('/dashboard/admin');
        $this->assertFalse($this->admin->fresh()->first_login);
    }

    public function test_reset_page_is_closed_after_password_was_set(): void
    {
        $this->actingAs($this->sp)->get('/force-password-reset')->assertRedirect('/dashboard/salesperson');
    }

    /* ---------------- 9. Profile & settings ---------------- */

    public function test_profile_and_settings_pages_render_for_both_roles(): void
    {
        foreach ([$this->admin, $this->sp] as $user) {
            $this->actingAs($user)->get('/editprofile')->assertOk()
                ->assertInertia(fn($page) => $page->component('profile/EditProfile')->where('profile.email', $user->email));
            $this->actingAs($user)->get('/settings')->assertOk();
        }
    }

    public function test_user_can_update_profile_and_phone_is_normalised(): void
    {
        $this->actingAs($this->sp)->put('/editprofile', [
            'name' => 'Sita Sharma', 'username' => 'sita', 'phone' => '9841234567',
        ])->assertSessionHasNoErrors()->assertRedirect('/editprofile');

        $this->sp->refresh();
        $this->assertSame('Sita Sharma', $this->sp->name);
        $this->assertSame('+9779841234567', $this->sp->phone);
    }

    public function test_salesperson_cannot_change_their_login_email(): void
    {
        $this->actingAs($this->sp)->put('/editprofile', [
            'name' => 'Sp', 'username' => 'sp', 'email' => 'hijack@t.test',
        ]);
        $this->assertSame('sp@t.test', $this->sp->fresh()->email);
    }

    public function test_profile_rejects_taken_username_and_bad_phone(): void
    {
        $this->actingAs($this->sp)->put('/editprofile', [
            'name' => 'Sp', 'username' => 'admin', 'phone' => '12345',
        ])->assertSessionHasErrors(['username', 'phone']);
    }

    public function test_password_change_requires_current_password(): void
    {
        $this->actingAs($this->sp)->put('/settings/password', [
            'current_password' => 'wrong', 'password' => 'NewPass1!', 'password_confirmation' => 'NewPass1!',
        ])->assertSessionHasErrors('current_password');
    }

    public function test_password_can_be_changed(): void
    {
        $this->actingAs($this->sp)->put('/settings/password', [
            'current_password' => 'Password1!', 'password' => 'NewPass1!', 'password_confirmation' => 'NewPass1!',
        ])->assertSessionHasNoErrors()->assertRedirect('/settings');

        $this->assertTrue(\Illuminate\Support\Facades\Hash::check('NewPass1!', $this->sp->fresh()->password));
    }
}
