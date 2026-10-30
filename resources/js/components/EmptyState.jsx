import { Link } from "@inertiajs/react";
import { SearchX, Sparkles } from "lucide-react";

// Shown instead of an empty table / chart: says what will appear here and how to get started.
// action: { label, href } for a link, or { label, onClick } for a button
export default function EmptyState({ Icon = Sparkles, title, message, action, compact = false }) {
    const ActionTag = action?.href ? Link : "button";

    return (
        <div className={`bg-white rounded-xl shadow-md flex flex-col items-center text-center ${compact ? "py-10 px-6" : "py-16 px-6"}`}>
            <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center mb-4">
                <Icon className="w-8 h-8 text-teal-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
            {message && <p className="mt-2 text-gray-500 max-w-md">{message}</p>}
            {action && (
                <ActionTag
                    {...(action.href ? { href: action.href } : { type: "button", onClick: action.onClick })}
                    className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white rounded-lg shadow-sm hover:bg-teal-700"
                >
                    {action.Icon && <action.Icon className="w-5 h-5" />}
                    {action.label}
                </ActionTag>
            )}
        </div>
    );
}

// A search that matched nothing: keep the search box, explain, offer to clear it
export function NoResults({ search, onClear }) {
    return (
        <EmptyState
            compact
            Icon={SearchX}
            title={`No results for "${search}"`}
            message="Try a different name or spelling."
            action={onClear ? { label: "Clear search", onClick: onClear } : undefined}
        />
    );
}

/**
 * Decides what a list page shows:
 *  - items exist           -> children (the table)
 *  - none, but searching   -> NoResults
 *  - none at all           -> the page's EmptyState
 */
export function ListGate({ items, search, onClearSearch, empty, children }) {
    if (items.length > 0) return children;
    if (search) return <NoResults search={search} onClear={onClearSearch} />;
    return <EmptyState {...empty} />;
}

// the search box is only useful when there is something to search, or a search is active
export const showSearch = (items, search) => items.length > 0 || !!search;
