import { AlertTriangle, ArrowRight } from "lucide-react";
import { Link } from "@inertiajs/react";

const LowStockAlert = ({ products }) => {

    return (
        <>
            {products.length > 0 && (
                <div className="mb-8 group">
                    <div className="relative overflow-hidden bg-red-50 border-l-4 border-red-500 rounded-r-lg shadow-sm">

                        <div className="absolute inset-0 bg-red-200/20 animate-pulse pointer-events-none" />

                        <div className="relative p-5 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="p-1.5 bg-red-100 rounded text-red-600 animate-bounce">
                                        <AlertTriangle size={18} strokeWidth={2.5} />
                                    </div>
                                    <h3 className="text-red-800 font-bold text-lg">
                                        Critical Stock Level Warning
                                    </h3>
                                    <span className="px-2 py-0.5 bg-red-200 text-red-800 text-xs font-bold rounded-full uppercase tracking-wider">
                                        Action Needed
                                    </span>
                                </div>
                                <p className="text-red-700/80 text-sm mb-4">
                                    The following items have fallen below their minimum stock threshold. Restock immediately to avoid shortages.
                                </p>
                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 w-full">
                                    {products.map((p) => (
                                        <div key={p.id} className="bg-white/60 border border-red-200 rounded px-3 py-2 flex justify-between items-center hover:bg-white transition-colors">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-red-900 text-sm">{p.name}</span>
                                                <span className="text-xs text-red-600/80">Min: {p.min_stock}</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="block font-bold text-red-600 text-lg leading-none">{p.stock}</span>
                                                <span className="text-[10px] text-red-500 uppercase font-bold">Left</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col items-end gap-2 min-w-max">
                                <Link href="/products" className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-md hover:shadow-lg active:scale-95 text-sm group-hover:animate-none">
                                    <span>Check the inventory</span>
                                    <ArrowRight size={16} />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
export default LowStockAlert;