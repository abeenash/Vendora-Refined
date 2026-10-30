<?php

namespace Database\Seeders;

use App\Models\{Category, Customer, GRN, Payment, Product, PurchaseOrder, Sale, StockMovement, Supplier, SupplierBill, SupplierPayment, User};
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

/**
 * Six months of trading for a demo B2B business:
 *
 *   Sagarmatha IT & Mobile Distributors, Kathmandu: a wholesaler that buys from
 *   importers and sells on credit (net 30) to retail shops, cyber cafés, offices
 *   and schools in the valley and Pokhara, through four field salespeople.
 *
 * Instead of inserting random rows, it replays the business day by day with the
 * same rules the app enforces, so everything reconciles:
 *   - stock = opening + received (GRN) - sold + cancelled, and every change is a stock movement
 *   - low stock triggers a purchase order -> goods arrive (sometimes partially) -> supplier bill -> paid later
 *   - customers pay their invoices according to how reliable they are, so receivables age realistically
 *   - Saturdays (Nepal's weekend) are quiet, Dashain/Tihar season is busy
 *
 * Deterministic (fixed random seed): the same data on every run.
 */
class DemoBusinessSeeder extends Seeder
{
    private const DAYS = 180;
    private const VAT = 0.13;

    private Carbon $now;
    private Carbon $today;
    private User $admin;

    /** @var array<int, int> product id => current stock, kept in step with the database */
    private array $stock = [];

    /** @var array<int, true> products with an open purchase order (so they are not ordered twice) */
    private array $onOrder = [];

    /** @var array<string, list<array{0: Carbon, 1: callable}>> 'Y-m-d' => [when, event] pairs for that day */
    private array $agenda = [];

    public function run(): void
    {
        if (Product::withTrashed()->exists()) {
            $this->command?->warn('Products already exist: skipping demo data (run `php artisan migrate:fresh --seed` for a clean demo).');
            return;
        }

        mt_srand(2026);
        $this->now = now();
        $this->today = $this->now->copy()->startOfDay();

        Model::unguarded(function () {
            DB::transaction(function () {
                $start = $this->today->copy()->subDays(self::DAYS);

                $this->admin = User::where('role', 'admin')->firstOrFail();
                $reps = $this->salespeople($start);
                $suppliers = $this->suppliers($start);
                $products = $this->catalogue($start, $suppliers);
                $customers = $this->customers($start, $reps);

                //each day: book its sales and the evening stock check, then play the whole day back in time order
                for ($day = $start->copy()->addDay(); $day->lte($this->today); $day->addDay()) {
                    $this->tradeDay($day, $customers, $reps, $products);
                    if (!$day->isSaturday()) {
                        $this->schedule($day->copy()->setTime(18, 30), fn(Carbon $when) => $this->restock($when, $products, $suppliers));
                    }
                    $this->runAgenda($day);
                }
            });
        });

        $this->command?->info(sprintf(
            'Demo business seeded: %d products, %d customers, %d sales, %d payments, %d purchase orders, %d supplier bills.',
            Product::count(), Customer::count(), Sale::count(), Payment::count(), PurchaseOrder::count(), SupplierBill::count()
        ));
    }

    /* =================================================================== master data */

    private function salespeople(Carbon $at): array
    {
        //sales@vendora.com stays the demo login; the others are the rest of the field team
        $team = [
            ['sales@vendora.com', 'Anish Shrestha', 'anish', '+9779841111111', 'Kathmandu'],
            ['pooja@vendora.com', 'Pooja Thapa', 'pooja', '+9779841222222', 'Lalitpur'],
            ['ramesh@vendora.com', 'Ramesh Karki', 'ramesh', '+9779841333333', 'Bhaktapur'],
            ['sunita@vendora.com', 'Sunita Gurung', 'sunita', '+9779841444444', 'Pokhara'],
        ];

        $reps = [];
        foreach ($team as [$email, $name, $username, $phone, $area]) {
            $user = User::updateOrCreate(['email' => $email], [
                'name' => $name, 'username' => $username, 'phone' => $phone, 'role' => 'salesperson',
                'password' => Hash::make('password'), 'first_login' => false,
                'last_login' => $this->today->copy()->subHours(mt_rand(2, 60)),
                'created_at' => $at, 'updated_at' => $at,
            ]);
            $reps[$area] = $user;
        }
        return $reps;
    }

