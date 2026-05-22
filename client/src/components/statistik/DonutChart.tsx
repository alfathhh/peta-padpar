import React, { useMemo, useState } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Sector, Tooltip } from 'recharts';
import type { PieSectorDataItem } from 'recharts/types/polar/Pie';
import { cn } from '../../lib/cn';

interface DonutChartDatum {
  name: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutChartDatum[];
  title?: string;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ payload: DonutChartDatum }>;
  total: number;
}

function ChartTooltip({ active, payload, total }: TooltipProps) {
  if (!active || !payload?.length) return null;

  const item = payload[0].payload;
  const percent = total > 0 ? Math.round((item.value / total) * 100) : 0;

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white px-3 py-2 text-xs shadow-pop">
      <p className="font-semibold text-neutral-900">{item.name}</p>
      <p className="mt-1 text-neutral-600">{item.value} unit</p>
      <p className="text-neutral-500">{percent}% dari total</p>
    </div>
  );
}

function ActiveSlice(props: PieSectorDataItem) {
  return (
    <Sector
      {...props}
      outerRadius={(props.outerRadius as number) + 6}
      innerRadius={props.innerRadius as number}
      cornerRadius={8}
    />
  );
}

export default function DonutChart({ data, title }: DonutChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const total = useMemo(() => data.reduce((sum, item) => sum + item.value, 0), [data]);

  if (data.length === 0) {
    return (
      <div className="flex min-h-36 items-center justify-center rounded-xl border border-dashed border-neutral-200 bg-neutral-50 text-center text-sm text-neutral-500">
        Belum ada infrastruktur untuk wilayah ini.
      </div>
    );
  }

  return (
    <div>
      {title && (
        <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
          {title}
        </p>
      )}

      <div className="mt-4 grid gap-4 sm:grid-cols-[148px,1fr] sm:items-center">
        <div className="relative mx-auto h-36 w-36">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={44}
                outerRadius={64}
                paddingAngle={2}
                dataKey="value"
                strokeWidth={0}
                activeIndex={activeIndex ?? undefined}
                activeShape={ActiveSlice}
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                onClick={(_, index) => setActiveIndex(current => (current === index ? null : index))}
              >
                {data.map((entry, index) => {
                  const faded = activeIndex !== null && activeIndex !== index;
                  return (
                    <Cell
                      key={entry.name}
                      fill={entry.color}
                      fillOpacity={faded ? 0.22 : 1}
                      stroke={faded ? 'transparent' : '#ffffff'}
                      strokeWidth={faded ? 0 : 2}
                      style={{ cursor: 'pointer', transition: 'opacity 180ms ease' }}
                    />
                  );
                })}
              </Pie>
              <Tooltip
                cursor={false}
                offset={12}
                position={{ x: 18, y: 18 }}
                content={<ChartTooltip total={total} />}
                wrapperStyle={{ outline: 'none', zIndex: 20 }}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <div className="rounded-full bg-white/92 px-3 py-2 text-center shadow-sm backdrop-blur-sm">
              <p className="font-display text-2xl font-bold leading-none text-neutral-950">{total}</p>
              <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">unit</p>
            </div>
          </div>
        </div>

        <div className="min-w-0 space-y-2">
          {data.slice(0, 6).map((item, index) => {
            const percent = total > 0 ? Math.round((item.value / total) * 100) : 0;
            const active = activeIndex === index;
            const faded = activeIndex !== null && activeIndex !== index;

            return (
              <button
                key={item.name}
                type="button"
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                onClick={() => setActiveIndex(current => (current === index ? null : index))}
                className={cn(
                  'flex w-full min-w-0 items-center gap-2 rounded-xl px-2 py-1.5 text-left transition-all duration-200',
                  active ? 'bg-neutral-50' : 'hover:bg-neutral-50',
                  faded && 'opacity-45',
                )}
              >
                <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="min-w-0 flex-1 truncate text-xs font-medium text-neutral-600">{item.name}</span>
                <span className="text-xs font-semibold text-neutral-900">{percent}%</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
