import { useForm } from "@inertiajs/react";

const ForcePasswordReset = () => {

    const customStyles = (
        <style>
            {`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fadeIn 0.8s ease-out forwards;
                }
                .shadow-3xl {
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                }
            `}
        </style>
    );

    const { data, setData, post, processing, errors } = useForm({
        password: "",
        password_confirmation: "",
    });

    const submit = (e) => {
        e.preventDefault();
        post("/force-password-reset");
    };

    return (
       <div className="flex items-center justify-center min-h-screen bg-gray-50">
            {customStyles}
            <div className="animate-fade-in bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full border-t-4 border-teal-600 transition duration-500 hover:shadow-3xl">

                <div className="text-center mb-6">
                    <h2 className="text-3xl font-extrabold text-gray-800">
                        Welcome!
                    </h2>
                    <p className="text-gray-500 mt-1">
                        Please set a secure, new password to continue.
                    </p>
                </div>

                <form onSubmit={submit}>
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
                            New Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={data.password}
                            onChange={(e) => setData("password", e.target.value)}
                            // mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus-ring-cyan sm:text-sm
                            className="mt-1 block w-full px-3 py-2 bg-white border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none transition duration-150 ease-in-out p-3 placeholder-gray-400"
                            required
                        />
                        {errors.password && (
                            <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                        )}
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password_confirmation">
                            Confirm Password
                        </label>
                        <input
                            id="password_confirmation"
                            type="password"
                            value={data.password_confirmation}
                            onChange={(e) => setData("password_confirmation", e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-white border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none transition duration-150 ease-in-out p-3 placeholder-gray-400"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className={`
                            w-full py-3 px-4 rounded-lg font-semibold text-white transition duration-300 ease-in-out
                            bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2
                            ${processing ? 'opacity-60 cursor-not-allowed' : 'shadow-lg hover:shadow-xl transform hover:scale-[1.01]'}
                        `}
                    >
                        {processing ? 'Saving...' : 'Update Password'}
                    </button>
                </form>
            </div>
        </div>
    );
}

ForcePasswordReset.layout = page => page;

export default ForcePasswordReset;
