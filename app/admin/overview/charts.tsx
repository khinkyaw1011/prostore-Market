'use client';

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const Charts = ({
  data: { salesData },
}: {
  data: {
    salesData: { date: string; totalSales: number }[];
  };
}) => {
  // Highlight the best day in teal, the rest in black (glassy dashboard style)
  const maxSales = Math.max(0, ...salesData.map((d) => d.totalSales));

  return (
    <ResponsiveContainer width='100%' height={350}>
      <BarChart data={salesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid stroke='rgb(255 255 255 / 0.7)' strokeDasharray='4 4' vertical={false} />
        <XAxis dataKey='date' stroke='#6b6257' fontSize={12} tickLine={false} axisLine={false} />
        <YAxis
          stroke='#2a9d8f'
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip
          cursor={{ fill: 'rgb(255 255 255 / 0.35)' }}
          contentStyle={{
            background: 'rgb(255 255 255 / 0.75)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgb(255 255 255 / 0.9)',
            borderRadius: 12,
          }}
          formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Sales']}
        />
        <Bar dataKey='totalSales' radius={[8, 8, 0, 0]} maxBarSize={36}>
          {salesData.map((entry) => (
            <Cell
              key={entry.date}
              fill={entry.totalSales === maxSales ? '#6b6257' : '#2a9d8f'}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default Charts;
