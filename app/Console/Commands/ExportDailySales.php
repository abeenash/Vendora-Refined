<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ExportDailySales extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:export-daily-sales';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Export daily completed sales to CSV';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $data = DB::select("
        SELECT 
        DATE(sales.created_at) AS date,
        SUM(sale_items.quantity) AS total_qty_sold
        FROM sales
        JOIN sale_items ON sales.id = sale_items.sale_id
        WHERE sales.status = 'completed'
        GROUP BY DATE(sales.created_at)
        ORDER BY date
        ");

        $file = fopen(base_path('ml/sales_daily.csv'),'w');
        fputcsv($file, ['date','total_qty_sold']);
        foreach($data as $row){
            fputcsv($file, [(string)$row->date,$row->total_qty_sold]);
        }
        fclose($file);

        $this->info('sales_daily.csv exported to /ml folder.');
    }
}