    private function suppliers(Carbon $at): array
    {
        $list = [
            'mobile' => ['Himal Mobile Accessories Importers', 'Bikash Rai', 'orders@himalmobile.com.np', '014251234', 'Khichapokhari, Kathmandu', '301245678'],
            'computer' => ['Yantra Distributors Pvt. Ltd.', 'Sanjay Shakya', 'sales@yantra.com.np', '014432567', 'Putalisadak, Kathmandu', '302356789'],
            'network' => ['NetLink Trading Concern', 'Prakash Adhikari', 'info@netlink.com.np', '015523344', 'Kupondole, Lalitpur', '303467890'],
            'storage' => ['Kathmandu Storage Solutions', 'Reena Joshi', 'reena@ktmstorage.com.np', '014269988', 'Teku, Kathmandu', '304578901'],
            'power' => ['Everest Power Systems', 'Dinesh Basnet', 'sales@everestpower.com.np', '014356677', 'Balaju, Kathmandu', '305689012'],
            'office' => ['Nepal Office Supplies Co.', 'Kamala Pradhan', 'orders@nepaloffice.com.np', '014221133', 'Bagbazar, Kathmandu', '306790123'],
        ];

        $suppliers = [];
        foreach ($list as $key => [$name, $contact, $email, $phone, $address, $pan]) {
            $suppliers[$key] = Supplier::create([
                'name' => $name, 'contact_person' => $contact, 'email' => $email, 'phone' => $phone,
                'address' => $address, 'tax_id' => $pan, 'notes' => 'Credit terms: net 30. PAN ' . $pan,
                'created_at' => $at, 'updated_at' => $at,
            ]);
        }
        return $suppliers;
    }

