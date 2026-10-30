import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { router, usePage } from "@inertiajs/react";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { toast } from "react-toastify";

// Shows the server's flash messages (success / error) as toasts
export function useFlashToasts() {
    const { flash } = usePage().props;
    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);
}

// Debounce-free live search that keeps the current page state
export function searchTo(url, search) {
    router.get(url, { search }, { preserveState: true, replace: true, preserveScroll: true });
}

// Same look as the supplier modal: teal header, animated card over a blurred backdrop.
// Portalled to <body> (like Overlay) so nothing on the page can draw over it.
export default function Modal({ open, onClose, title, subtitle, Icon, maxWidth = "max-w-2xl", children }) {
    return createPortal(
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-[100] flex items-start justify-center pt-16 overflow-y-auto">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className={`relative w-full ${maxWidth} mx-4 mb-10 bg-white rounded-[2rem] shadow-2xl shadow-slate-900/20 overflow-hidden`}
                    >
                        <div className="px-8 py-5 bg-teal-600 text-white flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    {Icon && <Icon className="w-5 h-5" />}
                                    {title}
                                </h3>
                                {subtitle && <p className="text-xs mt-1">{subtitle}</p>}
                            </div>
                            <button type="button" onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-6">{children}</div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
}

// Small helpers so every form in the purchase/payment pages looks the same
export const inputClass =
    "w-full px-3 py-2 mt-1 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all font-medium text-slate-700";

export function Field({ label, error, children, className = "" }) {
    return (
        <div className={`space-y-1 ${className}`}>
            <label className="text-sm ml-1">{label}</label>
            {children}
            {error && <div className="text-red-500 text-sm">{error}</div>}
        </div>
    );
}

export function FormActions({ onCancel, processing, label }) {
    return (
        <div className="mt-8 flex items-center justify-end gap-4">
            <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-200 transition-colors">
                Cancel
            </button>
            <button
                type="submit"
                disabled={processing}
                className="px-8 py-2 bg-teal-600 text-white font-bold rounded-lg shadow-lg shadow-teal-100 hover:bg-teal-700 transition-all disabled:opacity-50"
            >
                {processing ? "Saving..." : label}
            </button>
        </div>
    );
}

export function formatNPR(n) {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "NPR", maximumFractionDigits: 2 }).format(Number(n || 0));
}

export function formatDate(d) {
    if (!d) return "-";
    return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export const today = () => new Date().toISOString().slice(0, 10);

export function Pagination({ links }) {
    if (!links || links.length <= 3) return null;
    return (
        <div className="p-4 flex justify-center flex-wrap gap-2">
            {links.map((link, index) => (
                <button
                    key={index}
                    type="button"
                    disabled={!link.url}
                    onClick={() => link.url && router.visit(link.url, { preserveScroll: true })}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                    className={`px-3 py-1 border border-gray-300 rounded-lg text-sm ${link.active ? "bg-teal-600 text-white" : "bg-white text-gray-700"} ${!link.url ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "hover:bg-gray-50"}`}
                />
            ))}
        </div>
    );
}
