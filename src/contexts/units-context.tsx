"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { WeightUnit } from "@/types";

interface UnitsContextType {
  unit: WeightUnit;
  set_unit: (unit: WeightUnit) => void;
  convert_weight: (
    weight: number,
    from_unit: WeightUnit,
    to_unit: WeightUnit
  ) => number;
  format_weight: (weight: number, target_unit?: WeightUnit) => string;
  convert_to_display: (weight_in_kg: number) => number;
  convert_to_storage: (weight_in_current_unit: number) => number;
  mounted: boolean;
}

const UnitsContext = createContext<UnitsContextType | undefined>(undefined);

const KG_TO_LBS_MULTIPLIER = 2.20462;

interface UnitsProviderProps {
  children: ReactNode;
}

export function UnitsProvider({ children }: UnitsProviderProps) {
  const [unit, set_unit_state] = useState<WeightUnit>("kg");
  const [mounted, set_mounted] = useState(false);

  // Load unit preference from localStorage on mount
  useEffect(() => {
    const saved_unit = localStorage.getItem("weight-unit") as WeightUnit;
    if (saved_unit && (saved_unit === "kg" || saved_unit === "lbs")) {
      set_unit_state(saved_unit);
    }
    set_mounted(true);
  }, []);

  const set_unit = useCallback((new_unit: WeightUnit) => {
    set_unit_state(new_unit);
    localStorage.setItem("weight-unit", new_unit);
  }, []);

  const convert_weight = useCallback(
    (weight: number, from_unit: WeightUnit, to_unit: WeightUnit): number => {
      if (from_unit === to_unit) return weight;

      if (from_unit === "kg" && to_unit === "lbs") {
        return weight * KG_TO_LBS_MULTIPLIER;
      } else if (from_unit === "lbs" && to_unit === "kg") {
        return weight / KG_TO_LBS_MULTIPLIER;
      }

      return weight;
    },
    []
  );

  const format_weight = useCallback(
    (weight: number, target_unit?: WeightUnit): string => {
      const display_unit = target_unit || unit;
      const rounded_weight = Math.round(weight * 10) / 10;

      if (display_unit === "kg") {
        // Use comma as decimal separator for kg
        return `${rounded_weight.toFixed(1).replace(".", ",")} kg`;
      } else {
        // Use dot as decimal separator for lbs
        return `${rounded_weight.toFixed(1)} lbs`;
      }
    },
    [unit]
  );

  // Convert from storage (always kg) to current display unit
  const convert_to_display = useCallback(
    (weight_in_kg: number): number => {
      return convert_weight(weight_in_kg, "kg", unit);
    },
    [unit, convert_weight]
  );

  // Convert from current display unit to storage (always kg)
  const convert_to_storage = useCallback(
    (weight_in_current_unit: number): number => {
      return convert_weight(weight_in_current_unit, unit, "kg");
    },
    [unit, convert_weight]
  );

  const value = {
    unit,
    set_unit,
    convert_weight,
    format_weight,
    convert_to_display,
    convert_to_storage,
    mounted,
  };

  return (
    <UnitsContext.Provider value={value}>{children}</UnitsContext.Provider>
  );
}

export function useUnits() {
  const context = useContext(UnitsContext);
  if (context === undefined) {
    throw new Error("useUnits must be used within a UnitsProvider");
  }
  return context;
}
