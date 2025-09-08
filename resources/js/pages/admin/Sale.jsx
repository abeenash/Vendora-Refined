import { Printer, Download, CheckCircle, ArrowLeft } from "lucide-react"
import { Link } from "@inertiajs/react"

const Sale = () => {
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
                {/* <!-- Header Section --> */}
                <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 no-print">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Sale Details</h1>
                        <p className="mt-1 text-gray-500">A complete overview of the transaction.</p>
                        <Link href="/sales" className="flex items-center justify-center mt-2 w-15 h-10 px-4 py-2 bg-cyan-600 text-white rounded-lg shadow-sm hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500">
                            <ArrowLeft />
                        </Link>
                    </div>
                    <div className="flex items-center space-x-3 mt-4 sm:mt-0">
                        {/* in that #, use window.print() */}
                        <button onclick="#" className="flex items-center justify-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400">
                            <Printer className="w-4 h-4 mr-2"/>
                            Print
                        </button>
                        <button className="flex items-center justify-center px-4 py-2 bg-cyan-600 text-white rounded-lg shadow-sm hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500">
                            <Download className="w-4 h-4 mr-2"/>
                            Download PDF
                        </button>
                    </div>
                </header>


                {/* Sales Details Container */}
                <main className="bg-white rounded-xl shadow-md printable-area">
                    {/* Invoice Header */}
                    <div className="p-8 border-b border-gray-200">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Sale #00A1</h2>
                                <p className="text-sm text-gray-500 mt-1">Date: July 7, 2024</p>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-cyan-600">VENDORA</div>
                                <p className="text-sm text-gray-500">123 Business Rd, Kathmandu, Nepal</p>
                            </div>
                        </div>
                    </div>

                    {/* Customer and Status Information */}
                    <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Billed To</h3>
                            <p className="mt-2 text-gray-900 font-medium">John Doe</p>
                            <p className="text-gray-600">john.doe@example.com</p>
                            <p className="text-gray-600">+977 9800000000</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Payment Method</h3>
                            <p className="mt-2 text-gray-900 font-medium">Cash</p>
                            <p className="text-gray-600">Paid in full</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Status</h3>
                            <span className="mt-2 inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full bg-teal-100 text-teal-800">
                                <CheckCircle className="w-4 h-4 mr-2"/>
                                Completed
                            </span>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="px-8 pb-8">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Order Summary</h3>
                        <div className="overflow-x-auto border border-gray-200 rounded-lg">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {/* <!-- Product Row 1 --> */}
                                    <tr>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">Wireless Headphones</div>
                                            <div className="text-sm text-gray-500">High-quality audio</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">WH-001</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">2</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">NPR 79.99</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">NPR 159.98</td>
                                    </tr>
                                    {/* <!-- Add more product rows here if needed --> */}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Totals Section */}
                    <div className="p-8 bg-gray-50 rounded-b-xl">
                        <div className="flex justify-end">
                            <div className="w-full max-w-sm">
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Subtotal</span>
                                    <span>NPR 159.98</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-600 mt-2">
                                    <span>Tax (13%)</span>
                                    <span>NPR 20.80</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-600 mt-2">
                                    <span>Discount</span>
                                    <span>- NPR 0.00</span>
                                </div>
                                <div className="border-t border-gray-200 my-4"></div>
                                <div className="flex justify-between text-lg font-bold text-gray-900">
                                    <span>Grand Total</span>
                                    <span>NPR 179.99</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}

Sale.layout = page => page

export default Sale