// @ts-nocheck
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { CheckCircle, XCircle, Database } from "lucide-react";
import type { ProcessingResult } from "./Dashboard";

interface ResultsChartProps {
  data: ProcessingResult;
}

export function ResultsChart({ data }: ResultsChartProps) {
  const chartData = [
    { name: "Success", value: data.success, color: "#10b981" },
    { name: "Failure", value: data.failure, color: "#ef4444" },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-center">Processing Results</h2>

      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
          <div>
            <div className="text-sm text-gray-600">Success</div>
            <div className="text-green-600">{data.success}</div>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
          <XCircle className="h-8 w-8 text-red-600" />
          <div>
            <div className="text-sm text-gray-600">Failure</div>
            <div className="text-red-600">{data.failure}</div>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <Database className="h-8 w-8 text-blue-600" />
          <div>
            <div className="text-sm text-gray-600">Total</div>
            <div className="text-blue-600">{data.total}</div>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
