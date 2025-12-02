import { useState, useEffect } from "react";
import axios from "axios";
import InfoCards from "../../components/InfoCards";
import ChartCard from "../../components/ChartCard";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";
import { BarChart3, TrendingUp, History } from "lucide-react";
import { Link } from "@inertiajs/react";

const SalespersonDashboard = () => {
    const [stats, setStats] = useState({});
    const [weeklySales, setWeeklySales] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [activities, setActivities] = useState([]);

    useEffect(() => {
        axios.get("/api/sales/my-stats").then(res => {
            setStats(res.data);
        });

        axios.get("/api/sales/weekly?mine=true").then(res => {
            setWeeklySales(
                res.data.map(item => ({
                    day: new Date(item.date).toLocaleDateString("en-US", { weekday: "short" }),
                    sales: item.total
                }))
            );
        });

        axios.get("/api/sales/top-products?mine=true").then(res => {
            setTopProducts(res.data);
        });

        axios.get("/api/stock-movements?mine=true").then(res => {
            setActivities(res.data);
        });
    }, []);

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

            {/* PERSONAL INFO CARDS */}
            {/* <InfoCards data={{
                todaysSales: stats.today_total,
                monthlySales: stats.month_total,
                totalCustomers: stats.customer_count,
                totalSalesCount: stats.total_sales_count
            }} /> */}

            <div className="grid gap-6 lg:grid-cols-2 mt-6">
                {/* MY WEEKLY SALES */}
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

                {/* MY TOP PRODUCTS */}
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
            </div>

            {/* RECENT ACTIVITIES */}
            {/* <div className="mt-6">
                <ChartCard title="My Recent Activity" Icon={History}>
                    <ul className="space-y-2 text-sm">
                        {activities.map((a, i) => (
                            <li key={i} className="p-2 border rounded-md bg-gray-50">
                                <strong>{a.type}</strong> – {a.description}
                                <span className="text-gray-500 ml-2">
                                    ({new Date(a.created_at).toLocaleString()})
                                </span>
                            </li>
                        ))}
                    </ul>
                </ChartCard>
            </div> */}
        </>
    );
};

export default SalespersonDashboard;
