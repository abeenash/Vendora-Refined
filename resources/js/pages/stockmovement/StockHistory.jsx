import { Link, usePage } from "@inertiajs/react";
import {
    History,
    Package,
    TrendingDown,
    TrendingUp,
    RefreshCw,
    ArrowRight,
    Calendar,
    Users
} from "lucide-react";

const TypeBadge = ({ type }) => {
    const styles = {
        sale: 'bg-orange-50 text-orange-700 border-orange-200',
        restock: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        adjustment: 'bg-blue-50 text-blue-700 border-blue-200',
        return: 'bg-purple-50 text-purple-700 border-purple-200',
        default: 'bg-gray-50 text-gray-700 border-gray-200'
    };

    const icons = {
        sale: <TrendingDown size={14} />,
        restock: <TrendingUp size={14} />,
        adjustment: <RefreshCw size={14} />,
        return: <RefreshCw size={14} className="rotate-180" />,
    };

    const badgeStyle = styles[type] || styles.default;
    const icon = icons[type] || <History size={14} />;

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${badgeStyle}`}>
            {icon}
            {type}
        </span>
    );
};

const UserAvatar = ({ name }) => {
    // Generate initials
    const initials = name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gray-200 text-slate-600 flex items-center justify-center text-[10px] font-bold ring-2 ring-white">
                {initials}
            </div>
            <span className="text-sm font-medium text-slate-700">{name}</span>
        </div>
    );
};

const StockHistory = () => {
    const { logs, users } = usePage().props;

    return (
        <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <History className="text-teal-600" />
                    Stock Movement History
                </h1>
                {users.role === "admin" && (
                    <p className="text-slate-500 text-sm mt-1">
                        Audit log of all inventory changes, sales, and adjustments.
                    </p>
                )}
            </div>


            <div className="bg-white shadow-sm border border-slate-200 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                                <th className="p-4 pl-6">Product Detail</th>
                                <th className="p-4">Transaction Type</th>
                                <th className="p-4 text-center">Movement</th>
                                {users.role === "admin" && (
                                    <th className="p-4">Authorized By</th>
                                )}
                                <th className="p-4">Context</th>
                                <th className="p-4 text-right pr-6">Date & Time</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                            {logs.data.map((log) => {
                                const isPositive = log.new_stock > log.old_stock;
                                const isNeutral = log.new_stock === log.old_stock;
                                const diff = log.new_stock - log.old_stock;

                                return (
                                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors group">
                                        {/* Product */}
                                        <td className="p-4 pl-6">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-slate-100 rounded text-slate-500">
                                                    <Package size={18} />
                                                </div>
                                                <span className="font-medium text-slate-800 text-sm">{log.product?.name || 'Unknown Product'}</span>
                                            </div>
                                        </td>

                                        {/* Type Badge */}
                                        <td className="p-4">
                                            <TypeBadge type={log.type} />
                                        </td>

                                        {/* Stock Movement */}
                                        <td className="p-4">
                                            <div className="flex items-center justify-center gap-3 bg-slate-50 py-1.5 px-3 rounded-lg border border-slate-100 w-fit mx-auto">
                                                <span className="text-slate-400 font-mono text-sm">{log.old_stock}</span>
                                                <ArrowRight size={14} className="text-slate-300" />
                                                <span className={`font-mono font-bold text-sm ${isPositive ? 'text-emerald-600' : isNeutral ? 'text-slate-600' : 'text-red-600'}`}>
                                                    {log.new_stock}
                                                </span>
                                                {/* Tiny indicator for the difference */}
                                                <span className={`text-[10px] font-medium ml-1 px-1.5 py-0.5 rounded ${isPositive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                                    {diff > 0 ? `+${diff}` : diff}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Users BUT ONLY GIVE THIS TO ADMIN */}
                                        {users.role === "admin" && (
                                            <td className="p-4">
                                                <UserAvatar name={log.user?.name ?? 'System'} />
                                            </td>
                                        )}

                                        {/* Description */}
                                        <td className="p-4 max-w-xs">
                                            <p className="text-xs text-slate-400 truncate" title={log.description}>
                                                {log.description}
                                            </p>
                                        </td>

                                        {/* Date */}
                                        <td className="p-4 pr-6 text-right">
                                            <div className="flex flex-col items-end">
                                                <span className="text-sm font-medium text-slate-700">
                                                    {new Date(log.created_at).toLocaleDateString()}
                                                </span>
                                                <span className="text-xs text-slate-400 flex items-center gap-1">
                                                    <Calendar size={10} />
                                                    {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Footer / Pagination */}
                <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-sm text-slate-500">
                        Showing {users.role === "salesperson" && (<span>your</span>)} recent activity
                    </span>
                    <div className="flex gap-2">
                        {logs.links.map((link, index) => (
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
                                    } ${!link.url
                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                        : "hover:bg-gray-50"
                                    }`}
                            ></button>
                        ))}
                    </div>
                </div>
            </div>
        </div >
    );
}


export default StockHistory;