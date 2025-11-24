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
    //necessary states for fetching data from backend to render in the Dashboard
    const [salesData, setSalesData] = useState([]);
    const [topProducts, setTopProducts] = useState([]);

    const COLORS = [
        "#3b82f6",
        "#10b981",
        "#f59e0b",
        "#8b5cf6",
        "#f43f5e",
        "#eab308",
    ];

    useEffect(() => {
        const fetchNewCharts = async () => {
            try {
                const [topRes] = await Promise.all([
                    axios.get("/api/sales/top-products"),
                ]);

                setTopProducts(topRes.data);
            }
            catch (err) {
                console.error(err);
            }
        };

        fetchNewCharts();
    }, []);


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
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart
                            margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
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
                <ChartCard title="Top Selling Products" Icon={BarChart3}>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart layout="vertical"
                            data={topProducts}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}> /{/*we add margin to prevent the cut off*/}
                            <YAxis dataKey="product_name" type="category" tick={{ fontSize: 12 }} />
                            <XAxis dataKey="total_qty" type="number" />
                            <Tooltip />
                            <Bar dataKey="total_qty" fill="#10b981" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>
        </>
    );
};

export default Dashboard;


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