    /** @return array<int, array{product: Product, supplier: Supplier, cost: float, target: int}> */
    private function catalogue(Carbon $at, array $suppliers): array
    {
        //[name, sku, wholesale price NPR, opening stock, min stock]
        $catalogue = [
            'Mobile Accessories' => ['mobile', [
                ['Tempered Glass 6.5" (Universal)', 'MA-TG65', 60, 600, 120],
                ['Silicone Back Case (Assorted)', 'MA-SC100', 120, 400, 80],
                ['25W Type-C Fast Charger', 'MA-CH25C', 850, 150, 30],
                ['20W USB-C PD Charger', 'MA-CH20PD', 1150, 90, 20],
                ['Wireless Earbuds EB-110', 'MA-EB110', 1800, 60, 15],
                ['Power Bank 10000mAh', 'MA-PB10K', 1650, 70, 15],
                ['Dual USB Car Charger', 'MA-CC02', 450, 120, 25],
            ]],
            'Computer Peripherals' => ['computer', [
                ['USB Optical Mouse', 'CP-MS100', 320, 300, 60],
                ['Wireless Mouse 2.4G', 'CP-MS220W', 650, 160, 30],
                ['USB Keyboard (Standard)', 'CP-KB101', 550, 150, 30],
                ['Wireless Keyboard & Mouse Combo', 'CP-KM300', 1750, 60, 12],
                ['15.6" Laptop Backpack', 'CP-LB156', 1200, 70, 15],
                ['1080p USB Webcam', 'CP-WC1080', 2400, 40, 8],
                ['Headset with Mic', 'CP-HS200', 950, 90, 20],
            ]],
            'Networking' => ['network', [
                ['N300 Wi-Fi Router', 'NW-N300', 2150, 50, 10],
                ['AC1200 Dual-Band Router', 'NW-AC1200', 4200, 30, 6],
                ['8-Port Gigabit Switch', 'NW-SW8G', 2600, 35, 8],
                ['Cat6 Cable Box 305m', 'NW-C6305', 12500, 12, 3],
                ['RJ45 Connectors (100 pcs)', 'NW-RJ100', 650, 120, 25],
                ['USB Wi-Fi Adapter 150Mbps', 'NW-WA150', 750, 80, 15],
            ]],
            'Storage Devices' => ['storage', [
                ['32GB Pen Drive', 'ST-PD32', 520, 250, 50],
                ['64GB Pen Drive', 'ST-PD64', 780, 180, 35],
                ['32GB microSD Card (Class 10)', 'ST-SD32', 560, 220, 45],
                ['1TB External Hard Drive', 'ST-HD1T', 7800, 20, 5],
                ['512GB SATA SSD', 'ST-SSD512', 5400, 25, 6],
            ]],
            'Power & Cables' => ['power', [
                ['Type-C Data Cable 1m', 'PC-CBC1', 180, 500, 100],
                ['Lightning Cable 1m', 'PC-CBL1', 260, 300, 60],
                ['HDMI Cable 1.5m', 'PC-HDMI15', 350, 200, 40],
                ['4-Way Extension Board', 'PC-EXT4', 650, 120, 25],
                ['650VA Line-Interactive UPS', 'PC-UPS650', 6900, 18, 4],
            ]],
            'Printers & Supplies' => ['office', [
                ['A4 Paper Ream 80gsm (500 sheets)', 'OF-PAPA4', 620, 300, 60],
                ['PG-47 Black Ink Cartridge', 'OF-INK47', 1050, 80, 15],
                ['12A Compatible Toner', 'OF-TON12A', 2300, 45, 10],
                ['003 Ink Bottle Set (4 colours)', 'OF-INK003', 2600, 40, 8],
                ['Thermal Receipt Roll 80mm (box of 50)', 'OF-THR80', 2900, 30, 6],
            ]],
        ];

        $products = [];
        foreach ($catalogue as $categoryName => [$supplierKey, $items]) {
            $category = Category::create(['name' => $categoryName, 'created_at' => $at, 'updated_at' => $at]);

            foreach ($items as [$name, $sku, $price, $opening, $min]) {
                $product = Product::create([
                    'name' => $name, 'sku' => $sku, 'category_id' => $category->id,
                    'description' => "{$categoryName} · wholesale pack pricing",
                    'price' => $price, 'stock' => $opening, 'min_stock' => $min,
                    'created_at' => $at, 'updated_at' => $at,
                ]);
                $this->stock[$product->id] = $opening;
                $this->log($product, 0, $opening, 'adjustment', 'Opening stock', $at, $this->admin->id);

                $products[$product->id] = [
                    'product' => $product,
                    'supplier' => $suppliers[$supplierKey],
                    'cost' => round($price * (mt_rand(68, 78) / 100)), //buying price ~70-78% of selling price
                    'target' => $opening,
                ];
            }
        }
        return $products;
    }

