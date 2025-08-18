"use client";

import { Button } from "@/components/ui/button";
import { useUnits } from "@/contexts/units-context";

export function UnitToggle() {
  const { unit, set_unit } = useUnits();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => set_unit(unit === "kg" ? "lbs" : "kg")}
      className="transition-colors text-xs font-medium min-w-[45px]"
    >
      {unit.toUpperCase()}
    </Button>
  );
}
