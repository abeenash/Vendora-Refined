import { useState } from "react";
import { XCircle, AlertTriangle } from "lucide-react";
import { router, usePage } from "@inertiajs/react";
import { route } from "ziggy-js";
import { toast } from "react-toastify";

export function Cancellation({ saleId, customerName, onClose }) {
    const [loading, setLoading] = useState(false);
    const {sales} = usePage().props;

    const handleConfirm = () => {
        setLoading(true);
        router.patch(
            route("sales.updateStatus", saleId),
            { status: "Cancelled" },
            {
                onSuccess: () => {
                    setLoading(false); //this will stop the loading state
                    onClose(true); //this will close the modal
                    toast.success("Sale cancelled successfully");
                },
                onError: () => {
                    setLoading(false); //this will stop the loading state
                    onClose(false); //this will close the modal
                    toast.error("Failed to cancel sale");
                },
            }
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 border border-gray-200">
                <div className="flex items-start space-x-4">
                    {/* Icon */}
                    <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                            <XCircle className="w-5 h-5 text-red-600" />
                        </div>
                    </div>
                    {/* Content */}
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900">
                            Confirm Cancellation
                        </h3>
                        <p className="mt-1 text-sm text-gray-600">
                            Are you sure you want to cancel this sale <strong> {saleId}</strong> for
                            <strong>{customerName}</strong>? 
                        </p>
                        <p className="mt-1 text-red-600 text-sm">
                           <AlertTriangle className="h-5 w-5 inline mr-1" /> 
                            You cannot revert it once cancelled.
                        </p>
                        <div className="mt-4 flex justify-end space-x-3">
                            <button
                                onClick={() => onClose(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none"
                            >
                                Go Back
                            </button>
                            <button
                                onClick={handleConfirm}
                                disabled={loading}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none disabled:opacity-50"
                            >
                                {loading ? "Cancelling..." : "Yes, Cancel"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
