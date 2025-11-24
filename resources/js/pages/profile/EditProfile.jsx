import { ArrowLeft } from "lucide-react";
import { Link } from "@inertiajs/react";

const EditProfile = () => {
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto space-y-12">
                <div>
                    <header className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-800">Edit Profile</h1>
                        <p className="mt-1 text-gray-500">Manage your personal information.</p>
                    </header>

                    <Link href="/dashboard">
                        <ArrowLeft className="bg-teal-600 rounded-md w-12 h-8 text-white hover:bg-teal-700 mb-2"/>
                    </Link>

                    <div className="bg-white rounded-xl shadow-md">
                        <form action="#" method="POST" className="p-8 space-y-6">
                            {/* <!-- Profile Photo --> */}
                            <div className="flex items-center space-x-6">
                                <img id="avatar-preview" className="h-20 w-20 rounded-full object-cover" src="https://placehold.co/96x96/e2e8f0/64748b?text=A" alt="Current profile photo" />
                                <div>
                                    <label for="photo-upload" className="cursor-pointer px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                                        Change Photo
                                    </label>
                                    <input type="file" id="photo-upload" name="photo" className="hidden" accept="image/*" />
                                    <p className="text-xs text-gray-500 mt-2">JPG, GIF or PNG. 1MB max.</p>
                                </div>
                            </div>

                            {/* <!-- Username --> */}
                            <div>
                                <label for="username" className="block text-sm font-medium text-gray-700">Username / Display Name</label>
                                <input type="text" id="username" name="username" value="Aaron Smith" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm" />
                            </div>

                            {/* <!-- Email --> */}
                            <div>
                                <label for="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                                <input type="email" id="email" name="email" value="aaron.smith@vendora.com" readonly className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm sm:text-sm text-gray-500 cursor-not-allowed" />
                            </div>

                            {/* <!-- Form Actions --> */}
                            <div className="pt-4 flex justify-end">
                                <button type="submit" className="px-5 py-2 text-sm font-medium text-white bg-teal-600 border border-transparent rounded-lg shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500">
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

EditProfile.layout = page => page;

export default EditProfile