import React from "react";
import { Bar, Line } from "react-chartjs-2";
import axios from "axios";
import { useState, useEffect } from "react";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const barData = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May"],
  datasets: [
    {
      label: "Sales",
      data: [12, 19, 3, 5, 2],
      backgroundColor: "rgba(75, 192, 192, 0.6)",
    },
  ],
};

const lineData = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May"],
  datasets: [
    {
      label: "Revenue",
      data: [300, 500, 400, 700, 600],
      borderColor: "rgba(153, 102, 255, 1)",
      fill: false,
    },
  ],
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
};

const fetchUserID = async () => {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const response = await axios.get("http://127.0.0.1:5000/app/user", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(response.data);
    return response.data.user_group;
  } catch (err) {
    console.error(err);
    return null;
  }
};

const Home: React.FC = () => {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const validateToken = async () => {
      const role = await fetchUserID();
      if (role) {
        setUserRole(role);
        setIsAuthorized(true);
      }
      setIsLoading(false);
    };
    validateToken();
  }, []);

  if (isLoading) {
    return <div className="p-4">Loading...</div>;
  }

  if (!isAuthorized) {
    return <div className="p-4 text-red-600">Unauthorized. Please log in.</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Home Page</h1>
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Welcome ({userRole})</h2>
      </div>
      <div className="flex flex-wrap gap-6">
        <div className="w-64 h-48">
          <h2 className="text-xl font-semibold mb-2">Sales Bar Chart</h2>
          <Bar data={barData} options={chartOptions} />
        </div>

        <div className="w-64 h-48">
          <h2 className="text-xl font-semibold mb-2">Revenue Line Chart</h2>
          <Line data={lineData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};

export default Home;
