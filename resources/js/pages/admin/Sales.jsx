import { Plus, Search, Eye } from "lucide-react";
import { Link, usePage, router } from "@inertiajs/react";
import { useState, useEffect } from "react";
import { route } from "ziggy-js";
import { toast } from "react-toastify";
import { DeleteButton } from "../../components/DeleteButton";
import { Cancellation } from "../../components/Cancellation";

// Status Badge Component
const StatusBadge = ({ sale }) => {
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [pendingStatus, setPendingStatus] = useState(null);

    const handleStatusChange = (e) => {
        const newStatus = e.target.value;

        if (newStatus === "Cancelled") {
            //don't update yet, open modal instead
            setPendingStatus(newStatus);
            setShowCancelModal(true);
            return;
        }

        //everything else goes immediately
        updateStatus(newStatus);
    };

    const updateStatus = (newStatus) => {
        router.patch(
            route("sales.updateStatus", sale.id),
            { status: newStatus },
            {
                preserveScroll: true, //this will keep the scroll position because we are on the same page
                onSuccess: () => {
                    toast.success(
                        `Sale #${sale.sale_id} updated to ${newStatus}`
                    );
                },
                onError: () => {
                    toast.error(`Failed to update status`);
                },
            }
        );
    };

    const statusStyles = {
        Pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
        Completed: "bg-teal-100 text-teal-800 border-teal-300",
        Cancelled: "bg-red-100 text-red-800 border-red-300",
    };

    if (sale.status === "Cancelled") {
        return (
            <span
                className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    statusStyles[sale.status]
                }`}
            >
                Cancelled
            </span>
        );
    }

    return (
        <>
            <select
                value={sale.status}
                onChange={handleStatusChange}
                onClick={(e) => e.stopPropagation()}
                className={`text-xs font-semibold border rounded-full px-3 py-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 ${
                    statusStyles[sale.status]
                }`}
            >
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
            </select>

            {/* Modal */}
            {showCancelModal && (
                <Cancellation
                    saleId={sale.id}
                    onConfirm={() => {
                        updateStatus(pendingStatus);
                        setShowCancelModal(false);
                        setPendingStatus(null);
                    }}
                    onClose={() => {
                        setShowCancelModal(false);
                        setPendingStatus(null);
                    }}
                />
            )}
        </>
    );
};

const Sales = () => {
    const { sales, flash } = usePage().props;
    const [search, setSearch] = useState("");

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    const handleSearch = (e) => {
        setSearch(e.target.value);
        router.get(
            route("sales.index"),
            { search: e.target.value },
            { preserveState: true, replace: true }
        );
    };

    return (
        <div className="space-y-6 p-4 lg:p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">
                            Sales
                        </h1>
                        <p className="mt-1 text-gray-500">
                            Track and manage the sales transactions
                        </p>
                    </div>
                    <Link
                        href={route("sales.create")}
                        className="mt-4 sm:mt-0 flex items-center justify-center px-4 py-2 bg-teal-600 text-white rounded-lg shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
                    >
                        <Plus className="mr-2 h-5 w-5" /> Add Sale
                    </Link>
                </header>

                {/* Search Bar */}
                <div className="mb-6">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            value={search}
                            onChange={handleSearch}
                            placeholder="Search sales by ID, customer, or product..."
                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
                        />
                    </div>
                </div>

                {/* Sales Table */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-700">
                            All Sales ({sales.total})
                        </h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    {[
                                        "Sale ID",
                                        "Customer",
                                        "Invoice Date",
                                        "Items",
                                        "Total Price",
                                        "Status",
                                        "Actions",
                                    ].map((col) => (
                                        <th
                                            key={col}
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >
                                            {col}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {sales.data.map((sale) => (
                                    <tr
                                        key={sale.id}
                                        className={
                                            sale.status === "Cancelled"
                                                ? "bg-red-50 text-red-500 line-through "
                                                : ""
                                        }
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {sale.sale_id}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {sale.customer_name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {sale.date}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {sale.items_count}{" "}
                                                {sale.items_count > 1
                                                    ? "items"
                                                    : "item"}
                                            </div>
                                            <div
                                                className="text-xs text-gray-500 truncate"
                                                title={sale.items_summary}
                                            >
                                                {sale.items_summary}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            NPR {sale.total_price}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <StatusBadge sale={sale} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center space-x-4">
                                                <Link
                                                    href={route(
                                                        "sales.show",
                                                        sale.id
                                                    )}
                                                    className="text-gray-400 hover:text-cyan-600"
                                                >
                                                    <Eye className="h-5 w-5" />
                                                </Link>
                                                {sale.status === "Pending" && (
                                                    <DeleteButton
                                                        onConfirm={() =>
                                                            router.delete(
                                                                route(
                                                                    "sales.destroy",
                                                                    sale.id
                                                                )
                                                            )
                                                        }
                                                        attr="sale"
                                                    />
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {sales.data.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan="7"
                                            className="px-6 py-4 text-center text-gray-500"
                                        >
                                            No Sales Found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="p-4 flex justify-center space-x-2">
                        {sales.links.map((link, index) => (
                            <button
                                key={index}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                onClick={() =>
                                    link.url && router.visit(link.url)
                                }
                                disabled={!link.url}
                                className={`px-3 py-1 border border-gray-300 rounded-lg text-sm ${
                                    link.active
                                        ? "bg-teal-600 text-white"
                                        : "bg-white text-gray-700"
                                } ${
                                    !link.url
                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                        : "hover:bg-gray-50"
                                }`}
                            ></button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sales;

//Status Badge Component
// const StatusBadge = ({ sale }) => {

// };
// const Sales = () => {
//     const { sales, flash } = usePage().props;
//     const [search, setSearch] = useState("");

//     useEffect(() => {
//         if (flash?.success) {
//             toast.success(flash.success);
//         }
//     }, [flash]);

//     const handleSearch = (e) => {
//         setSearch(e.target.value);

//         router.get(
//             route("sales.index"), //listing route
//             { search: e.target.value },
//             { preserveState: true, replace: true }
//         );
//     };

//     return (
//         <div className="space-y-6 p-4 lg:p-2 lg:p-6">
//             <div className="max-w-7xl mx-auto">
//                 {/* <!-- Header Section --> */}
//                 <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
//                     <div>
//                         <h1 className="text-3xl font-bold text-gray-800">
//                             Sales
//                         </h1>
//                         <p className="mt-1 text-gray-500">
//                             Track and manage the sales transactions
//                         </p>
//                     </div>
//                     <Link
//                         href={route("sales.create")}
//                         className="mt-4 sm:mt-0 flex items-center justify-center px-4 py-2 bg-teal-600 text-white rounded-lg shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
//                     >
//                         <Plus className="mr-2" /> Add Sale
//                     </Link>
//                 </header>

//                 {/* <!-- Search Bar --> */}
//                 <div className="mb-6">
//                     <div className="relative">
//                         <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                             <Search className="h-5 w-5 text-gray-400" />
//                         </div>
//                         <input
//                             type="text"
//                             value={search}
//                             onChange={handleSearch}
//                             placeholder="Search sales by ID, customer, or product..."
//                             className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
//                         />
//                     </div>
//                 </div>

//                 {/* <!-- Sales Table Container --> */}
//                 <div className="bg-white rounded-xl shadow-md overflow-hidden">
//                     <div className="p-6 border-b border-gray-200">
//                         <h2 className="text-lg font-semibold text-gray-700">
//                             All Sales ({sales.total})
//                         </h2>
//                     </div>

//                     {/* <!-- Header Table --> */}
//                     <div className="overflow-x-auto">
//                         <table className="min-w-full divide-y divide-gray-200">
//                             <thead className="bg-gray-50">
//                                 <tr>
//                                     {[
//                                         "Sale ID",
//                                         "Customer",
//                                         "Invoice Date",
//                                         "Items",
//                                         "Total Price",
//                                         "Status",
//                                         "Actions",
//                                     ].map((col) => (
//                                         <th
//                                             key={col}
//                                             className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
//                                         >
//                                             {col}
//                                         </th>
//                                     ))}
//                                 </tr>
//                             </thead>

//                             <tbody className="bg-white divide-y divide-gray-200">
//                                 {/* Sales Row(s) */}
//                                 {sales.data.map((sale) => (
//                                     <tr key={sale.id}>
//                                         <td className="px-6 py-4 whitespace-nowrap">
//                                             <div className="text-sm font-medium text-gray-900">
//                                                 {sale.sale_id}
//                                             </div>
//                                         </td>
//                                         <td className="px-6 py-4 whitespace-nowrap">
//                                             <div className="text-sm text-gray-900">
//                                                 {sale.customer_name}
//                                             </div>
//                                         </td>
//                                         <td className="px-6 py-4 whitespace-nowrap">
//                                             <div className="text-sm text-gray-900">
//                                                 {sale.date}
//                                             </div>
//                                         </td>
//                                         <td className="px-6 py-4 whitespace-nowrap">
//                                             <div className="text-sm text-gray-900">
//                                                 {sale.items_count}{" "}
//                                                 {sale.items_count > 1
//                                                     ? "items"
//                                                     : "item"}
//                                             </div>
//                                             <div className="text-xs text-gray-500">
//                                                 {sale.items_summary}
//                                             </div>
//                                         </td>
//                                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
//                                             NPR {sale.total_price}
//                                         </td>
//                                         <td className="px-6 py-4 whitespace-nowrap">
//                                             <span
//                                                 className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
//                                                  ${
//                                                      sale.status === "Completed"
//                                                          ? "bg-teal-100 text-teal-800"
//                                                          : "bg-yellow-100 text-yellow-800"
//                                                  }`}
//                                             >
//                                                 {sale.status}
//                                             </span>
//                                         </td>
//                                         <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                                             <div className="flex items-center space-x-3">
//                                                 <Link
//                                                     href={route(
//                                                         "sales.show",
//                                                         sale.id
//                                                     )}
//                                                     className="text-gray-400 hover:text-cyan-600"
//                                                 >
//                                                     <Eye className="h-5 w-5 ml-4" />
//                                                 </Link>
//                                                 <DeleteButton
//                                                     onConfirm={() =>
//                                                         router.delete(
//                                                             route(
//                                                                 "sales.destroy",
//                                                                 sale.id
//                                                             )
//                                                         )
//                                                     }
//                                                 />
//                                             </div>
//                                         </td>
//                                     </tr>
//                                 ))}

//                                 {sales.data.length === 0 && (
//                                     <tr>
//                                         <td
//                                             colspan="7"
//                                             className="px-6 py-4 text-center text-gray-500"
//                                         >
//                                             No Sales Found
//                                         </td>
//                                     </tr>
//                                 )}
//                             </tbody>
//                         </table>
//                     </div>
//                     <div className="p-4 flex justify-center space-x-2">
//                         {sales.links.map((link, index) => (
//                             <button
//                                 key={index}
//                                 dangerouslySetInnerHTML={{
//                                     __html: link.label,
//                                 }}
//                                 onClick={() =>
//                                     link.url && router.visit(link.url)
//                                 }
//                                 className={`px-3 py-1 border border-gray-300 rounded-lg text-sm ${
//                                     link.active
//                                         ? "bg-teal-600 text-white"
//                                         : "bg-white text-gray-700"
//                                 }`}
//                             ></button>
//                         ))}
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default Sales;
