// Chart.js line chart wrapper (registered once, offline-safe).

import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js';
import {Line} from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

export function ChartBlock({
  labels,
  values,
  label,
  color,
  unit,
}: {
  labels: string[];
  values: number[];
  label: string;
  color: string;
  unit?: string;
}) {
  const data = {
    labels,
    datasets: [
      {
        label,
        data: values,
        borderColor: color,
        backgroundColor: `${color}26`,
        fill: true,
        tension: 0.35,
        pointRadius: 3,
        pointHoverRadius: 5,
        pointBackgroundColor: color,
        borderWidth: 2,
      },
    ],
  };
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {display: false},
      tooltip: {
        callbacks: {
          label: (ctx: {parsed: {y: number | null}}) =>
            ` ${new Intl.NumberFormat('pt-PT', {maximumFractionDigits: 1}).format(ctx.parsed.y ?? 0)}${unit ? ` ${unit}` : ''}`,
        },
      },
    },
    scales: {
      x: {grid: {display: false}, ticks: {color: '#94a3b8', font: {size: 11}}},
      y: {grid: {color: '#f1f5f9'}, ticks: {color: '#94a3b8', font: {size: 11}}},
    },
  };
  return (
    <div className="h-56 w-full">
      <Line data={data} options={options} />
    </div>
  );
}
