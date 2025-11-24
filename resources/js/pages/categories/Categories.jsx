import { useState, useEffect } from "react"
import { Edit, Plus, Search, Trash } from "lucide-react"
import { usePage, router } from "@inertiajs/react"
import { toast } from "react-toastify"
import { route } from "ziggy-js"
import { Link } from "@inertiajs/react"
import { DeleteButton } from "../../components/DeleteButton"

const Categories = () => {
    const { categories, flash } = usePage().props;
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }

        if(flash?.error){
            toast.error(flash.error);
        }
    }, [flash]);

    const handleSearch = (e) => {
        setSearch(e.target.value);

        router.get(
            route('categories.index'), //listing route
            { search: e.target.value },
            { preserveState: true, replace: true }
        );
    };

    return (
        <div className="space-y-6 p-4 lg:p-2 lg:p-6">
            <div className="max-w-7xl mx-auto">
                {/* <!-- Header Section --> */}
                <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Categories</h1>
                        <p className="mt-1 text-gray-500">List out the categories and manage them</p>
                    </div>
                    <Link
                        href={route('categories.create')}
                        className="mt-4 sm:mt-0 flex items-center justify-center px-4 py-2 bg-teal-600 text-white rounded-lg shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500">
                        <Plus className="mr-2" /> New Category
                    </Link>
                </header>

                {/* <!-- Search Bar --> */}
                <div className="mb-6">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 mr-2 text-gray-400" />
                        </div>
                        <input type="text" placeholder="Search category..."
                            value={search}
                            onChange={handleSearch}
                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm" />
                    </div>
                </div>

                {/* <!-- Categories Table Container --> */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-700">Categories in Total ({categories.total})</h2>
                    </div>

                    {/* <!-- Table --> */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">S.N</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {categories.data.map((category, i) => (
                                    <tr key={category.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{categories.from + i}</div> 
                                            {/* if we do {i+1}, thenit just resets on every page becuase i is the local index of the current page's loop */}
                                        </td>
                                        {/* what you actually want is a global index that accounts for pagination. Laravel's paginator gives you a "from" property and "to" property to offset the numbering */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{category.name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center space-x-3">
                                                <Link href={route(`categories.edit`, category.id)} className="text-gray-400 hover:text-cyan-600">
                                                    <Edit className="h-5 w-5" />
                                                </Link>
                                                <DeleteButton onConfirm={() => router.delete(route('categories.destroy', category.id))} attr="category" />
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                            </tbody>
                        </table>
                    </div>
                    <div className="p-4 flex justify-center space-x-2">
                        {
                            categories.links.map((link, index) => (
                                <button
                                    key={index}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    onClick={() => link.url && router.visit(link.url)}
                                    className={`px-3 py-1 border border-gray-300 rounded-lg text-sm ${link.active ? 'bg-teal-600 text-white' : 'bg-white text-gray-700'} disabled:opacity-50`}
                                />
                            ))
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Categories