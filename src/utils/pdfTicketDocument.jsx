// @react-pdf/renderer
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

// Define styles using React-PDF's StyleSheet (Pure styling for PDF output)
const styles = StyleSheet.create({
    page: {
        backgroundColor: '#0F171E', // Deep dark ink
        color: '#F3F2EE', // Cream text
        padding: 24,
        fontFamily: 'Helvetica',
        fontSize: 10,
    },
    container: {
        borderWidth: 1,
        borderColor: '#2B3640',
        borderRadius: 8,
        backgroundColor: '#161F26',
        overflow: 'hidden',
    },
    header: {
        backgroundColor: '#1E293B',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#2B3640',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    brandTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
        letterSpacing: 1,
    },
    brandSubtitle: {
        fontSize: 8,
        color: '#0E7C86',
        marginTop: 2,
        textTransform: 'uppercase',
    },
    refBadge: {
        backgroundColor: '#0E7C86',
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 4,
    },
    refText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: 'bold',
    },
    gridTwoCol: {
        flexDirection: 'row',
        padding: 16,
        gap: 16,
    },
    colLeft: {
        flex: 1.4,
    },
    colRight: {
        flex: 1,
        borderLeftWidth: 1,
        borderLeftColor: '#2B3640',
        paddingLeft: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#0E7C86',
        marginBottom: 8,
        textTransform: 'uppercase',
        borderBottomWidth: 0.5,
        borderBottomColor: '#2B3640',
        paddingBottom: 2,
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    metaLabel: {
        color: '#8B939A',
        fontSize: 9,
    },
    metaValue: {
        color: '#F3F2EE',
        fontSize: 9,
        fontWeight: 'bold',
        textAlign: 'right',
    },
    highlightBox: {
        backgroundColor: '#1E293B',
        padding: 10,
        borderRadius: 6,
        marginTop: 8,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#0E7C86',
    },
    highlightRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    highlightLabel: {
        color: '#94A3B8',
        fontSize: 9,
    },
    highlightVal: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: 'bold',
    },
    qrContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 8,
        backgroundColor: '#FFFFFF',
        borderRadius: 6,
        marginTop: 6,
    },
    qrImage: {
        width: 110,
        height: 110,
    },
    qrCaption: {
        fontSize: 7,
        color: '#8B939A',
        textAlign: 'center',
        marginTop: 6,
    },
    employeeSection: {
        margin: 16,
        marginTop: 0,
        padding: 12,
        backgroundColor: '#0D141C',
        borderWidth: 1,
        borderColor: '#B45309', // Amber border for staff verification
        borderRadius: 6,
    },
    employeeHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    employeeTitle: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#F59E0B',
        textTransform: 'uppercase',
    },
    employeeBadge: {
        fontSize: 7,
        color: '#F59E0B',
        backgroundColor: '#2D1B02',
        paddingHorizontal: 4,
        paddingVertical: 2,
        borderRadius: 3,
    },
    employeeGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    employeeChecklist: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 4,
        paddingTop: 4,
        borderTopWidth: 0.5,
        borderTopColor: '#2B3640',
    },
    checkItem: {
        fontSize: 7,
        color: '#CBD5E1',
    },
    footer: {
        padding: 12,
        backgroundColor: '#0F171E',
        borderTopWidth: 1,
        borderTopColor: '#2B3640',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    footerText: {
        fontSize: 7,
        color: '#64748B',
    },
    policyText: {
        fontSize: 7,
        color: '#94A3B8',
        fontStyle: 'italic',
        maxWidth: 340,
    }
});

/**
 * NOVIQ PDF Booking Pass Document
 */
