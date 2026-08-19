import { getProducts } from '@/services/product';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';

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
                'Overview': 'Detailed product overview...',
                'Suggested Use': 'Take 1 daily',
                'Key Ingredients': 'Vitamin C, Zinc, Herbal Extracts',
                'Direction of use/dosage': '1 capsule daily after meals',
                'Safety Information': 'Store in a cool dry place',
                'Brand': 'Itelents Brands',
                'Manufacturer': 'Itelents Healthcare',
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
            const ws = XLSX.utils.json_to_sheet(sampleRows);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Products');
            XLSX.writeFile(wb, 'sample_products_bulk.csv', { bookType: 'csv' });
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
                'Price': p.price || 0,
                'Discount': p.discount || 0,
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

        const ws = XLSX.utils.json_to_sheet(exportRows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Products');
        XLSX.writeFile(wb, 'all_products_bulk_export.csv', { bookType: 'csv' });
        toast.success(`Exported ${products.length} products to CSV!`, { id: toastId });
    } catch (err: any) {
        console.error('Failed exporting products CSV:', err);
        toast.error('Failed to export products CSV', { id: toastId });
    }
};
