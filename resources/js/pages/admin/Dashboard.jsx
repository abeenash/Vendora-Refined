import { useState, useEffect } from "react";
import axios from "axios";
import InfoCards from "../../components/InfoCards";
import ChartCard from "../../components/ChartCard";
import {
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    ResponsiveContainer,
    LineChart,
    Tooltip,
} from "recharts";
import {
    PieChart as PieChartIcon,
    BarChart3,
    TrendingDownIcon,
    TrendingUp,
} from "lucide-react";

const Dashboard = ({ categoryData }) => {
    const COLORS = [
        "#3b82f6",
        "#10b981",
        "#f59e0b",
        "#8b5cf6",
        "#f43f5e",
        "#eab308",
    ];
    // const categoryData = [
    //   { category: "Electronics", stock: 20, percentage: 40 },
    //   { category: "Clothing", stock: 15, percentage: 30 },
    //   { category: "Accessories", stock: 15, percentage: 30 },
    // ];
    // Now instead, pull the real counts of products grouped by category from Laravel and pass that down as Inertia props

    // const dailySalesData = [
    //     { date: "Mon", sales: 150 },
    //     { date: "Tue", sales: 200 },
    //     { date: "Wed", sales: 180 },
    //     { date: "Thu", sales: 220 },
    //     { date: "Fri", sales: 170 },
    //     { date: "Sat", sales: 90 },
    //     { date: "Sun", sales: 130 },
    // ]; What we will do instead is to pull the real sales data from Laravel and pass that down as Inertia props

    const [salesData, setSalesData] = useState([]);
    useEffect(() => {
        axios.get("/api/sales/weekly").then((res) => {
            const formatted = res.data.map((item) => ({
                day: new Date(item.date).toLocaleDateString("en-US", {
                    weekday: "short",
                }),
                sales: item.total,
            }));
            setSalesData(formatted);
        });
    }, []);

    const filteredCategoryData = categoryData.filter((item) => item.stock > 0);
    return (
        <>
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">
                        Dashboard
                    </h1>
                    <p className="text-muted-foreground">
                        Vendora business analytics center
                    </p>
                </div>
            </div>
            <InfoCards />

            <div className="grid gap-6 lg:grid-cols-2 mt-6">
                {/* Pie Chart */}
                <ChartCard title="Stock by Category" Icon={PieChartIcon}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart
                            margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                        >
                            <Pie
                                data={filteredCategoryData}
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                dataKey="stock"
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

                {/* Bar Chart */}
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
            </div>

            <div className="grid gap-6 lg:grid-cols-2 mt-6">
                <ChartCard title="Trend Analysis by SKU" Icon={TrendingUp}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart></LineChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>
        </>
    );
};

export default Dashboard;
