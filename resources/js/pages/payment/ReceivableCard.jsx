import axios from "axios";
import Card from "../../components/Card";
import { IndianRupeeIcon, ReceiptIndianRupee } from "lucide-react";
import { useEffect, useState } from "react";
import { usePage } from "@inertiajs/react";

//need to format the currency here
export function formatCurrency(n) {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'NPR', maximumFractionDigits: 2 }).format(n)
}


const ReceivableCard = ({ onData }) => {
    const [aging, setAging] = useState();
    const { summary } = usePage().props;

    useEffect(() => {
        //fetch aging
        axios.get('/api/reports/receivables/aging')
            .then(res => setAging(res.data.data || {}))
            .catch(() => setAging({}))
    }, [])

    return (
        <section className="py-4">
            <div className="container-xl lg:container m-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-lg">
                    <Card title="Total Outstanding"
                        value={formatCurrency(summary.total_outstanding || 0)}
                        Icon={IndianRupeeIcon}

                    />
                    <Card
                        title="Overdue Amount"
                        value={formatCurrency(summary.overdue_amount || 0)}
                        Icon={IndianRupeeIcon}
                        bg="bg-red-100 border-red-100"
                        iconColor="text-red-500"
                    />
                    <Card
                        title="Outstanding Invoices"
                        value={summary.outstanding_invoices || 0}
                        Icon={ReceiptIndianRupee}
                    />
                    <Card
                        title="Partially Paid"
                        value={summary.partially_paid_count || 0}
                        Icon={IndianRupeeIcon}

                    />
                </div>
            </div>

            {/* --- AGING SUMMARY SECTION --- */}
            <div className="bg-white p-5 m-3 rounded-xl shadow-sm border border-gray-200">
                <h2 className="text-2xl font-semibold mb-4">
                    Aging Summary
                </h2>
                <div className="container-xl lg:container m-auto">
                    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-4">
                        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                            <p className="text-sm text-gray-700">Current</p>
                            <p className="text-xl font-bold text-green-500">{formatCurrency(aging?.current ?? 0)}</p>
                        </div>
                        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                            <p className="text-sm text-gray-700">1-30 Days</p>
                            <p className="text-xl font-bold text-yellow-500">{formatCurrency(aging?.days_1_30 ?? 0)}</p>
                        </div>
                        <div className="p-4 bg-orange-100 rounded-lg border border-orange-200">
                            <p className="text-sm text-gray-700">31-60 Days</p>
                            <p className="text-xl font-bold text-orange-600">{formatCurrency(aging?.days_31_60 ?? 0)}</p>
                        </div>
                        <div className="p-4 bg-red-100 rounded-lg border border-red-200">
                            <p className="text-sm text-gray-700">61+ Days</p>
                            <p className="text-xl font-bold text-red-500">{formatCurrency(aging?.days_61_plus ?? 0)}</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ReceivableCard;
