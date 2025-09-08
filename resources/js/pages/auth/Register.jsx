import { useForm, Link } from "@inertiajs/react";
import { Box, BoxIcon } from "lucide-react";

const Register = () => {
    const { data, setData, post, processing, errors } = useForm({
        fullname: "",
        email: "",
        password: "",
        password_confirmation: "",
        role: "admin",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post("/register"); // Laravel route you'll define below
    };

    return (
        <div className="bg-gray-100 flex items-center justify-center min-h-screen">
            <div className="w-full max-w-md p-4">
                <div
                    id="signup-form"
                    className="items-center bg-white p-8 rounded-xl shadow-md transition-all duration-300"
                >
                    <div className="text-center mb-8">
                        <span className="text-2xl font-bold text-gray-800">
                            <BoxIcon className="inline-block mr-2" />
                            Vendora
                        </span>
                        <p className="text-gray-500 mt-2">
                            Create Your Account
                        </p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            {/* Full Name */}
                            <div>
                                <label
                                    htmlFor="fullname"
                                    className="text-sm font-medium text-gray-700"
                                >
                                    Full Name
                                </label>
                                <input
                                    id="fullname"
                                    type="text"
                                    value={data.fullname}
                                    onChange={(e) =>
                                        setData("fullname", e.target.value)
                                    }
                                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus-ring-cyan sm:text-sm"
                                />
                                {errors.fullname && (
                                    <p className="text-red-500 text-sm">
                                        {errors.fullname}
                                    </p>
                                )}
                            </div>

                            {/* Username */}
                            <div>
                                <label
                                    htmlFor="username"
                                    className="text-sm font-medium text-gray-700"
                                >
                                    Username
                                </label>
                                <input
                                    id="username"
                                    type="text"
                                    value={data.username}
                                    onChange={(e) =>
                                        setData("username", e.target.value)
                                    }
                                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus-ring-cyan sm:text-sm"
                                />
                                {errors.username && (
                                    <p className="text-red-500 text-sm">
                                        {errors.username}
                                    </p>
                                )}
                            </div>
                            
                            {/* Email */}
                            <div>
                                <label
                                    htmlFor="email"
                                    className="text-sm font-medium text-gray-700"
                                >
                                    Email Address
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) =>
                                        setData("email", e.target.value)
                                    }
                                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus-ring-cyan sm:text-sm"
                                />
                                {errors.email && (
                                    <p className="text-red-500 text-sm">
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            {/* Password */}
                            <div>
                                <label
                                    htmlFor="password"
                                    className="text-sm font-medium text-gray-700"
                                >
                                    Password
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) =>
                                        setData("password", e.target.value)
                                    }
                                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus-ring-cyan sm:text-sm"
                                />
                                {errors.password && (
                                    <p className="text-red-500 text-sm">
                                        {errors.password}
                                    </p>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label
                                    htmlFor="password_confirmation"
                                    className="text-sm font-medium text-gray-700"
                                >
                                    Confirm Password
                                </label>
                                <input
                                    id="password_confirmation"
                                    name="password_confirmation"
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={(e) =>
                                        setData(
                                            "password_confirmation",
                                            e.target.value
                                        )
                                    }
                                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus-ring-cyan sm:text-sm"
                                />
                                {errors.password_confirmation && (
                                    <p className="text-red-500 text-sm">
                                        {errors.password_confirmation}
                                    </p>
                                )}
                            </div>

                            {/* Role */}
                            <div>
                                <label
                                    htmlFor="role"
                                    className="text-sm font-medium text-gray-700"
                                >
                                    User Role
                                </label>
                                <select
                                    id="role"
                                    value={data.role}
                                    onChange={(e) =>
                                        setData("role", e.target.value)
                                    }
                                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus-ring-cyan sm:text-sm"
                                >
                                    <option value="admin">Admin</option>
                                    <option value="salesperson">
                                        Salesperson
                                    </option>
                                </select>
                            </div>
                        </div>

                        {/* Submit */}
                        <div className="mt-6">
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full flex justify-center py-2 px-4 rounded-md text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700"
                            >
                                Sign Up
                            </button>
                        </div>
                    </form>

                    {/* Login Redirect */}
                    <p className="mt-6 text-center text-sm text-gray-600">
                        Already have an account?
                        <Link
                            href="/login"
                            className="font-medium text-cyan-600 hover:text-cyan-500 ml-1"
                        >
                            Login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

Register.layout = (page) => page;

export default Register;
