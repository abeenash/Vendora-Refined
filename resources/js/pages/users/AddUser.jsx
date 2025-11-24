import { useForm, Link, usePage } from "@inertiajs/react";
import { route } from "ziggy-js";

const AddUser = () => {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        username: "",
        email: "",
        phone: "",
        role: "",
        status: "",
    });

    const { users } = usePage().props;

    const handleSubmit = (e) => {
        e.preventDefault();

        post(route("manageusers.store"), {
            onSuccess: () => reset(), //reset the form
        });
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto mb-12">
                <div className="bg-white rounded-xl shadow-md">
                    <div className="p-6 border-b border-gray-200 bg-teal-600">
                        <h1 className="text-2xl font-bold text-gray-800">
                            Add New User
                        </h1>
                        <p className="mt-1 text-sm text-gray-200">
                            Fill in the details below to add a new user
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Full Name
                                </label>
                                <input
                                    type="text"
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
                                    Username
                                </label>
                                <input
                                    type="text"
                                    id="add-username"
                                    value={data.username}
                                    onChange={(e) =>
                                        setData("username", e.target.value)
                                    }
                                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus-ring-cyan sm:text-sm"
                                />
                                {errors.username && (
                                    <div className="text-red-500 text-sm">
                                        {errors.username}
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Email
                                </label>
                                <input
                                    type="text"
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

                        {/* <div className="mt-6">
                            <label className="block text-sm font-medium text-gray-700">
                                Assigned Role
                            </label>
                            <select
                                id="add-role"
                                value={data.role}
                                onChange={(e) =>
                                    setData("role", e.target.value)
                                }
                                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan sm:text-sm"
                            >
                                <option value="">-- Select Role --</option>
                                <option value="">Admin</option>
                                <option value="">Salesperson</option>
                            </select>
                            {errors.role && (
                                <div className="text-red-500 text-sm">
                                    {errors.role}
                                </div>
                            )}
                        </div>
                        <div className="mt-6">
                            <label className="block text-sm font-medium text-gray-700">
                                Status
                            </label>
                            <select
                                id="add-status"
                                value={data.status}
                                onChange={(e) =>
                                    setData("status", e.target.value)
                                }
                                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan sm:text-sm"
                            >
                                <option value="">-- Select Status --</option>
                                <option value="">Active</option>
                                <option value="">Inactive</option>
                            </select>
                            {errors.status && (
                                <div className="text-red-500 text-sm">
                                    {errors.status}
                                </div>
                            )}
                        </div> */}

                        <div className="flex justify-end gap-4">
                            <Link
                                href="/manageusers"
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                className="btn-primary px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                disabled={processing}
                            >
                                Save User
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddUser;
