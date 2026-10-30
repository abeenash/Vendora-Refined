@php
    /*
    | Receipt-style sales report (rendered by DomPDF: tables only, no flexbox).
    | $report comes from App\Services\SalesReport, the same data the Sales Report page shows.
    */
    $s = $report['summary'];
    $npr = fn($v) => 'NPR ' . number_format((float) $v, 2);
    $int = fn($v) => number_format((int) $v);
    $zigzag = str_repeat('/\\', 62);

    //a decorative barcode generated from the reference, so every report gets its own
    $bars = [];
    foreach (str_split(md5($reference)) as $ch) {
        $n = hexdec($ch);
        $bars[] = ['w' => 1 + ($n % 3), 'gap' => 1 + (intdiv($n, 4) % 2)];
    }
@endphp
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>{{ $report['title'] }}</title>
<style>
    @page { margin: 14mm 0 14mm 0; }
    body { font-family: 'DejaVu Sans Mono', monospace; font-size: 8.6pt; color: #1f2937; margin: 0; }

    .paper { width: 128mm; margin: 0 auto; }
    .edge { color: #cbd5e1; font-size: 7pt; letter-spacing: -0.6pt; white-space: nowrap; overflow: hidden; line-height: 1; }
    .inner { padding: 4mm 6mm; border-left: 1px solid #e5e7eb; border-right: 1px solid #e5e7eb; }

    .center { text-align: center; }
    .right { text-align: right; }
    .muted { color: #6b7280; }
    .teal { color: #0f766e; }
    .brand { font-size: 22pt; font-weight: bold; letter-spacing: 7pt; color: #0f766e; margin: 2mm 0 0 0; }
    .tagline { font-size: 7pt; letter-spacing: 2pt; color: #6b7280; }
    .title { font-size: 11pt; font-weight: bold; letter-spacing: 1.5pt; margin-top: 3mm; }

    .rule { border-top: 1px dashed #9ca3af; margin: 3mm 0; }
    .double { border-top: 3px double #0f766e; margin: 3mm 0; }

    .section { background: #0f766e; color: #ffffff; font-weight: bold; letter-spacing: 2pt; font-size: 8pt; padding: 1.2mm 2mm; margin: 4mm 0 2mm 0; }

    table { width: 100%; border-collapse: collapse; }
    td, th { padding: 0.9mm 0; vertical-align: top; }
    th { font-size: 7pt; letter-spacing: 1pt; color: #6b7280; text-align: left; border-bottom: 1px dashed #9ca3af; padding-bottom: 1.2mm; }

    /* "Net revenue ........ NPR 1,000.00": the dots are the dotted bottom border of an empty
       filler cell (a string of dots would overflow, DomPDF doesn't clip text in cells) */
    .leader td.k { white-space: nowrap; padding-right: 1.5mm; }
    .leader td.dots { width: 100%; border-bottom: 1.2px dotted #9ca3af; }
    .leader td.v { white-space: nowrap; text-align: right; font-weight: bold; padding-left: 1.5mm; }

    .bar-track { background: #e6f4f2; height: 2.4mm; width: 100%; }
    .bar { background: #14b8a6; height: 2.4mm; }
    .zero td { color: #b6bcc6; }

    .total td { font-weight: bold; border-top: 1px solid #1f2937; padding-top: 1.5mm; }
    .big { font-size: 15pt; font-weight: bold; color: #0f766e; }

    .stamp { border: 2px solid #0f766e; color: #0f766e; text-align: center; padding: 1.5mm 2mm; font-weight: bold; letter-spacing: 1pt; }
    .stamp small { display: block; font-size: 6.5pt; letter-spacing: 1pt; font-weight: normal; }

    .barcode td { padding: 0; height: 11mm; }
    .footer { font-size: 7pt; color: #6b7280; letter-spacing: 1pt; }
</style>
</head>
<body>
<div class="paper">
    <div class="edge">{{ $zigzag }}</div>
    <div class="inner">

        {{-- ===== header ===== --}}
        <div class="center">
            <div class="brand">VENDORA</div>
            <div class="tagline">SALES &amp; INVENTORY MANAGEMENT</div>
            <div class="title">{{ strtoupper($report['title']) }}</div>
            <div class="muted">{{ $report['range_label'] }}</div>
        </div>

        <div class="rule"></div>
        <table>
            <tr><td class="muted">REPORT NO</td><td class="right">{{ $reference }}</td></tr>
            <tr><td class="muted">PRINTED</td><td class="right">{{ $generatedAt->format('d M Y, h:i A') }}</td></tr>
            <tr><td class="muted">PRINTED BY</td><td class="right">{{ $generatedBy }}</td></tr>
        </table>
        <div class="rule"></div>

        @if ($s['orders'] === 0)
            {{-- nothing sold in this period: say so instead of printing a page of zeros --}}
            <div class="center" style="padding: 10mm 0;">
                <div class="big">NO SALES</div>
                <div class="muted" style="margin-top: 2mm;">No sales were recorded between<br>{{ $report['range_label'] }}.</div>
                @if ($s['cancelled'] > 0)
                    <div class="muted" style="margin-top: 2mm;">({{ $s['cancelled'] }} cancelled {{ \Illuminate\Support\Str::plural('order', $s['cancelled']) }} not counted)</div>
                @endif
            </div>
        @else
            {{-- ===== headline ===== --}}
            <table>
                <tr>
                    <td style="width: 62%;">
                        <div class="muted" style="font-size: 7pt; letter-spacing: 1pt;">NET REVENUE</div>
                        <div class="big">{{ $npr($s['revenue']) }}</div>
                        <div class="muted">{{ $int($s['orders']) }} {{ \Illuminate\Support\Str::plural('order', $s['orders']) }} · {{ $int($s['units']) }} units</div>
                    </td>
                    <td style="width: 38%;">
                        <div class="stamp">
                            COLLECTED<br>{{ rtrim(rtrim(number_format($s['collection_rate'], 1), '0'), '.') }}%
                            <small>OF REVENUE</small>
                        </div>
                    </td>
                </tr>
            </table>

            {{-- ===== summary ===== --}}
            <div class="section">SUMMARY</div>
            @php
                $lines = [
                    ['Net revenue', $npr($s['revenue'])],
                    ['Orders', $int($s['orders'])],
                    ['Units sold', $int($s['units'])],
                    ['Average order value', $npr($s['avg_order'])],
                    ['Customers served', $int($s['customers'])],
                    ['Payments collected', $npr($s['collected'])],
                    ['Still outstanding', $npr($s['outstanding'])],
                    ['Cancelled orders (excluded)', $int($s['cancelled'])],
                ];
                if ($s['best']) {
                    $lines[] = ['Best ' . ['day' => 'day', 'month' => 'month', 'year' => 'year'][$report['bucket']], $s['best']['label']];
                }
            @endphp
            <table class="leader">
                @foreach ($lines as [$k, $v])
                    <tr>
                        <td class="k">{{ $k }}</td>
                        <td class="dots"></td>
                        <td class="v">{{ $v }}</td>
                    </tr>
                @endforeach
            </table>

            {{-- ===== breakdown ===== --}}
            <div class="section">BREAKDOWN BY {{ strtoupper($report['bucket']) }}</div>
            <table>
                <tr>
                    <th style="width: 23%;">{{ strtoupper($report['bucket']) }}</th>
                    <th class="right" style="width: 10%;">ORD</th>
                    <th class="right" style="width: 11%;">UNITS</th>
                    <th class="right" style="width: 28%;">REVENUE</th>
                    <th style="width: 28%; padding-left: 3mm;">&nbsp;</th>
                </tr>
                @foreach ($report['rows'] as $row)
                    <tr class="{{ $row['orders'] === 0 ? 'zero' : '' }}">
                        <td>{{ $row['label'] }}</td>
                        <td class="right">{{ $row['orders'] ?: '-' }}</td>
                        <td class="right">{{ $row['units'] ? $int($row['units']) : '-' }}</td>
                        <td class="right">{{ $row['revenue'] > 0 ? number_format($row['revenue'], 2) : '-' }}</td>
                        <td style="padding-left: 3mm; padding-top: 1.6mm;">
                            @if ($row['revenue'] > 0)
                                <div class="bar-track"><div class="bar" style="width: {{ max(2, round($row['share'] * 100)) }}%;"></div></div>
                            @endif
                        </td>
                    </tr>
                @endforeach
                <tr class="total">
                    <td>TOTAL</td>
                    <td class="right">{{ $int($s['orders']) }}</td>
                    <td class="right">{{ $int($s['units']) }}</td>
                    <td class="right">{{ number_format($s['revenue'], 2) }}</td>
                    <td></td>
                </tr>
            </table>

            {{-- ===== top products ===== --}}
            @if (count($report['top_products']))
                <div class="section">TOP PRODUCTS</div>
                <table>
                    <tr>
                        <th style="width: 6%;">#</th>
                        <th style="width: 52%;">PRODUCT</th>
                        <th class="right" style="width: 12%;">UNITS</th>
                        <th class="right" style="width: 30%;">REVENUE</th>
                    </tr>
                    @foreach ($report['top_products'] as $i => $p)
                        <tr>
                            <td class="teal">{{ $i + 1 }}</td>
                            <td>{{ $p['name'] }}<br><span class="muted" style="font-size: 7pt;">{{ $p['sku'] }}</span></td>
                            <td class="right">{{ $int($p['units']) }}</td>
                            <td class="right">{{ number_format($p['revenue'], 2) }}</td>
                        </tr>
                    @endforeach
                </table>
            @endif

            {{-- ===== top customers ===== --}}
            @if (count($report['top_customers']))
                <div class="section">TOP CUSTOMERS</div>
                <table>
                    <tr>
                        <th style="width: 6%;">#</th>
                        <th style="width: 52%;">CUSTOMER</th>
                        <th class="right" style="width: 12%;">ORD</th>
                        <th class="right" style="width: 30%;">REVENUE</th>
                    </tr>
                    @foreach ($report['top_customers'] as $i => $c)
                        <tr>
                            <td class="teal">{{ $i + 1 }}</td>
                            <td>{{ $c['name'] }}</td>
                            <td class="right">{{ $int($c['orders']) }}</td>
                            <td class="right">{{ number_format($c['revenue'], 2) }}</td>
                        </tr>
                    @endforeach
                </table>
            @endif

            <div class="double"></div>
            <table class="leader">
                <tr>
                    <td class="k" style="font-size: 10pt; font-weight: bold;">GRAND TOTAL</td>
                    <td class="dots"></td>
                    <td class="v" style="font-size: 10pt; color: #0f766e;">{{ $npr($s['revenue']) }}</td>
                </tr>
            </table>
            <div class="double"></div>
        @endif

        {{-- ===== footer ===== --}}
        <table class="barcode" style="width: auto; margin: 4mm auto 1mm auto;">
            <tr>
                @foreach ($bars as $b)
                    <td style="width: {{ $b['w'] * 0.55 }}mm; background: #1f2937;"></td>
                    <td style="width: {{ $b['gap'] * 0.55 }}mm;"></td>
                @endforeach
            </tr>
        </table>
        <div class="center footer">{{ $reference }}</div>
        <div class="center footer" style="margin-top: 3mm;">*** END OF REPORT ***</div>
        <div class="center footer">Figures exclude cancelled sales · amounts in NPR</div>
    </div>
    <div class="edge">{{ $zigzag }}</div>
</div>
</body>
</html>
