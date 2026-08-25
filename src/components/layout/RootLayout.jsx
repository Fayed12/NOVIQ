// react
import { Suspense, useState, useEffect } from "react";

// react-router
import { Outlet } from "react-router";

// loading & global overlay components
import LoadingPage from "../../pages/global-pages/loading-page/loadingPage";
import WelcomePage from "../../pages/global-pages/welcome-page/welcomePage";
import OfflinePage from "../../pages/global-pages/offline-page/offlinePage";

const RootLayout = () => {
    const [isOnline, setIsOnline] = useState(
        typeof navigator !== "undefined" ? navigator.onLine : true
    );

    // Check if first time in this browser session
    const [showWelcome, setShowWelcome] = useState(() => {
        if (typeof window !== "undefined" && window.sessionStorage) {
            return !sessionStorage.getItem("noviq_welcome_shown");
        }
        return false;
    });

    const handleWelcomeComplete = () => {
        setShowWelcome(false);
        if (typeof window !== "undefined" && window.sessionStorage) {
            sessionStorage.setItem("noviq_welcome_shown", "true");
        }
    };

    // Network status listener
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    return (
        <>
            <Suspense fallback={<LoadingPage label="Loading NOVIQ..." />}>
                <Outlet />
            </Suspense>

            {/* First-time session welcome modal (auto-closes after 4s) */}
            {showWelcome && (
                <WelcomePage
                    onComplete={handleWelcomeComplete}
                    duration={4}
                />
            )}

            {/* Offline notification overlay */}
            {!isOnline && (
                <OfflinePage
                    isOffline={!isOnline}
                    onExited={() => setIsOnline(true)}
                />
            )}
        </>
    );
};

export default RootLayout;
