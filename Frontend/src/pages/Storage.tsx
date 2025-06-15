import "../App.css";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

function Storage() {
  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        background: "#fff",
        color: "#222",
        overflow: "hidden",
      }}
    >
      <Sidebar />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          height: "100vh",
          overflow: "hidden",
        }}
      >
        <Header />
        <div
          style={{
            flex: 1,
            overflow: "auto",
            padding: 16,
          }}
        >
          <h1 className="text-2xl font-bold mb-4">Storage</h1>
          {/* Storage page content here */}
        </div>
      </div>
    </div>
  );
}

export default Storage;
