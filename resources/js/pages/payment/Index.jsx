export default function Index({ payments, auth }) {
    return (
        <div className="p-6">
            <div className="flex justify-between mb-4">
                <h1 className="text-xl font-semibold">Payments</h1>

                {(auth.user.role === "salesperson" || auth.user.role === "admin") && (
                    <button className="bg-blue-600 text-white px-4 py-2 rounded">
                        Record Payment
                    </button>
                )}
            </div>

            <table className="w-full bg-white shadow rounded">
                <thead>
                    <tr className="border-b">
                        <th className="p-3 text-left">Sale ID</th>
                        <th className="p-3 text-left">Amount</th>
                        <th className="p-3 text-left">Method</th>
                        <th className="p-3 text-left">Date</th>
                        <th className="p-3 text-left">Recorded By</th>
                        <th className="p-3 text-left">Status</th>
                        {auth.user.role === "admin" && <th className="p-3">Action</th>}
                    </tr>
                </thead>

                <tbody>
                    {payments.map((p) => (
                        <tr key={p.id} className="border-b hover:bg-gray-50">
                            <td className="p-3">{p.sale_id}</td>
                            <td className="p-3">Rs. {p.amount}</td>
                            <td className="p-3">{p.payment_method}</td>
                            <td className="p-3">{p.payment_date}</td>
                            <td className="p-3">{p.recorder?.name}</td>

                            <td className="p-3">
                                {p.verified_by ? (
                                    <span className="px-2 py-1 bg-green-200 text-green-800 rounded">
                                        Verified
                                    </span>
                                ) : (
                                    <span className="px-2 py-1 bg-yellow-200 text-yellow-800 rounded">
                                        Pending
                                    </span>
                                )}
                            </td>

                            {auth.user.role === "admin" && (
                                <td className="p-3">
                                    {!p.verified_by && (
                                        <button className="bg-green-600 text-white px-3 py-1 
                                        rounded text-sm">
                                            Verify
                                        </button>
                                    )}
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
