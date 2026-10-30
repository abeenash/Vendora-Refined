import { useEffect, useState } from "react";

// Theme preference: "light" | "dark" | "system" (follow the OS).
// Saved per browser in localStorage; the colours themselves live in resources/css/theme.css.
// app.blade.php runs the same logic inline before the page paints, so there is no white flash.

const KEY = "theme";
const EVENT = "vendora:theme";
const media = () => window.matchMedia("(prefers-color-scheme: dark)");

export function getThemePreference() {
    try {
        const saved = localStorage.getItem(KEY);
        return saved === "light" || saved === "dark" || saved === "system" ? saved : "system";
    } catch {
        return "system";
    }
}

export function resolveTheme(preference) {
    return preference === "system" ? (media().matches ? "dark" : "light") : preference;
}

function apply(preference, animate) {
    const root = document.documentElement;
    if (animate) {
        root.classList.add("theme-transition");
        setTimeout(() => root.classList.remove("theme-transition"), 250);
    }
    root.classList.toggle("dark", resolveTheme(preference) === "dark");
}

export function setThemePreference(preference) {
    try {
        localStorage.setItem(KEY, preference);
    } catch {
        //private mode / storage blocked: the choice just won't be remembered
    }
    apply(preference, true);
    window.dispatchEvent(new CustomEvent(EVENT, { detail: preference }));
}

// [preference, setPreference, resolved ("light" | "dark")]
export function useTheme() {
    const [preference, setPreference] = useState(getThemePreference);
    const [systemDark, setSystemDark] = useState(() => media().matches);

    useEffect(() => {
        const onChange = (e) => setPreference(e.detail);
        const onSystem = (e) => {
            setSystemDark(e.matches);
            if (getThemePreference() === "system") apply("system", true);
        };
        window.addEventListener(EVENT, onChange);
        media().addEventListener("change", onSystem);
        return () => {
            window.removeEventListener(EVENT, onChange);
            media().removeEventListener("change", onSystem);
        };
    }, []);

    const resolved = preference === "system" ? (systemDark ? "dark" : "light") : preference;
    return [preference, setThemePreference, resolved];
}
