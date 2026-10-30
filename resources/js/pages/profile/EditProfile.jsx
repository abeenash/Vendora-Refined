import { ArrowLeft, Lock } from "lucide-react";
import { Link, useForm, usePage } from "@inertiajs/react";
import { route } from "ziggy-js";
import Profile from "../../images/profile.jpg";
import { useFlashToasts } from "../../components/Modal";

const inputClass = "mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm text-gray-800";

export const dashboardRoute = (user) => route(user?.role === "admin" ? "dashboard.admin" : "dashboard.salesperson");

const EditProfile = () => {
    const { profile, canEditEmail, auth } = usePage().props;
    useFlashToasts();

    const { data, setData, put, processing, errors, isDirty } = useForm({
        name: profile.name || "",
        username: profile.username || "",
        email: profile.email || "",
        phone: profile.phone || "",
    });

    const submit = (e) => {
        e.preventDefault();
        put(route("editprofile.update"), { preserveScroll: true });
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
                <header className="mb-6 flex items-start gap-4">
                    <Link href={dashboardRoute(auth.user)} className="mt-1 p-2 rounded-md bg-teal-600 text-white hover:bg-teal-700" aria-label="Back to dashboard">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Edit Profile</h1>
                        <p className="mt-1 text-gray-500">Manage your personal information.</p>
                    </div>
                </header>

                <div className="bg-white rounded-xl shadow-md">
                    <form onSubmit={submit} className="p-8 space-y-6">
                        <div className="flex items-center space-x-6">
                            <img className="h-20 w-20 rounded-full object-cover border-2 border-gray-200" src={Profile} alt="Profile" />
                            <div>
                                <p className="text-lg font-semibold text-gray-800">{profile.name}</p>
                                <p className="text-sm text-gray-500 capitalize">{profile.role}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                                <input id="name" value={data.name} onChange={(e) => setData("name", e.target.value)} className={inputClass} />
                                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                            </div>

                            <div>
                                <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
                                <input id="username" value={data.username} onChange={(e) => setData("username", e.target.value)} className={inputClass} />
                                {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                                {canEditEmail ? (
                                    <input id="email" type="email" value={data.email} onChange={(e) => setData("email", e.target.value)} className={inputClass} />
                                ) : (
                                    <>
                                        <input id="email" type="email" value={data.email} readOnly className={`${inputClass} bg-gray-100 text-gray-500 cursor-not-allowed`} />
                                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1"><Lock className="w-3 h-3" /> Your login email is managed by the admin.</p>
                                    </>
                                )}
                                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                            </div>

                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
                                <input id="phone" value={data.phone} onChange={(e) => setData("phone", e.target.value)} placeholder="98XXXXXXXX" className={inputClass} />
                                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                            </div>
                        </div>

                        <div className="pt-4 flex justify-between items-center">
                            <Link href={route("settings")} className="text-sm text-teal-600 hover:underline">Change password →</Link>
                            <button type="submit" disabled={processing || !isDirty} className="px-5 py-2 text-sm font-medium text-white bg-teal-600 border border-transparent rounded-lg shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50">
                                {processing ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default EditProfile
