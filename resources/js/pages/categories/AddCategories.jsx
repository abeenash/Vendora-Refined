import { useForm, Link, usePage } from "@inertiajs/react"
import { route } from "ziggy-js";

const AddCategories = () => {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        post(route('categories.store'), {
            onSuccess: () => reset(), //reset the form
        })
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto mb-12">
                <div className="bg-white rounded-xl shadow-md">
                    <div className="p-6 border-b border-gray-200 bg-teal-600">
                        <h1 className="text-2xl font-bold text-gray-800">Add New Category</h1>
                        <p className="mt-1 text-sm text-gray-200">Fill in the details below.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="add-name" className="block text-sm font-medium text-gray-700">Category Name</label>
                                <input
                                    type="text"
                                    id="add-name"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus-ring-cyan sm:text-sm"
                                />
                                {errors.name && <div className="text-white text-sm text-center bg-red-400 w-full p-2 mt-2 rounded">{errors.name}</div>}
                            </div>
                        </div>

                        <div className="flex justify-end gap-4">
                            <Link href="/categories" className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">Cancel</Link>
                            <button type="submit" className="btn-primary px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500" disabled={processing}>Save Product</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default AddCategories