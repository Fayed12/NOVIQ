// react-router
import { createBrowserRouter } from "react-router";

// layouts & fallbacks
import RootLayout from "../components/layout/RootLayout";
import LoadingPage from "../pages/global-pages/loading-page/loadingPage";
import ErrorPage from "../pages/global-pages/error-page/errorPage";

// route guards
import ProtectedRoute from "../components/auth/ProtectedRoute";
import PublicOnlyRoute from "../components/auth/PublicOnlyRoute";
import RoleRoute from "../components/auth/RoleRoute";

const router = createBrowserRouter([
    {
        element: <RootLayout />,
        errorElement: <ErrorPage />,
        children: [
            // Public Pages
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
            // Section 1: Public Discovery & Booking Pages
            {
                path: "/explore",
                hydrateFallbackElement: <LoadingPage label="Loading NOVIQ Marketplace..." />,
                lazy: async () => {
                    const { default: Component } = await import("../pages/global-pages/explore-page/ExplorePage");
                    return { Component };
                },
            },
            {
                path: "/explore/:categorySlug",
                hydrateFallbackElement: <LoadingPage label="Loading Category Showcase..." />,
                lazy: async () => {
                    const { default: Component } = await import("../pages/global-pages/category-page/CategoryPage");
                    return { Component };
                },
            },
            {
                path: "/:tenantSlug/book",
                hydrateFallbackElement: <LoadingPage label="Initializing Booking Session..." />,
                lazy: async () => {
                    const { default: Component } = await import("../pages/global-pages/booking-widget-page/BookingWidgetPage");
                    return { Component };
                },
            },
            {
                path: "/:tenantSlug/booking/:bookingId",
                hydrateFallbackElement: <LoadingPage label="Retrieving Booking Receipt..." />,
                lazy: async () => {
                    const { default: Component } = await import("../pages/global-pages/booking-confirmation-page/BookingConfirmationPage");
                    return { Component };
                },
            },
            {
                path: "/:tenantSlug",
                hydrateFallbackElement: <LoadingPage label="Loading Business Storefront..." />,
                lazy: async () => {
                    const { default: Component } = await import("../pages/global-pages/tenant-storefront-page/TenantStorefrontPage");
                    return { Component };
                },
            },

            // Authentication Pages (Section 2)
            {
                path: "/login",
                hydrateFallbackElement: <LoadingPage label="Unlocking Space..." />,
                lazy: async () => {
                    const { default: LoginPage } = await import("../pages/authentication/login-page/LoginPage");
                    return {
                        Component: () => (
                            <PublicOnlyRoute>
                                <LoginPage />
                            </PublicOnlyRoute>
                        ),
                    };
                },
            },
            {
                path: "/register",
                hydrateFallbackElement: <LoadingPage label="Preparing Registration..." />,
                lazy: async () => {
                    const { default: RegisterPage } = await import("../pages/authentication/register-page/RegisterPage");
                    return {
                        Component: () => (
                            <PublicOnlyRoute>
                                <RegisterPage />
                            </PublicOnlyRoute>
                        ),
                    };
                },
            },
            {
                path: "/verify-email",
                hydrateFallbackElement: <LoadingPage label="Checking Verification Status..." />,
                lazy: async () => {
                    const { default: VerifyEmailPage } = await import("../pages/authentication/verify-email-page/VerifyEmailPage");
                    return { Component: VerifyEmailPage };
                },
            },
            {
                path: "/forgot-password",
                hydrateFallbackElement: <LoadingPage label="Preparing Recovery..." />,
                lazy: async () => {
                    const { default: ForgotPasswordPage } = await import("../pages/authentication/forgot-password-page/ForgotPasswordPage");
                    return { Component: ForgotPasswordPage };
                },
            },
            {
                path: "/reset-password",
                hydrateFallbackElement: <LoadingPage label="Validating Security Key..." />,
                lazy: async () => {
                    const { default: ResetPasswordPage } = await import("../pages/authentication/reset-password-page/ResetPasswordPage");
                    return { Component: ResetPasswordPage };
                },
            },
            {
                path: "/accept-invite",
                hydrateFallbackElement: <LoadingPage label="Verifying Invitation..." />,
                lazy: async () => {
                    const { default: AcceptInvitePage } = await import("../pages/authentication/accept-invite-page/AcceptInvitePage");
                    return { Component: AcceptInvitePage };
                },
            },

            // Section 4: ONBOARDING WIZARD (Become a Business Owner)
            {
                path: "/onboarding",
                hydrateFallbackElement: <LoadingPage label="Launching Business Onboarding..." />,
                lazy: async () => {
                    const { default: OnboardingWizardPage } = await import(
                        "../pages/tenant/onboarding-wizard-page/OnboardingWizardPage"
                    );
                    return {
                        Component: () => (
                            <ProtectedRoute>
                                <OnboardingWizardPage />
                            </ProtectedRoute>
                        ),
                    };
                },
            },
            {
                path: "/onboarding/:stepSlug",
                hydrateFallbackElement: <LoadingPage label="Loading Setup Step..." />,
                lazy: async () => {
                    const { default: OnboardingWizardPage } = await import(
                        "../pages/tenant/onboarding-wizard-page/OnboardingWizardPage"
                    );
                    return {
                        Component: () => (
                            <ProtectedRoute>
                                <OnboardingWizardPage />
                            </ProtectedRoute>
                        ),
                    };
                },
            },

            // Scaffolding / Protected Customer & Dashboard Pages
            {
                path: "/account",
                hydrateFallbackElement: <LoadingPage label="Loading Customer Hub..." />,
                lazy: async () => {
                    const { default: AccountBasePage } = await import("../pages/customer/account-page/AccountBasePage");
                    return {
                        Component: () => (
                            <ProtectedRoute>
                                <AccountBasePage />
                            </ProtectedRoute>
                        ),
                    };
                },
            },
            {
                path: "/:tenantSlug/dashboard",
                hydrateFallbackElement: <LoadingPage label="Loading Business Console..." />,
                lazy: async () => {
                    const { default: TenantDashboardBasePage } = await import("../pages/tenant/dashboard-page/TenantDashboardBasePage");
                    return {
                        Component: () => (
                            <ProtectedRoute>
                                <RoleRoute allowedRoles={["owner", "manager", "employee", "admin"]}>
                                    <TenantDashboardBasePage />
                                </RoleRoute>
                            </ProtectedRoute>
                        ),
                    };
                },
            },
            {
                path: "/platform/admin",
                hydrateFallbackElement: <LoadingPage label="Loading Platform Admin..." />,
                lazy: async () => {
                    const { default: AdminPlatformBasePage } = await import("../pages/admin/platform-page/AdminPlatformBasePage");
                    return {
                        Component: () => (
                            <ProtectedRoute>
                                <RoleRoute allowedRoles={["admin"]}>
                                    <AdminPlatformBasePage />
                                </RoleRoute>
                            </ProtectedRoute>
                        ),
                    };
                },
            },

            // 403 Forbidden Access Page
            {
                path: "/403",
                element: (
                    <ErrorPage
                        customStatus={403}
                        customTitle="403 - Access Denied"
                        customMessage="You do not possess the required security clearance or role permissions to access this area."
                    />
                ),
            },

            // 404 Catch-All Page
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
