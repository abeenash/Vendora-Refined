<?php

namespace App\Services;

use App\Models\Sale;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

/**
 * Builds one sales report (weekly / monthly / yearly / custom range) that both the
 * Sales Report page and the PDF export use, so the two can never disagree.
 *
 * Cancelled sales are not revenue: they are excluded from every figure and only
 * counted separately. Grouping is done in PHP, so it works on any database.
 */
class SalesReport
{
    public const PERIODS = ['weekly', 'monthly', 'yearly', 'custom'];

    //longer custom ranges are grouped by month instead of by day
    private const MAX_DAILY_DAYS = 62;

    public static function make(string $period, ?int $year = null, ?string $start = null, ?string $end = null): array
    {
        [$from, $to, $bucket, $title] = self::range($period, $year, $start, $end);

        $sales = Sale::query()
            ->where('status', '!=', 'Cancelled')
            ->whereBetween('created_at', [$from, $to])
            ->withSum('items as units', 'quantity')
            ->get(['id', 'created_at', 'total_price', 'total_paid', 'customer_id']);

        //every day/month/year in the range gets a row, even with no sales, so gaps are visible
        $rows = [];
        foreach (self::buckets($from, $to, $bucket) as $key => $label) {
            $rows[$key] = ['key' => $key, 'label' => $label, 'orders' => 0, 'units' => 0, 'revenue' => 0.0];
        }
        foreach ($sales as $sale) {
            $key = $sale->created_at->format(self::keyFormat($bucket));
            if (!isset($rows[$key])) {
                continue;
            }
            $rows[$key]['orders']++;
            $rows[$key]['units'] += (int) $sale->units;
            $rows[$key]['revenue'] += (float) $sale->total_price;
        }
        $rows = array_values($rows);

        $max = max(array_column($rows, 'revenue') ?: [0]);
        foreach ($rows as &$row) {
            $row['revenue'] = round($row['revenue'], 2);
            $row['share'] = $max > 0 ? $row['revenue'] / $max : 0; //for bars in the page and the PDF
        }
        unset($row);

        $revenue = round((float) $sales->sum('total_price'), 2);
        $collected = round((float) $sales->sum('total_paid'), 2);
        $orders = $sales->count();
        $best = collect($rows)->sortByDesc('revenue')->first();

        return [
            'period' => $period,
            'title' => $title,
            'bucket' => $bucket,
            'from' => $from->toDateString(),
            'to' => $to->toDateString(),
            'range_label' => $from->isSameDay($to) ? $from->format('d M Y') : $from->format('d M Y') . ' – ' . $to->format('d M Y'),
            'rows' => $rows,
            'summary' => [
                'revenue' => $revenue,
                'orders' => $orders,
                'units' => (int) $sales->sum('units'),
                'avg_order' => $orders ? round($revenue / $orders, 2) : 0,
                'customers' => $sales->pluck('customer_id')->filter()->unique()->count(),
                'collected' => $collected,
                'outstanding' => round($revenue - $collected, 2),
                'collection_rate' => $revenue > 0 ? round($collected / $revenue * 100, 1) : 0,
                'cancelled' => Sale::where('status', 'Cancelled')->whereBetween('created_at', [$from, $to])->count(),
                'best' => $best && $best['revenue'] > 0 ? ['label' => $best['label'], 'revenue' => $best['revenue']] : null,
            ],
            'top_products' => self::topProducts($from, $to),
            'top_customers' => self::topCustomers($from, $to),
        ];
    }

    /** @return array{Carbon, Carbon, string, string} [from, to, bucket, title] */
    private static function range(string $period, ?int $year, ?string $start, ?string $end): array
    {
        $now = now();

        return match ($period) {
            'weekly' => [$now->copy()->subDays(6)->startOfDay(), $now->copy()->endOfDay(), 'day', 'Weekly Sales Report'],
            'monthly' => (function () use ($year, $now) {
                $year ??= $now->year;
                $from = Carbon::create($year, 1, 1)->startOfDay();
                //the current year stops at this month instead of listing empty future months
                $to = $year === $now->year ? $now->copy()->endOfMonth() : $from->copy()->endOfYear();
                return [$from, $to, 'month', "Monthly Sales Report · {$year}"];
            })(),
            'yearly' => (function () use ($now) {
                $first = Sale::min('created_at');
                $from = ($first ? Carbon::parse($first) : $now->copy())->startOfYear();
                return [$from, $now->copy()->endOfYear(), 'year', 'Yearly Sales Report'];
            })(),
            'custom' => (function () use ($start, $end) {
                $from = Carbon::parse($start)->startOfDay();
                $to = Carbon::parse($end)->endOfDay();
                $bucket = $from->diffInDays($to) < self::MAX_DAILY_DAYS ? 'day' : 'month';
                return [$from, $to, $bucket, 'Custom Range Sales Report'];
            })(),
            default => throw new InvalidArgumentException("Unknown report period [$period]"),
        };
    }

    private static function keyFormat(string $bucket): string
    {
        return ['day' => 'Y-m-d', 'month' => 'Y-m', 'year' => 'Y'][$bucket];
    }

    private static function buckets(Carbon $from, Carbon $to, string $bucket): array
    {
        $interval = ['day' => '1 day', 'month' => '1 month', 'year' => '1 year'][$bucket];
        $label = ['day' => 'D, d M', 'month' => 'M Y', 'year' => 'Y'][$bucket];
        $start = match ($bucket) {
            'day' => $from->copy()->startOfDay(),
            'month' => $from->copy()->startOfMonth(),
            'year' => $from->copy()->startOfYear(),
        };

        $out = [];
        foreach (CarbonPeriod::create($start, $interval, $to) as $date) {
            $out[$date->format(self::keyFormat($bucket))] = $date->format($label);
        }
        return $out;
    }

    private static function topProducts(Carbon $from, Carbon $to): array
    {
        //plain query (not Eloquent), so archived products still count in history
        return DB::table('sale_items')
            ->join('sales', 'sale_items.sale_id', '=', 'sales.id')
            ->join('products', 'sale_items.product_id', '=', 'products.id')
            ->where('sales.status', '!=', 'Cancelled')
            ->whereBetween('sales.created_at', [$from, $to])
            ->groupBy('products.id', 'products.name', 'products.sku')
            ->orderByDesc('revenue')
            ->limit(5)
            ->get([
                'products.name',
                'products.sku',
                DB::raw('SUM(sale_items.quantity) as units'),
                DB::raw('SUM(sale_items.subtotal) as revenue'),
            ])
            ->map(fn($r) => ['name' => $r->name, 'sku' => $r->sku, 'units' => (int) $r->units, 'revenue' => round((float) $r->revenue, 2)])
            ->all();
    }

    private static function topCustomers(Carbon $from, Carbon $to): array
    {
        return DB::table('sales')
            ->join('customers', 'sales.customer_id', '=', 'customers.id')
            ->where('sales.status', '!=', 'Cancelled')
            ->whereBetween('sales.created_at', [$from, $to])
            ->groupBy('customers.id', 'customers.name')
            ->orderByDesc('revenue')
            ->limit(5)
            ->get([
                'customers.name',
                DB::raw('COUNT(sales.id) as orders'),
                DB::raw('SUM(sales.total_price) as revenue'),
            ])
            ->map(fn($r) => ['name' => $r->name, 'orders' => (int) $r->orders, 'revenue' => round((float) $r->revenue, 2)])
            ->all();
    }
}
