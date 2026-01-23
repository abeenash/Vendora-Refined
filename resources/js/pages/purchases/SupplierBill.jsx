import { Link } from "@inertiajs/react";
import { Eye, Search, Building } from "lucide-react";


const SupplierBill = () => {

    const statusStyles = {
        partially_paid: "bg-yellow-100 text-yellow-600 border-yellow-300",
        unpaid: "bg-orange-100 text-orange-500 border-teal-300",
    };

    return (
        <>
            <div className="flex justify-between items-center">
                <div className="space-y-2 p-4 lg:p-2 lg:p-6">
                    <div className="max-w-7xl mx-auto">
                        <h1 className="text-3xl font-bold text-foreground">
                            Supplier Bills
                        </h1>
                        <p className="text-muted-foreground">
                            Track and manage bills from your suppliers
                        </p>
                    </div>
                </div>
            </div>

            {/* --- TABLE SECTION --- */}
            <div className="bg-white rounded-xl shadow-md m-5">
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
                    <table className="w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                {[
                                    "Bill Number",
                                    "Supplier",
                                    "Bill Date",
                                    "Due Date",
                                    "Total",
                                    "Paid",
                                    "Balance",
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
                                    <div className="flex items-center space-x-3">
                                        <Building className="h-4 w-4 text-teal-400" />
                                        <div className="inline-block ">
                                            <span className="text-sm font-medium text-gray-900">TechMart Electronics</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    20 Dec 2024
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-500">
                                    20 Dec 2024
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    NPR 425,000.00
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-500">
                                    NPR 300,000.00
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-500">
                                    NPR 125,000.00
                                </td>
                                <td className="px-2 py-4 whitespace-nowrap text-xs text-gray-700 font-semibold">
                                    <span className={`text-xs font-semibold border rounded-full px-3 py-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 ${statusStyles["partially_paid"]}`}>Partially Paid</span>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex items-center space-x-3">
                                        <Link className="text-gray-400 hover:text-cyan-600">
                                            <Eye className="h-5 w-5" />
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

export default SupplierBill;