"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, format_weight_value } from "@/lib/utils";

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
          {change !== null && change !== undefined
            ? // Show change value with +/- sign as main value
              `${change > 0 ? "+ " : change < 0 ? "- " : ""}${Math.abs(
                change
              ).toFixed(1)} ${unit}`
            : // Show regular value
            value !== null
            ? format_weight_value(value as number, unit)
            : "No data"}
        </div>
      </CardContent>
    </Card>
  );
}
