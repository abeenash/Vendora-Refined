import { Link, useForm, usePage } from "@inertiajs/react"
import { route } from "ziggy-js";

const UpdateCategories = () => {

    const { category } = usePage().props;

    const { data, setData, put, processing, errors, reset } = useForm({
        name: category.name || '',
    });

    const editCategories = (e) => {
        e.preventDefault();
        put(route('categories.update', category.id), {
            preserveState: false,
            onSuccess: () => reset(),
        })
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            {/* <!-- Edit Category Form --> */}
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-xl shadow-md">
                    {/* <!-- Form Header --> */}
                    <div className="p-6 border-b border-gray-200 bg-teal-600">
                        <h1 className="text-2xl font-bold text-gray-800">Edit Category</h1>
                        <p className="mt-1 text-sm text-gray-300">Update the details for the category below.</p>
                    </div>

                    {/* <!-- Form Body --> */}
                    <form onSubmit={editCategories} method="POST" className="p-6">
                        <div className="space-y-6">
                            {/* <!-- Category Name --> */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700">Category Name</label>
                                    <input type="text"
                                        id="edit-name" name="name"
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus-ring-cyan sm:text-sm" />
                                </div>
                            </div>
                        </div>

                        {/* <!-- Form Actions --> */}
                        <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end gap-4">
                            <Link href="/products" className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                                Cancel
                            </Link>
                            <button type="submit"
                                disabled={processing}
                                className="px-4 py-2 text-sm font-medium text-white bg-cyan-600 border border-transparent rounded-lg shadow-sm hover:bg-green-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500">
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default UpdateCategories