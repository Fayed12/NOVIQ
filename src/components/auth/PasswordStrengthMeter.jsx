// local
import styles from './PasswordStrengthMeter.module.css';
import { evaluatePasswordStrength } from '../../utils/validationPatterns';

// prop-types
import PropTypes from 'prop-types';

// react icons
import { FiCheck, FiCircle } from 'react-icons/fi';

export default function PasswordStrengthMeter({ password = '', showRules = true }) {
  const { score, label, color, rules } = evaluatePasswordStrength(password);

  if (!password && !showRules) return null;

  return (
    <div className={styles.meterContainer} aria-live="polite">
      <div className={styles.headerRow}>
        <span className={styles.meterLabel}>Password strength</span>
        <span className={styles.strengthText} style={{ color: password ? color : 'var(--text-muted)' }}>
          {password ? label : 'None'}
        </span>
      </div>

      <div className={styles.segmentsRow}>
        {[1, 2, 3, 4].map((segIndex) => {
          const isActive = score >= segIndex;
          return (
            <div
              key={segIndex}
              className={styles.segment}
              data-active={isActive ? "true" : undefined}
              style={{
                backgroundColor: isActive ? color : undefined,
              }}
            />
          );
        })}
      </div>

      {showRules && (
        <ul className={styles.rulesList}>
          <li className={styles.ruleItem} data-valid={rules.minLength ? "true" : undefined}>
            <span className={styles.ruleIcon}>{rules.minLength ? <FiCheck /> : <FiCircle />}</span>
            <span>At least 8 characters</span>
          </li>
          <li className={styles.ruleItem} data-valid={rules.hasUpper && rules.hasLower ? "true" : undefined}>
            <span className={styles.ruleIcon}>{rules.hasUpper && rules.hasLower ? <FiCheck /> : <FiCircle />}</span>
            <span>Upper & lower case</span>
          </li>
          <li className={styles.ruleItem} data-valid={rules.hasNumber ? "true" : undefined}>
            <span className={styles.ruleIcon}>{rules.hasNumber ? <FiCheck /> : <FiCircle />}</span>
            <span>At least 1 number</span>
          </li>
          <li className={styles.ruleItem} data-valid={rules.hasSpecial ? "true" : undefined}>
            <span className={styles.ruleIcon}>{rules.hasSpecial ? <FiCheck /> : <FiCircle />}</span>
            <span>At least 1 special char</span>
          </li>
        </ul>
      )}
    </div>
  );
}

PasswordStrengthMeter.propTypes = {
  password: PropTypes.string,
  showRules: PropTypes.bool,
};
