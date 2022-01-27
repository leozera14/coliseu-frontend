import { useContext } from "react";
import { ThemeContext } from "../../contexts/theme";

export function useTheme() {
  return useContext(ThemeContext);
}
