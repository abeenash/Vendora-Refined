import { useForm, Link, usePage } from '@inertiajs/react';
import { Box, BoxIcon } from 'lucide-react';


const Login = () => {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
    });

    const { props } = usePage();

    const status = props?.flash?.status;

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/login'); // Laravel route you'll define below
    };

    return (
        <div className="bg-gray-100 flex items-center justify-center min-h-screen">
            <div className="w-full max-w-md p-4">
                <div id="signup-form" className="items-center bg-white p-8 rounded-xl shadow-md transition-all duration-300">
                    <div className="text-center mb-8">
                        <span className="text-2xl font-bold text-gray-800">
                            <BoxIcon className="inline-block mr-2" />
                            Vendora</span>
                        <p className="text-gray-500 mt-2">Welcome Back! Login to your account.</p>
                    </div>

                    {status && (
                        <div className="text-white text-center bg-red-500 w-full p-2 mb-2 rounded">
                            {status}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4">

                            {/* Email */}
                            <div>
                                <label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</label>
                                <input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus-ring-cyan sm:text-sm"
                                />
                                {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                            </div>

                            {/* Password */}
                            <div>
                                <label htmlFor="password" className="text-sm font-medium text-gray-700">Password</label>
                                <input
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus-ring-cyan sm:text-sm"
                                />
                                {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
                            </div>
                        </div>

                        {/* <!-- Remember Me & Forgot Password --> */}
                        <div className="flex items-center justify-between mt-4 text-sm">
                            <div className="flex items-center">
                                <input id="remember-me" name="remember-me" type="checkbox"
                                    className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded" />
                                <label htmlFor="remember-me" className="ml-2 block text-gray-900">
                                    Remember me
                                </label>
                            </div>
                            <Link href="#" className="font-medium text-teal-600 hover:text-teal-500">
                                Forgot Password?
                            </Link>
                        </div>

                        {/* Submit */}
                        <div className="mt-6">
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full flex justify-center py-2 px-4 rounded-md text-sm font-medium text-white bg-teal-600 hover:bg-teal-700"
                            >
                                Login
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

Login.layout = page => page;

export default Login;
