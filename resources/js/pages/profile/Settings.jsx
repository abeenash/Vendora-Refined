import { ArrowLeft, Monitor, Moon, Sun } from "lucide-react"
import { Link, useForm, usePage } from "@inertiajs/react"
import { route } from "ziggy-js"
import { useTheme } from "../../lib/theme"
import { useFlashToasts } from "../../components/Modal"
import { dashboardRoute } from "./EditProfile"

const inputClass = "mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm text-gray-800"

const THEMES = [
    { value: "light", label: "Light", Icon: Sun },
    { value: "dark", label: "Dark", Icon: Moon },
    { value: "system", label: "System", Icon: Monitor },
]

const Settings = () => {
    const { auth } = usePage().props
    const [theme, setTheme] = useTheme()
    useFlashToasts()

    const { data, setData, put, processing, errors, reset } = useForm({
        current_password: "",
        password: "",
        password_confirmation: "",
    })

    const submit = (e) => {
        e.preventDefault()
        put(route("settings.password"), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: () => reset("password", "password_confirmation"),
        })
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
                <header className="mb-6 flex items-start gap-4">
                    <Link href={dashboardRoute(auth.user)} className="mt-1 p-2 rounded-md bg-teal-600 text-white hover:bg-teal-700" aria-label="Back to dashboard">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
                        <p className="mt-1 text-gray-500">Manage your password and appearance.</p>
                    </div>
                </header>

                <div className="bg-white rounded-xl shadow-md divide-y divide-gray-200">
                    {/* Change Password */}
                    <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-1">
                            <h3 className="text-lg font-medium text-gray-900">Change Password</h3>
                            <p className="mt-1 text-sm text-gray-600">At least 8 characters with an uppercase letter, a lowercase letter, a number and a symbol. Other devices will be signed out.</p>
                        </div>
                        <form onSubmit={submit} className="md:col-span-2 space-y-4">
                            <div>
                                <label htmlFor="current_password" className="block text-sm font-medium text-gray-700">Current Password</label>
                                <input type="password" id="current_password" autoComplete="current-password" value={data.current_password} onChange={(e) => setData("current_password", e.target.value)} className={inputClass} />
                                {errors.current_password && <p className="text-red-500 text-sm mt-1">{errors.current_password}</p>}
                            </div>
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">New Password</label>
                                <input type="password" id="password" autoComplete="new-password" value={data.password} onChange={(e) => setData("password", e.target.value)} className={inputClass} />
                                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                            </div>
                            <div>
                                <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                                <input type="password" id="password_confirmation" autoComplete="new-password" value={data.password_confirmation} onChange={(e) => setData("password_confirmation", e.target.value)} className={inputClass} />
                            </div>
                            <div className="pt-2 flex justify-end">
                                <button type="submit" disabled={processing} className="px-5 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 disabled:opacity-50">
                                    {processing ? "Updating..." : "Update Password"}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Theme */}
                    <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                        <div className="md:col-span-1">
                            <h3 className="text-lg font-medium text-gray-900">Theme</h3>
                            <p className="mt-1 text-sm text-gray-600">"System" follows your device's light/dark setting.</p>
                        </div>
                        <div className="md:col-span-2">
                            <div role="radiogroup" aria-label="Theme" className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1">
                                {THEMES.map(({ value, label, Icon }) => (
                                    <button
                                        key={value}
                                        type="button"
                                        role="radio"
                                        aria-checked={theme === value}
                                        onClick={() => setTheme(value)}
                                        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${theme === value ? "bg-teal-600 text-white shadow-sm" : "text-gray-600 hover:bg-gray-200"}`}
                                    >
                                        <Icon className="w-4 h-4" /> {label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Settings
