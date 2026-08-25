// local
import styles from "./loadingPage.module.css";
import LoadingSpinner from "../../../components/ui/loading-Spinner/loadingSpinner";

// react
import { useEffect, useRef } from "react";

// gsap
import { gsap } from "gsap";

const LoadingPage = ({ label = "Loading NOVIQ..." }) => {
    const containerRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Pulse the skeletons
            gsap.fromTo(
                `.${styles.skeleton}`,
                { opacity: 0.4 },
                {
                    opacity: 0.75,
                    duration: 0.9,
                    repeat: -1,
                    yoyo: true,
                    ease: "sine.inOut",
                    stagger: 0.04
                }
            );

            // Intro fade-in of container
            gsap.fromTo(
                containerRef.current,
                { opacity: 0 },
                { opacity: 1, duration: 0.3, ease: "power2.out" }
            );
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <div ref={containerRef} className={styles.container} role="status" aria-label={label}>
            {/* Topbar skeleton */}
            <div className={styles.topbar}>
                <div className={`${styles.skeleton} ${styles.logoSkeleton}`} />
                <div className={`${styles.skeleton} ${styles.searchSkeleton}`} />
                <div className={`${styles.skeleton} ${styles.avatarSkeleton}`} />
            </div>

            <div className={styles.body}>
                {/* Sidebar skeleton */}
                <div className={styles.sidebar}>
                    <div className={`${styles.skeleton} ${styles.navSkeleton}`} />
                    <div className={`${styles.skeleton} ${styles.navSkeleton}`} />
                    <div className={`${styles.skeleton} ${styles.navSkeleton}`} />
                    <div className={`${styles.skeleton} ${styles.navSkeleton}`} />
                    <div className={`${styles.skeleton} ${styles.navSkeleton}`} />
                </div>

                {/* Main Content Area */}
                <main className={styles.main}>
                    <div className={styles.headerArea}>
                        <div className={`${styles.skeleton} ${styles.titleSkeleton}`} />
                        <div className={`${styles.skeleton} ${styles.subtitleSkeleton}`} />
                    </div>

                    <div className={styles.grid}>
                        <div className={styles.cardCol}>
                            <div className={`${styles.skeleton} ${styles.cardSkeleton}`} />
                            <div className={`${styles.skeleton} ${styles.cardSkeleton}`} />
                        </div>
                        <div className={styles.cardCol}>
                            <div className={`${styles.skeleton} ${styles.largeCardSkeleton}`} />
                        </div>
                    </div>
                </main>
            </div>

            {/* Spinner Overlay */}
            <div className={styles.spinnerOverlay}>
                <div className={styles.spinnerWrapper}>
                    <LoadingSpinner size="lg" color="primary" label={label} />
                </div>
            </div>
        </div>
    );
};

export default LoadingPage;