    private function customers(Carbon $at, array $reps): array
    {
        //[business, area, reliability]; reliability decides how they pay (see payInvoice)
        $list = [
            ['Bishal Mobile Center', 'New Road, Kathmandu', 'Kathmandu', 'reliable'],
            ['Shrestha Computer House', 'Putalisadak, Kathmandu', 'Kathmandu', 'reliable'],
            ['Click Cyber Café', 'Baneshwor, Kathmandu', 'Kathmandu', 'slow'],
            ['Everest Engineering College (Store)', 'Sanepa, Lalitpur', 'Lalitpur', 'reliable'],
            ['Nabil Tech Solutions', 'Thamel, Kathmandu', 'Kathmandu', 'slow'],
            ['Ganesh Electronics', 'Asan, Kathmandu', 'Kathmandu', 'reliable'],
            ['Smart Zone Mobile', 'Chabahil, Kathmandu', 'Kathmandu', 'risky'],
            ['Patan Digital Hub', 'Mangal Bazar, Lalitpur', 'Lalitpur', 'reliable'],
            ['Lalitpur Office Mart', 'Pulchowk, Lalitpur', 'Lalitpur', 'slow'],
            ['Jawalakhel Computers', 'Jawalakhel, Lalitpur', 'Lalitpur', 'reliable'],
            ['Kumari Stationery & Print', 'Lagankhel, Lalitpur', 'Lalitpur', 'risky'],
            ['Bhaktapur Mobile Point', 'Durbar Square, Bhaktapur', 'Bhaktapur', 'reliable'],
            ['Suryabinayak IT Center', 'Suryabinayak, Bhaktapur', 'Bhaktapur', 'slow'],
            ['Kathmandu University (Procurement)', 'Dhulikhel, Kavre', 'Bhaktapur', 'reliable'],
            ['Thimi Tech Store', 'Madhyapur Thimi, Bhaktapur', 'Bhaktapur', 'risky'],
            ['Lakeside Gadget Store', 'Lakeside, Pokhara', 'Pokhara', 'reliable'],
            ['Pokhara Computer Bazaar', 'Mahendrapul, Pokhara', 'Pokhara', 'slow'],
            ['Fewa Cyber & Print', 'Baidam, Pokhara', 'Pokhara', 'reliable'],
            ['Annapurna Office Solutions', 'Chipledhunga, Pokhara', 'Pokhara', 'slow'],
            ['Gurung Mobile Suppliers', 'Prithvi Chowk, Pokhara', 'Pokhara', 'risky'],
            ['Koteshwor Tech Mart', 'Koteshwor, Kathmandu', 'Kathmandu', 'reliable'],
            ['Himalayan Bank (IT Dept.)', 'Kamaladi, Kathmandu', 'Kathmandu', 'reliable'],
            ['Satdobato Electronics', 'Satdobato, Lalitpur', 'Lalitpur', 'reliable'],
            ['Sallaghari Computer Care', 'Sallaghari, Bhaktapur', 'Bhaktapur', 'slow'],
        ];

        $customers = [];
        foreach ($list as $i => [$name, $address, $area, $reliability]) {
            $slug = strtolower(preg_replace('/[^a-z0-9]+/i', '', explode(' (', $name)[0]));
            $customer = Customer::create([
                'name' => $name,
                'email' => substr($slug, 0, 20) . '@gmail.com',
                'phone' => '+97798' . str_pad((string) (51000000 + $i * 37171), 8, '0', STR_PAD_LEFT),
                'address' => $address,
                'user_id' => $reps[$area]->id,
                'created_at' => $at, 'updated_at' => $at,
            ]);
            //bigger institutions buy bigger
            $customers[] = ['model' => $customer, 'rep' => $reps[$area], 'reliability' => $reliability,
                'size' => str_contains($name, 'University') || str_contains($name, 'College') || str_contains($name, 'Bank') ? 2.0 : 1.0];
        }
        return $customers;
    }

    /* =================================================================== the daily simulation */

    private function tradeDay(Carbon $day, array $customers, array $reps, array $products): void
    {
        //Saturday is the weekly holiday in Nepal; Sep-Oct is the Dashain/Tihar rush
        $rate = $day->isSaturday() ? 0.15 : 0.95;
        if (in_array($day->month, [9, 10])) {
            $rate *= 1.4;
        }
        $count = (int) floor($rate + mt_rand(0, 100) / 100 * $rate);

        for ($n = 0; $n < $count; $n++) {
            $at = $day->copy()->setTime(mt_rand(9, 17), mt_rand(0, 59));
            //a few counter (walk-in) sales, the rest go to account customers
            if (mt_rand(1, 100) <= 6) {
                $rep = $reps[array_rand($reps)];
                $this->schedule($at, fn(Carbon $when) => $this->sell($when, null, $rep, $products));
            } else {
                $c = $customers[array_rand($customers)];
                $this->schedule($at, fn(Carbon $when) => $this->sell($when, $c, $c['rep'], $products));
            }
        }
    }

