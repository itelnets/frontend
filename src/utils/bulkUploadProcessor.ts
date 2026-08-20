/**
 * Bulk Upload Processor Utility
 *
 * Handles CSV row normalization, SKU matching, field change detection across 
 * all 24 product fields, payload building for create/update operations,
 * and automated PDF audit report generation for modified products.
 */

export interface FieldChange {
    fieldName: string;
    oldValue: string;
    newValue: string;
}

export interface BulkAuditRecord {
    sku: string;
    productName: string;
    changes: FieldChange[];
}

export const BULK_HEADER_MAP: Record<string, string> = {
    'Product Name': 'name',
    'Product Type': 'type',
    'Price': 'price',
    'Discount': 'discount',
    'Overview': 'overview',
    'Suggested Use': 'suggestedUse',
    'Key Ingredients': 'otherIngredients',
    'Direction of use/dosage': 'warnings',
    'Safety Information': 'disclaimer',
    'Brand': 'brand',
    'Manufacturer': 'manufacturer',
    'In Stock': 'inStock',
    'Best Seller': 'bestSeller',
    'Categories': 'categories',
    'HSN Code': 'hsn',
    'Batch No.': 'batchNo',
    'Expired On': 'expiredOn',
    'Pack Size': 'Pack Size',
    'Units in Pack': 'Units in Pack',
    'SKU': 'SKU',
    'Product Code': 'SKU',
    'Product Code (SKU)': 'SKU',
    'Code': 'SKU',
    'Treatment': 'Treatment',
    'Benefits': 'Benefits',
    'Varient': 'Variant',
    'Variant': 'Variant',
    'Dimensions (l x b h)': 'Dimensions (l x b h)',
    'Form': 'Form'
};

export const STANDARD_FIELDS = [
    'name', 'type', 'price', 'discount', 'overview',
    'suggestedUse', 'otherIngredients', 'warnings', 'disclaimer',
    'brand', 'manufacturer', 'inStock', 'bestSeller', 'categories',
    'hsn', 'batchNo', 'expiredOn', 'images', 'specifications'
];

/**
 * Normalizes alias key names for specifications
 */
export function getCanonicalSpecKey(key: string): string {
    const k = key.trim().toLowerCase();
    if (k === 'sku' || k === 'product code' || k === 'code' || k === 'product code (sku)') return 'SKU';
    if (k === 'variant' || k === 'varient') return 'Variant';
    if (k === 'pack size') return 'Pack Size';
    if (k === 'units in pack') return 'Units in Pack';
    if (k === 'dimensions (l x b h)' || k === 'dimensions') return 'Dimensions (l x b h)';
    if (k === 'form') return 'Form';
    if (k === 'treatment') return 'Treatment';
    if (k === 'benefits') return 'Benefits';
    return key.trim();
}

/**
 * Extracts SKU from a product object
 */
export function getProductSku(product: any): string {
    if (!product) return '';
    if (product.sku && String(product.sku).trim()) {
        return String(product.sku).trim();
    }
    if (product['Product Code (SKU)'] && String(product['Product Code (SKU)']).trim()) {
        return String(product['Product Code (SKU)']).trim();
    }
    if (product['Product Code'] && String(product['Product Code']).trim()) {
        return String(product['Product Code']).trim();
    }
    if (Array.isArray(product.specifications)) {
        const spec = product.specifications.find((s: any) => {
            const k = (s?.key || '').toLowerCase().trim();
            return k === 'sku' || k === 'product code' || k.includes('sku') || k === 'code';
        });
        if (spec && spec.value) return String(spec.value).trim();
    }
    return '';
}

/**
 * Normalizes a raw CSV row according to BULK_HEADER_MAP
 */
export function normalizeCsvRow(rawRow: Record<string, any>): Record<string, any> {
    const row: Record<string, any> = {};
    Object.keys(rawRow).forEach(key => {
        const trimmedKey = key.trim();
        const mappedKey = BULK_HEADER_MAP[trimmedKey] || trimmedKey;
        row[mappedKey] = rawRow[key];
    });
    return row;
}

/**
 * Builds specifications array from normalized CSV row
 */
