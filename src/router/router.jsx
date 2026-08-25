// react-router
import { createBrowserRouter } from "react-router";

// layouts & fallbacks
import RootLayout from "../components/layout/RootLayout";
import LoadingPage from "../pages/global-pages/loading-page/loadingPage";
import ErrorPage from "../pages/global-pages/error-page/errorPage";

const router = createBrowserRouter([
    {
        element: <RootLayout />,
        errorElement: <ErrorPage />,
        children: [
            {
                path: "/",
                hydrateFallbackElement: <LoadingPage label="Loading NOVIQ..." />,
                lazy: async () => {
                    const { default: Component } = await import("../pages/global-pages/landing-page/landingPage");
                    return { Component };
                },
            },
            {
                path: "/privacy",
                hydrateFallbackElement: <LoadingPage label="Loading Privacy Policy..." />,
                lazy: async () => {
                    const { default: Component } = await import("../pages/global-pages/privacy-page/PrivacyPage");
                    return { Component };
                },
            },
            {
                path: "/terms",
                hydrateFallbackElement: <LoadingPage label="Loading Terms of Service..." />,
                lazy: async () => {
                    const { default: Component } = await import("../pages/global-pages/terms-page/TermsPage");
                    return { Component };
                },
            },
            {
                path: "/offline",
                hydrateFallbackElement: <LoadingPage label="Checking Network Status..." />,
                lazy: async () => {
                    const { default: Component } = await import("../pages/global-pages/offline-page/offlinePage");
                    return { Component };
                },
            },
            {
                path: "/welcome",
                hydrateFallbackElement: <LoadingPage label="Launching NOVIQ Tour..." />,
                lazy: async () => {
                    const { default: Component } = await import("../pages/global-pages/welcome-page/welcomePage");
                    return { Component };
                },
            },
            {
                path: "/loading",
                element: <LoadingPage label="Loading NOVIQ Application..." />,
            },
            {
                path: "*",
                element: (
                    <ErrorPage
                        customStatus={404}
                        customTitle="404 - Page Not Found"
                        customMessage="The page you requested could not be found on NOVIQ."
                    />
                ),
            }
        ]
    }
]);

export default router;
