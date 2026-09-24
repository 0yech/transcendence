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
import { cardDarkStyle, textDiscretStyle } from '~/styles/style';
import { twMerge } from 'tailwind-merge';

/*
  Chart.js needs plain color values, so the palette of app.css is repeated
  here. Keep --color-pink and --color-blue in sync with these two.
*/
const ELO_COLOR = '#ff91c8';
const POINTS_COLOR = '#777df2';
const TEXT_COLOR = 'rgba(255, 255, 255, 0.65)';
const GRID_COLOR = 'rgba(255, 255, 255, 0.07)';
const TICK_FONT = { size: 11, weight: 600 } as const;

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
  let playedOnce: boolean = false;

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
      playedOnce = true;
      return point.pointWon;
    }
    return playedOnce ? 0 : null;
  });

  const finalGamesData = rollingHours.map((h) => {
    const point = progressionMap.get(h.timestamp);
    if (point) {
      playedOnce = true;
      return point.games;
    }
    return playedOnce ? 0 : null;
  });

  const labels = rollingHours.map((h) => h.label);
  const data = {
    labels,
    datasets: [
      {
        label: 'Elo',
        data: finalEloData,
        borderColor: ELO_COLOR,
        backgroundColor: 'rgba(255, 145, 200, 0.10)',
        pointBackgroundColor: ELO_COLOR,
        pointBorderColor: ELO_COLOR,
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
        borderColor: POINTS_COLOR,
        backgroundColor: 'rgba(119, 125, 242, 0.08)',
        pointBackgroundColor: POINTS_COLOR,
        pointBorderColor: POINTS_COLOR,
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
          color: TEXT_COLOR,
          font: TICK_FONT,
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        callbacks: {
          label: (context: TooltipItem<'line'>) => {
            const dataIndex = context.dataIndex;
            if (context.dataset.yAxisID === 'yElo') {
              const elo = finalEloData[dataIndex];
              return elo === null ? '' : `Elo: ${elo}`;
            }
            const pointsWon = finalPointsData[dataIndex];
            return pointsWon === null ? '' : `Points won: ${pointsWon}`;
          },
          afterBody: (items: TooltipItem<'line'>[]) => {
            if (!items.length) return [];
            const dataIndex = items[0].dataIndex;
            const games = finalGamesData[dataIndex];
            if (games === null) {
              return [];
            }
            return ['', `Games: ${games}`];
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
          color: TEXT_COLOR,
          font: TICK_FONT,
        },
      },
      yElo: {
        type: 'linear',
        position: 'left',
        border: {
          display: false,
        },
        grid: {
          color: GRID_COLOR,
        },
        ticks: {
          color: ELO_COLOR,
          font: TICK_FONT,
        },
        title: {
          display: true,
          text: 'Elo',
          color: ELO_COLOR,
          font: TICK_FONT,
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
          color: POINTS_COLOR,
          font: TICK_FONT,
        },
        title: {
          display: true,
          text: 'Points won',
          color: POINTS_COLOR,
          font: TICK_FONT,
        },
        beginAtZero: true,
      },
    },
  };

  if (!progression.length) {
    return (
      <p className={twMerge(cardDarkStyle, textDiscretStyle, 'text-center')}>
        No rating history yet.
      </p>
    );
  }

  return (
    <div className={cardDarkStyle}>
      <div className="h-64 sm:h-80">
        <Line data={data} options={options} />
      </div>
    </div>
  );
}
