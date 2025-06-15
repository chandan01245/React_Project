import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function NotFound() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      // Redirect to login if the user is not authenticated
      navigate("/");
    }
  }, [navigate]);

  const handleGoBackHome = async () => {
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("email"); // Assuming email is stored in localStorage

    if (!token) {
      // Redirect to login if the user is not authenticated
      navigate("/");
      return;
    }

    try {
      // Check if 2FA is activated
      const response = await fetch("http://127.0.0.1:5000/app/2fa-status", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.is_2fa_enabled) {
          // If 2FA is activated, redirect to login
          navigate("/");
        } else {
          // If 2FA is not activated, redirect to the dashboard
          navigate("/dashboard");
        }
      } else {
        console.error("Failed to fetch 2FA status:", response.statusText);
        navigate("/"); // Redirect to login in case of an error
      }
    } catch (error) {
      console.error("Error checking 2FA status:", error);
      navigate("/"); // Redirect to login in case of an error
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">404 - Not Found</h1>
      <p>The page you are looking for does not exist.</p>
      <main className="grid min-h-full place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8">
        <div className="text-center">
          <p className="text-base font-semibold text-indigo-600">404</p>
          <h1 className="mt-4 text-5xl font-semibold tracking-tight text-balance text-gray-900 sm:text-7xl">
            Page not found
          </h1>
          <p className="mt-6 text-lg font-medium text-pretty text-gray-500 sm:text-xl/8">
            Sorry, we couldn’t find the page you’re looking for.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <button
              onClick={handleGoBackHome}
              className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Go back home
            </button>
            <a href="#" className="text-sm font-semibold text-gray-900">
              Contact support <span aria-hidden="true">&rarr;</span>
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}

export default NotFound;
