import { useState, useEffect } from "react";
import { Plus, Search, Edit, Building, Eye, X, ArrowRight } from "lucide-react";
import { Link, useForm, usePage, router } from "@inertiajs/react";
import { route } from "ziggy-js";
import { DeleteButton } from "../../components/DeleteButton";
import { toast } from "react-toastify";
import { AnimatePresence, motion } from "framer-motion";

export default function Suppliers() {
    const { suppliers, flash } = usePage().props;
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [search, setSearch] = useState((suppliers && suppliers.filters?.search) || '');

    // Initialize form with defaults
    const form = useForm({
        name: "",
        contact_person: "",
        email: "",
        phone: "",
        address: "",
        tax_id: "",
        notes: "",
    });

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    function openCreate() {
        setEditing(null);
        form.setData({
            name: "",
            contact_person: "",
            email: "",
            phone: "",
            address: "",
            tax_id: "",
            notes: "",
        });
        form.clearErrors();
        setOpen(true);
    }

    function openEdit(supplier) {
        setEditing(supplier);
        form.setData({
            name: supplier.name || "",
            contact_person: supplier.contact_person || "",
            email: supplier.email || "",
            phone: supplier.phone || "",
            address: supplier.address || "",
            tax_id: supplier.tax_id || "",
            notes: supplier.notes || "",
        });
        form.clearErrors();
        setOpen(true);
    }


    function closeModal() {
        setOpen(false);
        setEditing(null);
        form.clearErrors();
    }

    function submit(e) {
        e.preventDefault();
        if (editing) {
            form.put(route("suppliers.update", editing.id), {
                onSuccess: () => {
                    closeModal()
                },
            });
        } else {
            form.post(route("suppliers.store"), {
                onSuccess: () => {
                    closeModal()
                },
            })
        }
    }

    function handleSearch(e) {
        const query = e.target.value;
        setSearch(query);
        router.get(
            route('suppliers.index'),
            { search: query },
            {
                preserveState: true,
                replace: true,
                preserveScroll: true
            }
        );
    }

    const formKey = editing ? `edit-${editing.id}` : 'create';

    return (
        <div className="space-y-6 p-4 lg:p-2 lg:p-6">
            <div className="max-w-7xl mx-auto">
                <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Suppliers</h1>
                        <p className="mt-1 text-gray-500">Manage your suppliers and vendor relationships</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button onClick={openCreate} className="mt-4 sm:mt-0 flex items-center justify-center px-4 py-2 bg-teal-600 text-white rounded-lg shadow-sm hover:bg-teal-700">
                            <Plus className="mr-2" /> Add Supplier
                        </button>
                    </div>
                </header>

                <div className="mb-6">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            value={search}
                            onChange={handleSearch}
                            type="text"
                            placeholder="Search suppliers by name, email, or contact..."
                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-teal-500 sm:text-sm"
                        />
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-md">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-700">Suppliers in Total ({suppliers.total})</h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    {["Supplier", "Contact", "Address", "Tax ID", "Outstanding", "Actions"].map(col => (
                                        <th key={col} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{col}</th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody className="bg-white divide-y divide-gray-200">
                                {suppliers.data.map(s => (
                                    <tr key={s.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center space-x-3">
                                                <Building className="text-teal-400" />
                                                <div>
                                                    <Link href={route('suppliers.show', s.id)} className="text-sm font-medium text-gray-900">{s.name}</Link>
                                                    <div className="text-sm text-gray-500">{s.email}</div>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{s.contact_person || '-'}</div>
                                            <div className="text-sm text-gray-500">{s.phone || '-'}</div>
                                        </td>

                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{s.address || '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-900">{s.tax_id || '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-500 font-medium">{s.outstanding_balance ? `NPR ${Number(s.outstanding_balance).toLocaleString()}` : 'NPR 0'}</td>

                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center space-x-3">
                                                <Link href={route('suppliers.show', s.id)} className="text-gray-400 hover:text-cyan-600">
                                                    <Eye className="h-5 w-5" />
                                                </Link>
                                                <button onClick={() => openEdit(s)} className="text-gray-400 hover:text-cyan-600">
                                                    <Edit className="h-5 w-5" />
                                                </button>
                                                <DeleteButton
                                                    onConfirm={() => router.delete(route('suppliers.destroy', s.id))}
                                                    attr="supplier"
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {suppliers.data.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-4 text-center text-gray-500">No suppliers found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* pagination */}
                    <div className="p-4 flex justify-center space-x-2">
                        {suppliers.links.map((link, index) => (
                            <button
                                key={index}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                onClick={() =>
                                    link.url && router.visit(link.url)
                                }
                                disabled={!link.url}
                                className={`px-3 py-1 border border-gray-300 rounded-lg text-sm ${link.active
                                    ? "bg-teal-600 text-white"
                                    : "bg-white text-gray-700"
                                    } disabled:opacity-50`}
                            />
                        ))}
                    </div>
                </div>
            </div>



            {/* Modal for edit and add supplier */}
            <AnimatePresence>
                {open && (
                    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 overflow-y-auto">

                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closeModal}
                            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
                        />

                        {/* Modal Card */}
                        <motion.div
                            key={formKey}
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl shadow-slate-900/20 overflow-x-auto"
                        >

                            {/* Form Header */}
                            <div className="px-8 py-5 bg-teal-600 text-white flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-bold flex items-center gap-2">
                                        {editing ? <Edit className="w-5 h-5 text-teal-400" /> : <Plus className="w-5 h-5 text-teal-400" />}
                                        {editing ? 'Update Supplier Profile' : 'Register New Supplier'}
                                    </h3>
                                    <p className="text-xs mt-1">Ensure all required fields are filled correctly.</p>
                                </div>
                                <button onClick={closeModal} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={submit} className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="col-span-2 space-y-2">
                                        <label className="text-sm ml-1 mb-2">Supplier Name *</label>
                                        <input autoFocus placeholder="e.g. Acme Corp Industries" value={form.data.name} onChange={e => form.setData('name', e.target.value)}
                                            className="w-full pl-2 pr-2 py-2 mt-1 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all font-medium text-slate-700" />
                                        {form.errors.name && <div className="text-red-500 text-sm">{form.errors.name}</div>}
                                    </div>

                                    <div className="col-span-2 space-y-2">
                                        <label className="text-sm ml-1 mb-2">Contact Person</label>
                                        <input placeholder="e.g. John Doe" value={form.data.contact_person} onChange={e => form.setData('contact_person', e.target.value)}
                                            className="w-full pl-2 pr-2 py-2 mt-1 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all font-medium text-slate-700" />
                                        {form.errors.contact_person && <div className="text-red-500 text-sm">{form.errors.contact_person}</div>}
                                    </div>

                                    <div className="col-span-2 space-y-2">
                                        <label className="text-sm ml-1 mb-2">Phone *</label>
                                        <input placeholder="e.g. +1234567890" value={form.data.phone} onChange={e => form.setData('phone', e.target.value)}
                                            className="w-full pl-2 pr-2 py-2 mt-1 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all font-medium text-slate-700" />
                                        {form.errors.phone && <div className="text-red-500 text-sm">{form.errors.phone}</div>}
                                    </div>

                                    <div className="col-span-2 space-y-2">
                                        <label className="text-sm ml-1 mb-2">Email *</label>
                                        <input placeholder="e.g. john@example.com" value={form.data.email} onChange={e => form.setData('email', e.target.value)}
                                            className="w-full pl-2 pr-2 py-2 mt-1 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all font-medium text-slate-700" />
                                        {form.errors.email && <div className="text-red-500 text-sm">{form.errors.email}</div>}
                                    </div>

                                    <div className="col-span-2 space-y-2">
                                        <label className="text-sm ml-1 mb-2">Address</label>
                                        <input placeholder="e.g. City, District" value={form.data.address} onChange={e => form.setData('address', e.target.value)}
                                            className="w-full pl-2 pr-2 py-2 mt-1 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all font-medium text-slate-700" />
                                        {form.errors.address && <div className="text-red-500 text-sm">{form.errors.address}</div>}
                                    </div>

                                    <div className="col-span-2 space-y-2">
                                        <label className="text-sm ml-1 mb-2">Tax ID</label>
                                        <input placeholder="e.g. 123456789" value={form.data.tax_id} onChange={e => form.setData('tax_id', e.target.value)}
                                            className="w-full pl-2 pr-2 py-2 mt-1 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all font-medium text-slate-700" />
                                        {form.errors.tax_id && <div className="text-red-500 text-sm">{form.errors.tax_id}</div>}
                                    </div>

                                    <div className="col-span-2 space-y-2">
                                        <label className="text-sm ml-1 mb-2">Notes</label>
                                        <textarea placeholder="e.g. 10 goods supplied" value={form.data.notes} onChange={e => form.setData('notes', e.target.value)}
                                            className="w-full pl-2 pr-2 py-2 mt-1 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all font-medium text-slate-700" rows="3"></textarea>
                                    </div>
                                </div>

                                {/* Footer Actions */}
                                <div className="mt-10 flex items-center justify-end gap-4">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-200 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <motion.button
                                        whileHover={{ x: 5 }}
                                        type="submit"
                                        className="flex items-center gap-2 px-8 py-2 bg-teal-600 text-white font-bold rounded-lg shadow-lg shadow-teal-100 hover:bg-teal-700 transition-all"
                                    >
                                        {editing ? 'Save Changes' : 'Confirm Registration'}
                                        <ArrowRight className="w-5 h-5" />
                                    </motion.button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
