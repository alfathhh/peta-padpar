import React from 'react';
import {
  BarChart as RechartsBarChart,
  Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

/**
 * BarChart — perbandingan nilai statistik.
 * Pakai prop schema: data: { name, nilai, satuan? }
 * Default export agar bisa diimport sebagai: import BarChart from './BarChart'
 *
 * Fix: sebelumnya named export `export function BarChart` dengan schema
 * berbeda {label, value}. Sekarang default export dengan schema {name, nilai, satuan}.
 */

interface BarChartProps {
  data: { name: string; nilai: number; satuan?: string }[];
  title?: string;
}

// Palet warna primary + accent dari design system (PRD §6.1)
const CHART_COLORS = ['#0284c7', '#38bdf8', '#f59e0b', '#7dd3fc', '#fcd34d'];

export default function BarChart({ data, title }: BarChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-36 text-neutral-400 text-xs">
        Tidak ada data
      </div>
    );
  }

  return (
    <div>
      {title && (
        <h4 className="text-xs font-semibold text-neutral-700 mb-3 uppercase tracking-wide">
          {title}
        </h4>
      )}
      <ResponsiveContainer width="100%" height={150}>
        <RechartsBarChart
          data={data}
          margin={{ top: 4, right: 4, bottom: 4, left: 0 }}
          barCategoryGap="30%"
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 10, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
            width={36}
            tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)}
          />
          <Tooltip
            contentStyle={{
              fontSize: 12,
              borderRadius: 10,
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
              padding: '8px 12px',
            }}
            formatter={(v: number, _n: string, props: { payload?: { satuan?: string } }) => [
              `${v.toLocaleString('id-ID')}${props.payload?.satuan ? ` ${props.payload.satuan}` : ''}`,
              'Nilai',
            ]}
            cursor={{ fill: '#f1f5f9' }}
          />
          <Bar dataKey="nilai" radius={[6, 6, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={`cell-${i}`} fill={CHART_COLORS[i % CHART_COLORS.length]} />
            ))}
          </Bar>
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}
