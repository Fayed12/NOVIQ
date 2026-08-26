// local
import styles from './AuthPortalModal.module.css';
import MainButton from '../ui/button/MainButton';

// react
import { useEffect } from 'react';
import { createPortal } from 'react-dom';

// proptyps
import PropTypes from 'prop-types';

// react icons
import { FiAlertTriangle, FiAlertCircle, FiInfo, FiCheckCircle } from 'react-icons/fi';

const ICON_MAP = {
  warning: <FiAlertTriangle />,
  danger: <FiAlertCircle />,
  info: <FiInfo />,
  success: <FiCheckCircle />,
};

export default function AuthPortalModal({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'warning',
  isLoading = false,
}) {
  // Lock body scrolling when modal is open
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onCancel && !isLoading) {
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel, isLoading]);

  if (!isOpen) return null;

  const getConfirmVariant = () => {
    if (variant === 'danger') return 'danger';
    if (variant === 'success') return 'success';
    return 'primary';
  };

  return createPortal(
    <div className={styles.portalOverlay} onClick={isLoading ? undefined : onCancel} role="dialog" aria-modal="true">
      <div className={styles.portalModal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.iconWrapper} data-variant={variant}>
          {ICON_MAP[variant] || ICON_MAP.warning}
        </div>

        <h3 className={styles.title}>{title}</h3>
        <p className={styles.message}>{message}</p>

        <div className={styles.actionsRow}>
          {cancelText && (
            <MainButton
              variant="secondary"
              size="md"
              onClick={onCancel}
              disabled={isLoading}
              className={styles.modalBtn}
            >
              {cancelText}
            </MainButton>
          )}

          <MainButton
            variant={getConfirmVariant()}
            size="md"
            onClick={onConfirm}
            isLoading={isLoading}
            className={styles.modalBtn}
          >
            {confirmText}
          </MainButton>
        </div>
      </div>
    </div>,
    document.body
  );
}

AuthPortalModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
  variant: PropTypes.oneOf(['warning', 'danger', 'info', 'success']),
  isLoading: PropTypes.bool,
};
