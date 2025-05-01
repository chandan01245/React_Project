import Sidebar from "../Components/Sidebar";

function Home(){
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Home Page</h1>

      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">User Role</h2>
        <p className="text-gray-700">
          {localStorage.getItem("user_role") || "No user role found"}
        </p>
      </div>

      {localStorage.getItem("user_role") === "admin" && (
        <div className="flex flex-wrap gap-6">
          <div className="flex h-screen w-screen bg-white text-black transition-colors duration-300 overflow-hidden">
            <Sidebar />
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
