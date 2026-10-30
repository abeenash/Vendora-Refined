import { useEffect, useRef, useState } from 'react';
import Profile from '../images/profile.jpg';
import { usePage, Link, router } from '@inertiajs/react';
import { Clock, Edit, Menu, Settings } from 'lucide-react';
import { LogoutButton, LogoutDialog } from './LogoutButton';
import { route } from 'ziggy-js';


export default function Navbar({ onMenuClick }) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [confirmLogout, setConfirmLogout] = useState(false);
    const [dateTime, setDateTime] = useState('');
    const dropdownRef = useRef(null);

    //for displaying authenticated user name as logged in
    const { auth, demo } = usePage().props;
    const username = auth.user?.name;

    useEffect(() => {
        const updateDateTime = () => {
            const now = new Date();
            const options = {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                hour: '2-digit', minute: '2-digit', second: '2-digit'
            };
            setDateTime(now.toLocaleDateString('en-US', options));
        };

        updateDateTime(); // initial call
        const interval = setInterval(updateDateTime, 1000);

        return () => clearInterval(interval); // cleanup
    }, []);

    //close the dropdown when clicking anywhere else or pressing Esc
    useEffect(() => {
        if (!isDropdownOpen) return;
        const onClick = (e) => dropdownRef.current && !dropdownRef.current.contains(e.target) && setIsDropdownOpen(false);
        const onKey = (e) => e.key === 'Escape' && setIsDropdownOpen(false);
        document.addEventListener('mousedown', onClick);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onClick);
            document.removeEventListener('keydown', onKey);
        };
    }, [isDropdownOpen]);

    return (
        <header className="h-16 shrink-0 bg-white shadow-md flex items-center justify-between px-4 sm:px-6">
            {/* hamburger: only when the sidebar is a slide-in drawer (below lg) */}
            <button
                onClick={onMenuClick}
                className="lg:hidden p-2 -ml-2 rounded-lg text-gray-600 hover:bg-gray-100"
                aria-label="Open menu"
            >
                <Menu className="h-6 w-6" />
            </button>

            <div className="flex items-center space-x-6 ml-auto">
                {demo && (
                    <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-800" title="Public demo: all data is rebuilt every night">
                        Live demo · resets nightly
                    </span>
                )}
                <div className="hidden md:block text-gray-600 text-sm">
                    {dateTime}
                    <Clock className="inline ml-2 h-5 w-5 text-gray-500" />
                </div>

                {/* Dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setIsDropdownOpen((prev) => !prev)}
                        className="flex items-center space-x-2 focus:outline-none"
                    >
                        <img
                            src={Profile}
                            alt="User Avatar"
                            className="w-10 h-10 rounded-full border-2 border-gray-300"
                        />
                        <span className="hidden lg:inline text-gray-700 font-medium">{username || "User"}</span>
                        <svg
                            className={`w-4 h-4 text-gray-600 arrow-down transition-transform ${isDropdownOpen ? 'rotate-180' : ''
                                }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 border border-gray-100">
                            <Link href={route('editprofile')} onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                <Edit className='inline mr-2 h-5 w-5 text-gray-500 ' />
                                Edit Profile
                            </Link>
                            <Link href={route('settings')} onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                <Settings className='inline mr-2 h-5 w-5 text-gray-500' />
                                Settings
                            </Link>
                            <LogoutButton onClick={() => { setIsDropdownOpen(false); setConfirmLogout(true); }} />
                        </div>
                    )}
                </div>
            </div>

            {confirmLogout && (
                <LogoutDialog
                    onCancel={() => setConfirmLogout(false)}
                    onConfirm={() => { setConfirmLogout(false); router.post(route("logout")); }}
                />
            )}
        </header>
    );
}
