<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class PredictionController extends Controller
{
    public function predict(Request $request)
    {
        $date = $request->date;

        $script = base_path('ml/predict.py');
        $python = 'python';

        //Run the Python script
        $command = "$python " . escapeshellarg($script) . " " . escapeshellarg($date) . " 2>&1";
        $output = shell_exec($command);

        //take last non-empty line (the actual prediction)
        $lines = array_filter(explode("\n", trim($output)));
        $prediction = floatval(end($lines));

        return response()->json([
            'command' => $command,
            'raw_output' => $output,
            'prediction' => $prediction,
            'cwd' => getcwd(),
            'date' => $date
        ]);
    }
}
