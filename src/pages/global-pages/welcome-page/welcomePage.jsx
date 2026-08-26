// local
import styles from "./welcomePage.module.css";
import { selectTheme } from "../../../redux/themeSlice";

// react
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router";

// redux
import { useSelector } from "react-redux";

// prop-types
import PropTypes from "prop-types";

// gsap
import { gsap } from "gsap";

const WelcomePage = ({ onComplete, duration = 4 }) => {
    const navigate = useNavigate();
    const containerRef = useRef(null);
    const progressRef = useRef(null);
    const currentTheme = useSelector(selectTheme);
    const isDark = currentTheme === "dark";

    // Lock body scrolling while welcome modal is visible
    useEffect(() => {
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, []);

    useEffect(() => {
        let isCancelled = false;

        const ctx = gsap.context(() => {
            gsap.set(containerRef.current, { opacity: 0, scale: 0.96 });

            // Entrance animation
            const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

            tl.to(containerRef.current, {
                opacity: 1,
                scale: 1,
                duration: 0.6
            })
            .fromTo(
                `.${styles.logo}`,
                { scale: 0.85, opacity: 0 },
                { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.4)" },
                "-=0.3"
            )
            .fromTo(
                `.${styles.welcomeTitle}`,
                { y: 15, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.4 },
                "-=0.2"
            )
            .fromTo(
                `.${styles.welcomeSentence}`,
                { y: 12, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.4 },
                "-=0.2"
            );

            // Progress bar animation
            if (progressRef.current) {
                gsap.fromTo(
                    progressRef.current,
                    { width: "0%" },
                    {
                        width: "100%",
                        duration: duration,
                        ease: "power1.inOut"
                    }
                );
            }
        }, containerRef);

        // Timer that automatically navigates to Landing Page
        const timer = setTimeout(() => {
            if (isCancelled) return;

            // Exit animation
            gsap.to(containerRef.current, {
                opacity: 0,
                scale: 1.03,
                y: -20,
                duration: 0.6,
                ease: "power3.inOut",
                onComplete: () => {
                    if (onComplete) {
                        onComplete();
                    }
                    navigate("/", { replace: true });
                }
            });
        }, duration * 1000);

        return () => {
            isCancelled = true;
            clearTimeout(timer);
            ctx.revert();
        };
    }, [duration, navigate, onComplete]);

    const logoSrc = isDark ? "/dark-logo.png" : "/light-logo.png";

    return (
        <div
            ref={containerRef}
            className={styles.welcomeWrapper}
            role="region"
            aria-label="Welcome to NOVIQ"
        >
            <div className={styles.ambientGlow} aria-hidden="true" />

            <div className={styles.welcomeCard}>
                <div className={styles.logoContainer}>
                    <img 
                        src={logoSrc} 
                        alt="NOVIQ Logo" 
                        className={styles.logo} 
                    />
                </div>

                <h1 className={styles.welcomeTitle}>
                    Welcome to <span className={styles.brandGradient}>NOVIQ</span>
                </h1>

                <p className={styles.welcomeSentence}>
                    Empowering your business with intelligent real-time scheduling, effortless bookings, and seamless client management.
                </p>

                {/* Animated Progress Bar */}
                <div className={styles.progressContainer}>
                    <div ref={progressRef} className={styles.progressBar} />
                </div>

                <div className={styles.loadingStatus}>
                    <span className={styles.pulseDot} />
                    <span>Taking you to NOVIQ...</span>
                </div>
            </div>
        </div>
    );
};

WelcomePage.propTypes = {
    onComplete: PropTypes.func,
    duration: PropTypes.number,
};

export default WelcomePage;
