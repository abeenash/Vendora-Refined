import { useEffect, useState } from "react";
import { router } from "@inertiajs/react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  //on small screens the sidebar is a drawer: close it after navigating
  useEffect(() => router.on("navigate", () => setSidebarOpen(false)), []);

  return (
    // the page itself never scrolls sideways; only <main> scrolls, so the sidebar stays put
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex-1 min-w-0 flex flex-col">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-auto bg-gray-100 p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
