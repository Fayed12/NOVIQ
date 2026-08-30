// local
import MainButton from "../../../../components/ui/button/MainButton";
import styles from "./OnboardingFooter.module.css";

// prop-types
import PropTypes from "prop-types";

// react icons
import { FiArrowLeft, FiArrowRight, FiCheckCircle } from "react-icons/fi";

export default function OnboardingFooter({
    currentStep,
    totalSteps = 6,
    onBack,
    onNext,
    isNextDisabled = false,
    isLoading = false,
    nextLabel,
}) {
    const isFirstStep = currentStep === 1;
    const isLastStep = currentStep === totalSteps;

    const defaultNextLabel = isLastStep ? "Publish Business" : "Continue";
    const label = nextLabel || defaultNextLabel;

    return (
        <div className={styles.footerContainer}>
            <div className={styles.footerInner}>
                {/* Back Button */}
                {!isFirstStep ? (
                    <MainButton
                        variant="ghost"
                        size="md"
                        onClick={onBack}
                        disabled={isLoading}
                        icon={<FiArrowLeft />}
                    >
                        Back
                    </MainButton>
                ) : (
                    <div />
                )}

                {/* Next / Action Button */}
                <MainButton
                    variant="primary"
                    size="md"
                    onClick={onNext}
                    disabled={isNextDisabled || isLoading}
                    isLoading={isLoading}
                    rightIcon={isLastStep ? <FiCheckCircle /> : <FiArrowRight />}
                >
                    {label}
                </MainButton>
            </div>
        </div>
    );
}

OnboardingFooter.propTypes = {
    currentStep: PropTypes.number.isRequired,
    totalSteps: PropTypes.number,
    onBack: PropTypes.func.isRequired,
    onNext: PropTypes.func.isRequired,
    isNextDisabled: PropTypes.bool,
    isLoading: PropTypes.bool,
    nextLabel: PropTypes.string,
};
