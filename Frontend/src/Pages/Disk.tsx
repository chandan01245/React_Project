import Sidebar from "../Components/Sidebar";
import "../App.css";


function Disk() {
    return (
        <div className="flex h-screen w-screen bg-white text-black transition-colors duration-300 overflow-hidden">
        <Sidebar />
        </div>
    );
}

export default Disk;
