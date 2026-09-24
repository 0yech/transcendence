import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
  type ChartOptions,
  type TooltipItem,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import type { PlayerStats } from '~/utils/users';
import { insetCardClass } from '~/styles/theme';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
);

type EloProgressionChartProps = {
  progression: PlayerStats['hourlyProgression'];
};

export function EloProgressionChart({ progression }: EloProgressionChartProps) {
  // 1. Obtenir l'heure actuelle arrondie à l'heure inférieure pile (ex: 15:34 -> 15:00)
  const baseDate = new Date();
  baseDate.setMinutes(0, 0, 0);

  // 2. Générer les objets des 24 dernières heures avec leur timestamp et leur label textuel
  const rollingHours = Array.from({ length: 24 }, (_, i) => {
    const d = new Date(baseDate);
    d.setHours(baseDate.getHours() - (23 - i));

    return {
      timestamp: d.getTime(),
      label: d.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
  });

  // 3. Indexer vos données réelles par leur timestamp arrondi à l'heure inférieure
  const progressionMap = new Map<number, (typeof progression)[number]>();
  progression.forEach((point) => {
    const pointDate = new Date(point.period);
    progressionMap.set(pointDate.getTime(), point);
  });

  // 4. Associer vos données aux 24 heures fixes générées
  let lastElo: number | null = null;
  let lastPts: number | null = null;

  const finalEloData = rollingHours.map((h) => {
    const point = progressionMap.get(h.timestamp);

    if (point) {
      lastElo = point.elo;
    }

    return lastElo;
  });

  const finalPointsData = rollingHours.map((h) => {
    const point = progressionMap.get(h.timestamp);
    if (point) {
      lastPts = point.elo;
    }
    return lastPts;
  });

const labels = rollingHours.map((h) => h.label);
  const data = {
    labels,
    datasets: [
      {
        label: 'Elo',
        data: finalEloData,
        borderColor: '#ec4899',
        backgroundColor: 'rgba(236, 72, 153, 0.10)',
        pointBackgroundColor: '#ec4899',
        pointBorderColor: '#ec4899',
        pointRadius: 3,
        pointHoverRadius: 5,
        borderWidth: 2,
        tension: 0.35,
        fill: true,
        yAxisID: 'yElo',
        spanGaps: false,
      },
      {
        label: 'Points Won',
        data: finalPointsData,
        borderColor: '#a78bfa',
        backgroundColor: 'rgba(167, 139, 250, 0.08)',
        pointBackgroundColor: '#a78bfa',
        pointBorderColor: '#a78bfa',
        borderDash: [5, 5],
        pointRadius: 2,
        pointHoverRadius: 4,
        borderWidth: 1,
        tension: 0.35,
        fill: false,
        yAxisID: 'yPoints',
        spanGaps: false,
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        labels: {
          color: 'rgba(255, 255, 255, 0.65)',
          font: {
            size: 12,
            weight: 600,
          },
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        callbacks: {
          label: (context: TooltipItem<'line'>) => {
            const hourObj = rollingHours[context.dataIndex];
            const point = progressionMap.get(hourObj.timestamp);

            if (!point) return '';

            if (context.dataset.yAxisID === 'yElo') {
              return `Elo: ${point.elo}`;
            }
            return `Points won: ${point.pointWon}`;
          },
          afterBody: (items: TooltipItem<'line'>[]) => {
            if (!items.length) return [];

            const hourObj = rollingHours[items[0].dataIndex];
            const point = progressionMap.get(hourObj.timestamp);

            if (!point) return [];

            return ['', `Games: ${point.games}`];
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
        ticks: {
          maxTicksLimit: 8,
          color: 'rgba(255, 255, 255, 0.45)',
          font: {
            size: 11,
            weight: 600,
          },
        },
      },
      yElo: {
        type: 'linear',
        position: 'left',
        border: {
          display: false,
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.07)',
        },
        ticks: {
          color: '#ec4899',
          font: {
            size: 11,
            weight: 600,
          },
        },
        title: {
          display: true,
          text: 'Elo',
          color: '#ec4899',
          font: {
            size: 11,
            weight: 600,
          },
        },
        beginAtZero: true,
      },
      yPoints: {
        type: 'linear',
        position: 'right',
        border: {
          display: false,
        },
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          color: '#a78bfa',
          font: {
            size: 11,
            weight: 600,
          },
        },
        title: {
          display: true,
          text: 'Points won',
          color: '#a78bfa',
          font: {
            size: 11,
            weight: 600,
          },
        },
        beginAtZero: true,
      },
    },
  };

  if (!progression.length) {
    return (
      <div className={`${insetCardClass} mt-5 p-8 text-center opacity-60`}>
        No rating history yet.
      </div>
    );
  }

  return (
    <div className={`${insetCardClass} mt-5 p-4 sm:p-5`}>
      <div className="h-64 sm:h-80">
        <Line data={data} options={options} />
      </div>
    </div>
  );
}
