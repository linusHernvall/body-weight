"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useUnits } from "@/contexts/units-context";

interface DashboardCardProps {
  title: string;
  value: string | number | null;
  change?: number | null;
  icon?: React.ReactNode;
  className?: string;
}

export function DashboardCard({
  title,
  value,
  change,
  icon,
  className,
}: DashboardCardProps) {
  const { convert_to_display, format_weight } = useUnits();
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
              `${change > 0 ? "+ " : change < 0 ? "- " : ""}${format_weight(
                Math.abs(convert_to_display(change))
              )}`
            : // Show regular value
            value !== null
            ? format_weight(convert_to_display(value as number))
            : "No data"}
        </div>
      </CardContent>
    </Card>
  );
}
