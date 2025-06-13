import "../App.css";
import Sidebar from "../components/Sidebar";

function FileSystem() {
  return (
    <div className="flex h-screen w-screen bg-white text-black transition-colors duration-300 overflow-hidden">
      <Sidebar />
      <div>
        <h1 className="text-2xl font-bold mb-4">File System</h1>
        {/* File system page content here */}
      </div>
    </div>
  );
}

export default FileSystem;
