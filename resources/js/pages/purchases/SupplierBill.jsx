import { Link, useForm, usePage } from "@inertiajs/react";
import { Search, Building, Plus, IndianRupee, ReceiptText } from "lucide-react";
import { ListGate } from "../../components/EmptyState";
import { useState } from "react";
import { route } from "ziggy-js";
import Modal, { Field, FormActions, Pagination, formatDate, formatNPR, inputClass, searchTo, today, useFlashToasts } from "../../components/Modal";
import PayBillModal from "../../components/PayBillModal";

export const billStatusStyles = {
    paid: "bg-teal-100 text-teal-800 border-teal-300",
    partially_paid: "bg-yellow-100 text-yellow-600 border-yellow-300",
    unpaid: "bg-orange-100 text-orange-500 border-orange-300",
    overdue: "bg-red-100 text-red-500 border-red-300",
};

const SupplierBill = () => {
    const { bills, suppliers, paymentMethods, search: initialSearch } = usePage().props;
    const [search, setSearch] = useState(initialSearch || "");
    const [open, setOpen] = useState(false);
    const [paying, setPaying] = useState(null);
    useFlashToasts();

    //bills not tied to a PO (e.g. services, transport); PO bills are created from the PO page
    const form = useForm({ bill_number: "", supplier_id: "", bill_date: today(), due_date: "", total_amount: "", notes: "" });

    const submit = (e) => {
        e.preventDefault();
        form.post(route("supplier-bills.store"), { onSuccess: () => setOpen(false) });
    };

    return (
        <>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center p-4 lg:p-6">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Supplier Bills</h1>
                    <p className="text-muted-foreground">Track and manage bills from your suppliers</p>
                </div>
                <button
                    onClick={() => { form.reset(); form.clearErrors(); setOpen(true); }}
                    className="mt-4 sm:mt-0 flex items-center justify-center px-4 py-2 bg-teal-600 text-white rounded-lg shadow-sm hover:bg-teal-700"
                >
                    <Plus className="mr-2" /> Add Bill
                </button>
            </div>

            {/* --- TABLE SECTION --- */}
            <div className="m-5">
            <ListGate
                items={bills.data}
                search={search}
                onClearSearch={() => { setSearch(""); searchTo(route("supplier-bills.index"), ""); }}
                empty={{
                    Icon: ReceiptText,
                    title: "No supplier bills yet",
                    message: "Bills for goods are best raised from a purchase order after the goods arrive. For anything else (transport, services), add a bill here.",
                    action: { label: "Add a bill", onClick: () => { form.reset(); form.clearErrors(); setOpen(true); }, Icon: Plus },
                }}
            >
            <div className="bg-white rounded-xl shadow-md">
                <div className="p-4 border-b border-gray-200">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); searchTo(route("supplier-bills.index"), e.target.value); }}
                            placeholder="Search by bill number, supplier..."
                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                {["Bill Number", "Supplier", "PO", "Bill Date", "Due Date", "Total", "Paid", "Status", "Actions"].map((col) => (
                                    <th key={col} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{col}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {bills.data.map((b) => {
                                const balance = Number(b.total_amount) - Number(b.paid_amount);
                                return (
                                    <tr key={b.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-teal-500">{b.bill_number}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center gap-2">
                                                <Building className="h-4 w-4 text-teal-400" />
                                                <Link href={route("suppliers.show", b.supplier_id)}>{b.supplier?.name}</Link>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {b.purchase_order ? <Link href={route("purchase-orders.show", b.purchase_order.id)} className="text-teal-600">{b.purchase_order.po_number}</Link> : "-"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{formatDate(b.bill_date)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{formatDate(b.due_date)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{formatNPR(b.total_amount)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">{formatNPR(b.paid_amount)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`text-xs font-semibold border rounded-full px-3 py-1 capitalize ${billStatusStyles[b.status]}`}>{b.status.replace(/_/g, " ")}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            {balance > 0 && (
                                                <button onClick={() => setPaying({ ...b, balance_due: balance })} className="text-gray-500 hover:text-cyan-600 bg-gray-100 px-2 py-1 rounded flex items-center gap-1">
                                                    <IndianRupee className="h-4 w-4" /> Pay
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                <Pagination links={bills.links} />
            </div>
            </ListGate>
            </div>

            {/* Manual bill (not linked to a PO) */}
            <Modal open={open} onClose={() => setOpen(false)} title="Add Supplier Bill" subtitle="For goods on a PO, use 'Create Bill from PO' on the PO page instead." Icon={Plus}>
                <form onSubmit={submit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field label="Supplier *" error={form.errors.supplier_id} className="md:col-span-2">
                            <select value={form.data.supplier_id} onChange={(e) => form.setData("supplier_id", e.target.value)} className={inputClass}>
                                <option value="">Select a supplier</option>
                                {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </Field>
                        <Field label="Supplier's bill number *" error={form.errors.bill_number} className="md:col-span-2">
                            <input value={form.data.bill_number} onChange={(e) => form.setData("bill_number", e.target.value)} className={inputClass} />
                        </Field>
                        <Field label="Bill date *" error={form.errors.bill_date}>
                            <input type="date" max={today()} value={form.data.bill_date} onChange={(e) => form.setData("bill_date", e.target.value)} className={inputClass} />
                        </Field>
                        <Field label="Due date" error={form.errors.due_date}>
                            <input type="date" value={form.data.due_date} onChange={(e) => form.setData("due_date", e.target.value)} className={inputClass} />
                        </Field>
                        <Field label="Amount (NPR) *" error={form.errors.total_amount} className="md:col-span-2">
                            <input type="number" step="0.01" min="0.01" value={form.data.total_amount} onChange={(e) => form.setData("total_amount", e.target.value)} className={inputClass} />
                        </Field>
                        <Field label="Notes" error={form.errors.notes} className="md:col-span-2">
                            <textarea rows="2" value={form.data.notes} onChange={(e) => form.setData("notes", e.target.value)} className={inputClass} />
                        </Field>
                    </div>
                    <FormActions onCancel={() => setOpen(false)} processing={form.processing} label="Save Bill" />
                </form>
            </Modal>

            <PayBillModal bill={paying} onClose={() => setPaying(null)} methods={paymentMethods} />
        </>
    );
};

export default SupplierBill;
