import { getProducts } from '@/services/product';
import toast from 'react-hot-toast';

/**
 * Clean CSV Exporter with UTF-8 BOM and multiline text wrapping support for Microsoft Excel
 */
function downloadCleanCsv(dataRows: Array<Record<string, any>>, filename: string) {
    if (!dataRows || dataRows.length === 0) return;

    const headers = Object.keys(dataRows[0]);
    const csvLines: string[] = [];

    // Header line
    const headerLine = headers.map(h => `"${h.replace(/"/g, '""')}"`).join(',');
    csvLines.push(headerLine);

    // Row lines
    dataRows.forEach(row => {
        const line = headers.map(h => {
            const val = row[h];
            if (val === undefined || val === null) return '""';
            if (typeof val === 'number') return String(val);
            
            // Normalize CRLF to LF so Excel renders multiline text inside a single cell across multiple lines
            const strVal = String(val).replace(/\r\n/g, '\n').trim();

            // Pure numeric fields (price, discount) without quotes to avoid "number as text" green corner
            if (/^\d+(\.\d+)?$/.test(strVal) && h !== 'HSN Code' && h !== 'SKU' && h !== 'Batch No.') {
                return strVal;
            }
            return `"${strVal.replace(/"/g, '""')}"`;
        }).join(',');
        csvLines.push(line);
    });

    // UTF-8 Byte Order Mark (\uFEFF) for seamless Microsoft Excel multiline compatibility
    const csvContent = '\uFEFF' + csvLines.join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

export const handleDownloadProductsCSV = async () => {
    const toastId = toast.loading('Preparing CSV export...');
    try {
        const res = await getProducts({ limit: 10000, isActive: 'all' });
        const products: any[] = Array.isArray(res.data) ? res.data : (res.data?.products || []);

        if (products.length === 0) {
            // Sample template row matching the exact upload CSV header structure
            const sampleRows = [{
                'Product Name': 'Sample Health Supplement',
                'Product Type': 'Supplements',
                'Price': 499,
                'Discount': 10,
                'Overview': 'Detailed product overview...\nSupports digestive health\nMaintains normal bowel function',
                'Suggested Use': 'Take 1 daily',
                'Key Ingredients': 'Vitamin C, Zinc, Herbal Extracts',
                'Direction of use/dosage': '1 capsule daily after meals',
                'Safety Information': 'Store in a cool dry place',
                'Brand': 'Pratham Herbs Brands',
                'Manufacturer': 'Pratham Herbs Healthcare',
                'In Stock': 'Yes',
                'Best Seller': 'No',
                'Categories': 'Supplements, Wellness',
                'HSN Code': '30049099',
                'Batch No.': 'BATCH-001',
                'Expired On': '12-2027',
                'Pack Size': '500 gm',
                'Units in Pack': '1',
                'SKU': 'ITL-001',
                'Treatment': 'Immunity',
                'Benefits': 'Energy Boost, Wellness',
                'Varient': '500gm',
                'Dimensions (l x b h)': '15 x 8 x 8',
                'Form': 'Syrup'
            }];

            downloadCleanCsv(sampleRows, 'sample_products_bulk.csv');
            toast.success('Sample CSV downloaded successfully!', { id: toastId });
            return;
        }

        const exportRows = products.map((p: any) => {
            const specs: any[] = Array.isArray(p.specifications) ? p.specifications : [];
            const getSpecVal = (keys: string[]) => {
                const found = specs.find((s: any) => {
                    const k = (s.key || '').toLowerCase().trim();
                    return keys.some(target => k === target.toLowerCase() || k.includes(target.toLowerCase()));
                });
                return found?.value || '';
            };

            const packSize = getSpecVal(['Pack Size', 'Pack size', 'Pack of', 'Weight']);
            const unitsInPack = getSpecVal(['Units in Pack', 'Units In Pack', 'Product Quantity', 'QTY']);
            const sku = getSpecVal(['SKU', 'Product Code (SKU)', 'Product Code', 'code']);
            const treatment = getSpecVal(['Treatment']);
            const benefits = getSpecVal(['Benefits']);
            const varient = getSpecVal(['Varient', 'Variant']);
            const dimensions = getSpecVal(['Dimensions (l x b h)', 'Dimensions', 'Dimension']);
            const form = getSpecVal(['Form']);

            const row: Record<string, any> = {
                'Product Name': p.name || '',
                'Product Type': p.type || '',
                'Price': Number(p.price) || 0,
                'Discount': Number(p.discount) || 0,
                'Overview': p.overview || '',
                'Suggested Use': p.suggestedUse || '',
                'Key Ingredients': p.otherIngredients || '',
                'Direction of use/dosage': p.warnings || '',
                'Safety Information': p.disclaimer || '',
                'Brand': p.brand || '',
                'Manufacturer': p.manufacturer || '',
                'In Stock': p.inStock !== undefined ? String(p.inStock) : 'Yes',
                'Best Seller': p.bestSeller || '',
                'Categories': Array.isArray(p.categories) ? p.categories.join(', ') : (p.categories || ''),
                'HSN Code': p.hsn || '',
                'Batch No.': p.batchNo || '',
                'Expired On': p.expiredOn || '',
                'Pack Size': packSize,
                'Units in Pack': unitsInPack,
                'SKU': sku,
                'Treatment': treatment,
                'Benefits': benefits,
                'Varient': varient,
                'Dimensions (l x b h)': dimensions,
                'Form': form
            };

            return row;
        });

        downloadCleanCsv(exportRows, 'all_products_bulk_export.csv');
        toast.success(`Exported ${products.length} products to CSV!`, { id: toastId });
    } catch (err: any) {
        console.error('Failed exporting products CSV:', err);
        toast.error('Failed to export products CSV', { id: toastId });
    }
};

export const handleDownloadSampleCSV = () => {
    const sampleRows = [{
        'Product Name': 'Sample Health Supplement',
        'Product Type': 'Supplements',
        'Price': 499,
        'Discount': 10,
        'Overview': 'Detailed product overview...\nSupports digestive health',
        'Suggested Use': 'Take 1 daily',
        'Key Ingredients': 'Vitamin C, Zinc, Herbal Extracts',
        'Direction of use/dosage': '1 capsule daily after meals',
        'Safety Information': 'Store in a cool dry place',
        'Brand': 'Pratham Herbs Brands',
        'Manufacturer': 'Pratham Herbs Healthcare',
        'In Stock': 'Yes',
        'Best Seller': 'No',
        'Categories': 'Supplements, Wellness',
        'HSN Code': '30049099',
        'Batch No.': 'BATCH-001',
        'Expired On': '12-2027',
        'Pack Size': '500 gm',
        'Units in Pack': '1',
        'SKU': 'ITL-001',
        'Treatment': 'Immunity',
        'Benefits': 'Energy Boost, Wellness',
        'Varient': '500gm',
        'Dimensions (l x b h)': '15 x 8 x 8',
        'Form': 'Syrup'
    }];

    downloadCleanCsv(sampleRows, 'sample_products_upload.csv');
    toast.success('Sample CSV downloaded successfully!');
};
