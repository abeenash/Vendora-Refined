import { Box, Building2, IndianRupeeIcon, Mail, MapPin, Phone, Plus, ReceiptIndianRupee, ReceiptText, Eye, IndianRupee } from "lucide-react"
import { Link, usePage } from "@inertiajs/react"
import Card from "../../components/Card"

const SupplierShow = () => {
    const { supplier, summary } = usePage().props

    function formatCurrency(n) {
        return `NPR ${Number(n || 0).toLocaleString()}`
    }
    return (
        <>
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Building2 className="w-8 h-8 text-primary text-teal-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">{supplier.name}</h1>
                        <p className="text-sm text-muted-foreground font-mono">{supplier.tax_id || '-'}</p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Link
                        href="#"
                        className="mt-4 sm:mt-0 flex items-center text-sm justify-center px-4 py-2 bg-gray-50 text-gray-900 rounded-lg shadow-sm border border-gray-200 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
                    >
                        <Plus className="mr-2 h-4 w-4" /> New Purchase Order
                    </Link>
                    <Link
                        href="#"
                        className="mt-4 sm:mt-0 flex items-center text-sm justify-center px-4 py-2 bg-gray-50 text-gray-900 rounded-lg shadow-sm border border-gray-200 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
                    >
                        <ReceiptIndianRupee className="mr-2 h-4 w-4" /> Add Bill
                    </Link>
                    <Link
                        href="#"
                        className="mt-4 sm:mt-0 flex items-center text-sm justify-center px-4 py-2 bg-teal-600 text-white rounded-lg shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
                    >
                        <IndianRupeeIcon className="mr-2 h-4 w-4" /> Record Payment
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <Card title="Total Purchase Orders"
                    value="2"
                    Icon={Box}

                />
                <Card
                    title="Total Billed"
                    value="NPR 489,000.00"
                    Icon={ReceiptIndianRupee}
                />
                <Card
                    title="Total Billed"
                    value="NPR 364,000.00"
                    Icon={IndianRupeeIcon}
                />
                <Card
                    title="Outstanding Balance"
                    value="NPR 125,000.00"
                    Icon={ReceiptText}
                    bg="bg-red-100 border-red-100"
                    iconColor="text-red-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Contact Information */}
                <div className="bg-white p-6 rounded-lg shadow-md items-start justify-between">
                    <div className="text-lg mb-4 font-semibold">Contact Information</div>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                <Building2 className="w-4 h-4 text-gray-500" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Contact Person</p>
                                <p className="text-sm font-medium">{supplier.contact_person || '-'}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                <Mail className="w-4 h-4 text-gray-500" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Email</p>
                                <p className="text-sm font-medium">{supplier.email || '-'}</p>
                            </div>
                        </div>


                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                <Phone className="w-4 h-4 text-gray-500" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Phone</p>
                                <p className="text-sm font-medium">{supplier.phone || '-'}</p>
                            </div>
                        </div>


                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                <MapPin className="w-4 h-4 text-gray-500" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Address</p>
                                <p className="text-sm font-medium">{supplier.address || '-'}</p>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-500">
                            <p className="text-xs text-gray-500 mb-1">Notes</p>
                            <p className="text-sm">{supplier.notes || 'No notes available'}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md items-start justify-between">
                    {/* Recent Purchase Orders */}
                    <div className="flex flex-row items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold">Recent Purchase Orders</h2>
                        <div className="text-sm">
                            <Link to="#" className="mt-4 sm:mt-0 flex items-center text-sm justify-center px-3 py-1 bg-gray-50 text-gray-900 rounded-lg shadow-sm border border-gray-200 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500">View All</Link>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <Link
                            to="#"
                            className="block p-3 rounded-lg border border-gray-200 hover:bg-gray-50"
                        >
                            <div className="flex items-center justify-between mb-1">
                                <span className="font-medium text-sm">#PO-001</span>
                                <span className="font-medium text-xs">Pending</span>
                            </div>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span className="font-medium text-gray-500">2023-01-01</span>
                                <span className="font-medium text-gray-500">NPR 100,000.00</span>
                            </div>
                        </Link>
                        <Link
                            to="#"
                            className="block p-3 rounded-lg border border-gray-200 hover:bg-gray-50"
                        >
                            <div className="flex items-center justify-between mb-1">
                                <span className="font-medium text-sm">#PO-001</span>
                                <span className="font-medium text-xs">Pending</span>
                            </div>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span className="font-medium text-gray-500">2023-01-01</span>
                                <span className="font-medium text-gray-500">NPR 100,000.00</span>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Recent bills */}
                <div className="bg-white p-6 rounded-lg shadow-md items-start justify-between">
                    {/* Recent Purchase Orders */}
                    <div className="flex flex-row items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold">Recent Bills</h2>
                        <div className="text-sm">
                            <Link to="#" className="mt-4 sm:mt-0 flex items-center text-sm justify-center px-3 py-1 bg-gray-50 text-gray-900 rounded-lg shadow-sm border border-gray-200 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500">View All</Link>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <Link
                            to="#"
                            className="block p-3 rounded-lg border border-gray-200 hover:bg-gray-50"
                        >
                            <div className="flex items-center justify-between mb-1">
                                <span className="font-medium text-sm">BILL-TM-2024-101</span>
                                <span className="font-medium text-xs">Partially Paid</span>
                            </div>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span className="font-medium text-gray-500">Due: 20 Jan 2025</span>
                                <span className="font-medium text-gray-500">Balance: NPR 125,000.00</span>
                            </div>
                        </Link>
                        <Link
                            to="#"
                            className="block p-3 rounded-lg border border-gray-200 hover:bg-gray-50"
                        >
                            <div className="flex items-center justify-between mb-1">
                                <span className="font-medium text-sm">BILL-TM-2024-102</span>
                                <span className="font-medium text-xs">Paid</span>
                            </div>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span className="font-medium text-gray-500">Due: 15 Jan 2025</span>
                                <span className="font-medium text-gray-500">Balance: NPR 0.00</span>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Payment History */}
            <div className="bg-white mt-6 p-6 rounded-lg shadow-md items-start justify-between">
                {/* Recent Purchase Orders */}
                <div className="flex flex-row items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold">Payment History</h2>
                </div>
                <table className="w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {[
                                "Date",
                                "Amount",
                                "Method",
                                "Reference",
                                "Bill",
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
                                20 Dec 2024
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                NPR 125,000.00
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                Cash
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-xs font-medium">
                                TRF-2024-1220-001
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-teal-500">
                                BILL-TM-2024-101
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </>
    )
}

export default SupplierShow