// local
import styles from "./OnboardingStepper.module.css";

// prop-types
import PropTypes from "prop-types";

// react icons
import { FiCheck } from "react-icons/fi";

const STEPS = [
    { number: 1, title: "Category", shortTitle: "Category" },
    { number: 2, title: "Business Info", shortTitle: "Info" },
    { number: 3, title: "Theme", shortTitle: "Theme" },
    { number: 4, title: "Modules", shortTitle: "Modules" },
    { number: 5, title: "Settings", shortTitle: "Hours" },
    { number: 6, title: "Publish", shortTitle: "Publish" },
];

export default function OnboardingStepper({
    currentStep,
    onStepClick,
    stepCompletion = {},
    canAccessStep,
}) {
    const progressPercent = Math.round(((currentStep - 1) / (STEPS.length - 1)) * 100);
    const activeStepInfo = STEPS.find((s) => s.number === currentStep) || STEPS[0];

    return (
        <div className={styles.stepperContainer}>
            {/* Desktop Stepper */}
            <div className={styles.desktopStepper}>
                <div className={styles.progressBarBackground}>
                    <div
                        className={styles.progressBarFill}
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>

                <div className={styles.stepsList}>
                    {STEPS.map((step) => {
                        const isCompleted = stepCompletion[step.number] || step.number < currentStep;
                        const isCurrent = step.number === currentStep;
                        const isClickable = canAccessStep
                            ? canAccessStep(step.number)
                            : isCompleted || step.number <= currentStep;

                        return (
                            <div
                                key={step.number}
                                className={`${styles.stepNode} ${isCurrent ? styles.activeNode : ""} ${
                                    isCompleted ? styles.completedNode : ""
                                } ${isClickable ? styles.clickableNode : styles.lockedNode}`}
                                onClick={() => onStepClick(step.number)}
                                role="button"
                                tabIndex={isClickable ? 0 : -1}
                                aria-label={`Step ${step.number}: ${step.title}`}
                            >
                                <div className={styles.nodeCircle}>
                                    {isCompleted && !isCurrent ? (
                                        <FiCheck size={14} className={styles.checkIcon} />
                                    ) : (
                                        <span>{step.number}</span>
                                    )}
                                </div>
                                <span className={styles.nodeLabel}>{step.title}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Mobile Compact Progress (<500px) */}
            <div className={styles.mobileStepper}>
                <div className={styles.mobileHeader}>
                    <span className={styles.mobileStepBadge}>
                        Step {currentStep} of {STEPS.length}
                    </span>
                    <span className={styles.mobileStepTitle}>{activeStepInfo.title}</span>
                    <span className={styles.mobilePercent}>{progressPercent}%</span>
                </div>
                <div className={styles.mobileProgressBar}>
                    <div
                        className={styles.mobileProgressFill}
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            </div>
        </div>
    );
}

OnboardingStepper.propTypes = {
    currentStep: PropTypes.number.isRequired,
    onStepClick: PropTypes.func.isRequired,
    stepCompletion: PropTypes.object,
    canAccessStep: PropTypes.func,
};
