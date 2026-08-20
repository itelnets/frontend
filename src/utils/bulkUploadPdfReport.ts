import { BulkAuditRecord } from './bulkUploadProcessor';

/**
 * Generates and auto-downloads a PDF audit report of all changed field data.
 */
export async function generateBulkUploadPdfReport(auditRecords: BulkAuditRecord[]): Promise<void> {
    if (!auditRecords || auditRecords.length === 0) return;

    try {
        const html2pdf = (await import('html2pdf.js')).default;

        const dateStr = new Date().toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
        const timeStr = new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });

        const fontCss = "'Segoe UI', system-ui, -apple-system, BlinkMacSystemFont, Roboto, sans-serif";

        let productsHtml = '';
        auditRecords.forEach((rec, idx) => {
            const changesList = rec.changes.map((ch, cIdx) => {
                const isLast = cIdx === rec.changes.length - 1;
                const borderStyle = isLast ? '' : 'border-bottom: 1px solid #e2e8f0;';
                return `
                <tr style="${borderStyle} height: 20px;">
                    <td style="padding-top: 0px; padding-bottom: 4px; padding-left: 8px; padding-right: 8px; font-weight: 600; color: #334155; font-size: 11px; height: 20px; vertical-align: top;">
                        <span style="position: relative; top: -5px; display: inline-block; line-height: 1; letter-spacing: 0.1px;">${ch.fieldName}</span>
                    </td>
                    <td style="padding-top: 0px; padding-bottom: 4px; padding-left: 8px; padding-right: 8px; color: #b91c1c; font-size: 11px; word-break: break-word; height: 20px; vertical-align: top;">
                        <span style="position: relative; top: -5px; display: inline-block; line-height: 1; letter-spacing: 0.1px;">${ch.oldValue}</span>
                    </td>
                    <td style="padding-top: 0px; padding-bottom: 4px; padding-left: 8px; padding-right: 8px; color: #15803d; font-weight: 600; font-size: 11px; word-break: break-word; height: 20px; vertical-align: top;">
                        <span style="position: relative; top: -5px; display: inline-block; line-height: 1; letter-spacing: 0.1px;">${ch.newValue}</span>
                    </td>
                </tr>
            `;
            }).join('');

            productsHtml += `
                <div style="margin-bottom: 14px; page-break-inside: avoid; border: 1px solid #cbd5e1; border-radius: 6px; overflow: hidden; background: #ffffff;">
                    <table style="width: 100%; border-collapse: collapse; background-color: #f8fafc; border-bottom: 1px solid #cbd5e1; font-family: ${fontCss};">
                        <tr style="height: 22px;">
                            <td style="padding-top: 0px; padding-bottom: 4px; padding-left: 10px; padding-right: 10px; height: 22px; vertical-align: top;">
                                <span style="position: relative; top: -6.5px; font-weight: 600; font-size: 12px; color: #0f172a; display: inline-block; letter-spacing: 0.15px;">${idx + 1}. ${rec.productName}</span>
                                <span style="position: relative; top: -8.5px; margin-left: 10px; font-family: monospace; font-size: 11px; color: #0369a1; font-weight: 600; display: inline-block; letter-spacing: 0.1px;">SKU: ${rec.sku}</span>
                            </td>
                            <td style="padding-top: 0px; padding-bottom: 4px; padding-left: 10px; padding-right: 10px; text-align: right; height: 22px; vertical-align: top; width: 140px;">
                                <span style="position: relative; top: -6.5px; font-size: 11px; color: #16a34a; font-weight: 600; display: inline-block; letter-spacing: 0.1px;">${rec.changes.length} Field(s) Changed</span>
                            </td>
                        </tr>
                    </table>
                    <table style="width: 100%; border-collapse: collapse; text-align: left; font-family: ${fontCss};">
                        <thead>
                            <tr style="background-color: #f1f5f9; border-bottom: 1px solid #cbd5e1; height: 20px;">
                                <th style="padding-top: 0px; padding-bottom: 4px; padding-left: 8px; padding-right: 8px; font-size: 11px; font-weight: 600; color: #475569; width: 30%; height: 20px; vertical-align: top;">
                                    <span style="position: relative; top: -4.5px; display: inline-block; line-height: 1; letter-spacing: 0.1px;">Field Name</span>
                                </th>
                                <th style="padding-top: 0px; padding-bottom: 4px; padding-left: 8px; padding-right: 8px; font-size: 11px; font-weight: 600; color: #dc2626; width: 35%; height: 20px; vertical-align: top;">
                                    <span style="position: relative; top: -4.5px; display: inline-block; line-height: 1; letter-spacing: 0.1px;">Old Value</span>
                                </th>
                                <th style="padding-top: 0px; padding-bottom: 4px; padding-left: 8px; padding-right: 8px; font-size: 11px; font-weight: 600; color: #16a34a; width: 35%; height: 20px; vertical-align: top;">
                                    <span style="position: relative; top: -4.5px; display: inline-block; line-height: 1; letter-spacing: 0.1px;">New Value</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            ${changesList}
                        </tbody>
                    </table>
                </div>
            `;
        });

        const reportContainer = document.createElement('div');
        reportContainer.style.padding = '18px';
        reportContainer.style.fontFamily = fontCss;
        reportContainer.style.backgroundColor = '#ffffff';
        reportContainer.style.color = '#1e293b';

        reportContainer.innerHTML = `
            <table style="width: 100%; border-collapse: collapse; border-bottom: 2px solid #16a34a; padding-bottom: 10px; margin-bottom: 16px; font-family: ${fontCss};">
                <tr>
                    <td style="vertical-align: bottom; padding-bottom: 8px;">
                        <h1 style="margin: 0; font-size: 20px; font-weight: 700; color: #16a34a; line-height: 1.2; letter-spacing: 0.2px;">Bulk Upload SKU Audit Report</h1>
                        <p style="margin: 3px 0 0 0; font-size: 11px; color: #64748b; font-weight: 500; line-height: 1.2; letter-spacing: 0.1px;">Detailed record of modified fields for existing products</p>
                    </td>
                    <td style="text-align: right; vertical-align: bottom; padding-bottom: 8px; font-size: 11px; color: #475569; font-weight: 500; line-height: 1.3; width: 180px;">
                        <div><strong>Date:</strong> ${dateStr}</div>
                        <div><strong>Time:</strong> ${timeStr}</div>
                        <div><strong>Updated Products:</strong> ${auditRecords.length}</div>
                    </td>
                </tr>
            </table>

            <div>
                ${productsHtml}
            </div>

            <div style="margin-top: 20px; padding-top: 10px; border-top: 1px solid #cbd5e1; text-align: center; font-size: 10px; color: #64748b; font-weight: 500; letter-spacing: 0.1px;">
                Generated automatically by Admin System • ${dateStr} ${timeStr}
            </div>
        `;

        const filename = `Bulk_Upload_Audit_Report_${new Date().toISOString().slice(0, 10)}.pdf`;

        const opt = {
            margin: 10,
            filename: filename,
            image: { type: 'jpeg' as const, quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, logging: false },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
        };

        await html2pdf().set(opt).from(reportContainer).save();
    } catch (err) {
        console.error('Error generating PDF audit report:', err);
    }
}
