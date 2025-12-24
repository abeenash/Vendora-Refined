import Card from "../../components/Card";
import { IndianRupeeIcon, ReceiptIndianRupee } from "lucide-react";


const PayableCard = () => {

    return (
        <section className="py-4">
            <div className="container-xl lg:container m-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-lg">
                    <Card title="Total Outstanding"
                        value="NPR 170,000.00"
                        Icon={IndianRupeeIcon}

                    />
                    <Card
                        title="Overdue Amount"
                        value="NPR 170,000.00"
                        Icon={IndianRupeeIcon}
                        bg="bg-red-50 border-red-100"
                        iconColor="text-red-500"
                    />
                    <Card
                        title="Outstanding Bills"
                        value="2"
                        Icon={ReceiptIndianRupee}
                    />
                    <Card
                        title="Partially Paid"
                        value="2"
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
                            <p className="text-xl font-bold text-green-500">NPR 22,500</p>
                        </div>
                        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                            <p className="text-sm text-gray-700">1-30 Days</p>
                            <p className="text-xl font-bold text-yellow-500">NPR 35,000</p>
                        </div>
                        <div className="p-4 bg-orange-100 rounded-lg border border-orange-200">
                            <p className="text-sm text-gray-700">31-60 Days</p>
                            <p className="text-xl font-bold text-orange-600">NPR 10,990</p>
                        </div>
                        <div className="p-4 bg-red-100 rounded-lg border border-red-200">
                            <p className="text-sm text-gray-700">61+ Days</p>
                            <p className="text-xl font-bold text-red-500">NPR 0</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PayableCard;
