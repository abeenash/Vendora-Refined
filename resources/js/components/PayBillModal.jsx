import { useEffect } from "react";
import { useForm } from "@inertiajs/react";
import { IndianRupee } from "lucide-react";
import { route } from "ziggy-js";
import Modal, { Field, FormActions, formatNPR, inputClass, today } from "./Modal";

// Records a payment we make to a supplier against one bill.
// `bill` needs: id, bill_number, balance_due
export default function PayBillModal({ bill, onClose, methods }) {
    const form = useForm({ amount: "", method: "bank_transfer", reference: "", paid_at: today() });

    useEffect(() => {
        if (bill) {
            form.setData({ amount: Number(bill.balance_due), method: "bank_transfer", reference: "", paid_at: today() });
            form.clearErrors();
        }
    }, [bill]);

    const submit = (e) => {
        e.preventDefault();
        form.post(route("supplier-bills.payments.store", bill.id), { preserveScroll: true, onSuccess: onClose });
    };

    return (
        <Modal open={!!bill} onClose={onClose} title={`Pay ${bill?.bill_number ?? ""}`} subtitle={bill ? `Balance due: ${formatNPR(bill.balance_due)}` : ""} Icon={IndianRupee} maxWidth="max-w-lg">
            <form onSubmit={submit}>
                <div className="grid grid-cols-1 gap-4">
                    <Field label="Amount (NPR) *" error={form.errors.amount}>
                        <input type="number" step="0.01" min="0.01" max={bill?.balance_due} value={form.data.amount} onChange={(e) => form.setData("amount", e.target.value)} className={inputClass} />
                    </Field>
                    <Field label="Method *" error={form.errors.method}>
                        <select value={form.data.method} onChange={(e) => form.setData("method", e.target.value)} className={`${inputClass} capitalize`}>
                            {methods.map((m) => <option key={m} value={m}>{m.replace(/_/g, " ")}</option>)}
                        </select>
                    </Field>
                    <Field label="Reference" error={form.errors.reference}>
                        <input value={form.data.reference} onChange={(e) => form.setData("reference", e.target.value)} placeholder="Cheque / transaction no." className={inputClass} />
                    </Field>
                    <Field label="Paid on *" error={form.errors.paid_at}>
                        <input type="date" max={today()} value={form.data.paid_at} onChange={(e) => form.setData("paid_at", e.target.value)} className={inputClass} />
                    </Field>
                </div>
                <FormActions onCancel={onClose} processing={form.processing} label="Record Payment" />
            </form>
        </Modal>
    );
}
