import React from "react";
import { NavLink } from "react-router-dom";

function Sidebar() {
const navItems = [
{ name: "Home", path: "/home" },
{ name: "Files", path: "/files" },
{ name: "Analytics", path: "/analytics" },
{ name: "Settings", path: "/settings" },
];

const handleLogout = () => {
// You can clear tokens, session, or redirect here
console.log("Logged out");
};

return (
<div className="w-64 bg-gray-100 dark:bg-gray-900 p-4 h-screen hidden md:flex flex-col justify-between">
    {/* Top Section */}
    <div>
    <h2 className="text-xl font-bold mb-6">AcceleronLabs</h2>
    <nav className="space-y-4">
        {navItems.map((item) => (
        <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
            `block px-3 py-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
                isActive ? "bg-gray-300 dark:bg-gray-700 font-semibold" : ""
            }`
            }
        >
            {item.name}
        </NavLink>
        ))}
    </nav>
    </div>

    {/* Logout Button at the Bottom */}
    <button
    onClick={handleLogout}
    className="mt-6 px-3 py-2 rounded bg-red-500 text-white hover:bg-red-600"
    >
    Logout
    </button>
</div>
);
}

export default Sidebar;
