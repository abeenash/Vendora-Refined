import ReceivableCard from "./ReceivableCard";
import { Link, router, usePage } from "@inertiajs/react";
import { Eye, IndianRupee, Search } from "lucide-react";
import { useState } from "react";
import { formatCurrency } from "./ReceivableCard";

//need to format the date here. Using the same currency formatter from Card
function formatDate(d) {
    if (!d) return '-';
    const dt = new Date(d);
    return dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

const Receivable = () => {
    const { rows } = usePage().props

    const statusStyles = {
        partially_paid: "bg-yellow-100 text-yellow-600 border-yellow-300",
        unpaid: "bg-orange-100 text-orange-500 border-orange-300",
        overdue: "bg-red-100 text-red-500 border-red-300",
    };

    return (
        <>
            <div className="flex justify-between items-center">
                <div className="space-y-2 p-4 lg:p-2 lg:p-6">
                    <div className="max-w-7xl mx-auto">
                        <h1 className="text-3xl font-bold text-foreground">
                            Account Receivable
                        </h1>
                        <p className="text-muted-foreground">
                            Track outstanding payments from customer
                        </p>
                    </div>
                </div>
            </div>

            <ReceivableCard />

            {/* --- TABLE SECTION --- */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden m-3">
                <div className="p-4 border-b border-gray-200">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by invoice, customer..."
                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-[1100px] w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                {[
                                    "Invoice",
                                    "Customer",
                                    "Invoice Total",
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

                            {rows.data.map(inv => (
                                <tr key={inv.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-teal-500">
                                        {inv.sale_number}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        {inv.customer}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        {formatCurrency(inv.total_price)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-500">
                                        {formatCurrency(inv.total_paid)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-500">
                                        {formatCurrency(inv.balance_due)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-500">
                                        {formatDate(inv.due_date)}
                                    </td>
                                    <td className="px-2 py-4 whitespace-nowrap text-xs text-gray-700 font-semibold">
                                        <span className={`text-xs font-semibold border rounded-full px-3 py-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 ${statusStyles[inv.payment_status]}`}>{inv.payment_status}</span>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex items-center space-x-3">
                                            <Link className="text-gray-400 hover:text-cyan-600">
                                                <Eye className="h-5 w-5" />
                                            </Link>
                                            <Link className="text-gray-400 hover:text-cyan-600 bg-gray-100 p-2 rounded">
                                                <div className="flex items-center space-x-1">
                                                    <IndianRupee className="h-5 w-5" />
                                                    <span>Pay</span>
                                                </div>
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    <div className="p-4 flex justify-center space-x-2">
                        {rows.links && rows.links.map((link, index) => (
                            <button
                                key={index}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                onClick={() => link.url && router.visit(link.url)}
                                disabled={!link.url}
                                className={`px-3 py-1 border border-gray-300 rounded-lg text-sm ${link.active ? "bg-teal-600 text-white" : "bg-white text-gray-700"} ${!link.url ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "hover:bg-gray-50"}`}
                            ></button>
                        ))}
                    </div>
                </div>
            </div>
        </>
    )
}

export default Receivable;