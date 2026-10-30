import { useState, useEffect } from "react";
import { Download, FileBarChart, IndianRupee, ShoppingCart, Receipt, Wallet, CalendarRange } from "lucide-react";
import axios from "axios";
import { route } from "ziggy-js";
import { toast } from "react-toastify";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from "recharts";
import Card from "../../components/Card";
import EmptyState from "../../components/EmptyState";
import { ChartSkeleton } from "../../components/ChartCard";
import { formatNPR, today } from "../../components/Modal";

const selectClass = "block w-full sm:w-auto px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm text-gray-700";

// query string for both the JSON report and the PDF
const params = (period, year, start, end) =>
    period === "monthly" ? { period, year } : period === "custom" ? { period, start, end } : { period };

const SalesReport = () => {
    const [period, setPeriod] = useState("weekly");
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [yearOptions, setYearOptions] = useState([]);
    const [start, setStart] = useState("");
    const [end, setEnd] = useState("");
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);

    const customIncomplete = period === "custom" && (!start || !end || end < start);

    useEffect(() => {
        axios.get("/api/sales/available-years").then((res) => setYearOptions(res.data)).catch(() => setYearOptions([]));
    }, []);

    useEffect(() => {
        if (customIncomplete) {
            setReport(null);
            setLoading(false);
            return;
        }
        let cancelled = false;
        setLoading(true);
        axios.get("/api/sales/report", { params: params(period, selectedYear, start, end) })
            .then((res) => !cancelled && setReport(res.data))
            .catch((err) => !cancelled && toast.error(err.response?.data?.message || "Could not load the report"))
            .finally(() => !cancelled && setLoading(false));
        return () => { cancelled = true; };
    }, [period, selectedYear, start, end]);

    const exportToPDF = async () => {
        setExporting(true);
        try {
            const { period: p, year } = params(period, selectedYear, start, end);
            const url = p === "monthly" ? `/api/sales/report/pdf/monthly/${year}` : `/api/sales/report/pdf/${p}`;
            const res = await axios.get(url, {
                params: p === "custom" ? { start, end } : {},
                responseType: "blob",
            });

            const href = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
            const link = document.createElement("a");
            link.href = href;
            link.setAttribute("download", `vendora_sales_${p}_${report.from}_to_${report.to}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(href);
        } catch (error) {
            //the error body is a Blob (we asked for one), read it to show the real message
            let message = "PDF download failed";
            try { message = JSON.parse(await error.response.data.text()).message || message; } catch { /* keep default */ }
            toast.error(message);
        } finally {
            setExporting(false);
        }
    };

    const s = report?.summary;
    const hasSales = s && s.orders > 0;
    const noSalesEver = !loading && yearOptions.length === 0;
    const chartData = (report?.rows || []).map((r) => ({ label: r.label, value: r.revenue, orders: r.orders }));

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <header className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">
                        Sales Report
                    </h1>
                    <p className="mt-1 text-gray-500">
                        View and export sales performance data
                    </p>
                </div>
                {!noSalesEver && (
                    <div className="flex flex-wrap items-center gap-3">
                        <select value={period} onChange={(e) => setPeriod(e.target.value)} className={selectClass}>
                            <option value="weekly">Last 7 days</option>
                            <option value="monthly">Monthly</option>
                            <option value="yearly">Yearly</option>
                            <option value="custom">Custom Range</option>
                        </select>

                        {period === "monthly" && (
                            <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} className={selectClass}>
                                {(yearOptions.length ? yearOptions : [new Date().getFullYear()]).map((year) => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        )}

                        {period === "custom" && (
                            <div className="flex items-center gap-2">
                                <input type="date" value={start} max={end || today()} onChange={(e) => setStart(e.target.value)} className={selectClass} aria-label="Start date" />
                                <span className="text-gray-500">to</span>
                                <input type="date" value={end} min={start || undefined} max={today()} onChange={(e) => setEnd(e.target.value)} className={selectClass} aria-label="End date" />
                            </div>
                        )}

                        <button
                            className="flex items-center justify-center px-4 py-2 bg-teal-600 text-white rounded-lg shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={exportToPDF}
                            disabled={!hasSales || exporting}
                            title={hasSales ? "Download this report as a PDF" : "Nothing to export for this period"}
                        >
                            <Download className="w-5 h-5 mr-2" />
                            {exporting ? "Preparing..." : "Export PDF"}
                        </button>
                    </div>
                )}
            </header>

            {noSalesEver ? (
                <EmptyState
                    Icon={FileBarChart}
                    title="Reports appear after your first sale"
                    message="Weekly, monthly, yearly and custom-range reports (with PDF export) are built from your sales."
                    action={{ label: "Record a sale", href: route("sales.create") }}
                />
            ) : customIncomplete ? (
                <EmptyState
                    compact
                    Icon={CalendarRange}
                    title="Pick a date range"
                    message={start && end && end < start ? "The end date must be on or after the start date." : "Choose a start and an end date above to build the report."}
                />
            ) : loading || !report ? (
                <ChartSkeleton />
            ) : !hasSales ? (
                <EmptyState
                    compact
                    Icon={FileBarChart}
                    title="No sales in this period"
                    message={`Nothing was sold between ${report.range_label}${s.cancelled ? ` (${s.cancelled} cancelled order${s.cancelled > 1 ? "s" : ""} not counted)` : ""}. Try another period.`}
                />
            ) : (
                <div className="space-y-6">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-700">{report.title}</h2>
                        <p className="text-sm text-gray-500">{report.range_label} · cancelled sales excluded</p>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card title="Net Revenue" value={formatNPR(s.revenue)} Icon={IndianRupee} />
                        <Card title="Orders" value={`${s.orders} · ${s.units} units`} Icon={ShoppingCart} />
                        <Card title="Avg. Order Value" value={formatNPR(s.avg_order)} Icon={Receipt} />
                        <Card title="Collected" value={`${s.collection_rate}%`} Icon={Wallet} />
                    </div>

                    {/* Sales Chart */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Revenue by {report.bucket}</h3>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                                    <YAxis tickFormatter={(val) => `NPR ${Number(val).toLocaleString()}`} width={100} tick={{ fontSize: 12 }} />
                                    <Tooltip formatter={(value) => [formatNPR(value), "Revenue"]} cursor={{ fill: "rgba(6, 182, 212, 0.1)" }} />
                                    <Bar dataKey="value" fill="rgba(6, 182, 212, 0.6)" stroke="rgba(6, 182, 212, 1)" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-2">
                        <RankTable title="Top Products" rows={report.top_products} nameKey="name" subKey="sku" countKey="units" countLabel="Units" />
                        <RankTable title="Top Customers" rows={report.top_customers} nameKey="name" countKey="orders" countLabel="Orders" />
                    </div>

                    {/* Breakdown */}
                    <div className="bg-white rounded-xl shadow-md overflow-hidden">
                        <div className="p-6 border-b border-gray-200 flex justify-between">
                            <h3 className="text-lg font-semibold text-gray-800">Breakdown</h3>
                            <span className="text-sm text-gray-500">
                                Collected {formatNPR(s.collected)} · Outstanding {formatNPR(s.outstanding)}
                            </span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        {[report.bucket, "Orders", "Units", "Revenue"].map((col, i) => (
                                            <th key={col} className={`px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider ${i ? "text-right" : "text-left"}`}>{col}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {report.rows.map((r) => (
                                        <tr key={r.key} className={r.orders ? "" : "text-gray-400"}>
                                            <td className="px-6 py-2">{r.label}</td>
                                            <td className="px-6 py-2 text-right">{r.orders || "-"}</td>
                                            <td className="px-6 py-2 text-right">{r.units || "-"}</td>
                                            <td className="px-6 py-2 text-right font-medium">{r.revenue ? formatNPR(r.revenue) : "-"}</td>
                                        </tr>
                                    ))}
                                    <tr className="bg-gray-50 font-semibold text-gray-800">
                                        <td className="px-6 py-3">Total</td>
                                        <td className="px-6 py-3 text-right">{s.orders}</td>
                                        <td className="px-6 py-3 text-right">{s.units}</td>
                                        <td className="px-6 py-3 text-right">{formatNPR(s.revenue)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

function RankTable({ title, rows, nameKey, subKey, countKey, countLabel }) {
    return (
        <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">{title}</h3>
            {rows.length === 0 ? (
                <p className="text-sm text-gray-500">No data for this period.</p>
            ) : (
                <ol className="divide-y divide-gray-100">
                    {rows.map((r, i) => (
                        <li key={i} className="py-2 flex items-center gap-3 text-sm">
                            <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-bold">{i + 1}</span>
                            <span className="flex-1 min-w-0">
                                <span className="block truncate text-gray-800 font-medium">{r[nameKey]}</span>
                                {subKey && <span className="block text-xs text-gray-400">{r[subKey]}</span>}
                            </span>
                            <span className="text-gray-500 whitespace-nowrap">{r[countKey]} {countLabel.toLowerCase()}</span>
                            <span className="w-32 text-right font-medium text-gray-800 whitespace-nowrap">{formatNPR(r.revenue)}</span>
                        </li>
                    ))}
                </ol>
            )}
        </div>
    );
}

export default SalesReport;
