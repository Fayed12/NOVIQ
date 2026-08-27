// local
import styles from "./BookingStepper.module.css";

// react 
import React from "react";

// react-icons
import { FiCheck, FiLayers, FiUser, FiCalendar, FiShield } from "react-icons/fi";

const STEPS = [
    { id: 1, label: "Service", icon: FiLayers },
    { id: 2, label: "Specialist", icon: FiUser },
    { id: 3, label: "Date & Time", icon: FiCalendar },
    { id: 4, label: "Confirm", icon: FiShield },
];

const BookingStepper = ({ currentStep = 1, isInventoryStrategy = false, onStepClick }) => {
    // If inventory strategy (like Hotels), step 2 (Resource) is skipped
    const activeSteps = isInventoryStrategy
        ? STEPS.filter((s) => s.id !== 2)
        : STEPS;

    return (
        <div className={styles.stepperContainer}>
            <div className={styles.stepperTrack}>
                {activeSteps.map((step, index) => {
                    const isCompleted = currentStep > step.id;
                    const isActive = currentStep === step.id;
                    const StepIcon = step.icon;

                    return (
                        <React.Fragment key={step.id}>
                            {/* Step Node */}
                            <div
                                className={`${styles.stepNode} ${isActive ? styles.activeNode : ""} ${
                                    isCompleted ? styles.completedNode : ""
                                }`}
                                onClick={() => {
                                    if (isCompleted && onStepClick) {
                                        onStepClick(step.id);
                                    }
                                }}
                            >
                                <div className={styles.circleIcon}>
                                    {isCompleted ? (
                                        <FiCheck className={styles.checkIcon} />
                                    ) : (
                                        <StepIcon className={styles.stepIcon} />
                                    )}
                                </div>
                                <span className={styles.stepLabel}>
                                    <span className={styles.stepIndex}>Step {index + 1}:</span> {step.label}
                                </span>
                            </div>

                            {/* Connecting Line */}
                            {index < activeSteps.length - 1 && (
                                <div
                                    className={`${styles.stepConnector} ${
                                        currentStep > step.id ? styles.connectorActive : ""
                                    }`}
                                />
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
};

export default BookingStepper;
