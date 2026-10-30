import PayableCard from "./PayableCard";
import { usePage } from "@inertiajs/react";
import { CheckCircle2, IndianRupee, Search } from "lucide-react";
import EmptyState from "../../components/EmptyState";
import { useState } from "react";
import { route } from "ziggy-js";
import { Pagination, formatDate, formatNPR, searchTo, useFlashToasts } from "../../components/Modal";
import PayBillModal from "../../components/PayBillModal";
import { billStatusStyles } from "../purchases/SupplierBill";

const Payable = () => {
    const { rows, summary, paymentMethods, search: initialSearch } = usePage().props;
    const [search, setSearch] = useState(initialSearch || "");
    const [paying, setPaying] = useState(null);
    useFlashToasts();

    return (
        <>
            <div className="flex justify-between items-center">
                <div className="space-y-2 p-4 lg:p-6">
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

            {/* nothing owed to suppliers (and not searching): no zero cards, no empty table */}
            {rows.data.length === 0 && !search ? (
                <div className="m-3">
                    <EmptyState
                        Icon={CheckCircle2}
                        title="All caught up!"
                        message="You don't owe any supplier right now. Unpaid supplier bills will appear here so you can pay them."
                        action={{ label: "View supplier bills", href: route("supplier-bills.index") }}
                    />
                </div>
            ) : (<>
            <PayableCard summary={summary} />

            {/* --- TABLE SECTION --- */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden m-3">
                <div className="p-4 border-b border-gray-200">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); searchTo(route("payables.index"), e.target.value); }}
                            placeholder="Search by bill number, supplier..."
                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                {["Bill Number", "Supplier", "Bill Total", "Paid", "Balance Due", "Due Date", "Status", "Actions"].map((col) => (
                                    <th key={col} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        {col}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {rows.data.map((bill) => (
                                <tr key={bill.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-teal-500">{bill.bill_number}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{bill.supplier}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{formatNPR(bill.total_amount)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-500">{formatNPR(bill.paid_amount)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-500">{formatNPR(bill.balance_due)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{formatDate(bill.due_date)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`text-xs font-semibold border rounded-full px-3 py-1 capitalize ${billStatusStyles[bill.status]}`}>{bill.status.replace(/_/g, " ")}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button onClick={() => setPaying(bill)} className="text-gray-500 hover:text-cyan-600 bg-gray-100 px-2 py-1 rounded flex items-center gap-1">
                                            <IndianRupee className="h-4 w-4" /> Pay
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {rows.data.length === 0 && (
                                <tr><td colSpan="8" className="px-6 py-10 text-center text-gray-500">
                                    No bills match "{search}". <button onClick={() => { setSearch(""); searchTo(route("payables.index"), ""); }} className="text-teal-600 underline">Clear search</button>
                                </td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <Pagination links={rows.links} />
            </div>
            </>)}

            <PayBillModal bill={paying} onClose={() => setPaying(null)} methods={paymentMethods} />
        </>
    )
}

export default Payable;
