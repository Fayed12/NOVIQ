// local
import styles from "./offlinePage.module.css";
import MainButton from "../../../components/ui/button/MainButton";

// react
import { useEffect, useRef, useState } from "react";

// prop-types
import PropTypes from "prop-types";

// gsap
import { gsap } from "gsap";

// react-icons
import { FiWifiOff, FiRefreshCw, FiArrowLeft, FiCheckCircle } from "react-icons/fi";

const OfflinePage = ({ isOffline = true, onExited }) => {
    const containerRef = useRef(null);
    const exitTriggeredRef = useRef(false);
    const [isChecking, setIsChecking] = useState(false);
    const [reconnected, setReconnected] = useState(!isOffline);

    useEffect(() => {
        // Entrance animation
        const ctx = gsap.context(() => {
            gsap.set(containerRef.current, { yPercent: 0, opacity: 1 });

            const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

            tl.fromTo(
                `.${styles.cardContainer}`,
                { scale: 0.9, y: 40, opacity: 0 },
                { scale: 1, y: 0, opacity: 1, duration: 0.7, ease: "back.out(1.3)" }
            )
            .fromTo(
                `.${styles.cardHeaderDecoration} span`,
                { scale: 0, opacity: 0 },
                { scale: 1, opacity: 1, duration: 0.4, stagger: 0.1 },
                "-=0.3"
            )
            .fromTo(
                `.${styles.iconContainer}`,
                { scale: 0.5, opacity: 0 },
                { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.6)" },
                "-=0.3"
            )
            .fromTo(
                `.${styles.title}`,
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
                `.${styles.statusIndicator}`,
                { scaleX: 0, opacity: 0 },
                { scaleX: 1, opacity: 1, duration: 0.5 },
                "-=0.2"
            )
            .fromTo(
                `.${styles.btnContainer}`,
                { y: 15, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.4 },
                "-=0.2"
            );

            gsap.to(`.${styles.wifiIcon}`, {
                scale: 1.1,
                duration: 1.2,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });
        }, containerRef);

        return () => ctx.revert();
    }, []);

    // Monitor isOffline prop & browser online state
    useEffect(() => {
        const handleOnline = () => {
            setReconnected(true);
            if (!exitTriggeredRef.current && onExited) {
                exitTriggeredRef.current = true;
                gsap.to(containerRef.current, {
                    yPercent: -100,
                    duration: 0.8,
                    ease: "power4.inOut",
                    onComplete: () => {
                        if (onExited) onExited();
                    }
                });
            }
        };

        window.addEventListener("online", handleOnline);
        return () => window.removeEventListener("online", handleOnline);
    }, [onExited]);

    const handleCheckConnection = () => {
        setIsChecking(true);
        if (navigator.onLine) {
            setReconnected(true);
            setTimeout(() => {
                window.location.reload();
            }, 600);
        } else {
            setTimeout(() => {
                setIsChecking(false);
            }, 800);
        }
    };

    return (
        <div
            ref={containerRef}
            className={styles.overlay}
            role="alert"
            aria-live="assertive"
            aria-labelledby="offline-title"
        >
            <div className={styles.cardContainer}>
                {/* Header Decoration */}
                <div className={styles.cardHeaderDecoration}>
                    <span className={styles.dotRed} />
                    <span className={styles.dotOrange} />
                    <span className={styles.dotGreen} />
                </div>

                <div className={styles.content}>
                    <div className={styles.iconContainer}>
                        <div className={styles.pulseRing} />
                        <div className={styles.pulseRing2} />
                        <div className={styles.iconCircle}>
                            {reconnected ? (
                                <FiCheckCircle className={styles.wifiIcon} style={{ color: "var(--color-success)" }} />
                            ) : (
                                <FiWifiOff className={styles.wifiIcon} />
                            )}
                        </div>
                    </div>

                    <h1 id="offline-title" className={styles.title}>
                        {reconnected ? "Connection Restored!" : "Connection Lost"}
                    </h1>

                    <p className={styles.description}>
                        {reconnected
                            ? "You are back online. Reloading NOVIQ..."
                            : "You are currently disconnected from NOVIQ. Please check your Wi-Fi, Ethernet, or cellular data. We will automatically reconnect you as soon as your connection returns."}
                    </p>

                    <div className={styles.statusIndicator}>
                        <span className={`${styles.indicatorDot} ${reconnected ? styles.indicatorGreen : ""}`} />
                        <span>
                            {reconnected
                                ? "Connected to NOVIQ Servers"
                                : isChecking
                                ? "Testing connection..."
                                : "Attempting automatic reconnection..."}
                        </span>
                    </div>

                    <div className={styles.btnContainer}>
                        <MainButton
                            onClick={handleCheckConnection}
                            variant="primary"
                            size="md"
                            isLoading={isChecking}
                            icon={<FiRefreshCw className={isChecking ? styles.spinIcon : ""} />}
                        >
                            Retry Connection
                        </MainButton>
                        <MainButton
                            onClick={() => window.history.back()}
                            variant="secondary"
                            size="md"
                            icon={<FiArrowLeft />}
                        >
                            Go Back
                        </MainButton>
                    </div>
                </div>
            </div>
        </div>
    );
};

OfflinePage.propTypes = {
    isOffline: PropTypes.bool,
    onExited: PropTypes.func,
};

export default OfflinePage;
