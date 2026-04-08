import { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';

const yearData = [
  { year: '2020 - 21', total: 1600, admitted: 1200, rejected: 400, vacancy: 80 },
  { year: '2021 - 22', total: 1900, admitted: 1500, rejected: 400, vacancy: 60 },
  { year: '2022 - 23', total: 2000, admitted: 1500, rejected: 500, vacancy: 45 },
  { year: '2023 - 24', total: 2100, admitted: 1600, rejected: 500, vacancy: 40 },
  { year: '2024 - 25', total: 2200, admitted: 1700, rejected: 450, vacancy: 50 },
  { year: '2025 - 26', total: 2300, admitted: 1800, rejected: 500, vacancy: 60 },
];

const KPI_STYLES = {
  'Total applications': { ring: 'border-sky-500', text: 'text-sky-500' },
  Admitted: { ring: 'border-lime-500', text: 'text-lime-500' },
  'Rejected /not turned up': { ring: 'border-rose-500', text: 'text-rose-500' },
  Vacancy: { ring: 'border-zinc-500', text: 'text-zinc-500' },
};

const BAR = {
  total: 'bg-sky-500',
  admitted: 'bg-lime-500',
  rejected: 'bg-rose-500',
};

/**
 * ✅ 100% Tailwind-only trick:
 * - We predefine percentage classes (0%..100%) in code so Tailwind JIT includes them.
 * - Then pick nearest bucket class at runtime (NO inline styles).
 */
const PCT_STEP = 2; // smaller = closer to exact (2% looks almost exact)
const PCT_CLASSES = Array.from({ length: Math.floor(100 / PCT_STEP) + 1 }, (_, i) => {
  const pct = i * PCT_STEP;
  return `h-[${pct}%]`;
});
const BOTTOM_CLASSES = Array.from({ length: Math.floor(100 / PCT_STEP) + 1 }, (_, i) => {
  const pct = i * PCT_STEP;
  return `bottom-[${pct}%]`;
});

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function nearestPctIndex(pct) {
  const v = clamp(pct, 0, 100);
  const idx = Math.round(v / PCT_STEP);
  return clamp(idx, 0, PCT_CLASSES.length - 1);
}

function heightClassFromPct(pct) {
  return PCT_CLASSES[nearestPctIndex(pct)];
}

function bottomClassFromPct(pct) {
  return BOTTOM_CLASSES[nearestPctIndex(pct)];
}

const Overview = () => {
  const { year, applications } =
    useOutletContext() ?? { year: yearData[yearData.length - 1].year, applications: [] };

  const [currentIndex, setCurrentIndex] = useState(() => {
    const idx = yearData.findIndex((y) => y.year === year);
    return idx >= 0 ? idx : yearData.length - 1;
  });

  const [visibleYears, setVisibleYears] = useState(3);
  const [hoveredYear, setHoveredYear] = useState(null);

  useEffect(() => {
    const idx = yearData.findIndex((y) => y.year === year);
    if (idx >= 0) setCurrentIndex(idx);
  }, [year]);

  const currentYear = yearData[currentIndex];

  const liveMetrics = useMemo(() => {
    if (!applications || !applications.length) return null;
    const total = applications.length;
    const admitted = applications.filter((a) => a.status === 'Accepted').length;
    const rejected = applications.filter((a) => ['Rejected', 'Not joined'].includes(a.status)).length;
    const vacancy = Math.max(total - admitted - rejected, 0);

    return [
      { label: 'Total applications', value: total },
      { label: 'Admitted', value: admitted },
      { label: 'Rejected /not turned up', value: rejected },
      { label: 'Vacancy', value: vacancy },
    ];
  }, [applications]);

  const metrics =
    liveMetrics ?? [
      { label: 'Total applications', value: currentYear.total },
      { label: 'Admitted', value: currentYear.admitted },
      { label: 'Rejected /not turned up', value: currentYear.rejected },
      { label: 'Vacancy', value: currentYear.vacancy },
    ];

  const chartStart = currentIndex;
  const chartEnd = Math.min(yearData.length, chartStart + visibleYears);
  const adjustedChartStart = Math.max(0, chartEnd - visibleYears);
  const chartYears = yearData.slice(adjustedChartStart, chartEnd);

  const allValues = chartYears.flatMap((y) => [y.total, y.admitted, y.rejected]);
  const maxDataVal = Math.max(...allValues, 0);
  const step = 500;
  const yMax = Math.max(Math.ceil(maxDataVal / step) * step, 1000);

  const yTicks = [];
  for (let i = 0; i <= yMax; i += step) yTicks.push(i);

  const pctNum = (val) => (yMax ? (val / yMax) * 100 : 0);

  return (
    <div className="rounded-lg bg-white p-8 font-sans shadow-sm">
      {/* YEAR NAV */}
      <div className="mb-10 flex items-center justify-center text-gray-500">
        <button
          className="px-5 text-4xl font-light text-gray-400 disabled:text-gray-200"
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
        >
          ‹
        </button>

        <span className="min-w-[180px] text-center text-3xl font-light">
          {currentYear.year}
        </span>

        <button
          className="px-5 text-4xl font-light text-gray-400 disabled:text-gray-200"
          disabled={currentIndex === yearData.length - 1}
          onClick={() => setCurrentIndex((i) => Math.min(yearData.length - 1, i + 1))}
        >
          ›
        </button>
      </div>

      {/* KPI */}
      <div className="mb-12 flex flex-wrap justify-around gap-5">
        {metrics.map((m) => {
          const s = KPI_STYLES[m.label] ?? { ring: 'border-gray-400', text: 'text-gray-700' };
          return (
            <div
              key={m.label}
              className={`flex h-40 w-40 flex-col items-center justify-center rounded-full border-8 bg-white ${s.ring}`}
            >
              <div className={`text-4xl font-semibold ${s.text}`}>{m.value}</div>
              <div className="px-2 text-center text-sm text-gray-500">{m.label}</div>
            </div>
          );
        })}
      </div>

      {/* ANALYTICS HEADER */}
      <div className="relative mb-10 text-center">
        <h2 className="text-2xl font-normal text-gray-600">Analytics</h2>
        <div className="absolute right-0 top-1/2 -translate-y-1/2 text-sm text-gray-500">
          Show data for
          <select
            className="ml-2 rounded border px-3 py-1 text-gray-600"
            value={visibleYears}
            onChange={(e) => setVisibleYears(Number(e.target.value))}
          >
            <option value={1}>1 years</option>
            <option value={3}>3 years</option>
            <option value={5}>5 years</option>
          </select>
        </div>
      </div>

      {/* CHART */}
      <div className="relative pb-8 pl-12">
        <div className="absolute left-[-80px] top-1/2 -translate-y-1/2 -rotate-90 text-xs text-gray-400">
          Number of applications
        </div>
        <div className="absolute bottom-[-10px] right-0 text-xs text-gray-400">
          Academic year
        </div>

        <div className="relative h-[300px] border-b">
          {/* Y GRID */}
          {yTicks.map((tick) => {
            const bottomPct = pctNum(tick);
            return (
              <div key={tick} className={`absolute left-0 w-full ${bottomClassFromPct(bottomPct)}`}>
                <div className="absolute -left-10 w-8 translate-y-1/2 text-right text-xs text-gray-400">
                  {tick}
                </div>
                <div className="border-t border-gray-100" />
              </div>
            );
          })}

          {/* BARS */}
          <div className="relative z-10 flex h-full items-end justify-around">
            {chartYears.map((g) => (
              <div
                key={g.year}
                className="relative flex h-full w-1/5 items-end justify-center"
                onMouseEnter={() => setHoveredYear(g.year)}
                onMouseLeave={() => setHoveredYear(null)}
              >
                {hoveredYear === g.year && (
                  <div className="absolute bottom-full z-50 mb-2 rounded border bg-white p-3 text-xs shadow-lg">
                    <div>Total applications received : {g.total}</div>
                    <div>Admitted : {g.admitted}</div>
                    <div>Rejected/not turned up : {g.rejected}</div>
                  </div>
                )}

                <div className="flex h-full items-end gap-1">
                  <div
                    className={`w-[18px] rounded-t ${BAR.total} ${heightClassFromPct(pctNum(g.total))}`}
                  />
                  <div
                    className={`w-[18px] rounded-t ${BAR.admitted} ${heightClassFromPct(
                      pctNum(g.admitted)
                    )}`}
                  />
                  <div
                    className={`w-[18px] rounded-t ${BAR.rejected} ${heightClassFromPct(
                      pctNum(g.rejected)
                    )}`}
                  />
                </div>

                <div className="absolute -bottom-6 whitespace-nowrap text-sm text-gray-500">
                  {g.year}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* LEGEND */}
        <div className="mt-10 flex justify-center gap-8 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 bg-sky-500" /> Total applications
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 bg-lime-500" /> Admitted
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 bg-rose-500" /> Rejected/not turned up
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
