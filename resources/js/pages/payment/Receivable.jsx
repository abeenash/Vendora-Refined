import ReceivableCard from "./ReceivableCard";
import { router, usePage } from "@inertiajs/react";
import { CheckCircle2, IndianRupee, Search } from "lucide-react";
import EmptyState from "../../components/EmptyState";
import { useState } from "react";
import axios from "axios";
import { route } from "ziggy-js";
import { toast } from "react-toastify";
import { formatCurrency } from "./ReceivableCard";
import Modal, { Field, FormActions, Pagination, formatDate, inputClass, searchTo, today } from "../../components/Modal";

const emptyPayment = (amount = "") => ({ amount, payment_method: "cash", reference_number: "", payment_date: today(), notes: "" });

const Receivable = () => {
    const { rows, paymentMethods, search: initialSearch } = usePage().props
    const [search, setSearch] = useState(initialSearch || "")
    const [paying, setPaying] = useState(null)
    const [history, setHistory] = useState([])
    const [data, setData] = useState(emptyPayment())
    const [errors, setErrors] = useState({})
    const [processing, setProcessing] = useState(false)
    const [refreshKey, setRefreshKey] = useState(0)

    const statusStyles = {
        partially_paid: "bg-yellow-100 text-yellow-600 border-yellow-300",
        unpaid: "bg-orange-100 text-orange-500 border-orange-300",
        overdue: "bg-red-100 text-red-500 border-red-300",
    };

    const openPay = (inv) => {
        setPaying(inv)
        setData(emptyPayment(Number(inv.balance_due)))
        setErrors({})
        setHistory([])
        axios.get(`/api/sales/${inv.id}/payments`).then((res) => setHistory(res.data.data || [])).catch(() => {})
    }

    //payments go through the JSON API (/api/sales/{id}/payments), so errors come back as 422 JSON
    const submit = async (e) => {
        e.preventDefault()
        setProcessing(true)
        try {
            await axios.post(`/api/sales/${paying.id}/payments`, data)
            toast.success(`Payment recorded for ${paying.sale_number}`)
            setPaying(null)
            setRefreshKey((k) => k + 1)
            router.reload({ only: ["rows", "summary"] })
        } catch (err) {
            if (err.response?.status === 422) {
                setErrors(Object.fromEntries(Object.entries(err.response.data.errors).map(([k, v]) => [k, v[0]])))
            } else {
                toast.error(err.response?.data?.message || "Could not record the payment")
            }
        } finally {
            setProcessing(false)
        }
    }

    const set = (key) => (e) => setData({ ...data, [key]: e.target.value })

    return (
        <>
            <div className="flex justify-between items-center">
                <div className="space-y-2 p-4 lg:p-6">
                    <div className="max-w-7xl mx-auto">
                        <h1 className="text-3xl font-bold text-foreground">
                            Account Receivable
                        </h1>
                        <p className="text-muted-foreground">
                            Track outstanding payments from customer
                        </p>
                    </div>
                </div>
            </div>

            {/* nothing owed (and not searching): no zero cards, no empty table */}
            {rows.data.length === 0 && !search ? (
                <div className="m-3">
                    <EmptyState
                        Icon={CheckCircle2}
                        title="All caught up!"
                        message="No customer owes you anything right now. Unpaid and partially paid sales will appear here so you can record payments."
                        action={{ label: "Record a sale", href: route("sales.create") }}
                    />
                </div>
            ) : (<>
            <ReceivableCard refreshKey={refreshKey} />

            {/* --- TABLE SECTION --- */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden m-3">
                <div className="p-4 border-b border-gray-200">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); searchTo(route("receivables.index"), e.target.value) }}
                            placeholder="Search by invoice, customer..."
                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-[1100px] w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                {["Invoice", "Customer", "Invoice Total", "Paid", "Balance Due", "Due Date", "Status", "Actions"].map((col) => (
                                    <th key={col} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        {col}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">

                            {rows.data.map(inv => (
                                <tr key={inv.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-teal-500">{inv.sale_number}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{inv.customer}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{formatCurrency(inv.total_price)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-500">{formatCurrency(inv.total_paid)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-500">{formatCurrency(inv.balance_due)}</td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${inv.payment_status === "overdue" ? "text-red-500" : ""}`}>{formatDate(inv.due_date)}</td>
                                    <td className="px-2 py-4 whitespace-nowrap text-xs text-gray-700 font-semibold">
                                        <span className={`text-xs font-semibold border rounded-full px-3 py-1 capitalize ${statusStyles[inv.payment_status]}`}>{inv.payment_status.replace(/_/g, " ")}</span>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                                        <button onClick={() => openPay(inv)} className="text-gray-500 hover:text-cyan-600 bg-gray-100 px-2 py-1 rounded flex items-center gap-1">
                                            <IndianRupee className="h-4 w-4" />
                                            <span>Pay</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {rows.data.length === 0 && (
                                <tr><td colSpan="8" className="px-6 py-10 text-center text-gray-500">
                                    No invoices match "{search}". <button onClick={() => { setSearch(""); searchTo(route("receivables.index"), ""); }} className="text-teal-600 underline">Clear search</button>
                                </td></tr>
                            )}
                        </tbody>
                    </table>

                    <Pagination links={rows.links} />
                </div>
            </div>
            </>)}

            <Modal open={!!paying} onClose={() => setPaying(null)} title={`Record payment · ${paying?.sale_number ?? ""}`} subtitle={paying ? `${paying.customer} · balance due ${formatCurrency(paying.balance_due)}` : ""} Icon={IndianRupee} maxWidth="max-w-lg">
                <form onSubmit={submit}>
                    <div className="grid grid-cols-1 gap-4">
                        <Field label="Amount (NPR) *" error={errors.amount}>
                            <input type="number" step="0.01" min="0.01" max={paying?.balance_due} value={data.amount} onChange={set("amount")} className={inputClass} />
                        </Field>
                        <Field label="Method *" error={errors.payment_method}>
                            <select value={data.payment_method} onChange={set("payment_method")} className={`${inputClass} capitalize`}>
                                {paymentMethods.map((m) => <option key={m} value={m}>{m.replace(/_/g, " ")}</option>)}
                            </select>
                        </Field>
                        <Field label="Reference" error={errors.reference_number}>
                            <input value={data.reference_number} onChange={set("reference_number")} placeholder="eSewa / cheque / transaction no." className={inputClass} />
                        </Field>
                        <Field label="Payment date *" error={errors.payment_date}>
                            <input type="date" max={today()} value={data.payment_date} onChange={set("payment_date")} className={inputClass} />
                        </Field>
                        <Field label="Notes" error={errors.notes}>
                            <input value={data.notes} onChange={set("notes")} className={inputClass} />
                        </Field>
                    </div>

                    {history.length > 0 && (
                        <div className="mt-6">
                            <p className="text-sm font-semibold text-gray-700 mb-2">Previous payments</p>
                            <ul className="text-sm divide-y divide-gray-100 border border-gray-100 rounded-lg">
                                {history.map((p) => (
                                    <li key={p.id} className="px-3 py-2 flex justify-between">
                                        <span>{formatDate(p.payment_date)} · <span className="capitalize">{p.payment_method.replace(/_/g, " ")}</span></span>
                                        <span className="font-medium">{formatCurrency(p.amount)}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <FormActions onCancel={() => setPaying(null)} processing={processing} label="Record Payment" />
                </form>
            </Modal>
        </>
    )
}

export default Receivable;
