import { useEffect, useState } from "react";
import { usePage, Link, router } from "@inertiajs/react";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import { route } from "ziggy-js";
import { toast } from "react-toastify";
import PasswordModal from "../../components/PasswordModal";
import { DeleteButton } from "../../components/DeleteButton";

const ManageUsers = () => {
    const { users, generatedPassword, flash } = usePage().props; //this will get the users from the props
    const [showModal, setShowModal] = useState(!!generatedPassword);
    const [search, setSearch] = useState("");

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
    }, [flash]);

    const handleSearch = (e) => {
        setSearch(e.target.value);

        router.get(
            route("manageusers.index"),
            { search: e.target.value },
            { preserveState: true, replace: true }
        );
    };

    return (
        <div className="space-y-6 p-4 lg:p-2 lg:p-6">
            <div className="max-w-7xl mx-auto">
                {/* <!-- Header Section --> */}
                <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">
                            Vendora Users
                        </h1>
                        <p className="mt-1 text-gray-500">
                            View and manage system users
                        </p>
                    </div>
                    <Link
                        href={route("manageusers.create")}
                        className="mt-4 sm:mt-0 flex items-center justify-center px-4 py-2 bg-teal-600 text-white rounded-lg shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                    >
                        <Plus className="h-5 w-5 mr-1" />
                        Add User
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
                            value={search}
                            onChange={handleSearch}
                            placeholder="Search user by name..."
                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
                        />
                    </div>
                </div>

                <div className="mt-4">
                    {showModal && (
                        <PasswordModal
                            password={generatedPassword}
                            onClose={() => setShowModal(false)}
                        />
                    )}
                </div>

                {/* <!-- Products Table Container --> */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-700">
                            Users in Total ({users.total})
                        </h2>
                    </div>

                    {/* <!-- Table --> */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    {[
                                        'Name',
                                        'Username',
                                        'Email',
                                        'Phone',
                                        'Status',
                                        'Last Login',
                                        'Actions'
                                    ].map((col) => (
                                        <th key={col}
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {col}
                                        </th>
                                    ))}

                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {users.data.map((user) => (
                                    <tr key={user.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {user.name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-xs text-gray-500">
                                                {user.username}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-xs text-gray-500">
                                                {user.email}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {user.phone}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {user.status === "Active" && (
                                                <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-teal-100 text-teal-800">
                                                    Active
                                                </span>
                                            )}
                                            {user.status === "Inactive" && (
                                                <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                                    Inactive
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-xs text-gray-500">
                                                {user.last_login}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center space-x-3">
                                                <Link
                                                    href={route(
                                                        "manageusers.edit",
                                                        user.id
                                                    )}
                                                    className="text-gray-400 hover:text-cyan-600"
                                                >
                                                    <Edit className="w-5 h-5" />
                                                </Link>
                                                <DeleteButton
                                                    onConfirm={() =>
                                                        router.delete(
                                                            route("manageusers.destroy",
                                                                user.id)
                                                        )
                                                    }
                                                    attr="user"
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                 {users.data.length === 0 && (
                                    <tr>
                                        <td
                                            colspan="6"
                                            className="px-6 py-4 text-center text-gray-500"
                                        >
                                            No Customers Found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-4 flex justify-center space-x-2">
                        {users.links.map((link, index) => (
                            <button
                                key={index}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                onClick={() =>
                                    link.url && router.visit(link.url)
                                }
                                disabled={!link.url}
                                className={`px-3 py-1 border border-gray-300 rounded-lg text-sm ${link.active
                                        ? "bg-teal-600 text-white"
                                        : "bg-white text-gray-700"
                                    } ${!link.url
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

export default ManageUsers;
