import React from "react";
import { Link, useLocation } from "react-router-dom";

const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter(Boolean);

  return (
    <nav className="bg-gray-100 text-sm text-gray-600 p-3 px-6">
      <Link to="/" className="text-blue-500 hover:underline">Home</Link>
      {pathnames.map((value, index) => {
        const to = "/" + pathnames.slice(0, index + 1).join("/");
        const label = value.charAt(0).toUpperCase() + value.slice(1);
        return (
          <span key={to}>
            {" / "}
            <Link to={to} className="text-blue-500 hover:underline">{label}</Link>
          </span>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs;
