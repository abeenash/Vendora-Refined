import { useState, useEffect } from "react";
import { usePage } from "@inertiajs/react";
import axios from "axios";
import { route } from "ziggy-js";
import InfoCards from "../../components/InfoCards";
import ChartCard, { ChartSkeleton, hasValues } from "../../components/ChartCard";
import EmptyState from "../../components/EmptyState";
import GettingStarted from "../../components/GettingStarted";
import { Link } from "@inertiajs/react";
import {
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    ResponsiveContainer,
    Tooltip,
} from "recharts";
import {
    PieChart as PieChartIcon,
    BarChart3,
    History,
    ShoppingCart,
} from "lucide-react";
import LowStockAlert from "../../components/LowStockAlert";



const AdminDashboard = ({ categoryData }) => {
    //necessary states for fetching data from backend to render in the Dashboard
    const [salesData, setSalesData] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [categoryRevenue, setCategoryRevenue] = useState([]);
    const [monthCompare, setMonthCompare] = useState({});
    const [loaded, setLoaded] = useState(false);
    const { lowStockProducts, products, sales } = usePage().props;

    const COLORS = [
        "#3b82f6",
        "#10b981",
        "#f59e0b",
        "#8b5cf6",
        "#f43f5e",
        "#eab308",
    ];

    useEffect(() => {
        const fetchCharts = async () => {
            //allSettled: one failing chart shouldn't blank the others
            const [weeklyRes, topRes, categoryRes, compareRes] = await Promise.allSettled([
                axios.get("/api/sales/weekly"),
                axios.get("/api/sales/top-products"),
                axios.get("/api/sales/revenue-category"),
                axios.get("/api/sales/compare-monthly"),
            ]);

            if (weeklyRes.status === "fulfilled") {
                setSalesData(weeklyRes.value.data.map((item) => ({
                    day: new Date(item.date).toLocaleDateString("en-US", { weekday: "short" }),
                    sales: Number(item.total),
                })));
            }
            if (topRes.status === "fulfilled") {
                setTopProducts(topRes.value.data.map((item) => ({ ...item, total_qty: Number(item.total_qty) })));
            }
            if (categoryRes.status === "fulfilled") {
                setCategoryRevenue(categoryRes.value.data.map((item) => ({ ...item, revenue: Number(item.revenue) })));
            }
            if (compareRes.status === "fulfilled") {
                setMonthCompare(compareRes.value.data);
            }
            setLoaded(true);
        };

        fetchCharts();
    }, []);

    //filter only those categories that has more than 0 products
    const filteredCategoryData = categoryData.filter((item) => item.stock > 0);

    //format data for monthly sales comparison
    const compareData = [
        { month: "Last Month", total: Number(monthCompare.previous_month || 0) },
        { month: "This Month", total: Number(monthCompare.current_month || 0) }
    ];

    const hasProducts = products.total > 0;
    const hasSales = Number(sales.total_price) > 0;

    const header = (
        <div className="flex justify-between items-center">
            <div className="space-y-2 p-4 lg:p-6">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-bold text-foreground">
                        Dashboard
                    </h1>
                    <p className="text-muted-foreground">
                        Vendora business analytics center
                    </p>
                </div>
                {hasProducts && (
                    <div className="flex gap-2">
                        <Link href="/stock-movements"
                            className="text-xs text-slate-500 flex items-center gap-1 hover:text-teal-600">
                            <span>Recent Activity</span>
                            <History size={16} />
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );

    //brand-new system: no point showing zero cards and empty axes
    if (!hasProducts && !hasSales) {
        return (
            <>
                {header}
                <GettingStarted
                    message="Your analytics will appear here as soon as you start selling. Three steps to get there:"
                    steps={[
                        { label: "Create a category", hint: "Group your products, e.g. Electronics or Groceries.", href: route("categories.create"), done: categoryData.length > 0 },
                        { label: "Add your products", hint: "Name, price and opening stock.", href: route("products.create"), done: hasProducts },
                        { label: "Record your first sale", hint: "Stock is deducted and the charts come alive.", href: route("sales.create"), done: hasSales },
                    ]}
                />
            </>
        );
    }

    //which sales charts actually have something to draw
    const charts = {
        weekly: hasValues(salesData, "sales"),
        top: hasValues(topProducts, "total_qty"),
        revenue: hasValues(categoryRevenue, "revenue"),
        compare: hasValues(compareData, "total"),
    };
    const anySalesChart = Object.values(charts).some(Boolean);

    return (
        <>
            {header}

            <InfoCards />

            <LowStockAlert products={lowStockProducts} />

            <div className="grid gap-6 lg:grid-cols-2 mt-6">
                {/* shows Pie Chart of no of products in % in that category */}
                {filteredCategoryData.length > 0 && (
                    <ChartCard title="Stock by Category" Icon={PieChartIcon}>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart
                                margin={{ top: 20, right: 35, left: 50, bottom: 5 }}
                            >
                                <Pie
                                    data={filteredCategoryData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    dataKey="stock"
                                    labelLine={false}
                                    label={({ category, percentage }) =>
                                        `${category} (${percentage}%)`
                                    }
                                >
                                    {filteredCategoryData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={COLORS[index % COLORS.length]}
                                            className="text-sm"
                                        />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                    </ChartCard>
                )}

                {!loaded && <ChartSkeleton />}

                {/* Shows Bar Chart of last 7 days sales */}
                {loaded && charts.weekly && (
                    <ChartCard title="Daily Sales (Last 7 Days)" Icon={BarChart3}>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart
                                data={salesData}
                                margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                            >
                                <XAxis
                                    dataKey="day"
                                    axisLine={false}
                                    tickLine={false}
                                    className="text-xs fill-gray-500"
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    className="text-xs fill-gray-500"
                                    tickFormatter={(value) => `Rs ${value}`}
                                />
                                <Tooltip
                                    formatter={(value) => [`Rs ${value}`, "Sales"]}
                                    cursor={{ fill: "rgba(59,130,246,0.1)" }}
                                />
                                <Bar
                                    dataKey="sales"
                                    fill="#3b82f6"
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>
                )}

                {/* Show bar chart of top selling products */}
                {loaded && charts.top && (
                    <ChartCard title="Top Selling Products" Icon={BarChart3}>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart layout="vertical"
                                data={topProducts}
                                margin={{ top: 20, right: 30, left: 40, bottom: 5 }}>
                                {/*we add margin to prevent the cut off*/}
                                <YAxis dataKey="product_name" type="category" tick={{ fontSize: 12 }} />
                                <XAxis dataKey="total_qty" type="number" />
                                <Tooltip
                                    formatter={(value) => [`${value}`, "Total Qty"]}
                                    cursor={{ fill: "rgba(59,130,246,0.1)" }}
                                />
                                <Bar dataKey="total_qty" fill="#10b981" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>
                )}

                {/* Show pie chart of revenue category wise */}
                {loaded && charts.revenue && (
                    <ChartCard title="Revenue by Category" Icon={PieChartIcon}>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart
                                margin={{ top: 20, right: 30, left: 10, bottom: 0 }}>
                                <Pie
                                    data={categoryRevenue}
                                    dataKey="revenue"
                                    nameKey="category"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={90}
                                    labelLine={false}
                                    label={({ category }) =>
                                        `${category} `}
                                >
                                    {categoryRevenue.map((entry, index) => (
                                        <Cell key={index}
                                            fill={COLORS[index % COLORS.length]}
                                            className="text-sm" />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value) => [`Rs ${value}`, "Revenue"]}
                                    cursor={{ fill: "rgba(59,130,246,0.1)" }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </ChartCard>
                )}

                {loaded && charts.compare && (
                    <ChartCard title="(Sales) This Month vs. Last Month" Icon={BarChart3}>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={compareData}
                                margin={{ top: 20, right: 30, left: 50, bottom: 5 }}>
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="total" fill="#6366f1" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>
                )}
            </div>

            {/* products exist but nothing sold yet: one prompt instead of four empty charts */}
            {loaded && !anySalesChart && (
                <div className="mt-6">
                    <EmptyState
                        compact
                        Icon={ShoppingCart}
                        title="Sales charts appear after your first sale"
                        message="Daily sales, top products, revenue by category and the month-to-month comparison all fill in automatically."
                        action={{ label: "Record a sale", href: route("sales.create") }}
                    />
                </div>
            )}
        </>
    );
};

export default AdminDashboard;
