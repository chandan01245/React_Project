import "../App.css";
import Sidebar from "../components/Sidebar";

function Network() {
    return (
        <div className="flex h-screen w-screen bg-white text-black transition-colors duration-300 overflow-hidden">
        <Sidebar />
        <div>
        <h1 className="text-2xl font-bold mb-4">Network</h1>
        {/* Network page content here */}
        </div>
        </div>
    );
}

export default Network;
