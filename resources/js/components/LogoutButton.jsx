import { AlertTriangle, LogOut } from "lucide-react";
import Overlay from "./Overlay";

// The menu item. It only asks to open the dialog; the dialog itself lives in the Navbar,
// so closing the dropdown doesn't unmount it mid-click.
export function LogoutButton({ onClick }) {
    return (
        <button
            onClick={onClick}
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
        >
            <LogOut className="inline mr-2 h-5 w-5 text-red-500" />
            Logout
        </button>
    );
}

// portalled to <body>, so the sidebar can no longer draw on top of it
export function LogoutDialog({ onCancel, onConfirm }) {
    return (
        <Overlay onClose={onCancel}>
            <div className="bg-white p-6 rounded-xl shadow-lg w-96 max-w-full">
                <h2 className="text-lg font-semibold text-gray-800">Confirm Logout</h2>
                <p className="mt-2 text-red-600">
                    <AlertTriangle className="h-5 w-5 inline mr-1" />
                    Are you sure you want to logout?
                </p>

                <div className="flex justify-end gap-3 mt-4">
                    <button
                        onClick={onCancel}
                        className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                        Yes, Logout
                    </button>
                </div>
            </div>
        </Overlay>
    );
}
