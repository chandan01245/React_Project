import Sidebar from "../Components/Sidebar";

function Home() {
  return (
    <div className="flex h-screen w-screen bg-white text-black transition-colors duration-300 overflow-hidden">
      <Sidebar />
      <div className="flex flex-col w-full h-screen overflow-hidden">
        <div className="flex flex-col flex-1 p-4 overflow-hidden">
          <div className="flex-1 overflow-auto">
            {localStorage.getItem("user_group") === "admin" ? (
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            ) : (
              <h1 className="text-2xl font-bold">User Dashboard</h1>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
