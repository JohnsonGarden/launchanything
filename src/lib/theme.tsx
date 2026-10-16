import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

const STORE_KEY = "launchanything.theme";
export type Theme = "rose" | "monochrome";

export function readTheme(value: string | null): Theme {
  return value === "monochrome" ? "monochrome" : "rose";
}

interface ThemeContextValue { theme: Theme; setTheme: (theme: Theme) => void; }
const ThemeContext = createContext<ThemeContextValue | null>(null);
export function ThemeProvider({children}:{children:ReactNode}) {
  const [theme,setTheme] = useState<Theme>(() => {
    try { return readTheme(localStorage.getItem(STORE_KEY)); }
    catch { return "rose"; }
  });
  useEffect(()=>{
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme === "monochrome" ? "dark" : "light";
    try { localStorage.setItem(STORE_KEY,theme); } catch { /* storage can be disabled */ }
  },[theme]);
  const value=useMemo(()=>({theme,setTheme}),[theme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
export function useTheme() {
  const ctx=useContext(ThemeContext);
  if(!ctx) throw new Error("useTheme requires ThemeProvider");
  return ctx;
}
