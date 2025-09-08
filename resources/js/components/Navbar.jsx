import { useEffect, useState } from 'react';
import Profile from '../images/profile.jpg';
import { useForm, usePage, Link, router } from '@inertiajs/react';
import { Clock, Edit, Settings } from 'lucide-react';
import { LogoutButton } from './LogoutButton';
import { route } from 'ziggy-js';


export default function Navbar() {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [dateTime, setDateTime] = useState('');

    //for logout functionality
    const { post } = useForm();
    // const logout = () => {
    //     if(confirm("Are you sure you want to logout?")){
    //         post('/logout');
    //     }
    // }

    //for displaying authenticated user name as logged in 
    const { auth } = usePage().props;
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

    return (
        <header className="h-16 bg-white shadow-md flex items-center justify-end px-6">
            <div className="flex items-center space-x-6">
                <div className="text-gray-600 text-sm">
                    {dateTime}
                    <Clock className="inline ml-2 h-5 w-5 text-gray-500" />
                </div>

                {/* Dropdown */}
                <div className="relative">
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
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20">
                            <Link href="/editprofile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                <Edit className='inline mr-2 h-5 w-5 text-gray-500 ' />
                                Edit Profile
                            </Link>
                            <Link href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                <Settings className='inline mr-2 h-5 w-5 text-gray-500' />
                                Settings
                            </Link>
                            <LogoutButton onConfirm={() => router.post(route("logout"))} />
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
