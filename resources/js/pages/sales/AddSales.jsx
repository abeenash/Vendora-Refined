import { useForm, Link, usePage } from "@inertiajs/react";
import { route } from "ziggy-js";
import { useState, useEffect } from "react";
import ProductRow from "./ProductRow";
import CustomerRow from "./CustomerRow";
import { Check, X } from "lucide-react";

const AddSales = () => {
    const { products = [], customers = [], auth } = usePage().props;

    const [customerSearchTerm, setCustomerSearchTerm] = useState("");
    const [productSearchTerm, setProductSearchTerm] = useState("");
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        customer_id: "",
        user_id: "",
        items: [],
        status: "Pending",
    });

    // --------------------- CUSTOMER HANDLING ------------------------
    const handleSelectCustomer = (customer) => {
        setSelectedCustomer(customer); //bc we need to set selected customer
        setData("customer_id", customer.id); //bc we need to set customer_id in form data
        setCustomerSearchTerm(""); //bc we need to clear search after selecting
    };

    const handleRemoveCustomer = () => {
        setSelectedCustomer(null); //this removes selected customer
        setData("customer_id", null); //bc we need to remove customer_id from form data
    };

    const filteredCustomers = customers.filter((c) =>
        c.name.toLowerCase().includes(customerSearchTerm.toLowerCase())
    ); //we filter customers based on search term

    // --------------------- PRODUCT HANDLING ------------------------
    const handleAddProduct = (product) => {
        if (!data.items.find((item) => item.product_id === product.id)) {
            setData("items", [
                ...data.items,
                { product_id: product.id, quantity: 1, price: product.price },
            ]);
        }
        setProductSearchTerm(""); //bc we need to clear search
    };

    // --------------------- FORM (AUTH) HANDLING ------------------------
    //pre-fill user_id with auth.id ()i.e: logged-in user
    useEffect(() => {
        if (auth?.user) {
            setData("user_id", auth.user.id);
        }
    }, [auth]);

    // --------------------- FORM SUBMISSION ------------------------
    const handleSubmit = (e) => {
        e.preventDefault();

        post(route("sales.store"), {
            onSuccess: () => reset(), //reset the form
        });
    };

    // --------------------- TOTAL CALCULATION ------------------------
    const totalPrice = data.items.reduce(
        (sum, item) => sum + (item.price || 0) * item.quantity,
        0
    );

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto mb-12">
                <div className="bg-white rounded-xl shadow-md">
                    <div className="p-6 border-b border-gray-200 bg-teal-600">
                        <h1 className="text-2xl font-bold text-gray-800">
                            Add New Sale
                        </h1>
                        <p className="mt-1 text-sm text-gray-200">
                            Fill in the details below to add a new sale to your
                            inventory.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Select customer */}
                            <div className="space-y-2">
                                {selectedCustomer ? (
                                    <CustomerRow
                                        item={selectedCustomer}
                                        onRemove={handleRemoveCustomer}
                                    />
                                ) : (
                                    <>
                                        <input
                                            type="text"
                                            placeholder="Search customer..."
                                            value={customerSearchTerm}
                                            onChange={(e) =>
                                                setCustomerSearchTerm(e.target.value)
                                            }
                                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-teal-600 focus:outline-none"
                                        />
                                        {customerSearchTerm && (
                                            <div className="max-h-52 overflow-y-auto border rounded-md shadow-sm divide-y divide-gray-100">
                                                {filteredCustomers.length >
                                                0 ? (
                                                    filteredCustomers.map(
                                                        (c) => (
                                                            <div
                                                                key={c.id}
                                                                onClick={() =>
                                                                    handleSelectCustomer(
                                                                        c
                                                                    )
                                                                }
                                                                className="px-3 py-2 hover:bg-cyan-50 cursor-pointer transition-colors"
                                                            >
                                                                <p className="font-medium text-gray-800">
                                                                    {c.name}
                                                                </p>
                                                                <p className="text-sm text-gray-500">
                                                                    {c.phone}
                                                                </p>
                                                            </div>
                                                        )
                                                    )
                                                ) : (
                                                    <p className="px-3 py-2 text-gray-500">
                                                        No customers found.
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Search bar for products */}
                        <div className="space-y-2">
                            <input
                                type="text"
                                placeholder="Search product..."
                                value={productSearchTerm}
                                onChange={(e) => setProductSearchTerm(e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-teal-600 focus:outline-none"
                            />
                            {productSearchTerm && (
                                <div className="max-h-52 overflow-y-auto border rounded-md shadow-sm divide-y divide-gray-100">
                                    {products
                                        .filter((product) =>
                                            product.name
                                                .toLowerCase()
                                                .includes(
                                                    productSearchTerm.toLowerCase()
                                                )
                                        )
                                        .map((product) => (
                                            <div
                                                key={product.id}
                                                onClick={() =>
                                                    handleAddProduct(product)
                                                }
                                                className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                                            >
                                                {product.name} (NPR{" "}
                                                {product.price})
                                            </div>
                                        ))}
                                </div>
                            )}
                        </div>

                        {/* Items */}
                        <div className="space-y-3">
                            {data.items.map((item, index) => (
                                <ProductRow
                                    key={item.product_id}
                                    item={item}
                                    products={products}
                                    onChange={(updated) => {
                                        const newItems = [...data.items];
                                        newItems[index] = updated;
                                        setData("items", newItems);
                                    }}
                                    onRemove={() => {
                                        setData(
                                            "items",
                                            data.items.filter(
                                                (index) =>
                                                    index.product_id !==
                                                    item.product_id
                                            )
                                        );
                                    }}
                                />
                            ))}

                            {errors.items_summary && (
                                <div className="text-red-500 text-sm">
                                    {errors.items_summary}
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="total_price">Total Price</label>
                                <input
                                    type="number"
                                    id="total_price"
                                    value={totalPrice}
                                    readOnly
                                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus-ring-cyan sm:text-sm"
                                />
                                {errors.total_price && (
                                    <div className="text-red-500 text-sm">
                                        {errors.total_price}
                                    </div>
                                )}
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                setData(
                                    "status",
                                    data.status === "Pending"
                                        ? "Completed"
                                        : "Pending"
                                )
                            }
                            className={`px-4 py-2 rounded-lg text-sm font-medium ${
                                data.status === "Pending"
                                    ? "bg-yellow-200 hover:bg-yellow-300 cursor-pointer"
                                    : "bg-green-200 hover:bg-green-300 cursor-pointer"
                            }`}
                        >
                            {data.status === "Pending"
                                ? `Mark as Completed`
                                : `Mark as Pending`}
                        </button>

                        <div className="flex justify-end gap-4">
                            <Link
                                href={route("sales.index")}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                className="btn-primary px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                disabled={processing}
                            >
                                Save Sale
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddSales;