    private function sell(Carbon $at, ?array $customer, User $rep, array $products): void
    {
        $size = $customer['size'] ?? 0.5;
        $lines = [];
        foreach ((array) array_rand($products, mt_rand(1, 4)) as $productId) {
            $price = (float) $products[$productId]['product']->price;
            //B2B quantities: lots of cheap items, a few expensive ones
            $qty = (int) round(match (true) {
                $price < 500 => mt_rand(10, 60),
                $price < 2000 => mt_rand(3, 20),
                $price < 6000 => mt_rand(1, 6),
                default => mt_rand(1, 3),
            } * $size);
            $qty = min(max(1, $qty), $this->stock[$productId]);
            if ($qty > 0) {
                $lines[$productId] = $qty;
            }
        }
        if (!$lines) {
            return; //everything they wanted is out of stock
        }

        $age = $at->diffInDays($this->today);
        $roll = mt_rand(1, 100);
        $status = $age > 5
            ? ($roll <= 91 ? 'Completed' : ($roll <= 96 ? 'Cancelled' : 'Pending'))
            : ($roll <= 48 ? 'Pending' : ($roll <= 97 ? 'Completed' : 'Cancelled'));

        $sale = Sale::create([
            'customer_id' => $customer['model']->id ?? null,
            'user_id' => $rep->id,
            'status' => 'Pending',
            'total_price' => 0,
            'due_date' => $at->copy()->addDays(30)->toDateString(), //net 30
            'created_at' => $at, 'updated_at' => $at,
        ]);
        $sale->sale_number = 'SALE-' . str_pad($sale->id, 5, '0', STR_PAD_LEFT);

        $total = 0;
        foreach ($lines as $productId => $qty) {
            $product = $products[$productId]['product'];
            $subtotal = $qty * (float) $product->price;
            $sale->items()->create([
                'product_id' => $productId, 'quantity' => $qty, 'price' => $product->price, 'subtotal' => $subtotal,
                'created_at' => $at, 'updated_at' => $at,
            ]);
            $this->adjust($product, -$qty, 'sale', "Stock deducted because of Sale {$sale->sale_number}", $at, $rep->id);
            $total += $subtotal;
        }
        $sale->total_price = $total;
        $sale->status = $status === 'Cancelled' ? 'Pending' : $status; //cancelled later, below
        $sale->save();

        if ($status === 'Cancelled') {
            //customer changed their mind a day or two later; stock goes back
            $this->schedule($this->later($at, mt_rand(0, 2)), function (Carbon $when) use ($sale, $products, $rep) {
                foreach ($sale->items as $item) {
                    $this->adjust($products[$item->product_id]['product'], $item->quantity, 'cancel', "Stock returned because Sale {$sale->sale_number} was cancelled", $when, $rep->id);
                }
                $sale->forceFill(['status' => 'Cancelled', 'updated_at' => $when])->save();
            });
            return;
        }

        $this->payInvoice($sale, $at, $customer['reliability'] ?? 'walkin', $rep);
    }

    //plan the customer's payments for one invoice, according to how they usually pay
    private function payInvoice(Sale $sale, Carbon $at, string $reliability, User $rep): void
    {
        $total = (float) $sale->total_price;
        $plan = match ($reliability) {
            'walkin' => [[0, 1.0]],                                                     //counter sale: paid on the spot
            'reliable' => mt_rand(1, 100) <= 75
                ? [[mt_rand(0, 22), 1.0]]
                : [[mt_rand(3, 12), 0.5], [mt_rand(18, 30), 1.0]],
            'slow' => [[mt_rand(12, 28), mt_rand(40, 60) / 100], [mt_rand(38, 70), 1.0]],
            'risky' => mt_rand(1, 100) <= 55 ? [[mt_rand(20, 45), mt_rand(25, 50) / 100]] : [],
        };

        $paid = 0;
        foreach ($plan as [$afterDays, $share]) {
            //a share of 1.0 means "whatever is still owed"
            $amount = $share >= 1.0 ? $total - $paid : round($total * $share, -1);
            if ($amount <= 0) {
                continue;
            }
            $paid += $amount;

            $this->schedule($this->later($at, $afterDays), function (Carbon $when) use ($sale, $amount, $rep, $reliability) {
                $method = $reliability === 'walkin'
                    ? (mt_rand(0, 1) ? 'cash' : 'esewa')
                    : ['bank_transfer', 'bank_transfer', 'cheque', 'connectips', 'esewa'][mt_rand(0, 4)];

                Payment::create([
                    'sale_id' => $sale->id,
                    'amount' => $amount,
                    'payment_method' => $method,
                    'reference_number' => $method === 'cash' ? null : strtoupper(substr($method, 0, 3)) . '-' . $when->format('ymd') . '-' . mt_rand(1000, 9999),
                    'payment_date' => $when->toDateString(),
                    'recorded_by' => $rep->id,
                    //the owner checks most payments against the bank statement after a few days
                    'verified_by' => $when->diffInDays($this->today) > 4 && mt_rand(1, 100) <= 80 ? $this->admin->id : null,
                    'created_at' => $when, 'updated_at' => $when,
                ]);
                $sale->recalculatePayments();
            });
        }
    }

