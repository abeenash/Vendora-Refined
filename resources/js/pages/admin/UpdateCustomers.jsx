import { useForm, usePage, Link } from "@inertiajs/react";
import { route } from "ziggy-js";

const UpdateCustomers = () => {
    const { customer, salespersons } = usePage().props;

    const { data, setData, put, processing, errors, reset } = useForm({
        name: customer.name || "",
        email: customer.email || "",
        phone: customer.phone || "",
        address: customer.address || "",
        user_id: customer.user_id || "",
    });

    const editCustomer = (e) => {
        e.preventDefault();
        put(route("managecustomers.update", customer.id), {
            preserveState: false,
            onSuccess: () => reset(),
        });
    };
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto mb-12">
                <div className="bg-white rounded-xl shadow-md">
                    <div className="p-6 border-b border-gray-200 bg-teal-600">
                        <h1 className="text-2xl font-bold text-gray-800">
                            Update Customer Details
                        </h1>
                        <p className="mt-1 text-sm text-gray-200">
                            Fill in the details below to update the customer
                            details
                        </p>
                    </div>

                    <form
                        onSubmit={editCustomer}
                        method="PUT"
                        className="p-6 space-y-6"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Customer Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    id="add-name"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData("name", e.target.value)
                                    }
                                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus-ring-cyan sm:text-sm"
                                />
                                {errors.name && (
                                    <div className="text-red-500 text-sm">
                                        {errors.name}
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Email
                                </label>
                                <input
                                    type="text"
                                    name="email"
                                    id="add-email"
                                    value={data.email}
                                    onChange={(e) =>
                                        setData("email", e.target.value)
                                    }
                                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus-ring-cyan sm:text-sm"
                                />
                                {errors.email && (
                                    <div className="text-red-500 text-sm">
                                        {errors.email}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Phone
                            </label>
                            <input
                                name="phone"
                                id="add-phone"
                                value={data.phone}
                                onChange={(e) =>
                                    setData("phone", e.target.value)
                                }
                                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus-ring-cyan sm:text-sm"
                            />
                            {errors.phone && (
                                <div className="text-red-500 text-sm">
                                    {errors.phone}
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Address
                            </label>
                            <input
                                name="address"
                                id="add-address"
                                value={data.address}
                                onChange={(e) =>
                                    setData("address", e.target.value)
                                }
                                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus-ring-cyan sm:text-sm"
                            />
                            {errors.address && (
                                <div className="text-red-500 text-sm">
                                    {errors.address}
                                </div>
                            )}
                            <div className="mt-6">
                                <label className="block text-sm font-medium text-gray-700">
                                    Assigned Salesperson
                                </label>
                                <select
                                    name="user_id"
                                    id="add-salesperson"
                                    value={data.user_id}
                                    onChange={(e) =>
                                        setData("user_id", e.target.value)
                                    }
                                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan sm:text-sm"
                                >
                                    <option value={customer.user_id}>
                                        -- Select Salesperson --
                                    </option>
                                    {salespersons.map((salesperson) => (
                                        <option
                                            key={salesperson.id}
                                            value={salesperson.id}
                                        >
                                            {salesperson.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.user_id && (
                                    <div className="text-red-500 text-sm">
                                        {errors.user_id}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end gap-4">
                            <Link
                                href="/managecustomers"
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                className="btn-primary px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                disabled={processing}
                            >
                                Save Customer
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default UpdateCustomers;
