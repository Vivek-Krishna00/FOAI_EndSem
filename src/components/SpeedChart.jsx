import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function SpeedChart({ speedHistory }) {
  const labels = speedHistory.map((entry) => entry.time);
  const data = {
    labels,
    datasets: [
      {
        label: 'ISS Speed (km/h)',
        data: speedHistory.map((entry) => entry.speed),
        borderColor: '#22d3ee',
        backgroundColor: 'rgba(34,211,238,0.11)',
        borderWidth: 2,
        pointRadius: 3,
        pointBackgroundColor: '#22d3ee',
        fill: true,
        tension: 0.35,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0a1628',
        borderColor: '#22d3ee',
        borderWidth: 1,
        titleColor: '#22d3ee',
        bodyColor: '#cbd5e1',
        callbacks: {
          label: (context) => `${context.parsed.y.toLocaleString()} km/h`,
        },
      },
    },
    scales: {
      x: {
        ticks: { color: '#94a3b8', font: { family: 'JetBrains Mono', size: 10 } },
        grid: { color: 'rgba(255,255,255,0.06)' },
      },
      y: {
        ticks: {
          color: '#94a3b8',
          font: { family: 'JetBrains Mono', size: 10 },
          callback: (value) => `${value.toLocaleString()}`,
        },
        grid: { color: 'rgba(255,255,255,0.06)' },
      },
    },
  };

  return (
    <div className="glass-card p-5">
      <h3 className="font-display font-semibold text-white mb-4 flex items-center gap-2">
        <span>📈</span> Speed History
      </h3>
      <div className="h-[240px]">
        {speedHistory.length > 1 ? (
          <Line data={data} options={options} />
        ) : (
          <div className="h-full flex items-center justify-center text-slate-500 text-sm">
            Waiting for speed data...
          </div>
        )}
      </div>
    </div>
  );
}
