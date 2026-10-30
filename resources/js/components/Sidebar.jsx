import { useState } from "react";
import {
    BoxIcon,
    Users,
    UserCog,
    HomeIcon,
    ChevronDown,
    TrendingUpIcon,
    DollarSign,
    Truck,
    X,
    Layers,
    ShoppingBag,
    FileBarChart,
} from "lucide-react";
import { Link, usePage } from "@inertiajs/react";

/*
| The menu. Colours come from the .vd-sidebar* classes in resources/css/theme.css:
| teal in light mode, "dimmed" midnight-teal with teal accents in dark mode.
| `roles` limits an entry to admin / salesperson; no roles = everyone.
*/
const NAV = [
    { label: "Dashboard", href: "/dashboard/admin", Icon: HomeIcon, roles: ["admin"] },
    { label: "My Dashboard", href: "/dashboard/salesperson", Icon: HomeIcon, roles: ["salesperson"] },
    { label: "Categories", href: "/categories", Icon: Layers, roles: ["admin"] },
    { label: "Products", href: "/products", Icon: ShoppingBag },
    { label: "Sales", href: "/sales", Icon: TrendingUpIcon },
    { label: "Sales Report", href: "/salesreport", Icon: FileBarChart, roles: ["admin"] },
    {
        label: "Purchases", Icon: Truck, roles: ["admin"], children: [
            { label: "Suppliers", href: "/suppliers" },
            { label: "Purchase Orders", href: "/purchase-orders" },
            { label: "Supplier Bills", href: "/supplier-bills" },
        ],
    },
    {
        label: "Payments", Icon: DollarSign, children: [
            { label: "Receivables", href: "/receivables" },
            { label: "Payables", href: "/payables", roles: ["admin"] },
        ],
    },
    { label: "Customers", href: "/managecustomers", Icon: Users, roles: ["admin"] },
    { label: "My Customers", href: "/managecustomers", Icon: Users, roles: ["salesperson"] },
    { label: "Users", href: "/manageusers", Icon: UserCog, roles: ["admin"] },
];

const allowed = (item, role) => !item.roles || item.roles.includes(role);

// "/purchase-orders/5" counts as being on "/purchase-orders"
const isActive = (href, url) => {
    const path = url.split("?")[0];
    return path === href || path.startsWith(href + "/");
};

function NavGroup({ item, url, role }) {
    const children = item.children.filter((c) => allowed(c, role));
    const hasActiveChild = children.some((c) => isActive(c.href, url));
    const [open, setOpen] = useState(hasActiveChild);

    return (
        <div>
            <button
                onClick={() => setOpen((prev) => !prev)}
                data-active={hasActiveChild && !open}
                className="vd-nav-item w-full justify-between"
            >
                <span className="flex items-center">
                    <item.Icon className="vd-nav-icon w-6 h-6 mr-3" />
                    {item.label}
                </span>
                <ChevronDown className={`w-4 h-4 transform transition-transform ${open ? "rotate-180" : ""}`} />
            </button>
            {open && (
                <div className="mt-1 pl-8 space-y-1">
                    {children.map((child) => (
                        <Link key={child.href} href={child.href} data-active={isActive(child.href, url)} className="vd-nav-subitem">
                            {child.label}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
    const { auth } = usePage().props;
    const { url } = usePage();
    const role = auth.user.role;

    return (
        <>
            <aside
                className={`vd-sidebar fixed lg:static inset-y-0 left-0 z-50 w-64 shrink-0 h-full overflow-y-auto transform transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
            >
                <div className="vd-sidebar-header h-16 flex items-center justify-center text-2xl font-bold shadow-md relative">
                    <BoxIcon className="vd-brand-icon mr-1" />
                    Vendora
                    {/* close button for the mobile drawer */}
                    <button onClick={() => setSidebarOpen(false)} className="vd-nav-close lg:hidden absolute right-3 p-1 rounded" aria-label="Close menu">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <nav className="py-2 space-y-0.5">
                    {NAV.filter((item) => allowed(item, role)).map((item) =>
                        item.children ? (
                            <NavGroup key={item.label} item={item} url={url} role={role} />
                        ) : (
                            <Link key={item.label} href={item.href} data-active={isActive(item.href, url)} className="vd-nav-item">
                                <item.Icon className="vd-nav-icon w-6 h-6 mr-3" />
                                {item.label}
                            </Link>
                        )
                    )}
                </nav>
            </aside>

            {/* the menu (hamburger) button lives in the Navbar and only shows below the lg breakpoint */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/30 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </>
    );
}
