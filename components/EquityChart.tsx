"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function EquityChart({ data }: { data: { date: string; equity: number }[] }) {
  const formatted = data.map((d) => ({
    ...d,
    label: new Date(d.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }),
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={formatted}>
        <CartesianGrid strokeDasharray="3 3" stroke="#232E3A" />
        <XAxis dataKey="label" stroke="#8A99A8" fontSize={12} tickLine={false} />
        <YAxis stroke="#8A99A8" fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{
            backgroundColor: "#131A22",
            border: "1px solid #232E3A",
            borderRadius: "8px",
            fontSize: "12px",
          }}
        />
        <Line
          type="monotone"
          dataKey="equity"
          stroke="#3FA9F5"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
