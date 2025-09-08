import { useEffect, useState } from "react";
import { Plus, Search, Edit } from "lucide-react";
import { usePage, router, Link } from "@inertiajs/react";
import { route } from "ziggy-js";
import { toast } from "react-toastify";
import { DeleteButton } from "../../components/DeleteButton";

const Products = () => {
    const { products, csrf_token, flash } = usePage().props;
    const [search, setSearch] = useState("");

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
    }, [flash]);

    const handleSearch = (e) => {
        setSearch(e.target.value);

        router.get(
            route("products.index"), //listing route
            { search: e.target.value },
            { preserveState: true, replace: true }
        );
    };

    return (
        <div className="space-y-6 p-4 lg:p-2 lg:p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">
                            Products
                        </h1>
                        <p className="mt-1 text-gray-500">
                            Manage your product inventory
                        </p>
                    </div>
                    <Link
                        href={route("products.create")}
                        className="mt-4 sm:mt-0 flex items-center justify-center px-4 py-2 bg-teal-600 text-white rounded-lg shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
                    >
                        <Plus className="mr-2" /> New Product
                    </Link>
                </header>

                {/* Search Bar */}
                <div className="mb-6">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            value={search}
                            onChange={handleSearch}
                            placeholder="Search products by name, SKU, or category..."
                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
                        />
                    </div>
                </div>

                {/* Products Table */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-700">
                            Products in Total ({products.total})
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        Name
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        SKU
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        Category
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        Price
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        Stock
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        Status
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {products.data.map((product) => (
                                    <tr
                                        key={product.id}
                                        className={
                                            product.stock <= product.min_stock
                                                ? "bg-red-50 text-red-500"
                                                : ""
                                        }
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {product.name}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {product.description}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {product.sku}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {product.category
                                                ? product.category.name
                                                : "-"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                            NPR {product.price}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {product.stock}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                Min: {product.min_stock}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    product.stock <=
                                                    product.min_stock
                                                        ? "bg-red-100 text-red-800"
                                                        : "bg-teal-100 text-teal-800"
                                                }`}
                                            >
                                                {product.stock <=
                                                product.min_stock
                                                    ? "Low Stock"
                                                    : "In Stock"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center space-x-3">
                                                <Link
                                                    href={route(
                                                        `products.edit`,
                                                        product.id
                                                    )}
                                                    className="text-gray-400 hover:text-cyan-600"
                                                >
                                                    <Edit className="h-5 w-5" />
                                                </Link>
                                                <DeleteButton
                                                    onConfirm={() =>
                                                        router.delete(
                                                            route(
                                                                "products.destroy",
                                                                product.id
                                                            )
                                                        )
                                                    }
                                                    attr="product"
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-4 flex justify-center space-x-2">
                        {products.links.map((link, index) => (
                            <button
                                key={index}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                onClick={() =>
                                    link.url && router.visit(link.url)
                                }
                                className={`px-3 py-1 border border-gray-300 rounded-lg text-sm ${
                                    link.active
                                        ? "bg-teal-600 text-white"
                                        : "bg-white text-gray-700"
                                } disabled:opacity-50`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Products;
