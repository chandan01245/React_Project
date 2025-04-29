import { createContext } from "react";

export enum Theme {
    Light = "light",
    Dark = "dark",
}

export const ThemeContext = createContext<ThemeContextType>({
    theme: Theme.Light,
    setTheme: () => {},
});

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}
