import { useEffect } from "react";
import { createPortal } from "react-dom";

// Dimmed full-screen layer for dialogs.
// It is portalled to <body>, so no parent's stacking context (e.g. the navbar dropdown)
// can trap it underneath the sidebar. Esc and clicking the backdrop call onClose.
export default function Overlay({ onClose, children, align = "center" }) {
    useEffect(() => {
        if (!onClose) return;
        const onKey = (e) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    return createPortal(
        <div
            className={`fixed inset-0 z-[100] flex justify-center overflow-y-auto bg-black/40 backdrop-blur-[1px] px-4 ${align === "top" ? "items-start pt-16" : "items-center"}`}
            onClick={(e) => e.target === e.currentTarget && onClose?.()}
        >
            {children}
        </div>,
        document.body
    );
}
