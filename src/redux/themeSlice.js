// redux
import { createSlice } from "@reduxjs/toolkit";

const getInitialTheme = () => {
    if (typeof window !== "undefined" && window.localStorage) {
        const saved = localStorage.getItem("theme");
        if (saved === "light" || saved === "dark") {
            return saved;
        }
        if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
            return "dark";
        }
    }
    return "light";
};

const theme = createSlice({
    name: "theme",
    initialState: {
        currentTheme: getInitialTheme(),
    },
    reducers: {
        toggleTheme: (state) => {
            state.currentTheme = state.currentTheme === "dark" ? "light" : "dark";
            if (typeof window !== "undefined" && window.localStorage) {
                localStorage.setItem("theme", state.currentTheme);
            }
        },
        setTheme: (state, action) => {
            state.currentTheme = action.payload;
            if (typeof window !== "undefined" && window.localStorage) {
                localStorage.setItem("theme", state.currentTheme);
            }
        },
    },
});

export const { toggleTheme, setTheme } = theme.actions;
export default theme.reducer;

// selectors
export const selectTheme = (state) => state.theme.currentTheme;

