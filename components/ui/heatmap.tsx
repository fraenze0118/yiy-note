"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface HeatmapProps {
  dates: string[];
}

const MONTHS = ["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"];
const ROWS = 7; // Mon-Sun
const CELL = 12; // px

function getColor(count: number): string {
  if (count === 0) return "var(--ac)";
  if (count <= 1) return "#a7f3d0";
  if (count <= 2) return "#6ee7b7";
  if (count <= 3) return "#34d399";
  return "#10b981";
}

/** 生成指定年份的所有周（周一 ~ 周日），含每格日期和当月归属 */
function buildYearWeeks(year: number): {
  weeks: { date: string; month: number }[][]; // weeks[weekIdx][dayIdx]
  monthSpans: { month: number; startCol: number; span: number }[];
} {
  // 从该年第一个周一开始
  const jan1 = new Date(year, 0, 1);
  const firstMonday = new Date(jan1);
  const jan1Day = jan1.getDay();
  const offset = jan1Day === 0 ? -6 : 1 - jan1Day; // days to Monday
  firstMonday.setDate(jan1.getDate() + offset);

  const lastDay = new Date(year, 11, 31);
  // 扩展到最后一个周日
  const lastSunday = new Date(lastDay);
  lastSunday.setDate(lastSunday.getDate() + (7 - lastSunday.getDay()) % 7);

  const weeks: { date: string; month: number }[][] = [];
  const cursor = new Date(firstMonday);

  while (cursor <= lastSunday) {
    const week: { date: string; month: number }[] = [];
    for (let d = 0; d < ROWS; d++) {
      week.push({
        date: cursor.toISOString().slice(0, 10),
        month: cursor.getMonth(),
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }

  // 计算 monthSpans：连续同月周合并
  const monthSpans: { month: number; startCol: number; span: number }[] = [];
  let currentMonth = -1;
  let spanStart = 0;
  for (let wi = 0; wi < weeks.length; wi++) {
    // 使用周四（day 3）判定该周归属月份
    const m = weeks[wi][3].month;
    if (m !== currentMonth) {
      if (currentMonth >= 0) {
        monthSpans.push({ month: currentMonth, startCol: spanStart, span: wi - spanStart });
      }
      currentMonth = m;
      spanStart = wi;
    }
  }
  if (currentMonth >= 0) {
    monthSpans.push({ month: currentMonth, startCol: spanStart, span: weeks.length - spanStart });
  }

  return { weeks, monthSpans };
}

export function Heatmap({ dates }: HeatmapProps) {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(2026);

  const { columns, monthSpans } = useMemo(() => {
    const map = new Map<string, number>();
    for (const d of dates) {
      const day = d.slice(0, 10);
      map.set(day, (map.get(day) ?? 0) + 1);
    }

    const { weeks, monthSpans } = buildYearWeeks(year);

    // 转为带 count 的列数据
    const columns = weeks.map((week) =>
      week.map((w) => ({
        date: w.date,
        count: map.get(w.date) ?? 0,
      }))
    );

    return { columns, monthSpans };
  }, [dates, year]);

  return (
    <div>
      {/* Year nav */}
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={() => setYear((y) => y - 1)}
          disabled={year <= 2026}
          className="size-5 flex items-center justify-center rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors disabled:opacity-30"
        >
          <ChevronLeft size={14} />
        </button>
        <span className="text-sm font-medium min-w-[40px] text-center">{year}</span>
        <button
          onClick={() => setYear((y) => y + 1)}
          className="size-5 flex items-center justify-center rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors disabled:opacity-30"
          disabled={year >= currentYear}
        >
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="border-separate border-spacing-0.5">
          <thead>
            <tr>
              <th className="w-3" />
              {monthSpans.map((ms) => (
                <th
                  key={ms.startCol}
                  colSpan={ms.span}
                  className="text-[10px] text-zinc-400 font-normal text-left align-bottom pb-0.5"
                >
                  {MONTHS[ms.month]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[0, 1, 2, 3, 4, 5, 6].map((row) => {
              const label = ["一", "", "三", "", "五", "", ""][row];
              return (
                <tr key={row}>
                  <td className="size-3 text-[10px] text-zinc-400 text-center leading-3">
                    {label}
                  </td>
                  {columns.map((col, ci) => {
                    const cell = col[row];
                    return (
                      <td key={ci} className="size-3">
                        <div
                          className="size-3 rounded-sm"
                          style={{ backgroundColor: getColor(cell.count) }}
                          title={`${cell.date}: ${cell.count} 条记录`}
                        />
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
