<?php

namespace App\Console\Commands;

use App\Services\DemoReset;
use Illuminate\Console\Command;

class RefreshDemo extends Command
{
    protected $signature = 'demo:refresh
                            {--if-stale : Only rebuild if it has not been rebuilt today}
                            {--force : Run even when DEMO_MODE is off}';

    protected $description = 'Rebuild the demo business so its history ends today (public demo only)';

    public function handle(DemoReset $reset): int
    {
        //this empties the business tables, so it must never run on real data by accident
        if (!config('vendora.demo') && !$this->option('force')) {
            $this->warn('DEMO_MODE is off: refusing to reset the data. Use --force if you really mean it.');
            return self::FAILURE;
        }

        if ($this->option('if-stale') && !DemoReset::isStale()) {
            $this->line('Demo data is already from today (' . DemoReset::refreshedOn() . '), nothing to do.');
            return self::SUCCESS;
        }

        $started = microtime(true);
        $reset->run();
        $this->info(sprintf('Demo data rebuilt for %s in %.1fs.', now()->toDateString(), microtime(true) - $started));

        return self::SUCCESS;
    }
}
