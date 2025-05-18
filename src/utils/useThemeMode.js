import { useState, useMemo } from "react";
import { getMuiTheme } from "../theme/muiTheme";

export default function useThemeMode(defaultMode = "dark") {
  const [mode, setMode] = useState(defaultMode);
  const theme = useMemo(() => getMuiTheme(mode), [mode]);
  const toggleMode = () =>
    setMode((prev) => (prev === "dark" ? "light" : "dark"));
  return { mode, theme, toggleMode };
}
