import { Plus, Search, Eye, Box, Trash2, Truck } from "lucide-react";
import { ListGate, showSearch } from "../../components/EmptyState";
import { Link, useForm, usePage } from "@inertiajs/react";
import { useState } from "react";
import { route } from "ziggy-js";
import Modal, { Field, FormActions, Pagination, formatDate, formatNPR, inputClass, searchTo, today, useFlashToasts } from "../../components/Modal";

export const poStatusStyles = {
    draft: "bg-gray-100 text-gray-600 border-gray-300",
    ordered: "bg-blue-100 text-blue-700 border-blue-300",
    partially_received: "bg-yellow-100 text-yellow-700 border-yellow-300",
    received: "bg-teal-100 text-teal-800 border-teal-300",
    closed: "bg-gray-200 text-gray-700 border-gray-400",
    cancelled: "bg-red-100 text-red-700 border-red-300",
};

export const label = (s) => (s || "").replace(/_/g, " ");

const emptyItem = { product_id: "", quantity_ordered: 1, unit_price: "" };

const PurchaseOrder = () => {
    const { purchaseOrders, suppliers, products, search: initialSearch } = usePage().props;
    const [search, setSearch] = useState(initialSearch || "");
    const [open, setOpen] = useState(false);
    useFlashToasts();

    const form = useForm({
        supplier_id: "",
        order_date: today(),
        expected_delivery: "",
        tax: 0,
        items: [{ ...emptyItem }],
    });

    const setItem = (i, key, value) => {
        const items = [...form.data.items];
        items[i] = { ...items[i], [key]: value };
        form.setData("items", items);
    };

    const subtotal = form.data.items.reduce((sum, it) => sum + Number(it.quantity_ordered || 0) * Number(it.unit_price || 0), 0);

    const openCreate = () => {
        form.reset();
        form.clearErrors();
        setOpen(true);
    };

    const submit = (e) => {
        e.preventDefault();
        form.post(route("purchase-orders.store"), { onSuccess: () => setOpen(false) });
    };

    //errors for array fields come back as "items.0.product_id"
    const itemError = (i, key) => form.errors[`items.${i}.${key}`];

    return (
        <div className="space-y-6 p-4 lg:p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">
                            Purchase Orders
                        </h1>
                        <p className="mt-1 text-gray-500">
                            Manage purchase orders and track deliveries
                        </p>
                    </div>
                    <button
                        onClick={openCreate}
                        className="mt-4 sm:mt-0 flex items-center justify-center px-4 py-2 bg-teal-600 text-white rounded-lg shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
                    >
                        <Plus className="mr-2" /> Create PO
                    </button>
                </header>

                {/* Search Bar */}
                {showSearch(purchaseOrders.data, search) && <div className="mb-6">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                searchTo(route("purchase-orders.index"), e.target.value);
                            }}
                            placeholder="Search by PO number, supplier..."
                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
                        />
                    </div>
                </div>}

                {/* Purchase Orders Table */}
                <ListGate
                    items={purchaseOrders.data}
                    search={search}
                    onClearSearch={() => { setSearch(""); searchTo(route("purchase-orders.index"), ""); }}
                    empty={{
                        Icon: Truck,
                        title: "No purchase orders yet",
                        message: suppliers.length === 0
                            ? "Add a supplier first, then order stock from them here. Stock increases when you receive the goods."
                            : "Order stock from a supplier. Stock increases when you receive the goods (GRN).",
                        action: suppliers.length === 0
                            ? { label: "Add a supplier", href: route("suppliers.index"), Icon: Plus }
                            : { label: "Create your first PO", onClick: openCreate, Icon: Plus },
                    }}
                >
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-700">
                            Purchase Orders in Total ({purchaseOrders.total})
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    {[
                                        "PO Number",
                                        "Supplier",
                                        "Order Date",
                                        "Expected Delivery",
                                        "Items",
                                        "Total",
                                        "Status",
                                        "Actions"
                                    ].map((col) => (
                                        <th key={col}
                                            className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            {col}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {purchaseOrders.data.map(po => (
                                    <tr key={po.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-teal-500">
                                            <Link href={route("purchase-orders.show", po.id)}>{po.po_number}</Link>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {po.supplier?.name}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {po.supplier?.email}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {formatDate(po.order_date)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {formatDate(po.expected_delivery)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <div className="flex items-center gap-2">
                                                <Box className="h-4 w-4 text-teal-400" />
                                                {po.items_count} {po.items_count === 1 ? "item" : "items"}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                            {formatNPR(po.total)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`text-xs font-semibold border rounded-full px-3 py-1 capitalize ${poStatusStyles[po.status]}`}>
                                                {label(po.status)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <Link href={route("purchase-orders.show", po.id)} className="text-gray-400 hover:text-cyan-600">
                                                <Eye className="h-5 w-5" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <Pagination links={purchaseOrders.links} />
                </div>
                </ListGate>
            </div>

            {/* Create PO modal */}
            <Modal open={open} onClose={() => setOpen(false)} title="Create Purchase Order" subtitle="Order stock from a supplier. Stock goes up when the goods are received (GRN)." Icon={Plus} maxWidth="max-w-4xl">
                <form onSubmit={submit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field label="Supplier *" error={form.errors.supplier_id} className="md:col-span-2">
                            <select value={form.data.supplier_id} onChange={(e) => form.setData("supplier_id", e.target.value)} className={inputClass}>
                                <option value="">Select a supplier</option>
                                {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                            {suppliers.length === 0 && (
                                <p className="text-xs text-gray-500 mt-1">No suppliers yet. <Link href={route("suppliers.index")} className="text-teal-600 underline">Add one first</Link>.</p>
                            )}
                        </Field>
                        <Field label="Order date *" error={form.errors.order_date}>
                            <input type="date" value={form.data.order_date} onChange={(e) => form.setData("order_date", e.target.value)} className={inputClass} />
                        </Field>
                        <Field label="Expected delivery" error={form.errors.expected_delivery}>
                            <input type="date" value={form.data.expected_delivery} onChange={(e) => form.setData("expected_delivery", e.target.value)} className={inputClass} />
                        </Field>
                    </div>

                    <h4 className="mt-6 mb-2 font-semibold text-gray-700">Items</h4>
                    {form.errors.items && <div className="text-red-500 text-sm mb-2">{form.errors.items}</div>}
                    <div className="space-y-3">
                        {form.data.items.map((it, i) => (
                            <div key={i} className="grid grid-cols-12 gap-2 items-start">
                                <div className="col-span-12 md:col-span-6">
                                    <select value={it.product_id} onChange={(e) => setItem(i, "product_id", e.target.value)} className={inputClass}>
                                        <option value="">Select a product</option>
                                        {products.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.sku}) · in stock: {p.stock}</option>)}
                                    </select>
                                    {itemError(i, "product_id") && <div className="text-red-500 text-xs">{itemError(i, "product_id")}</div>}
                                </div>
                                <div className="col-span-5 md:col-span-2">
                                    <input type="number" min="1" placeholder="Qty" value={it.quantity_ordered} onChange={(e) => setItem(i, "quantity_ordered", e.target.value)} className={inputClass} />
                                    {itemError(i, "quantity_ordered") && <div className="text-red-500 text-xs">{itemError(i, "quantity_ordered")}</div>}
                                </div>
                                <div className="col-span-5 md:col-span-3">
                                    <input type="number" min="0" step="0.01" placeholder="Unit price" value={it.unit_price} onChange={(e) => setItem(i, "unit_price", e.target.value)} className={inputClass} />
                                    {itemError(i, "unit_price") && <div className="text-red-500 text-xs">{itemError(i, "unit_price")}</div>}
                                </div>
                                <div className="col-span-2 md:col-span-1 flex justify-center pt-3">
                                    {form.data.items.length > 1 && (
                                        <button type="button" onClick={() => form.setData("items", form.data.items.filter((_, j) => j !== i))} className="text-gray-400 hover:text-red-500">
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    <button type="button" onClick={() => form.setData("items", [...form.data.items, { ...emptyItem }])} className="mt-3 text-sm text-teal-600 hover:underline flex items-center gap-1">
                        <Plus className="h-4 w-4" /> Add another item
                    </button>

                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                        <Field label="Tax (NPR)" error={form.errors.tax}>
                            <input type="number" min="0" step="0.01" value={form.data.tax} onChange={(e) => form.setData("tax", e.target.value)} className={inputClass} />
                        </Field>
                        <div className="text-right text-sm text-gray-600 space-y-1">
                            <p>Subtotal: <span className="font-medium">{formatNPR(subtotal)}</span></p>
                            <p className="text-lg font-semibold text-gray-800">Total: {formatNPR(subtotal + Number(form.data.tax || 0))}</p>
                        </div>
                    </div>

                    <FormActions onCancel={() => setOpen(false)} processing={form.processing} label="Create PO" />
                </form>
            </Modal>
        </div>
    );
};

export default PurchaseOrder;
