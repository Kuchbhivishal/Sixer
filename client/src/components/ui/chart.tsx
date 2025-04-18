import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";

interface ChartData {
  name: string;
  value: number;
}

interface ChartProps {
  data: ChartData[];
  color: string;
}

export default function Chart({ data, color }: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`chartGradient-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.2} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis 
          dataKey="name" 
          axisLine={false} 
          tickLine={false} 
          tick={false} 
          height={0} 
        />
        <Tooltip 
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <div className="bg-white p-2 rounded-md shadow-md border border-muted text-xs">
                  <p className="font-medium">{`₹${payload[0].value.toFixed(2)}`}</p>
                </div>
              );
            }
            return null;
          }} 
        />
        <Area 
          type="monotone" 
          dataKey="value" 
          stroke={color} 
          strokeWidth={2}
          fill={`url(#chartGradient-${color.replace('#', '')})`}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
