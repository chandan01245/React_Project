import "../App.css";
import Sidebar from "../components/Sidebar";

function Disk() {
  return (
    <div className="flex h-screen w-screen bg-white text-black transition-colors duration-300 overflow-hidden">
      <Sidebar />
      <div>
        <h1 className="text-2xl font-bold mb-4">Disk</h1>
        {/* Disk page content here */}
      </div>
    </div>
  );
}

export default Disk;
