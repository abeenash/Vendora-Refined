import PayableCard from "./PayableCard";
import { Link } from "@inertiajs/react";
import { Eye, IndianRupee, Search } from "lucide-react";

const Payable = () => {
    return (
        <>
            <div className="flex justify-between items-center">
                <div className="space-y-2 p-4 lg:p-2 lg:p-6">
                    <div className="max-w-7xl mx-auto">
                        <h1 className="text-3xl font-bold text-foreground">
                            Account Payable
                        </h1>
                        <p className="text-muted-foreground">
                            Track outstanding payments to suppliers
                        </p>
                    </div>
                </div>
            </div>

            <PayableCard />

            {/* --- TABLE SECTION --- */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden m-3">
                <div className="p-4 border-b border-gray-200">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by bill number, supplier..."
                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                {[
                                    "Bill Number",
                                    "Supplier",
                                    "Bill Total",
                                    "Paid",
                                    "Balance Due",
                                    "Due Date",
                                    "Status",
                                    "Actions"
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
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-teal-500">
                                    BILL-TM-2024-101
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    TechMart Electronics
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    NPR 425,000.00
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-500">
                                    NPR 300,000.00
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-500">
                                    NPR 125,000.00
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-500">
                                    20 Jan, 2025
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-700 font-semibold">
                                    Partially Paid
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex items-center space-x-3">
                                        <Link
                                            className="text-gray-400 hover:text-cyan-600"
                                        >
                                            <Eye className="h-5 w-5" />
                                        </Link>
                                        <Link
                                            className="text-gray-400 hover:text-cyan-600 bg-gray-100 p-2 rounded"
                                        >
                                            <div className="flex items-center space-x-1">
                                                <IndianRupee className="h-5 w-5" />
                                                <span>Pay</span>
                                            </div>
                                        </Link>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-teal-500">
                                    BILL-TM-2024-102
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    TechMart Electronics
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    NPR 200,000.00
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-500">
                                    NPR 100,000.00
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-500">
                                    NPR 100,000.00
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-500">
                                    25 Jan, 2025
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-700 font-semibold">
                                    Partially Paid
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex items-center space-x-3">
                                        <Link
                                            className="text-gray-400 hover:text-cyan-600"
                                        >
                                            <Eye className="h-5 w-5" />
                                        </Link>
                                        <Link
                                            className="text-gray-400 hover:text-cyan-600 bg-gray-100 p-2 rounded"
                                        >
                                            <div className="flex items-center space-x-1">
                                                <IndianRupee className="h-5 w-5" />
                                                <span>Pay</span>
                                            </div>
                                        </Link>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    )
}

export default Payable;