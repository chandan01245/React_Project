import React from "react";
import { Bar, Line } from "react-chartjs-2";
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

const Home: React.FC = () => {
    return (
        <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Home Page</h1>

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
