import { useForm, Link, usePage } from "@inertiajs/react";
import { route } from "ziggy-js";

const AddProducts = () => {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        sku: "",
        description: "",
        category_id: "",
        price: "",
        stock: "",
        min_stock: "",
    });

    const {categories} = usePage().props;
    
    const handleSubmit = (e) => {
        e.preventDefault();

        post(route("products.store"), {
            onSuccess: () => reset(), //reset the form
        });
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto mb-12">
                <div className="bg-white rounded-xl shadow-md">
                    <div className="p-6 border-b border-gray-200 bg-teal-600">
                        <h1 className="text-2xl font-bold text-gray-800">
                            Add New Product
                        </h1>
                        <p className="mt-1 text-sm text-gray-200">
                            Fill in the details below to add a new product to
                            your inventory.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label
                                    htmlFor="add-name"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Product Name
                                </label>
                                <input
                                    type="text"
                                    id="add-name"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData("name", e.target.value)
                                    }
                                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus-ring-cyan sm:text-sm"
                                />
                                {errors.name && (
                                    <div className="text-red-500 text-sm">
                                        {errors.name}
                                    </div>
                                )}
                            </div>
                            <div>
                                <label
                                    htmlFor="add-sku"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    SKU
                                </label>
                                <input
                                    type="text"
                                    id="add-sku"
                                    value={data.sku}
                                    onChange={(e) =>
                                        setData("sku", e.target.value)
                                    }
                                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus-ring-cyan sm:text-sm"
                                />
                                {errors.sku && (
                                    <div className="text-red-500 text-sm">
                                        {errors.sku}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="add-description"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Description
                            </label>
                            <textarea
                                id="add-description"
                                value={data.description}
                                onChange={(e) =>
                                    setData("description", e.target.value)
                                }
                                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus-ring-cyan sm:text-sm"
                            />
                            {errors.description && (
                                <div className="text-red-500 text-sm">
                                    {errors.description}
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="add-category">Category</label>
                                <select
                                    id="add-category"
                                    value={data.category_id}
                                    onChange={(e) =>
                                        setData("category_id", e.target.value)
                                    }
                                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus-ring-cyan sm:text-sm"
                                >
                                    <option value="">Select a category</option>
                                    {categories.map((category) => (
                                        <option
                                            key={category.id}
                                            value={category.id}
                                        >
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.category_id && (
                                    <div className="text-red-500 text-sm">
                                        {errors.category_id}
                                    </div>
                                )}
                            </div>
                            <div>
                                <label htmlFor="add-price">Price (NPR)</label>
                                <input
                                    type="number"
                                    id="add-price"
                                    value={data.price}
                                    onChange={(e) =>
                                        setData("price", e.target.value)
                                    }
                                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus-ring-cyan sm:text-sm"
                                />
                                {errors.price && (
                                    <div className="text-red-500 text-sm">
                                        {errors.price}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="add-stock">
                                    Stock Quantity
                                </label>
                                <input
                                    type="number"
                                    id="add-stock"
                                    value={data.stock}
                                    onChange={(e) =>
                                        setData("stock", e.target.value)
                                    }
                                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus-ring-cyan sm:text-sm"
                                />
                                {errors.stock && (
                                    <div className="text-red-500 text-sm">
                                        {errors.stock}
                                    </div>
                                )}
                            </div>
                            <div>
                                <label htmlFor="add-min-stock">
                                    Minimum Stock
                                </label>
                                <input
                                    type="number"
                                    id="add-min-stock"
                                    value={data.min_stock}
                                    onChange={(e) =>
                                        setData("min_stock", e.target.value)
                                    }
                                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus-ring-cyan sm:text-sm"
                                />
                                {errors.min_stock && (
                                    <div className="text-red-500 text-sm">
                                        {errors.min_stock}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end gap-4">
                            <Link
                                href="/products"
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                className="btn-primary px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                disabled={processing}
                            >
                                Save Product
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddProducts;