export const PdfTicketDocument = ({
    booking = {},
    tenant = {},
    service = {},
    resource = {},
    qrCodeDataUrl = null,
}) => {
    const bookingRef = booking.ref || `NVQ-${(booking.id || '00000').slice(0, 8).toUpperCase()}`;
    const formattedDate = booking.date || booking.start_time?.split(" ")[0] || 'Scheduled';
    const formattedTime = booking.time || booking.time_slot || (booking.start_time?.includes(" ") ? booking.start_time.split(" ").slice(1).join(" ") : 'Scheduled');
    const originalPrice = booking.original_price || (booking.total_price ? Math.round(booking.total_price / (booking.is_member ? 0.75 : 1)) : service.price || 0);
    const discountAmount = booking.discount_applied || (booking.is_member ? Math.round(originalPrice * 0.25) : 0);
    const finalPrice = booking.total_price || (originalPrice - discountAmount);

    return (
        <Document title={`NOVIQ Ticket - ${bookingRef}`} author="NOVIQ Booking Network">
            <Page size="A5" orientation="portrait" style={styles.page}>
                <View style={styles.container}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.brandTitle}>{tenant.name || 'NOVIQ SPACE'}</Text>
                            <Text style={styles.brandSubtitle}>
                                {tenant.category_name || 'Verified Service Provider'} · NOVIQ Booking Pass
                            </Text>
                        </View>
                        <View style={styles.refBadge}>
                            <Text style={styles.refText}>{bookingRef}</Text>
                        </View>
                    </View>

                    {/* Main Content Grid */}
                    <View style={styles.gridTwoCol}>
                        {/* Left Details Column */}
                        <View style={styles.colLeft}>
                            <Text style={styles.sectionTitle}>Reservation Summary</Text>

                            <View style={styles.metaRow}>
                                <Text style={styles.metaLabel}>Service / Experience:</Text>
                                <Text style={styles.metaValue}>{service.name || 'General Appointment'}</Text>
                            </View>

                            <View style={styles.metaRow}>
                                <Text style={styles.metaLabel}>Specialist / Staff:</Text>
                                <Text style={styles.metaValue}>{resource.name || 'Assigned Staff Member'}</Text>
                            </View>

                            <View style={styles.metaRow}>
                                <Text style={styles.metaLabel}>Date & Time:</Text>
                                <Text style={styles.metaValue}>{formattedDate} @ {formattedTime}</Text>
                            </View>

                            <View style={styles.metaRow}>
                                <Text style={styles.metaLabel}>Estimated Duration:</Text>
                                <Text style={styles.metaValue}>{service.duration_minutes || 45} mins</Text>
                            </View>

                            <View style={styles.highlightBox}>
                                <View style={styles.highlightRow}>
                                    <Text style={styles.highlightLabel}>Primary Guest:</Text>
                                    <Text style={styles.highlightVal}>{booking.customer_name || 'Guest Customer'}</Text>
                                </View>
                                <View style={styles.highlightRow}>
                                    <Text style={styles.highlightLabel}>Contact Email:</Text>
                                    <Text style={styles.highlightVal}>{booking.customer_email || 'Verified'}</Text>
                                </View>
                                <View style={styles.highlightRow}>
                                    <Text style={styles.highlightLabel}>Standard Price (Before Discount):</Text>
                                    <Text style={styles.highlightVal}>${originalPrice}</Text>
                                </View>
                                {discountAmount > 0 && (
                                    <View style={styles.highlightRow}>
                                        <Text style={{ ...styles.highlightLabel, color: '#4ADE80' }}>Member Privilege (25% OFF):</Text>
                                        <Text style={{ ...styles.highlightVal, color: '#4ADE80' }}>-${discountAmount}</Text>
                                    </View>
                                )}
                                <View style={{ ...styles.highlightRow, borderTopWidth: 0.5, borderTopColor: '#0E7C86', paddingTop: 4, marginTop: 2 }}>
                                    <Text style={{ ...styles.highlightLabel, color: '#FFFFFF', fontWeight: 'bold' }}>Total Due at Venue (After Discount):</Text>
                                    <Text style={{ ...styles.highlightVal, color: '#38BDF8', fontSize: 11 }}>${finalPrice}</Text>
                                </View>
                            </View>

                            <View style={styles.metaRow}>
                                <Text style={styles.metaLabel}>Location / Venue:</Text>
                                <Text style={styles.metaValue}>{tenant.address || 'Standard Location'}</Text>
                            </View>
                        </View>

                        {/* Right QR Column */}
                        <View style={styles.colRight}>
                            <Text style={styles.sectionTitle}>Digital Check-In</Text>
                            {qrCodeDataUrl ? (
                                <View style={styles.qrContainer}>
                                    <Image src={qrCodeDataUrl} style={styles.qrImage} />
                                </View>
                            ) : (
                                <Text style={styles.metaLabel}>QR Code Generated at Terminal</Text>
                            )}
                            <Text style={styles.qrCaption}>
                                Scan upon arrival at front desk for instant automated verification.
                            </Text>
                        </View>
                    </View>

                    {/* Employee / Internal Staff Verification Section */}
                    <View style={styles.employeeSection}>
                        <View style={styles.employeeHeader}>
                            <Text style={styles.employeeTitle}>Staff / Front Desk Verification Protocol</Text>
                            <Text style={styles.employeeBadge}>INTERNAL USE ONLY</Text>
                        </View>

                        <View style={styles.employeeGrid}>
                            <Text style={styles.metaLabel}>Tenant ID: {tenant.id ? tenant.id.slice(0, 13) : 'TENANT-SYS-OK'}</Text>
                            <Text style={styles.metaLabel}>Sec Hash: {booking.security_hash || 'SHA256-NVQ-VERIFIED'}</Text>
                            <Text style={styles.metaLabel}>Status: {booking.status ? booking.status.toUpperCase() : 'CONFIRMED'}</Text>
                        </View>

                        <View style={styles.employeeChecklist}>
                            <Text style={styles.checkItem}>[ ] ID Matches Guest</Text>
                            <Text style={styles.checkItem}>[ ] System Check-in Logged</Text>
                            <Text style={styles.checkItem}>[ ] Resource Notified</Text>
                            <Text style={styles.checkItem}>Staff Signature: __________________</Text>
                        </View>
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={styles.policyText}>
                            Cancellation Policy: Standard 24-hour notice required for full refund. Please arrive 10 minutes prior to scheduled time.
                        </Text>
                        <Text style={styles.footerText}>
                            Powered by NOVIQ Platform
                        </Text>
                    </View>
                </View>
            </Page>
        </Document>
    );
};
