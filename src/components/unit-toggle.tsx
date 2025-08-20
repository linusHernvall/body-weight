"use client";

import { useUnits } from "@/contexts/units-context";

export function UnitToggle() {
  const { unit, set_unit } = useUnits();

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        set_unit(unit === "kg" ? "lbs" : "kg");
        (e.currentTarget as HTMLButtonElement).blur();
      }}
      className="transition-colors text-xs font-medium w-10 h-10 rounded-md flex justify-center items-center focus:outline-none focus:ring-0 focus-visible:ring-0 md:hover:bg-muted"
    >
      {unit.toUpperCase()}
    </button>
  );
}
