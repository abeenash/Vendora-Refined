import { usePage, Link, router } from "@inertiajs/react";
import { Plus, Edit, Search } from "lucide-react";
import { DeleteButton } from "../../components/DeleteButton";
import { route } from "ziggy-js";
import { useEffect } from "react";
import { toast } from "react-toastify";

const ManageCustomer = () => {
    const { customers, flash } = usePage().props;

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
    }, [flash]);

    return (
        <div className="space-y-6 p-4 lg:p-2 lg:p-6">
            <div className="max-w-7xl mx-auto">
                {/* <!-- Header Section --> */}
                <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">
                            Customers
                        </h1>
                        <p className="mt-1 text-gray-500">
                            View and manage customers
                        </p>
                    </div>
                    <Link
                        href={route("managecustomers.create")}
                        className="mt-4 sm:mt-0 flex items-center justify-center px-4 py-2 bg-teal-600 text-white rounded-lg shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
                    >
                        <Plus className="mr-2" /> New Customer
                    </Link>
                </header>

                {/* <!-- Search Bar --> */}
                <div className="mb-6">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search salesperson by name or username..."
                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
                        />
                    </div>
                </div>

                {/* <!-- Customers Table Container --> */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-700">
                            Customers in Total ({customers.length})
                        </h2>
                    </div>

                    {/* <!-- Table --> */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        Name
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        Email
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        Phone
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        Address
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        Assigned Salesperson
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {/* <!-- Customer Row from back --> */}
                                {customers.map((customer) => (
                                    <tr key={customer.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {customer.name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-xs text-gray-500">
                                                {customer.email}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-xs text-semibold">
                                                {customer.phone}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-sm text-gray-900">
                                                {customer.address}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-xs text-gray-500">
                                                {customer.assigned_salesperson ? (
                                                    <span className="px-2 py-1 rounded-full bg-teal-100 text-teal-800 text-xs text-center font-medium">
                                                        {
                                                            customer.assigned_salesperson
                                                        }
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-500 text-xs text-center font-medium">
                                                        Unassigned
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center space-x-3">
                                                <Link
                                                    href={route(
                                                        "managecustomers.edit",
                                                        customer.id
                                                    )}
                                                    className="text-gray-400 hover:text-cyan-600"
                                                >
                                                    <Edit className="h-5 w-5" />
                                                </Link>
                                                <DeleteButton
                                                    onConfirm={() =>
                                                        router.delete(
                                                            route(
                                                                "managecustomers.destroy",
                                                                customer.id
                                                            )
                                                        )
                                                    }
                                                    attr="customer"
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageCustomer;
