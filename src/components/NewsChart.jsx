import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function NewsChart({ articles, onFilterChange }) {
  const techCount = (articles.technology || []).length;
  const sciCount = (articles.science || []).length;

  const data = {
    labels: ['Technology', 'Science'],
    datasets: [
      {
        data: [techCount, sciCount],
        backgroundColor: ['rgba(34,211,238,0.75)', 'rgba(168,85,247,0.75)'],
        borderColor: ['#22d3ee', '#a855f7'],
        borderWidth: 2,
        hoverBackgroundColor: ['rgba(34,211,238,0.95)', 'rgba(168,85,247,0.95)'],
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#94a3b8',
          font: { family: 'DM Sans', size: 12 },
          padding: 20,
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: '#0a1628',
        borderColor: '#22d3ee',
        borderWidth: 1,
        titleColor: '#22d3ee',
        bodyColor: '#94a3b8',
      },
    },
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        onFilterChange(index === 0 ? 'technology' : 'science');
      }
    },
  };

  return (
    <div className="glass-card p-5">
      <h3 className="font-display font-semibold text-white mb-4 flex items-center gap-2">
        <span>🗞️</span> Articles Distribution
      </h3>
      <div style={{ height: '240px' }}>
        {techCount + sciCount > 0 ? (
          <Doughnut data={data} options={options} />
        ) : (
          <div className="h-full flex items-center justify-center text-slate-500 text-sm">
            Loading chart data...
          </div>
        )}
      </div>
      <p className="text-center text-slate-500 text-xs mt-3">Click a slice to filter the news sections</p>
    </div>
  );
}
