import Sidebar from "../components/Sidebar";
import "../App.css";

function FileSystem() {
    return (
        <div className="flex h-screen w-screen bg-white text-black transition-colors duration-300 overflow-hidden">
        <Sidebar />
        </div>
    );
}

export default FileSystem;
