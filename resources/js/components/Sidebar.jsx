import { useState, useEffect } from "react";
import {
    BoxIcon,
    Users,
    HomeIcon,
    ChevronDown,
    TrendingUpIcon,
} from "lucide-react";
import { Link, usePage } from "@inertiajs/react";

export default function Sidebar() {
    const users = usePage().props.auth.user;
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isCustomerMenuOpen, setIsCustomerMenuOpen] = useState(false);

    //we will track the window to collapse sidebar automatically
    useEffect(() => {
        const handleResize = () => setIsCollapsed(window.innerWidth < 1024); //this adjusts the breakpoint as needed
        window.addEventListener("resize", handleResize);
        handleResize();
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <aside className={`bg-teal-700 text-white flex flex-col transition-all duration-300 ${isCollapsed ? "w-18" : "w-64"}`}>
            <div className="h-16 flex items-center justify-center text-2xl font-bold text-white shadow-md bg-teal-900">
                <BoxIcon className="mr-1" />
                {!isCollapsed && "Vendora"}
            </div>
            {users.role === "admin" && (
                <Link
                    href="/dashboard/admin"
                    className="flex items-center px-4 py-2.5 text-gray-300 hover:bg-teal-800 hover:text-white rounded-md transition duration-200"
                >
                    <HomeIcon className="mr-3" />
                    {!isCollapsed && "Dashboard"}
                </Link>
            )}
            {users.role === "salesperson" && (
                <Link
                    href="/dashboard/salesperson"
                    className="flex items-center px-4 py-2.5 text-gray-300 hover:bg-teal-800 hover:text-white rounded-md transition duration-200"
                >
                    <HomeIcon className="mr-3" />
                    {!isCollapsed && "My Dashboard"}
                </Link>
            )}
            {users.role === "admin" && (
                <Link
                    href="/categories"
                    className="flex items-center px-4 py-2.5 text-gray-300 hover:bg-teal-800 hover:text-white rounded-md transition duration-200"
                >
                    <svg
                        className="w-6 h-6 mr-3"
                        fill="none"
                        strokeWidth="2"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                        ></path>
                    </svg>
                    {!isCollapsed && "Categories"}
                </Link>
            )}
            <Link
                href="/products"
                className="flex items-center px-4 py-2.5 text-gray-300 hover:bg-teal-800 hover:text-white rounded-md transition duration-200"
            >
                <svg
                    className="w-6 h-6 mr-3"
                    fill="none"
                    strokeWidth="2"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    ></path>
                </svg>
                {!isCollapsed && "Products"}
            </Link>
            <Link
                href="/sales"
                className="flex items-center px-4 py-2.5 text-gray-300 hover:bg-teal-800 hover:text-white rounded-md transition duration-200"
            >
                <TrendingUpIcon className="w-6 h-6 mr-3" />
                {!isCollapsed && "Sales"}
            </Link>
            {users.role === "admin" && (
                <Link
                    href="/salesreport"
                    className="flex items-center px-4 py-2.5 text-gray-300 hover:bg-teal-800 hover:text-white rounded-md transition duration-200"
                >
                    <svg
                        className="w-6 h-6 mr-3"
                        fill="none"
                        strokeWidth="2"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        ></path>
                    </svg>
                    {!isCollapsed && "Sales Report"}
                </Link>
            )}
            {users.role === "admin" && (
                <div>
                    <button
                        onClick={() => setIsCustomerMenuOpen((prev) => !prev)}
                        className="w-full flex items-center justify-between px-4 py-2.5 text-gray-300 hover:bg-teal-800 hover:text-white rounded-md transition"
                    >
                        <span className="flex items-center">
                            <Users className="mr-3" /> {!isCollapsed && "Customers"}
                        </span>
                        <ChevronDown
                            className={`w-4 h-4 arrow-down transform transition-transform ${isCustomerMenuOpen ? "rotate-180" : ""
                                }`}
                            fill="none"
                            strokeWidth="2"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        />
                    </button>
                    {isCustomerMenuOpen && (
                        <div className="mt-1 pl-8 space-y-1">
                            <Link
                                href="/managecustomers"
                                className="block px-4 py-2 text-sm text-white hover:bg-teal-800 hover:text-white rounded-md"
                            >
                                Manage Customers
                            </Link>
                        </div>
                    )}
                </div>
            )}
            {users.role === "salesperson" && (
                <Link
                    href="/managecustomers"
                    className="flex items-center px-4 py-2.5 text-gray-300 hover:bg-teal-800 hover:text-white rounded-md transition duration-200"
                >
                    <Users className="w-6 h-6 mr-3" />
                    {!isCollapsed && "My Customers"}
                </Link>
            )}
            {users.role === "admin" && (
                <div>
                    <button
                        onClick={() => setIsUserMenuOpen((prev) => !prev)}
                        className="w-full flex items-center justify-between px-4 py-2.5 text-gray-300 hover:bg-teal-800 hover:text-white rounded-md transition"
                    >
                        <span className="flex items-center">
                            <Users className="mr-3" /> {!isCollapsed && "Users"}
                        </span>
                        <ChevronDown
                            className={`w-4 h-4 arrow-down transform transition-transform ${isUserMenuOpen ? "rotate-180" : ""
                                }`}
                            fill="none"
                            strokeWidth="2"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        />
                    </button>
                    {isUserMenuOpen && (
                        <div className="mt-1 pl-8 space-y-1">
                            <Link
                                href="/manageusers"
                                className="block px-4 py-2 text-sm text-white hover:bg-teal-800 hover:text-white rounded-md"
                            >
                                Manage Users
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </aside>
    );
}
