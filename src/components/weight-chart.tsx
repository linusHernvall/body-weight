"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Weight } from "@/types";
import { format_date, format_weight_value } from "@/lib/utils";

interface WeightChartProps {
  weights: Weight[];
  goal_weight: number | null;
}

export function WeightChart({ weights, goal_weight }: WeightChartProps) {
  if (weights.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Weight Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <div className="text-center">
              <div className="text-4xl mb-2">📊</div>
              <p>No weight data recorded yet</p>
              <p className="text-sm">
                Start tracking your weight to see your progress
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Sort weights by date and format for chart
  const chart_data = weights
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((weight) => ({
      date: format_date(weight.date),
      weight: weight.value,
      goal: goal_weight,
    }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-primary">
            Weight: {format_weight_value(payload[0].value)}
          </p>
          {goal_weight && (
            <p className="text-muted-foreground">
              Goal: {format_weight_value(goal_weight)}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weight Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chart_data}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="date" className="text-xs" tick={{ fontSize: 12 }} />
            <YAxis
              className="text-xs"
              tick={{ fontSize: 12 }}
              domain={["dataMin - 2", "dataMax + 2"]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="weight"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
            {goal_weight && (
              <Line
                type="monotone"
                dataKey="goal"
                stroke="hsl(var(--muted-foreground))"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