export function extractRowSpecifications(row: Record<string, any>): Array<{ key: string; value: string }> {
    return Object.keys(row)
        .filter(key => !STANDARD_FIELDS.includes(key) && row[key] !== undefined && String(row[key]).trim() !== '')
        .map(key => ({ key: getCanonicalSpecKey(key), value: String(row[key]).trim() }));
}

/**
 * Helper to normalize In Stock string
 */
function normalizeInStock(val: any): string {
    if (val === undefined || val === null) return 'Yes';
    const s = String(val).trim().toLowerCase();
    if (s === 'no' || s === 'false' || s === 'out of stock' || s === '0') return 'No';
    return 'Yes';
}

/**
 * Helper to normalize Best Seller string
 */
function normalizeBestSeller(val: any): string {
    if (val === undefined || val === null) return '';
    const s = String(val).trim().toLowerCase();
    if (s === 'yes' || s === 'true' || s === '1' || s === 'bestseller' || s === 'best seller') return 'Yes';
    return '';
}

/**
 * Compares CSV row data against an existing product across all 24 fields.
 * Strictly ignores missing or empty CSV cells so existing product data is preserved.
 * If any field has changed, returns { isChanged: true, updatePayload, changes }.
 */
export function compareAndUpdateProduct(csvRow: Record<string, any>, existingProduct: any): {
    isChanged: boolean;
    updatePayload: Record<string, any>;
    changes: FieldChange[];
} {
    let isChanged = false;
    const changes: FieldChange[] = [];
    const updatePayload: Record<string, any> = {};

    const checkStringChange = (
        fieldName: string,
        csvVal: any,
        existingVal: any,
        payloadKey: string
    ) => {
        if (csvVal === undefined || csvVal === null) return;
        const newStr = String(csvVal).trim();
        if (!newStr) return; // Skip empty CSV cells to preserve existing product data

        const oldStr = String(existingVal || '').trim();
        if (newStr !== oldStr) {
            isChanged = true;
            changes.push({ fieldName, oldValue: oldStr || '(empty)', newValue: newStr });
            updatePayload[payloadKey] = newStr;
        }
    };

    // 1. Name
    checkStringChange('Product Name', csvRow.name, existingProduct.name, 'name');

    // 2. Type
    checkStringChange('Product Type', csvRow.type, existingProduct.type, 'type');

    // 3. Brand
    checkStringChange('Brand', csvRow.brand, existingProduct.brand, 'brand');

    // 4. Manufacturer
    checkStringChange('Manufacturer', csvRow.manufacturer, existingProduct.manufacturer, 'manufacturer');

    // 5. Price (only compare if explicitly provided in CSV)
    if (csvRow.price !== undefined && csvRow.price !== null && String(csvRow.price).trim() !== '') {
        const newPrice = Number(csvRow.price);
        const oldPrice = Number(existingProduct.price) || 0;
        if (!isNaN(newPrice) && newPrice !== oldPrice) {
            isChanged = true;
            changes.push({ fieldName: 'Price (₹)', oldValue: `₹${oldPrice}`, newValue: `₹${newPrice}` });
            updatePayload.price = newPrice;
        }
    }

    // 6. Discount (only compare if explicitly provided in CSV)
    if (csvRow.discount !== undefined && csvRow.discount !== null && String(csvRow.discount).trim() !== '') {
        const newDisc = Number(csvRow.discount);
        const oldDisc = Number(existingProduct.discount) || 0;
        if (!isNaN(newDisc) && newDisc !== oldDisc) {
            isChanged = true;
            changes.push({ fieldName: 'Discount (%)', oldValue: `${oldDisc}%`, newValue: `${newDisc}%` });
            updatePayload.discount = newDisc;
        }
    }

    // 7. In Stock
    if (csvRow.inStock !== undefined && csvRow.inStock !== null && String(csvRow.inStock).trim() !== '') {
        const newStock = normalizeInStock(csvRow.inStock);
        const oldStock = normalizeInStock(existingProduct.inStock);
        if (newStock !== oldStock) {
            isChanged = true;
            changes.push({ fieldName: 'In Stock', oldValue: oldStock, newValue: newStock });
            updatePayload.inStock = newStock;
        }
    }

    // 8. Best Seller
    if (csvRow.bestSeller !== undefined && csvRow.bestSeller !== null && String(csvRow.bestSeller).trim() !== '') {
        const newBest = normalizeBestSeller(csvRow.bestSeller);
        const oldBest = normalizeBestSeller(existingProduct.bestSeller);
        if (newBest !== oldBest) {
            isChanged = true;
            changes.push({ fieldName: 'Best Seller', oldValue: oldBest || 'No', newValue: newBest || 'No' });
            updatePayload.bestSeller = newBest;
        }
    }

    // 9. Categories
    if (csvRow.categories !== undefined && csvRow.categories !== null && String(csvRow.categories).trim() !== '') {
        const newCats = String(csvRow.categories).split(',').map(c => c.trim()).filter(Boolean);
        const oldCats = Array.isArray(existingProduct.categories) ? existingProduct.categories : [];

        const newCatsNorm = newCats.map((c: string) => c.toLowerCase()).sort().join(',');
        const oldCatsNorm = oldCats.map((c: any) => String(c).toLowerCase()).sort().join(',');

        if (newCatsNorm !== oldCatsNorm) {
            isChanged = true;
            changes.push({ fieldName: 'Categories', oldValue: oldCats.join(', ') || '(none)', newValue: newCats.join(', ') });
            updatePayload.categories = newCats;
        }
    }

    // 10. HSN Code
    checkStringChange('HSN Code', csvRow.hsn, existingProduct.hsn, 'hsn');

    // 11. Batch No.
    checkStringChange('Batch No.', csvRow.batchNo, existingProduct.batchNo, 'batchNo');

    // 12. Expired On
    checkStringChange('Expired On', csvRow.expiredOn, existingProduct.expiredOn, 'expiredOn');

    // 13. Overview
    checkStringChange('Overview', csvRow.overview, existingProduct.overview, 'overview');

    // 14. Suggested Use
    checkStringChange('Suggested Use', csvRow.suggestedUse, existingProduct.suggestedUse, 'suggestedUse');

    // 15. Key Ingredients
    checkStringChange('Key Ingredients', csvRow.otherIngredients, existingProduct.otherIngredients, 'otherIngredients');

    // 16. Direction of use/dosage
    checkStringChange('Direction of use/dosage', csvRow.warnings, existingProduct.warnings, 'warnings');

    // 17. Safety Information
    checkStringChange('Safety Information', csvRow.disclaimer, existingProduct.disclaimer, 'disclaimer');

    // Specifications Comparison (Fields 18 to 24 + SKU)
    const existingSpecs: Array<{ key: string; value: string }> = Array.isArray(existingProduct.specifications)
        ? [...existingProduct.specifications]
        : [];

    let specsModified = false;
    const csvSpecs = extractRowSpecifications(csvRow);

    csvSpecs.forEach(csvSpec => {
        const canonicalKey = getCanonicalSpecKey(csvSpec.key);
        const newVal = csvSpec.value.trim();
        if (!newVal) return;

        // Find spec by canonical alias matching
        const specIdx = existingSpecs.findIndex(s => getCanonicalSpecKey(s.key || '').toLowerCase() === canonicalKey.toLowerCase());
        if (specIdx >= 0) {
            const oldVal = (existingSpecs[specIdx].value || '').trim();
            if (newVal !== oldVal) {
                existingSpecs[specIdx] = { key: canonicalKey, value: newVal };
                specsModified = true;
                changes.push({ fieldName: canonicalKey, oldValue: oldVal || '(empty)', newValue: newVal });
            }
        } else {
            existingSpecs.push({ key: canonicalKey, value: newVal });
            specsModified = true;
            changes.push({ fieldName: canonicalKey, oldValue: '(empty)', newValue: newVal });
        }
    });

    if (specsModified) {
        isChanged = true;
        updatePayload.specifications = existingSpecs;
    }

    return { isChanged, updatePayload, changes };
}

export { generateBulkUploadPdfReport } from './bulkUploadPdfReport';
