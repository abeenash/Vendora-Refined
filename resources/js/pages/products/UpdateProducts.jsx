import { Link, useForm, usePage } from "@inertiajs/react";
import { route } from "ziggy-js";

const UpdateProducts = () => {
    const { product, categories } = usePage().props;

    const { data, setData, put, processing, errors, reset } = useForm({
        name: product.name || "",
        description: product.description || "",
        sku: product.sku || "",
        category_id: product.category_id || "",
        price: product.price || "",
        stock: product.stock || "",
        min_stock: product.min_stock || "",
    });

    const editProducts = (e) => {
        e.preventDefault();
        put(route("products.update", product.id), {
            preserveState: false,
            onSuccess: () => reset(),
        });
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            {/* <!-- Edit Product Form --> */}
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-xl shadow-md">
                    {/* <!-- Form Header --> */}
                    <div className="p-6 border-b border-gray-200 bg-teal-600">
                        <h1 className="text-2xl font-bold text-gray-800">
                            Edit Product
                        </h1>
                        <p className="mt-1 text-sm text-gray-300">
                            Update the details for the product below.
                        </p>
                    </div>

                    {/* <!-- Form Body --> */}
                    <form onSubmit={editProducts} method="PUT" className="p-6">
                        <div className="space-y-6">
                            {/* <!-- Product Name & SKU --> */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label
                                        htmlFor="edit-name"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Product Name
                                    </label>
                                    <input
                                        type="text"
                                        id="edit-name"
                                        name="name"
                                        value={data.name}
                                        onChange={(e) =>
                                            setData("name", e.target.value)
                                        }
                                        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus-ring-cyan sm:text-sm"
                                    />
                                </div>
                                <div>
                                    <label
                                        htmlFor="edit-sku"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        SKU (Stock Keeping Unit)
                                    </label>
                                    <input
                                        type="text"
                                        id="edit-sku"
                                        name="sku"
                                        value={product.sku}
                                        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus-ring-cyan sm:text-sm"
                                    />
                                </div>
                            </div>

                            {/* <!-- Description --> */}
                            <div>
                                <label
                                    htmlFor="edit-description"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Description
                                </label>
                                <textarea
                                    id="edit-description"
                                    name="description"
                                    rows="4"
                                    value={data.description}
                                    onChange={(e) =>
                                        setData("description", e.target.value)
                                    }
                                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus-ring-cyan sm:text-sm"
                                >
                                   
                                </textarea>
                            </div>

                            {/* <!-- Category & Price --> */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="edit-category">
                                        Category
                                    </label>
                                    <select
                                        id="edit-category"
                                        value={data.category_id}
                                        onChange={(e) =>
                                            setData(
                                                "category_id",
                                                e.target.value
                                            )
                                        }
                                        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus-ring-cyan sm:text-sm"
                                    >
                                        <option value="">
                                            --Select a category--
                                        </option>
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
                                    <label
                                        htmlFor="edit-price"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Price (NPR)
                                    </label>
                                    <input
                                        type="number"
                                        id="edit-price"
                                        name="price"
                                        step="0.01"
                                        value={data.price}
                                        onChange={(e) =>
                                            setData(e.target.value)
                                        }
                                        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus-ring-cyan sm:text-sm"
                                    />
                                </div>
                            </div>

                            {/* <!-- Stock & Minimum Stock --> */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label
                                        htmlFor="edit-stock"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Stock Quantity
                                    </label>
                                    <input
                                        type="number"
                                        id="edit-stock"
                                        name="stock"
                                        value={data.stock}
                                        onChange={(e) =>
                                            setData("stock", e.target.value)
                                        }
                                        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus-ring-cyan sm:text-sm"
                                    />
                                </div>
                                <div>
                                    <label
                                        htmlFor="edit-min-stock"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Minimum Stock Level
                                    </label>
                                    <input
                                        type="number"
                                        id="edit-min-stock"
                                        name="min_stock"
                                        value={data.min_stock}
                                        onChange={(e) =>
                                            setData("min_stock", e.target.value)
                                        }
                                        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus-ring-cyan sm:text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* <!-- Form Actions --> */}
                        <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end gap-4">
                            <Link
                                href={route("products.index")}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-4 py-2 text-sm font-medium text-white bg-teal-600 border border-transparent rounded-lg shadow-sm hover:bg-green-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
                            >
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default UpdateProducts;
