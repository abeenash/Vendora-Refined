import { Plus, Search, Eye, Box } from "lucide-react";
import { Link, usePage } from "@inertiajs/react";

const PurchaseOrder = () => {

    const { purchaseOrders } = usePage().props;

    return (
        <div className="space-y-6 p-4 lg:p-2 lg:p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">
                            Purchase Orders
                        </h1>
                        <p className="mt-1 text-gray-500">
                            Manage purchase orders and track deliveries
                        </p>
                    </div>
                    <Link
                        href="/products"
                        className="mt-4 sm:mt-0 flex items-center justify-center px-4 py-2 bg-teal-600 text-white rounded-lg shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
                    >
                        <Plus className="mr-2" /> Create PO
                    </Link>
                </header>

                {/* Search Bar */}
                <div className="mb-6">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by PO number, supplier..."
                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
                        />
                    </div>
                </div>

                {/* Products Table */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-700">
                            Purchase Orders in Total (12)
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    {[
                                        "PO Number",
                                        "Supplier",
                                        "Order Date",
                                        "Expected Delivery",
                                        "Items",
                                        "Total",
                                        "Status",
                                        "Actions"
                                    ].map((col) => (
                                        <th key={col}
                                            className="px-6 py-3 text-left text-xs font-medium font-semibold text-gray-500 uppercase tracking-wider">
                                            {col}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {purchaseOrders.data.map(po => (
                                    <tr key={po.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-teal-500">
                                            {po.po_number}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {po.supplier?.name}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {po.supplier?.email}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {po.order_date}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {po.expected_delivery}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-900">
                                            <div className="flex items-center space-x-3">
                                                <Box className="h-4 w-4 text-teal-400" />
                                                <div className="inline-block ">
                                                    <span className="text-sm font-medium text-gray-900">{po.items_count ?? po.items?.length}
                                                        <div className="text-sm text-gray-500">{po.items_count === 1 ? 'item' : 'items'}</div>
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                            NPR {Number(po.total).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                            {po.status}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <Eye
                                                className="h-5 w-5 text-gray-400 hover:text-cyan-600" />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PurchaseOrder;
