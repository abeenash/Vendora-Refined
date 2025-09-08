import { AlertTriangle, Trash } from "lucide-react";
import { useState } from "react";

export function DeleteButton({ onConfirm, attr}) {
    const [showModal, setShowModal] = useState(false);

    return (
        <>
            <button 
                onClick={() => setShowModal(true)}
            >
                <Trash className="h-5 w-5 text-gray-400 hover:text-red-500" />
            </button>

            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                    <div className="bg-white p-6 rounded-xl shadow-lg w-96">
                        <h2 className="text-lg font-semibold">Confirm Delete</h2>
                        <p className="mt-2 text-gray-600">
                            Are you sure you want to delete this {attr}?
                        </p>
                        <p className="mt-1 text-red-600">
                           <AlertTriangle className="h-5 w-5 inline mr-1" /> 
                            This action cannot be undone.
                        </p>

                        <div className="flex justify-end gap-3 mt-4">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    onConfirm();
                                    setShowModal(false);
                                }}
                                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                            >
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
