import { Box, Building2, IndianRupeeIcon, Mail, MapPin, Phone, Plus, ReceiptIndianRupee, ReceiptText, Eye, IndianRupee, Truck, CircleX, CircleCheckBig, Calendar } from "lucide-react"
import { Link } from "@inertiajs/react"
import Card from "../../components/Card"

const PurchaseOrderShow = () => {
    return (
        <>
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                <div className="flex items-start gap-4">
                    <h1 className="text-2xl font-bold text-foreground">PO-2024-001</h1>
                    <p className="text-sm text-muted-foreground font-mono">Ordered</p>
                </div>
                <div className="flex items-center gap-2">
                    Supplier: <span className="text-teal-500">Techmart Electronics</span>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Link
                        href="#"
                        className="mt-4 sm:mt-0 flex items-center text-sm justify-center px-4 py-2 bg-teal-600 text-white rounded-lg shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
                    >
                        <Truck className="mr-2 h-4 w-4" /> Create GRN
                    </Link>
                    <Link
                        href="#"
                        className="mt-4 sm:mt-0 flex items-center text-sm justify-center px-4 py-2 bg-gray-50 text-gray-900 rounded-lg shadow-sm border border-gray-200 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
                    >
                        <CircleCheckBig className="mr-2 h-4 w-4" /> Close PO
                    </Link>
                    <Link
                        href="#"
                        className="mt-4 sm:mt-0 flex items-center text-sm justify-center px-4 py-2 bg-gray-50 text-gray-900 rounded-lg shadow-sm border border-red-200 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                        <CircleX className="mr-2 h-4 w-4 text-red-500" /> <span className="text-red-500">Cancel PO</span>
                    </Link>

                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Order Items */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow-md items-start justify-between">
                        <div className="flex flex-row items-center justify-between mb-3">
                            <h2 className="text-lg font-semibold">Order Items</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        {[
                                            "Product",
                                            "Qty Ordered",
                                            "Qty Received",
                                            "Unit Price",
                                            "Total",
                                        ].map((col) => (
                                            <th
                                                key={col}
                                                className="px-6 py-3 text-left text-xs font-medium font-semibold text-gray-500 uppercase tracking-wider"
                                            >
                                                {col}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    <tr>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center space-x-2">
                                                <Box className="h-3 w-3" />
                                                <div className="inline-block">
                                                    <span className="text-sm font-medium text-gray-900">iPhone 14 (Refurbished)</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            5
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-yellow-500">
                                            0
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            NPR 85,000.00
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            NPR 425,000.00
                                        </td>
                                    </tr>
                                    <tr className="border-t-2 border-gray-200">
                                        <td colSpan="4" className="text-sm text-right font-medium py-2">Grand Total: </td>
                                        <td className="text-sm font-medium px-6 font-semibold">NPR 425,000.00</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>


                {/* Order Information */}
                <div className="bg-white p-6 rounded-lg shadow-md items-start justify-between">
                    <div className="text-lg mb-4 font-semibold">Order Information</div>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                <Calendar className="w-4 h-4 text-gray-500" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Order Date</p>
                                <p className="text-sm font-medium">20 Dec 2024</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                <Truck className="w-4 h-4 text-gray-500" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Expected Delivery</p>
                                <p className="text-sm font-medium">28 Dec 2024</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full  flex items-center justify-center">
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Currency</p>
                                <p className="text-sm font-medium">NPR</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow-md items-start justify-between mb-6">
                        {/* Goods Received Notes */}
                        <div className="flex flex-row items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold">Goods Received Notes</h2>
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground text-gray-500">No Goods Received yet</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md items-start justify-between mb-6">
                    {/* Actions */}
                    <div className="flex flex-row items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold">Actions</h2>
                    </div>
                    <Link
                        href="#"
                        className="mt-4 sm:mt-0 flex items-center text-sm justify-center px-4 py-2 bg-gray-50 text-gray-900 rounded-lg shadow-sm border border-gray-200 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
                    >
                        <ReceiptIndianRupee className="mr-2 h-4 w-4" /> Create Bill from PO
                    </Link>
                </div>
            </div>
        </>
    )
}

export default PurchaseOrderShow