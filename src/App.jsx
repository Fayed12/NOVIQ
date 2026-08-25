// react
import { useEffect } from "react";

// redux
import { useSelector } from "react-redux";
import { selectTheme } from "./redux/themeSlice";

// router
import { RouterProvider } from "react-router";
import router from "./router/router";

function App() {
    const currentTheme = useSelector(selectTheme);

    // Apply theme class to document root
    useEffect(() => {
        if (typeof document !== "undefined") {
            const root = document.documentElement;
            if (currentTheme === "dark") {
                root.classList.add("dark");
                root.setAttribute("data-theme", "dark");
            } else {
                root.classList.remove("dark");
                root.setAttribute("data-theme", "light");
            }
        }
    }, [currentTheme]);

    return <RouterProvider router={router} />;
}

export default App;
