<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

/*
| Public demo: keep the demo business "live". Checked every hour, so it rebuilds once
| shortly after midnight (Asia/Kathmandu), or as soon as the server is up again if it
| was asleep / restarting at midnight. Does nothing unless DEMO_MODE=true.
| Runs inside the app container via `php artisan schedule:work` (no external cron needed).
*/
Schedule::command('demo:refresh --if-stale')
    ->hourly()
    ->when(fn() => config('vendora.demo'))
    ->withoutOverlapping(30)
    ->runInBackground();
