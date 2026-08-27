// local
import { PdfTicketDocument } from './pdfTicketDocument';

// react
import React from 'react';

// @react-pdf/renderer
import { pdf } from '@react-pdf/renderer';

/**
 * Converts a string / JSON payload to a QR Code PNG Data URL using an HTML5 canvas
 */
export const generateQrDataUrl = (payload) => {
    return new Promise((resolve) => {
        try {
            const canvas = document.createElement('canvas');
            canvas.width = 256;
            canvas.height = 256;
            const ctx = canvas.getContext('2d');

            // Draw clean background
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, 256, 256);

            const textToEncode = typeof payload === 'object' ? JSON.stringify(payload) : String(payload);
            const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(textToEncode)}`;

            const img = new window.Image();
            img.crossOrigin = 'Anonymous';
            img.onload = () => {
                ctx.drawImage(img, 0, 0, 256, 256);
                resolve(canvas.toDataURL('image/png'));
            };
            img.onerror = () => {
                // Fallback basic canvas indicator if offline
                ctx.fillStyle = '#161F26';
                ctx.fillRect(20, 20, 216, 216);
                ctx.fillStyle = '#FFFFFF';
                ctx.font = '14px sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('NOVIQ VERIFIED QR', 128, 134);
                resolve(canvas.toDataURL('image/png'));
            };
            img.src = qrApiUrl;
        } catch {
            resolve(null);
        }
    });
};

/**
 * Compiles and triggers immediate browser download of the PDF Booking Ticket
 */
export const downloadPdfBookingTicket = async ({
    booking = {},
    tenant = {},
    service = {},
    resource = {},
}) => {
    const bookingRef = booking.ref || `NVQ-${(booking.id || '00000').slice(0, 8).toUpperCase()}`;

    // 1. Generate QR Code Data URL for PDF inclusion
    const qrPayload = {
        app: 'NOVIQ',
        ref: bookingRef,
        booking_id: booking.id || 'N/A',
        tenant_id: tenant.id || 'N/A',
        tenant_name: tenant.name || 'NOVIQ Space',
        service: service.name || 'Standard Service',
        resource: resource.name || 'General Staff',
        customer: booking.customer_name || 'Guest Customer',
        date: booking.date || 'Scheduled',
        time: booking.time || 'Scheduled',
        total: booking.total_price || service.price || 0,
        status: booking.status || 'confirmed',
        sec_hash: booking.security_hash || `NVQ-SIG-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
    };

    const qrDataUrl = await generateQrDataUrl(qrPayload);

    // 2. Render React-PDF to Blob using React.createElement
    const docElement = React.createElement(PdfTicketDocument, {
        booking: { ...booking, ref: bookingRef, security_hash: qrPayload.sec_hash },
        tenant: tenant,
        service: service,
        resource: resource,
        qrCodeDataUrl: qrDataUrl
    });

    const asPdf = pdf([]);
    asPdf.updateContainer(docElement);
    const blob = await asPdf.toBlob();

    // 3. Trigger file download in browser
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.href = url;
    downloadAnchor.setAttribute('download', `NOVIQ-Ticket-${bookingRef}.pdf`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
    URL.revokeObjectURL(url);
};
