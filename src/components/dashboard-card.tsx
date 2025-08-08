"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardCardProps {
  title: string;
  value: string | number | null;
  change?: number | null;
  unit?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function DashboardCard({
  title,
  value,
  change,
  unit = "kg",
  icon,
  className,
}: DashboardCardProps) {
  const format_change = (change: number) => {
    const is_positive = change > 0;
    const formatted = Math.abs(change).toFixed(1);
    return { formatted, is_positive };
  };

  return (
    <Card
      className={cn("transition-all duration-200 hover:shadow-md", className)}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {value !== null ? `${value} ${unit}` : "No data"}
        </div>
        {change !== null && change !== undefined && (
          <div className="flex items-center text-xs text-muted-foreground mt-1">
            {change === 0 ? (
              <>
                <Minus className="h-3 w-3 mr-1" />
                <span>No change</span>
              </>
            ) : (
              <>
                {change > 0 ? (
                  <TrendingUp className="h-3 w-3 mr-1 text-red-600 dark:text-red-400" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1 text-green-600 dark:text-green-400" />
                )}
                <span
                  className={cn(
                    change > 0
                      ? "text-red-600 dark:text-red-400"
                      : "text-green-600 dark:text-green-400"
                  )}
                >
                  {format_change(change).formatted} {unit}
                </span>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
