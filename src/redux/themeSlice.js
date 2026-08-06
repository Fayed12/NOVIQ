// redux
import { createSlice } from "@reduxjs/toolkit";

const getInitialTheme = () => {
    if (typeof window !== "undefined" && window.localStorage) {
        return localStorage.getItem("theme") || "dark";
    }
    return "dark";
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
