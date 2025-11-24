import { useState } from "react";
import {
    BoxIcon,
    Users,
    HomeIcon,
    ChevronDown,
    TrendingUpIcon,
} from "lucide-react";
import { Link } from "@inertiajs/react";

export default function Sidebar() {
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isCustomerMenuOpen, setIsCustomerMenuOpen] = useState(false);

    return (
        <aside className="w-64 bg-teal-700 text-white flex flex-col">
            <div className="h-16 flex items-center justify-center text-2xl font-bold text-white shadow-md bg-teal-900">
                <BoxIcon className="mr-1" />
                Vendora
            </div>
            <Link
                href="/dashboard"
                className="flex items-center px-4 py-2.5 text-gray-300 hover:bg-teal-800 hover:text-white rounded-md transition duration-200"
            >
                <HomeIcon className="mr-3" />
                Dashboard
            </Link>
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
                Categories
            </Link>
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
                Products
            </Link>
            <Link
                href="/sales"
                className="flex items-center px-4 py-2.5 text-gray-300 hover:bg-teal-800 hover:text-white rounded-md transition duration-200"
            >
                <TrendingUpIcon className="w-6 h-6 mr-3" />
                Sales
            </Link>
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
                Sales Report
            </Link>
            <div>
                <button
                    onClick={() => setIsCustomerMenuOpen((prev) => !prev)}
                    className="w-full flex items-center justify-between px-4 py-2.5 text-gray-300 hover:bg-teal-800 hover:text-white rounded-md transition"
                >
                    <span className="flex items-center">
                        <Users className="mr-3" /> Customers
                    </span>
                    <ChevronDown
                        className={`w-4 h-4 arrow-down transform transition-transform ${
                            isCustomerMenuOpen ? "rotate-180" : ""
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
            <div>
                <button
                    onClick={() => setIsUserMenuOpen((prev) => !prev)}
                    className="w-full flex items-center justify-between px-4 py-2.5 text-gray-300 hover:bg-teal-800 hover:text-white rounded-md transition"
                >
                    <span className="flex items-center">
                        <Users className="mr-3" /> Users
                    </span>
                    <ChevronDown
                        className={`w-4 h-4 arrow-down transform transition-transform ${
                            isUserMenuOpen ? "rotate-180" : ""
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
        </aside>
    );
}
