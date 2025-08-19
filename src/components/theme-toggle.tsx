"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setTheme(theme === "light" ? "dark" : "light");
        (e.currentTarget as HTMLButtonElement).blur();
      }}
      className="transition-colors w-10 h-10 rounded-md flex justify-center items-center focus:outline-none focus:ring-0 focus-visible:ring-0 md:hover:bg-muted"
    >
      {theme === "light" ? (
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      ) : (
        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      )}
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
