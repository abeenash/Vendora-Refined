import { Box, ReceiptIndianRupee, Truck, CircleX, CircleCheckBig, Calendar, ArrowLeft, User } from "lucide-react"
import { Link, router, useForm, usePage } from "@inertiajs/react"
import { useState } from "react"
import { route } from "ziggy-js"
import Modal, { Field, FormActions, formatDate, formatNPR, inputClass, today, useFlashToasts } from "../../components/Modal"
import { poStatusStyles, label } from "./PurchaseOrder"

const PurchaseOrderShow = () => {
    const { purchaseOrder: po, canReceive, receivedValue, billedValue } = usePage().props
    const [grnOpen, setGrnOpen] = useState(false)
    const [billOpen, setBillOpen] = useState(false)
    useFlashToasts()

    const grnForm = useForm({ items: [], received_date: today(), notes: "" })
    const billForm = useForm({
        bill_number: "",
        supplier_id: po.supplier_id,
        purchase_order_id: po.id,
        bill_date: today(),
        due_date: "",
        total_amount: "",
        notes: "",
    })

    //what is left to bill = value of goods received (incl. its share of tax) minus bills already raised
    const taxShare = po.subtotal > 0 ? Number(po.tax) * (receivedValue / Number(po.subtotal)) : 0
    const billable = Math.max(0, Math.round((receivedValue + taxShare - billedValue) * 100) / 100)

    const openGrn = () => {
        grnForm.setData({
            items: po.items.map((i) => ({ id: i.id, qty_received: 0 })),
            received_date: today(),
            notes: "",
        })
        grnForm.clearErrors()
        setGrnOpen(true)
    }

    const setQty = (idx, value) => {
        const items = [...grnForm.data.items]
        items[idx] = { ...items[idx], qty_received: value === "" ? "" : Number(value) }
        grnForm.setData("items", items)
    }

    const submitGrn = (e) => {
        e.preventDefault()
        grnForm.post(route("purchase-orders.grn", po.id), { preserveScroll: true, onSuccess: () => setGrnOpen(false) })
    }

    const openBill = () => {
        billForm.setData({ ...billForm.data, total_amount: billable || "", bill_date: today() })
        billForm.clearErrors()
        setBillOpen(true)
    }

    const submitBill = (e) => {
        e.preventDefault()
        billForm.post(route("supplier-bills.store"), { preserveScroll: true, onSuccess: () => setBillOpen(false) })
    }

    const action = (name, message) => {
        if (confirm(message)) router.post(route(name, po.id), {}, { preserveScroll: true })
    }

    const canCancel = ["draft", "ordered"].includes(po.status)
    const canClose = ["partially_received", "received"].includes(po.status)

    const buttonClass = "flex items-center text-sm justify-center px-4 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2"

    return (
        <>
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                <div className="flex items-start gap-4">
                    <Link href={route("purchase-orders.index")} className="mt-1 text-gray-500 hover:text-teal-600">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-foreground">{po.po_number}</h1>
                            <span className={`text-xs font-semibold border rounded-full px-3 py-1 capitalize ${poStatusStyles[po.status]}`}>{label(po.status)}</span>
                        </div>
                        <p className="text-sm mt-1">
                            Supplier: <Link href={route("suppliers.show", po.supplier_id)} className="text-teal-500">{po.supplier?.name}</Link>
                        </p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    {canReceive && (
                        <button onClick={openGrn} className={`${buttonClass} bg-teal-600 text-white hover:bg-teal-700 focus:ring-cyan-500`}>
                            <Truck className="mr-2 h-4 w-4" /> Receive Goods (GRN)
                        </button>
                    )}
                    {canClose && po.status !== "closed" && (
                        <button onClick={() => action("purchase-orders.close", "Close this PO? Nothing more can be received on it.")} className={`${buttonClass} bg-gray-50 text-gray-900 border border-gray-200 hover:bg-gray-100 focus:ring-cyan-500`}>
                            <CircleCheckBig className="mr-2 h-4 w-4" /> Close PO
                        </button>
                    )}
                    {canCancel && (
                        <button onClick={() => action("purchase-orders.cancel", "Cancel this PO? This cannot be undone.")} className={`${buttonClass} bg-gray-50 border border-red-200 hover:bg-red-100 focus:ring-red-500`}>
                            <CircleX className="mr-2 h-4 w-4 text-red-500" /> <span className="text-red-500">Cancel PO</span>
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Order Items */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-lg font-semibold mb-3">Order Items</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        {["Product", "Qty Ordered", "Qty Received", "Unit Price", "Total"].map((col) => (
                                            <th key={col} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                {col}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {po.items.map((item) => (
                                        <tr key={item.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center gap-2">
                                                    <Box className="h-3 w-3" />
                                                    <span className="text-gray-900">{item.product?.name}</span>
                                                    <span className="text-xs text-gray-400">{item.product?.sku}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{item.quantity_ordered}</td>
                                            <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${item.quantity_received >= item.quantity_ordered ? "text-teal-600" : "text-yellow-500"}`}>
                                                {item.quantity_received}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{formatNPR(item.unit_price)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{formatNPR(item.total_price)}</td>
                                        </tr>
                                    ))}
                                    <tr className="border-t-2 border-gray-200 text-sm">
                                        <td colSpan="4" className="text-right py-2">Subtotal:</td>
                                        <td className="px-6">{formatNPR(po.subtotal)}</td>
                                    </tr>
                                    <tr className="text-sm">
                                        <td colSpan="4" className="text-right py-2">Tax:</td>
                                        <td className="px-6">{formatNPR(po.tax)}</td>
                                    </tr>
                                    <tr className="text-sm">
                                        <td colSpan="4" className="text-right py-2 font-medium">Grand Total:</td>
                                        <td className="px-6 font-semibold">{formatNPR(po.total)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Order Information */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="text-lg mb-4 font-semibold">Order Information</div>
                    <div className="space-y-4">
                        {[
                            [Calendar, "Order Date", formatDate(po.order_date)],
                            [Truck, "Expected Delivery", formatDate(po.expected_delivery)],
                            [User, "Created By", po.creator?.name || "-"],
                            [ReceiptIndianRupee, "Currency", "NPR"],
                        ].map(([Icon, title, value]) => (
                            <div key={title} className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                    <Icon className="w-4 h-4 text-gray-500" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">{title}</p>
                                    <p className="text-sm font-medium">{value}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Goods Received Notes */}
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-lg font-semibold mb-4">Goods Received Notes</h2>
                    {po.grns.length === 0 ? (
                        <p className="text-sm text-center text-gray-500">No goods received yet</p>
                    ) : (
                        <div className="space-y-3">
                            {po.grns.map((grn) => (
                                <div key={grn.id} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium">GRN #{grn.id}</span>
                                        <span className="text-gray-500">{formatDate(grn.received_at)} · {grn.receiver?.name || "-"}</span>
                                    </div>
                                    <ul className="mt-2 text-sm text-gray-700 list-disc ml-5">
                                        {grn.items.map((gi) => (
                                            <li key={gi.id}>{gi.product?.name}: {gi.qty_received}</li>
                                        ))}
                                    </ul>
                                    {grn.notes && <p className="mt-2 text-xs text-gray-500">{grn.notes}</p>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Bills */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-lg font-semibold mb-4">Bills</h2>
                    {po.bills.length === 0 && <p className="text-sm text-gray-500 mb-4">No bills yet</p>}
                    <ul className="space-y-2 mb-4">
                        {po.bills.map((b) => (
                            <li key={b.id} className="text-sm flex justify-between">
                                <span className="text-teal-600">{b.bill_number}</span>
                                <span>{formatNPR(b.total_amount)} <span className="text-xs text-gray-500 capitalize">({label(b.status)})</span></span>
                            </li>
                        ))}
                    </ul>
                    {billable > 0 ? (
                        <button onClick={openBill} className={`${buttonClass} w-full bg-gray-50 text-gray-900 border border-gray-200 hover:bg-gray-100 focus:ring-cyan-500`}>
                            <ReceiptIndianRupee className="mr-2 h-4 w-4" /> Create Bill from PO
                        </button>
                    ) : (
                        <p className="text-xs text-gray-500">
                            {receivedValue > 0 ? "All received goods have been billed." : "A bill can be raised once goods are received."}
                        </p>
                    )}
                </div>
            </div>

            {/* Receive goods modal */}
            <Modal open={grnOpen} onClose={() => setGrnOpen(false)} title="Receive Goods" subtitle="Enter what physically arrived. Stock is increased immediately." Icon={Truck}>
                <form onSubmit={submitGrn}>
                    {grnForm.errors.items && <div className="text-red-500 text-sm mb-3">{grnForm.errors.items}</div>}
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-gray-500">
                                <th className="py-2">Product</th>
                                <th className="py-2">Remaining</th>
                                <th className="py-2 w-32">Received now</th>
                            </tr>
                        </thead>
                        <tbody>
                            {po.items.map((item, idx) => {
                                const remaining = item.quantity_ordered - item.quantity_received
                                return (
                                    <tr key={item.id} className="border-t border-gray-100">
                                        <td className="py-2">{item.product?.name}</td>
                                        <td className="py-2">{remaining}</td>
                                        <td className="py-2">
                                            <input
                                                type="number" min="0" max={remaining} disabled={remaining === 0}
                                                value={grnForm.data.items[idx]?.qty_received ?? 0}
                                                onChange={(e) => setQty(idx, e.target.value)}
                                                className={inputClass}
                                            />
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <Field label="Received date" error={grnForm.errors.received_date}>
                            <input type="date" max={today()} value={grnForm.data.received_date} onChange={(e) => grnForm.setData("received_date", e.target.value)} className={inputClass} />
                        </Field>
                        <Field label="Notes" error={grnForm.errors.notes}>
                            <input value={grnForm.data.notes} onChange={(e) => grnForm.setData("notes", e.target.value)} placeholder="e.g. 1 box damaged" className={inputClass} />
                        </Field>
                    </div>
                    <FormActions onCancel={() => setGrnOpen(false)} processing={grnForm.processing} label="Record GRN" />
                </form>
            </Modal>

            {/* Create bill modal */}
            <Modal open={billOpen} onClose={() => setBillOpen(false)} title="Create Bill from PO" subtitle={`Up to ${formatNPR(billable)} of received goods can be billed.`} Icon={ReceiptIndianRupee}>
                <form onSubmit={submitBill}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field label="Supplier's bill number *" error={billForm.errors.bill_number} className="md:col-span-2">
                            <input value={billForm.data.bill_number} onChange={(e) => billForm.setData("bill_number", e.target.value)} placeholder="e.g. INV-2026-118" className={inputClass} />
                        </Field>
                        <Field label="Bill date *" error={billForm.errors.bill_date}>
                            <input type="date" max={today()} value={billForm.data.bill_date} onChange={(e) => billForm.setData("bill_date", e.target.value)} className={inputClass} />
                        </Field>
                        <Field label="Due date" error={billForm.errors.due_date}>
                            <input type="date" value={billForm.data.due_date} onChange={(e) => billForm.setData("due_date", e.target.value)} className={inputClass} />
                        </Field>
                        <Field label="Amount (NPR) *" error={billForm.errors.total_amount || billForm.errors.purchase_order_id} className="md:col-span-2">
                            <input type="number" step="0.01" min="0.01" max={billable} value={billForm.data.total_amount} onChange={(e) => billForm.setData("total_amount", e.target.value)} className={inputClass} />
                        </Field>
                        <Field label="Notes" error={billForm.errors.notes} className="md:col-span-2">
                            <textarea rows="2" value={billForm.data.notes} onChange={(e) => billForm.setData("notes", e.target.value)} className={inputClass} />
                        </Field>
                    </div>
                    <FormActions onCancel={() => setBillOpen(false)} processing={billForm.processing} label="Save Bill" />
                </form>
            </Modal>
        </>
    )
}

export default PurchaseOrderShow
