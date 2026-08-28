import { useState, useMemo } from "react";
import PropTypes from "prop-types";
import MainInput from "../../../../components/ui/input/MainInput";
import MainSelect from "../../../../components/ui/select/MainSelect";
import MainButton from "../../../../components/ui/button/MainButton";
import { EGYPTIAN_CITIES } from "../../../../utils/egyptianCities";
import { FiMapPin, FiX, FiPhone, FiCompass, FiHome } from "react-icons/fi";
import styles from "./QuickBranchModal.module.css";

export default function QuickBranchModal({ isOpen, onClose, onSave, isLoading, existingBranch }) {
    const [name, setName] = useState(existingBranch?.name || "");
    const [selectedCityId, setSelectedCityId] = useState(
        existingBranch?.cityId || EGYPTIAN_CITIES[0].id
    );
    const [address, setAddress] = useState(existingBranch?.address || "");
    const [phone, setPhone] = useState(existingBranch?.phone || "");
    const [isMain, setIsMain] = useState(existingBranch?.is_main || false);
    const [error, setError] = useState("");

    const cityOptions = useMemo(() => {
        return EGYPTIAN_CITIES.map((c) => ({
            value: c.id,
            label: `${c.name} (${c.arabicName}) — ${c.region}`,
            cityData: c,
        }));
    }, []);

    const currentCityOption = useMemo(() => {
        return cityOptions.find((opt) => opt.value === selectedCityId) || cityOptions[0];
    }, [cityOptions, selectedCityId]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim()) {
            setError("Branch name is required (e.g. New Cairo Branch, Alexandria Clinic)");
            return;
        }

        const city = currentCityOption.cityData;
        onSave({
            id: existingBranch?.id || `branch-${Date.now()}`,
            name: name.trim(),
            cityId: city.id,
            cityName: city.name,
            arabicName: city.arabicName,
            region: city.region,
            lat: city.lat,
            lng: city.lng,
            address: address.trim() || `${city.name}, Egypt`,
            phone: phone.trim(),
            is_main: isMain,
        });
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className={styles.modalHeader}>
                    <div className={styles.titleGroup}>
                        <div className={styles.iconCircle}>
                            <FiMapPin size={20} />
                        </div>
                        <div>
                            <h3 className={styles.modalTitle}>
                                {existingBranch ? "Edit Operating Branch" : "Add Physical Branch"}
                            </h3>
                            <p className={styles.modalSubtitle}>
                                Configure a physical location for customer bookings in Egypt.
                            </p>
                        </div>
                    </div>
                    <button type="button" className={styles.closeBtn} onClick={onClose}>
                        <FiX size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className={styles.formBody}>
                    <MainInput
                        label="Branch Name / Location Title"
                        placeholder="e.g. Nasr City Branch, Marina Plaza Suite"
                        value={name}
                        onChange={(e) => {
                            setName(e.target.value);
                            setError("");
                        }}
                        error={error}
                        icon={FiHome}
                        required
                    />

                    <MainSelect
                        label="Egyptian City / Governorate"
                        options={cityOptions}
                        value={currentCityOption}
                        onChange={(opt) => setSelectedCityId(opt.value)}
                        icon={FiCompass}
                        isSearchable
                    />

                    <MainInput
                        label="Street Address & Details"
                        placeholder="e.g. 12 Abbas El-Akkad St., 3rd Floor"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        icon={FiMapPin}
                    />

                    <MainInput
                        label="Branch Phone Number"
                        type="tel"
                        placeholder="+20 10 9876 5432"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        icon={FiPhone}
                    />

                    {/* Actions */}
                    <div className={styles.modalActions}>
                        <MainButton variant="ghost" size="md" onClick={onClose} disabled={isLoading}>
                            Cancel
                        </MainButton>
                        <MainButton
                            variant="primary"
                            size="md"
                            type="submit"
                            loading={isLoading}
                        >
                            Save Branch
                        </MainButton>
                    </div>
                </form>
            </div>
        </div>
    );
}

QuickBranchModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    isLoading: PropTypes.bool,
    existingBranch: PropTypes.object,
};
