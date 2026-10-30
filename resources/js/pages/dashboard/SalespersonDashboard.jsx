import { useState, useEffect } from "react";
import axios from "axios";
import { route } from "ziggy-js";
import ChartCard, { ChartSkeleton, hasValues } from "../../components/ChartCard";
import EmptyState from "../../components/EmptyState";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";
import { BarChart3, TrendingUp, History, ShoppingCart } from "lucide-react";
import { Link } from "@inertiajs/react";

const SalespersonDashboard = () => {
    const [weeklySales, setWeeklySales] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        Promise.allSettled([
            axios.get("/api/sales/my-weekly-sales"),
            axios.get("/api/sales/my-top-products"),
        ]).then(([weeklyRes, topRes]) => {
            if (weeklyRes.status === "fulfilled" && weeklyRes.value.data.data) {
                setWeeklySales(
                    weeklyRes.value.data.data.map(item => ({
                        day: new Date(item.date).toLocaleDateString("en-US", { weekday: "short" }),
                        sales: Number(item.total)
                    }))
                );
            }
            if (topRes.status === "fulfilled" && topRes.value.data.data) {
                setTopProducts(topRes.value.data.data.map(item => ({ ...item, total_qty: Number(item.total_qty) })));
            }
            setLoaded(true);
        });
    }, []);

    const hasWeekly = hasValues(weeklySales, "sales");
    const hasTop = hasValues(topProducts, "total_qty");

    return (
        <>
            <div className="space-y-2 p-4 lg:p-6">
                <h1 className="text-3xl font-bold">My Dashboard</h1>
                <p className="text-muted-foreground">Overview of my sales activity</p>
                <Link href="/stock-movements"
                    className="text-xs text-slate-500 flex items-center gap-1 hover:text-teal-600">
                    <span>Recent Activity</span>
                    <History size={16} />
                </Link>
            </div>

            {!loaded && (
                <div className="grid gap-6 lg:grid-cols-2 mt-6">
                    <ChartSkeleton />
                    <ChartSkeleton />
                </div>
            )}

            {/* nothing sold recently: one friendly prompt instead of two empty charts */}
            {loaded && !hasWeekly && !hasTop && (
                <EmptyState
                    Icon={ShoppingCart}
                    title="Your charts will appear here"
                    message="Once you record a sale, your daily sales and your top products for the last 30 days show up on this dashboard."
                    action={{ label: "Start now: record a sale", href: route("sales.create") }}
                />
            )}

            {loaded && (hasWeekly || hasTop) && (
                <div className="grid gap-6 lg:grid-cols-2 mt-6">
                    {/* MY WEEKLY SALES */}
                    {hasWeekly && (
                        <ChartCard title="My Daily Sales (Last 7 Days)" Icon={TrendingUp}>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={weeklySales}>
                                    <XAxis dataKey="day" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="sales" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartCard>
                    )}

                    {/* MY TOP PRODUCTS */}
                    {hasTop && (
                        <ChartCard title="Top Products I Sold" Icon={BarChart3}>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart layout="vertical" data={topProducts}>
                                    <YAxis dataKey="product_name" type="category" tick={{ fontSize: 12 }} />
                                    <XAxis dataKey="total_qty" type="number" />
                                    <Tooltip />
                                    <Bar dataKey="total_qty" fill="#10b981" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartCard>
                    )}
                </div>
            )}
        </>
    );
};

export default SalespersonDashboard;
