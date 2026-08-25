// react
import { useEffect } from "react";

// redux
import { useDispatch, useSelector } from "react-redux";
import { selectTheme } from "./redux/themeSlice";
import { fetchNotifications } from "./redux/slices/notificationSlice";
import { fetchBookings } from "./redux/slices/bookingSlice";

// hooks
import { useAuth } from "./hooks/useAuth";
import { useRealtime } from "./hooks/useRealtime";

// router
import { RouterProvider } from "react-router";
import router from "./router/router";

function App() {
    const dispatch = useDispatch();
    const currentTheme = useSelector(selectTheme);
    const activeTenantId = useSelector((state) => state.tenants?.selected?.id ?? null);

    // Track Supabase auth session & sync with Redux (state.auth)
    const { user } = useAuth();
    const userId = user?.id ?? null;

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

    // Realtime subscriptions for bookings, notifications, and reviews
    useRealtime({ userId, tenantId: activeTenantId });

    // Initial data load when authenticated
    useEffect(() => {
        if (userId) {
            dispatch(fetchNotifications({ filters: { user_id: userId } }));
        }
    }, [userId, dispatch]);

    // Initial data load when active tenant changes
    useEffect(() => {
        if (activeTenantId) {
            dispatch(fetchBookings({ filters: { tenant_id: activeTenantId } }));
        }
    }, [activeTenantId, dispatch]);

    return <RouterProvider router={router} />;
}

export default App;
