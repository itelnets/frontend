export const formatDate = (dateString: string | Date | undefined): string => {
    if (!dateString) return '-';

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const day = date.getDate().toString().padStart(2, '0');
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${day}-${month}-${year} ${hours}:${minutes}`;
};

export const formatExpiryDate = (val: string | null | undefined): string | null => {
    if (!val) return null;
    let cleaned = String(val).replace(/expired/gi, '').trim();
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    // Match MM-YYYY or MM/YYYY (e.g. 07-2029, 07/2029)
    const mmYyyyMatch = cleaned.match(/^(\d{1,2})[-/](\d{4})$/);
    if (mmYyyyMatch) {
        const m = parseInt(mmYyyyMatch[1], 10);
        const y = mmYyyyMatch[2];
        if (m >= 1 && m <= 12) {
            return `${monthNames[m - 1]}-${y}`;
        }
    }

    // Match YYYY-MM or YYYY/MM (e.g. 2029-07)
    const yyyyMmMatch = cleaned.match(/^(\d{4})[-/](\d{1,2})$/);
    if (yyyyMmMatch) {
        const y = yyyyMmMatch[1];
        const m = parseInt(yyyyMmMatch[2], 10);
        if (m >= 1 && m <= 12) {
            return `${monthNames[m - 1]}-${y}`;
        }
    }

    try {
        if (cleaned.includes('-') || cleaned.includes('/') || cleaned.includes('T')) {
            const d = new Date(cleaned);
            if (!isNaN(d.getTime())) {
                const monthName = monthNames[d.getMonth()];
                const year = d.getFullYear();
                return `${monthName}-${year}`;
            }
        }
    } catch (e) {}

    return cleaned;
};