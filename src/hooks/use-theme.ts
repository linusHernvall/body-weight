import { useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

export function useTheme() {
  const [theme, set_theme] = useState<Theme>("system");
  const [resolved_theme, set_resolved_theme] = useState<"dark" | "light">(
    "light"
  );

  useEffect(() => {
    // Load theme from localStorage on mount
    const saved_theme = localStorage.getItem("theme") as Theme;
    if (saved_theme) {
      set_theme(saved_theme);
    }
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;

    // Remove existing classes
    root.classList.remove("light", "dark");

    if (theme === "system") {
      const system_theme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      root.classList.add(system_theme);
      set_resolved_theme(system_theme);
    } else {
      root.classList.add(theme);
      set_resolved_theme(theme);
    }
  }, [theme]);

  useEffect(() => {
    // Listen for system theme changes
    const media_query = window.matchMedia("(prefers-color-scheme: dark)");

    const handle_change = () => {
      if (theme === "system") {
        const system_theme = media_query.matches ? "dark" : "light";
        const root = window.document.documentElement;
        root.classList.remove("light", "dark");
        root.classList.add(system_theme);
        set_resolved_theme(system_theme);
      }
    };

    media_query.addEventListener("change", handle_change);
    return () => media_query.removeEventListener("change", handle_change);
  }, [theme]);

  const set_theme_and_save = (new_theme: Theme) => {
    set_theme(new_theme);
    localStorage.setItem("theme", new_theme);
  };

  return {
    theme,
    resolved_theme,
    set_theme: set_theme_and_save,
  };
}
