<h2>Sales Report ({{ ucfirst($period) }})</h2>

<table width="100%" border="1" cellspacing="0" cellpadding="6">
    <tr>
        <th>Date</th>
        <th>Total Sales</th>
    </tr>
    @foreach ($data as $row)
        <tr>
            <td class="text-center">
                @if (isset($row->date))
                    {{ \Carbon\Carbon::parse($row->date)->format('M d, Y D') }}
                @elseif(isset($row->month))
                    {{ \Carbon\Carbon::createFromFormat('Y-m', $row->month)->format('M Y') }}
                @elseif(isset($row->year))
                    {{ $row->year }}
                @else
                    -
                @endif
            </td>
            <td class="text-center">Rs. {{ number_format($row->total) }}</td>
        </tr>
    @endforeach
</table>