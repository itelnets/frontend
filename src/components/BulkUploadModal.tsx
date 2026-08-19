'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { createProduct, getProducts } from '@/services/product';
import toast from 'react-hot-toast';
import Spinner from '@/components/Spinner';
import * as XLSX from 'xlsx';

export default function BulkUploadModal() {
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [uploadSummary, setUploadSummary] = useState<{
        successCount: number;
        skippedCount: number;
        errorCount: number;
        totalCount: number;
    } | null>(null);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Strict CSV file validation
        const fileName = file.name.toLowerCase();
        if (!fileName.endsWith('.csv')) {
            toast.error("Invalid file format. Only CSV (.csv) files are allowed for bulk upload.");
            if (e.target) e.target.value = '';
            return;
        }

        setIsLoading(true);

        const reader = new FileReader();
        reader.onload = async (evt) => {
            try {
                const arrayBuffer = evt.target?.result as ArrayBuffer;
                const wb = XLSX.read(arrayBuffer, { type: 'array' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws);

                if (!data || data.length === 0) {
                    toast.error("No data found in the Excel/CSV file");
                    setIsLoading(false);
                    return;
                }

                // 1. Fetch all existing products to check for duplicate Product Code (SKU)
                const existingSkusSet = new Set<string>();
                try {
                    const res = await getProducts({ limit: 10000, isActive: 'all' });
                    const existingProducts: any[] = Array.isArray(res.data) ? res.data : (res.data?.products || []);

                    existingProducts.forEach((p: any) => {
                        if (Array.isArray(p.specifications)) {
                            p.specifications.forEach((spec: any) => {
                                const k = (spec.key || '').toLowerCase().trim();
                                if (k.includes('sku') || k.includes('product code') || k === 'code') {
                                    if (spec.value) {
                                        existingSkusSet.add(String(spec.value).trim().toLowerCase());
                                    }
                                }
                            });
                        }
                    });
                } catch (fetchErr) {
                    console.error('Error fetching existing products for SKU duplicate check:', fetchErr);
                }

                let successCount = 0;
                let skippedCount = 0;
                let errorCount = 0;

                const headerMap: Record<string, string> = {
                    'Product Name': 'name',
                    'Product Type': 'type',
                    'Description': 'description',
                    'Price (₹)': 'price',
                    'Price': 'price',
                    'Discount (%)': 'discount',
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
                    'Categories (comma-separated)': 'categories',
                    'Categories': 'categories',
                    'HSN Code': 'hsn',
                    'Batch No.': 'batchNo',
                    'Expired On': 'expiredOn',
                    'Pack Size': 'Pack Size',
                    'Units in Pack': 'Units in Pack',
                    'Product Code (SKU)': 'SKU',
                    'Varient': 'Variant'
                };

                for (let i = 0; i < data.length; i++) {
                    const originalRow: any = data[i];
                    const row: any = {};

                    // Normalize row keys based on header map
                    Object.keys(originalRow).forEach(key => {
                        const trimmedKey = key.trim();
                        const mappedKey = headerMap[trimmedKey] || trimmedKey;
                        row[mappedKey] = originalRow[key];
                    });

                    try {
                        const standardFields = [
                            'name', 'type', 'description', 'price', 'discount', 'overview',
                            'suggestedUse', 'otherIngredients', 'warnings', 'disclaimer',
                            'brand', 'manufacturer', 'inStock', 'bestSeller', 'categories',
                            'hsn', 'batchNo', 'expiredOn', 'images', 'specifications'
                        ];

                        const specs = Object.keys(row)
                            .filter(key => !standardFields.includes(key) && row[key] !== undefined && String(row[key]).trim() !== '')
                            .map(key => ({ key: key.trim(), value: String(row[key]).trim() }));

                        // Find SKU value
                        const skuSpec = specs.find(s => {
                            const k = s.key.toLowerCase();
                            return k.includes('sku') || k.includes('product code') || k === 'code';
                        });

                        const skuValue = (skuSpec?.value || row['Product Code (SKU)'] || row['Product Code'] || row['SKU'] || '').trim();

                        if (skuValue) {
                            const normalizedSku = skuValue.toLowerCase();
                            if (existingSkusSet.has(normalizedSku)) {
                                skippedCount++;
                                continue;
                            } else {
                                existingSkusSet.add(normalizedSku);
                            }
                        }

                        const productData = {
                            name: row.name || '',
                            type: row.type || '',
                            description: row.description || '',
                            price: Number(row.price) || 0,
                            discount: Number(row.discount) || 0,
                            overview: row.overview || '',
                            suggestedUse: row.suggestedUse || '',
                            otherIngredients: row.otherIngredients || '',
                            warnings: row.warnings || '',
                            disclaimer: row.disclaimer || '',
                            brand: row.brand || '',
                            manufacturer: row.manufacturer || '',
                            inStock: row.inStock !== undefined ? String(row.inStock) : 'Yes',
                            bestSeller: row.bestSeller !== undefined ? String(row.bestSeller) : '',
                            categories: row.categories ? String(row.categories).split(',').map((c: string) => c.trim()).filter(Boolean) : [],
                            hsn: row.hsn || '',
                            batchNo: row.batchNo || '',
                            expiredOn: row.expiredOn || '',
                            images: [],
                            specifications: specs
                        };

                        await createProduct(productData);
                        successCount++;
                    } catch (err) {
                        console.error(`Error uploading row ${i + 1}:`, err);
                        errorCount++;
                    }
                }

                // Show summary popup modal
                setUploadSummary({
                    successCount,
                    skippedCount,
                    errorCount,
                    totalCount: data.length
                });

            } catch (error) {
                console.error(error);
                toast.error("Failed to parse Excel/CSV file");
            } finally {
                setIsLoading(false);
                if (e.target) e.target.value = '';
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const handleCloseSummary = () => {
        const hasCreated = uploadSummary && uploadSummary.successCount > 0;
        setUploadSummary(null);
        if (hasCreated) {
            router.push('/admin/products');
        }
    };

    const modalJSX = (
        <>
            {/* Hidden Bulk Upload Input triggered by label[htmlFor="bulk-upload-input"] */}
            <input
                type="file"
                id="bulk-upload-input"
                accept=".csv"
                className="hidden"
                onChange={handleBulkUpload}
            />

            {/* Loading Overlay when processing file */}
            {isLoading && (
                <div className="fixed inset-0 top-0 left-0 w-screen h-screen min-h-[100dvh] bg-black/50 backdrop-blur-xs z-[9999] flex flex-col items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-2xl flex flex-col items-center justify-center max-w-sm w-full text-center space-y-4">
                        <Spinner className="w-10 h-10 text-[#458500] animate-spin" />
                        <div>
                            <h3 className="text-base font-bold text-gray-900">Processing Bulk Upload</h3>
                            <p className="text-xs text-gray-500 mt-1">Checking duplicates & creating products</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Summary Popup Modal - Portal to document.body for dead-center positioning */}
            {uploadSummary && (
                <div className="fixed inset-0 top-0 left-0 w-screen h-screen min-h-[100dvh] bg-black/60 backdrop-blur-xs z-[9999] flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-lg shadow-2xl max-w-[320px] sm:max-w-md w-full overflow-hidden border border-gray-100 my-auto animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="bg-gray-50 px-3.5 py-3 sm:px-5 sm:py-4 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-2 sm:gap-2.5">
                                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-green-100 text-[#458500] flex items-center justify-center font-bold shrink-0">
                                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-xs sm:text-base font-bold text-gray-900 leading-tight">Bulk Upload Summary</h3>
                                    <p className="text-[10px] sm:text-xs text-gray-500">Import status & deduplication report</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={handleCloseSummary}
                                className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#458500] hover:bg-[#366800] text-white flex items-center justify-center transition cursor-pointer shrink-0 font-bold shadow-xs"
                                title="Close"
                            >
                                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Content Stats: 3 Metric Cards (Total, New Upload, Skip) */}
                        <div className="p-3 sm:p-5 space-y-2.5 sm:space-y-3">
                            <div className="grid grid-cols-3 gap-1.5 sm:gap-3">
                                <div className="bg-blue-50/70 border border-blue-200/80 rounded-lg p-2 sm:p-3 text-center">
                                    <span className="block text-base sm:text-2xl font-extrabold text-blue-600 leading-tight">{uploadSummary.totalCount}</span>
                                    <span className="text-[9px] sm:text-[11px] font-bold text-blue-800 uppercase tracking-wider block mt-0.5">Total</span>
                                </div>

                                <div className="bg-green-50/70 border border-green-200/80 rounded-lg p-2 sm:p-3 text-center">
                                    <span className="block text-base sm:text-2xl font-extrabold text-[#458500] leading-tight">{uploadSummary.successCount}</span>
                                    <span className="text-[9px] sm:text-[11px] font-bold text-green-800 uppercase tracking-wider block mt-0.5">New Upload</span>
                                </div>

                                <div className="bg-amber-50/70 border border-amber-200/80 rounded-lg p-2 sm:p-3 text-center">
                                    <span className="block text-base sm:text-2xl font-extrabold text-amber-600 leading-tight">{uploadSummary.skippedCount}</span>
                                    <span className="text-[9px] sm:text-[11px] font-bold text-amber-800 uppercase tracking-wider block mt-0.5">Skip</span>
                                </div>
                            </div>

                            {uploadSummary.errorCount > 0 && (
                                <div className="bg-red-50 border border-red-200/80 rounded-lg p-2 sm:p-2.5 flex items-center justify-between px-3 sm:px-4 text-[11px] sm:text-xs font-medium text-red-700">
                                    <span>Failed Rows:</span>
                                    <span className="font-bold text-red-800 text-xs sm:text-sm">{uploadSummary.errorCount}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );

    if (!isMounted) return null;
    return createPortal(modalJSX, document.body);
}
