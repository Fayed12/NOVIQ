// local
import MainButton from "../../../components/ui/button/MainButton";
import styles from "./errorPage.module.css";

// react
import { useEffect, useRef } from "react";

// react-router
import { useNavigate, useRouteError, isRouteErrorResponse } from "react-router";

// gsap
import { gsap } from "gsap";

// react-icons
import {
    FiAlertOctagon,
    FiArrowLeft,
    FiHome,
    FiRefreshCw,
    FiLock,
    FiFileText,
    FiServer,
    FiMessageCircle,
    FiGithub
} from "react-icons/fi";

const ErrorPage = ({ customStatus, customTitle, customMessage }) => {
    const navigate = useNavigate();
    const routeError = useRouteError();
    const containerRef = useRef(null);

    // Determine error type & message
    let status = customStatus;
    let title = customTitle || "Oops! Something Went Wrong";
    let message = customMessage || "NOVIQ encountered an unexpected issue while loading this page.";
    let icon = <FiAlertOctagon className={styles.errorIcon} />;

    if (isRouteErrorResponse(routeError)) {
        status = routeError.status;
        if (status === 404) {
            title = "404 - Page Not Found";
            message = "The page or business storefront you are looking for does not exist or has been moved.";
            icon = <FiFileText className={styles.errorIcon} />;
        } else if (status === 403) {
            title = "403 - Access Denied";
            message = "You don't have permission to access this resource or dashboard area.";
            icon = <FiLock className={styles.errorIcon} />;
        } else if (status === 500) {
            title = "500 - Server Error";
            message = "Our servers ran into an internal error. We've logged this and are looking into it.";
            icon = <FiServer className={styles.errorIcon} />;
        } else {
            message = routeError.statusText || routeError.data || message;
        }
    } else if (routeError instanceof Error) {
        message = routeError.message;
    }

    useEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

            tl.fromTo(
                `.${styles.card}`,
                { y: 40, scale: 0.95, opacity: 0 },
                { y: 0, scale: 1, opacity: 1, duration: 0.7, ease: "back.out(1.2)" }
            )
            .fromTo(
                `.${styles.iconContainer}`,
                { scale: 0.4, rotation: -20, opacity: 0 },
                { scale: 1, rotation: 0, opacity: 1, duration: 0.5, ease: "back.out(1.5)" },
                "-=0.3"
            )
            .fromTo(
                `.${styles.heading}`,
                { y: 15, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.4 },
                "-=0.2"
            )
            .fromTo(
                `.${styles.description}`,
                { y: 15, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.4 },
                "-=0.2"
            )
            .fromTo(
                `.${styles.details}`,
                { y: 15, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.4 },
                "-=0.2"
            )
            .fromTo(
                `.${styles.actions} button, .${styles.actions} a`,
                { y: 10, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.4, stagger: 0.1 },
                "-=0.2"
            );
        }, containerRef);

        return () => ctx.revert();
    }, []);

    const handleGoBack = () => {
        if (window.history.length > 1) {
            navigate(-1);
        } else {
            navigate("/");
        }
    };

    const handleGoHome = () => {
        navigate("/");
    };

    const handleReload = () => {
        window.location.reload();
    };

    return (
        <div ref={containerRef} className={styles.overlay}>
            <main className={styles.card} role="main">
                <div className={styles.iconContainer}>
                    {icon}
                </div>

                {status && <span className={styles.statusCode}>Status Code: {status}</span>}
                <h1 className={styles.heading}>{title}</h1>

                <p className={styles.description}>{message}</p>

                {routeError && !isRouteErrorResponse(routeError) && (
                    <div className={styles.details}>
                        <code>{String(routeError)}</code>
                    </div>
                )}

                <div className={styles.actions}>
                    <MainButton
                        onClick={handleReload}
                        variant="secondary"
                        size="md"
                        icon={<FiRefreshCw />}
                    >
                        Reload Page
                    </MainButton>
                    <MainButton
                        onClick={handleGoBack}
                        variant="secondary"
                        size="md"
                        icon={<FiArrowLeft />}
                    >
                        Go Back
                    </MainButton>
                    <MainButton
                        onClick={handleGoHome}
                        variant="primary"
                        size="md"
                        icon={<FiHome />}
                    >
                        Return Home
                    </MainButton>
                </div>

                <div className={styles.contactSection}>
                    <p className={styles.contactText}>
                        Need assistance? Reach out to support:
                    </p>
                    <div className={styles.contactLinks}>
                        <a
                            href="https://wa.me/201093650836"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.contactLink}
                        >
                            <FiMessageCircle /> WhatsApp Support
                        </a>
                        <a
                            href="https://github.com/Fayed12/NOVIQ"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.contactLink}
                        >
                            <FiGithub /> GitHub Repository
                        </a>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ErrorPage;
