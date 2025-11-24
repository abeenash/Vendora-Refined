import { ArrowLeft } from "lucide-react"
import { Link } from "@inertiajs/react"
import { useState, useEffect } from "react"


const Settings = () => {

    const [darkMode, setDarkMode] = useState(false);

    //Sync with localStorage so it remembers user choice
    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    }, [darkMode]);

    //we will load saved preference
    useEffect(() => {
        const storedTheme = localStorage.getItem("theme");
        if (storedTheme == "dark") {
            setDarkMode(true);
        }
    }, []);

    return (
        <div className="p-4 sm:p-6 lg:p-8 dark:bg-gray-900">
            <div className="max-w-4xl mx-auto space-y-12">
                <div>
                    <header className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Settings</h1>
                        <p className="mt-1 text-gray-500 dark:text-gray-400">Manage your preferences and system settings.</p>
                        <Link href="/dashboard">
                            <ArrowLeft className="bg-teal-600 rounded-md text-white mt-2 w-12 h-7 hover:bg-teal-700" />
                        </Link>
                    </header>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md divide-y divide-gray-200 dark:divide-gray-700">
                        {/* <!-- Change Password --> */}
                        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-1">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Change Password</h3>
                                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Update your password for enhanced security.</p>
                            </div>
                            <div className="md:col-span-2">
                                <form action="#" method="POST" className="space-y-4">
                                    <div>
                                        <label for="current-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Current Password</label>
                                        <input type="password" id="current-password" name="current_password"
                                            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 
                                        dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm dark:text-white"/>
                                    </div>
                                    <div>
                                        <label for="new-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">New Password</label>
                                        <input type="password" id="new-password" name="new_password"
                                            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 
                                        dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm dark:text-white"/>
                                    </div>
                                    <div className="pt-2 flex justify-end">
                                        <button type="submit" className="px-5 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700">Update Password</button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* <!-- Dark Mode Toggle --> */}
                        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                            <div className="md:col-span-1">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Theme</h3>
                                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Switch between light and dark mode.</p>
                            </div>
                            <div className="md:col-span-2 flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Dark Mode</span>
                                <label className="relative inline-block w-12 h-6">
                                    <input
                                        type="checkbox"
                                        checked={darkMode}
                                        onChange={() => setDarkMode(!darkMode)}
                                        className="sr-only"
                                    />
                                    <span
                                        className={`block w-full h-full rounded-full transition-colors duration-300 ${darkMode ? "bg-teal-600" : "bg-gray-300"
                                            }`}
                                    ></span>
                                    <span
                                        className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${darkMode ? "translate-x-6" : ""
                                            }`}
                                    ></span>
                                </label>
                            </div>
                        </div>

                        {/* <!-- Notification Preferences --> */}
                        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-1">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Notifications</h3>
                                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Choose how you receive notifications.</p>
                            </div>
                            <div className="md:col-span-2 space-y-4">
                                <div className="flex items-center">
                                    <input id="email-notifications" name="email_notifications" type="checkbox" checked
                                        className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 dark:border-gray-600 rounded" />
                                    <label for="email-notifications" className="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300">Email Notifications</label>
                                </div>
                                <div className="flex items-center">
                                    <input id="in-app-notifications" name="in_app_notifications" type="checkbox" checked
                                        className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 dark:border-gray-600 rounded" />
                                    <label for="in-app-notifications" className="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300">In-App Notifications</label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

Settings.layout = page => page

export default Settings