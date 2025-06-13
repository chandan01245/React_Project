import "../App.css";
import Sidebar from "../components/Sidebar";

function Storage() {
  return (
    <div className="flex h-screen w-screen bg-white text-black transition-colors duration-300 overflow-hidden">
      <Sidebar />
      <div>
        <h1 className="text-2xl font-bold mb-4">Storage</h1>
        {/* Storage page content here */}
      </div>
    </div>
  );
}

export default Storage;