    //top up anything running low with a purchase order to its supplier
    private function restock(Carbon $at, array $products, array $suppliers): void
    {
        $low = [];
        foreach ($products as $id => $p) {
            if ($this->stock[$id] <= $p['product']->min_stock * 1.6 && !isset($this->onOrder[$id])) {
                $low[$p['supplier']->id][] = $id;
            }
        }

        foreach ($low as $supplierId => $productIds) {
            $po = PurchaseOrder::create([
                'po_number' => 'PO-PENDING-' . uniqid(),
                'supplier_id' => $supplierId, 'created_by' => $this->admin->id,
                'order_date' => $at->toDateString(), 'expected_delivery' => $at->copy()->addDays(5)->toDateString(),
                'subtotal' => 0, 'tax' => 0, 'total' => 0, 'status' => 'ordered',
                'created_at' => $at, 'updated_at' => $at,
            ]);
            $po->po_number = 'PO-' . $at->format('Y') . '-' . str_pad($po->id, 4, '0', STR_PAD_LEFT);

            $subtotal = 0;
            foreach ($productIds as $id) {
                $qty = max($products[$id]['target'] - $this->stock[$id], $products[$id]['product']->min_stock);
                $line = $qty * $products[$id]['cost'];
                $po->items()->create([
                    'product_id' => $id, 'quantity_ordered' => $qty, 'quantity_received' => 0,
                    'unit_price' => $products[$id]['cost'], 'total_price' => $line,
                    'created_at' => $at, 'updated_at' => $at,
                ]);
                $subtotal += $line;
                $this->onOrder[$id] = true;
            }
            $po->forceFill(['subtotal' => $subtotal, 'tax' => round($subtotal * self::VAT, 2), 'total' => round($subtotal * (1 + self::VAT), 2)])->save();

            //goods arrive 3-8 days later; one delivery in six is short and the rest follows later
            $arrival = $at->copy()->addDays(mt_rand(3, 8))->setTime(mt_rand(10, 16), 0);
            $partial = mt_rand(1, 6) === 1;
            $this->schedule($arrival, fn(Carbon $when) => $this->receive($po, $when, $partial ? 0.6 : 1.0, $products));
            if ($partial) {
                $this->schedule($arrival->copy()->addDays(mt_rand(6, 12)), fn(Carbon $when) => $this->receive($po, $when, 1.0, $products));
            }
        }
    }

