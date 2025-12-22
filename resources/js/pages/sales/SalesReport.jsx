import { useState, useEffect } from "react";
import { Download } from "lucide-react";
import axios from "axios";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from "recharts";

const SalesReport = () => {
    const [period, setPeriod] = useState("weekly");
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [yearOptions, setYearOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [chartData, setChartData] = useState([]);
    const [tableData, setTableData] = useState([]);
    const [summary, setSummary] = useState({
        sales: 0,
        orders: 0,
        product: "-",
    });
    const [start, setStart] = useState("");
    const [end, setEnd] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);

            try {
                let url = "";

                // to stop if custom range dates aren't both filled
                if (period === "custom" && (!start || !end)) {
                    setChartData([]);
                    setTableData([]);
                    setSummary({
                        sales: "NPR 0",
                        orders: 0,
                        product: "—",
                    });
                    setLoading(false);
                    return;
                }


                if (period === "weekly") url = "/api/sales/weekly";
                if (period === "monthly")
                    url = `/api/sales/monthly/${selectedYear}`;
                if (period === "yearly") url = "/api/sales/yearly";
                if (period === "custom") url = `/api/sales/custom?start=${start}&end=${end}`;

                const res = await axios.get(url);
                const data = res.data;

                // Transform for recharts
                const labels = data.map((item) => {
                    if (period === "weekly") {
                        const d = new Date(item.date);
                        return d.toLocaleDateString("en-US", {
                            weekday: 'short',
                            day: "numeric",
                            month: "short",
                        });
                    }

                    if (period === "monthly") {
                        console.log(item.month);
                        // Parse "2024-07" → show "Jul 2024"
                        const [year, month] = item.month.split("-");
                        const dateObj = new Date(year, month - 1);
                        return dateObj.toLocaleDateString("en-US", {
                            month: "short",
                            year: "numeric",
                        });
                    }

                    if (period === "yearly") {
                        return item.year.toString();
                    }

                    if (period === "custom" && (!start || !end)) {
                        setChartData([]);
                        setTableData([]);
                        return;
                    }


                    if (period === "custom") {
                        const d = new Date(item.date);
                        return d.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                        });
                    }

                    return "";


                });

                const values = data.map((item) => Number(item.total));

                const formattedData = labels.map((label, i) => ({
                    label,
                    value: values[i],
                }));

                setChartData(formattedData);

                // Summary calculations
                const totalSales = values.reduce((a, b) => a + b, 0);

                setSummary({
                    sales: `NPR ${totalSales.toLocaleString()}`,
                    orders: data.length,
                    product: "—", // leave blank until you design “top product” logic
                });
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (period === "custom" && (!start || !end)) return;
        fetchData();
    }, [period, selectedYear, start, end]);

    //let frontend fetch the available years
    useEffect(() => {
        const fetchYears = async () => {
            const res = await axios.get("/api/sales/available-years");
            setYearOptions(res.data);
        };
        fetchYears();
    }, []);

    const exportToPDF = async () => {
        try {
            let url = "";

            if (period === "custom") {
                url = `/api/sales/report/pdf/custom`;
            } else if (period === "monthly") {
                url = `/api/sales/report/pdf/monthly/${selectedYear}`;
            } else {
                url = `/api/sales/report/pdf/${period}`;
            }

            const res = await axios.get(url, {
                responseType: "blob",
                params: period === "custom" ? { start, end } : {}
            });

            const blobUrl = window.URL.createObjectURL(res.data);
            const link = document.createElement("a");
            link.href = blobUrl;
            link.download =
                period === "custom"
                    ? `sales_report_${start}_to_${end}.pdf`
                    : `sales_report_${period}.pdf`;

            link.click();
            window.URL.revokeObjectURL(blobUrl);
        } catch (err) {
            console.error("PDF download failed:", err);
        }
    };



    return (
        <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">
                        Sales Report
                    </h1>
                    <p className="mt-1 text-gray-500">
                        View and export sales performance data
                    </p>
                </div>
                <div className="flex items-center space-x-4 mt-4 sm:mt-0">
                    <select
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                        className="block w-full sm:w-auto px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
                    >
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                        <option value="custom">Custom Range</option>
                    </select>

                    {/* Year Selector (only shows when monthly is chosen) */}
                    {(period === "monthly") && (
                        <select value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="block w-full sm:w-auto px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm" >
                            {yearOptions.map((year) => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))

                            }
                        </select>
                    )}

                    {period === "custom" && (
                        <div className="flex gap-2">
                            <input type="date"
                                value={start}
                                onChange={(e) => setStart(e.target.value)}
                                className="px-3 py-2 border rounded"
                            />
                            <input type="date"
                                value={end}
                                onChange={(e) => setEnd(e.target.value)}
                                className="px-3 py-2 border rounded"
                            />
                        </div>
                    )}

                    <button
                        className="flex items-center justify-center px-4 py-2 bg-teal-600 text-white rounded-lg shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
                        onClick={exportToPDF}
                    >
                        <Download className="w-5 h-5 mr-2" />
                        Export PDF
                    </button>
                </div>
            </header>

            {/* Report Container */}
            <div className="bg-gray-50 rounded-xl shadow-md">
                <div className="p-6 border-b border-gray-200">
                    <h2
                        id="report-title"
                        className="text-xl font-semibold text-gray-700"
                    >
                        {period === "weekly"
                            ? "Weekly Sales Report"
                            : period === "monthly"
                                ? "Monthly Sales Report"
                                : period == "yearly"
                                    ? "Yearly Sales Report"
                                    : ""}
                    </h2>
                </div>

                <div id="report-content" className="p-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {period !== "custom" && (
                            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                                <h3 className="text-sm font-medium text-gray-500">
                                    Total Sales
                                </h3>
                                <p className="mt-2 text-3xl font-bold text-gray-900">
                                    {summary.sales}
                                </p>
                            </div>
                        )}
                        {/* <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                            <h3 className="text-sm font-medium text-gray-500">
                                Total Orders
                            </h3>
                            <p className="mt-2 text-3xl font-bold text-gray-900">
                                {summary.orders}
                            </p>
                        </div>
                        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                            <h3 className="text-sm font-medium text-gray-500">
                                Top Selling Product
                            </h3>
                            <p className="mt-2 text-xl font-semibold text-gray-900 truncate">
                                {summary.product}
                            </p>
                        </div> */}
                    </div>



                    {/* Sales Chart */}
                    {period !== "custom" && (

                        <div className="h-96">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke="#e5e7eb"
                                    />
                                    <XAxis dataKey="label" />
                                    <YAxis
                                        tickFormatter={(val) =>
                                            `NPR ${val.toLocaleString()}`
                                        }
                                        width={100}
                                    />
                                    <Tooltip
                                        formatter={(value) =>
                                            `NPR ${value.toLocaleString()}`
                                        }
                                        cursor={{ fill: "rgba(6, 182, 212, 0.1)" }}
                                    />
                                    <Bar
                                        dataKey="value"
                                        fill="rgba(6, 182, 212, 0.6)"
                                        stroke="rgba(6, 182, 212, 1)"
                                        radius={[6, 6, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {/* No data state (for future hook-up) */}
                    {chartData.length === 0 && (
                        <div className="p-16 text-center text-gray-500">
                            <p>
                                No sales data available for the selected period.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SalesReport;


//-----------------PREVIOUSLY USED DUMMY DATA-------------------------
// const salesData = {
//     daily: {
//         title: "Daily Sales Report",
//         labels: ["9am", "11am", "1pm", "3pm", "5pm", "7pm"],
//         data: [150, 220, 300, 180, 400, 250.75],
//         summary: { sales: "NPR 1,500.75", orders: "15", product: "Wireless Headphones" },
//     },
//     weekly: {
//         title: "Weekly Sales Report",
//         labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
//         data: [1200, 1500, 1100, 1800, 2200, 2500, 1700],
//         summary: { sales: "NPR 12,000.00", orders: "98", product: "Coffee Mug" },
//     },
//     monthly: {
//         title: "Monthly Sales Report",
//         labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"],
//         data: [45000, 52000, 61000, 55000, 72000, 68000, 75000, 81000],
//         summary: { sales: "NPR 510,000.00", orders: "1,204", product: "Notebook" },
//     },
// }; was frontend data before
