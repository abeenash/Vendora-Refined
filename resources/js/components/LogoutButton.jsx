import { AlertTriangle, LogOut } from "lucide-react";
import { useState } from "react";

export function LogoutButton({ onConfirm }) {
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    return (
        <>
            <button
                onClick={() => setShowLogoutModal(true)}
                className="w-full px-4 py-2 bg-red-300 text-sm text-red-700 hover:bg-red-400"
            >
                <LogOut className="inline mr-1 h-5 w-5 text-red-500" />
                Logout
            </button>

            {showLogoutModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                    <div className="bg-white p-6 rounded-xl shadow-lg w-96">
                        <h2 className="text-lg font-semibold">Confirm Logout</h2>
                        <p className="mt-2 text-red-600">
                            <AlertTriangle className="h-5 w-5 inline mr-1" />
                            Are you sure you want to logout?
                        </p>

                        <div className="flex justify-end gap-3 mt-4">
                            <button
                                onClick={() => setShowLogoutModal(false)}
                                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    onConfirm();
                                    setShowLogoutModal(false);
                                }}
                                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                            >
                                Yes, Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