    private function receive(PurchaseOrder $po, Carbon $when, float $share, array $products): void
    {
        $grn = GRN::create([
            'purchase_order_id' => $po->id, 'received_by' => $this->admin->id, 'received_at' => $when,
            'notes' => $share < 1 ? 'Short delivery, balance to follow' : null,
            'created_at' => $when, 'updated_at' => $when,
        ]);

        $value = 0;
        foreach ($po->items()->get() as $item) {
            $remaining = $item->quantity_ordered - $item->quantity_received;
            $qty = $share < 1 ? (int) floor($remaining * $share) : $remaining;
            if ($qty <= 0) {
                continue;
            }
            $item->forceFill(['quantity_received' => $item->quantity_received + $qty, 'updated_at' => $when])->save();
            $grn->items()->create([
                'purchase_order_item_id' => $item->id, 'product_id' => $item->product_id, 'qty_received' => $qty,
                'created_at' => $when, 'updated_at' => $when,
            ]);
            $this->adjust($products[$item->product_id]['product'], $qty, 'restock', "Received on {$po->po_number} (GRN #{$grn->id})", $when, $this->admin->id);
            $value += $qty * (float) $item->unit_price;
        }

        $po->refresh()->refreshReceivingStatus();
        if ($po->status === 'received') {
            foreach ($po->items as $item) {
                unset($this->onOrder[$item->product_id]);
            }
        }

        //the supplier invoices what was delivered (+13% VAT), due in 30 days
        $billAt = $when->copy()->addHours(2);
        $bill = SupplierBill::create([
            'bill_number' => strtoupper(substr(preg_replace('/[^A-Za-z]/', '', $po->supplier->name), 0, 3)) . '-INV-' . $when->format('Y') . '-' . str_pad((string) mt_rand(100, 9999), 4, '0', STR_PAD_LEFT) . $grn->id,
            'supplier_id' => $po->supplier_id, 'purchase_order_id' => $po->id,
            'bill_date' => $billAt->toDateString(), 'due_date' => $billAt->copy()->addDays(30)->toDateString(),
            'total_amount' => round($value * (1 + self::VAT), 2), 'paid_amount' => 0, 'status' => 'unpaid',
            'created_at' => $billAt, 'updated_at' => $billAt,
        ]);

        //we usually pay 15-45 days later, sometimes in two parts
        $first = $billAt->copy()->addDays(mt_rand(15, 45))->setTime(14, 0);
        $split = mt_rand(1, 4) === 1;
        $this->schedule($first, fn(Carbon $w) => $this->paySupplier($bill, $w, $split ? 0.5 : 1.0));
        if ($split) {
            $this->schedule($first->copy()->addDays(mt_rand(10, 25)), fn(Carbon $w) => $this->paySupplier($bill, $w, 1.0));
        }
    }

    private function paySupplier(SupplierBill $bill, Carbon $when, float $share): void
    {
        $bill->refresh();
        $amount = $share >= 1 ? $bill->balanceDue() : round($bill->balanceDue() * $share, -1);
        if ($amount <= 0) {
            return;
        }
        SupplierPayment::create([
            'supplier_bill_id' => $bill->id, 'supplier_id' => $bill->supplier_id, 'amount' => $amount,
            'method' => mt_rand(1, 3) === 1 ? 'cheque' : 'bank_transfer',
            'reference' => 'TXN' . $when->format('ymd') . mt_rand(100, 999),
            'paid_at' => $when->toDateString(), 'recorded_by' => $this->admin->id,
            'created_at' => $when, 'updated_at' => $when,
        ]);
        $bill->recalcPaid();
    }

    /* =================================================================== helpers */

    private function adjust(Product $product, int $delta, string $type, string $description, Carbon $at, ?int $userId): void
    {
        $old = $this->stock[$product->id];
        $new = $old + $delta;
        $this->stock[$product->id] = $new;
        $product->forceFill(['stock' => $new, 'updated_at' => $at])->save();
        $this->log($product, $old, $new, $type, $description, $at, $userId);
    }

    private function log(Product $product, int $old, int $new, string $type, string $description, Carbon $at, ?int $userId): void
    {
        StockMovement::create([
            'product_id' => $product->id, 'user_id' => $userId, 'old_stock' => $old, 'new_stock' => $new,
            'type' => $type, 'description' => $description, 'created_at' => $at, 'updated_at' => $at,
        ]);
    }

    //a moment after $at: same day = a little later, otherwise during business hours that day
    private function later(Carbon $at, int $days): Carbon
    {
        return $days === 0
            ? $at->copy()->addMinutes(mt_rand(5, 90))
            : $at->copy()->addDays($days)->setTime(mt_rand(10, 17), mt_rand(0, 59));
    }

    //run $event at that moment, if it has come yet (anything later than "now" simply never happens)
    private function schedule(Carbon $when, callable $event): void
    {
        if ($when->gt($this->now)) {
            return;
        }
        $this->agenda[$when->toDateString()][] = [$when, $event];
    }

    //play one day back strictly in time order, including events booked while it runs
    //(e.g. a counter payment a few minutes after a sale), so stock movements chain correctly
    private function runAgenda(Carbon $day): void
    {
        $key = $day->toDateString();
        while (!empty($this->agenda[$key])) {
            usort($this->agenda[$key], fn($a, $b) => $a[0] <=> $b[0]);
            [$when, $event] = array_shift($this->agenda[$key]);
            $event($when);
        }
        unset($this->agenda[$key]);
    }
}
