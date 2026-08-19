'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { createProduct, getProducts, updateProduct } from '@/services/product';
import toast from 'react-hot-toast';
import Spinner from '@/components/Spinner';
import * as XLSX from 'xlsx';
import {
    normalizeCsvRow,
    getProductSku,
    compareAndUpdateProduct,
    extractRowSpecifications,
    generateBulkUploadPdfReport,
    BulkAuditRecord
} from '@/utils/bulkUploadProcessor';

export default function BulkUploadModal() {
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [uploadSummary, setUploadSummary] = useState<{
        createdCount: number;
        updatedCount: number;
        skippedCount: number;
        errorCount: number;
        totalCount: number;
        auditRecords?: BulkAuditRecord[];
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
                const rawData = XLSX.utils.sheet_to_json(ws);

                if (!rawData || rawData.length === 0) {
                    toast.error("No data found in the Excel/CSV file");
                    setIsLoading(false);
                    return;
                }

                // 0. Deduplicate CSV rows by SKU / Product Name so duplicate rows in CSV don't overwrite each other
                const deduplicatedRowsMap = new Map<string, any>();
                rawData.forEach((originalRow: any) => {
                    const row = normalizeCsvRow(originalRow);
                    const specs = extractRowSpecifications(row);
                    const skuSpec = specs.find(s => {
                        const k = s.key.toLowerCase();
                        return k.includes('sku') || k.includes('product code') || k === 'code';
                    });

                    const skuValue = (skuSpec?.value || row['Product Code (SKU)'] || row['Product Code'] || row['SKU'] || '').trim();
                    const normalizedSku = skuValue.toLowerCase();
                    const rowName = String(row.name || '').trim();
                    const normalizedName = rowName.toLowerCase();

                    const groupKey = (normalizedSku && normalizedSku !== 'n/a') ? `sku:${normalizedSku}` : `name:${normalizedName}`;
                    if (groupKey) {
                        deduplicatedRowsMap.set(groupKey, originalRow);
                    }
                });

                const data = Array.from(deduplicatedRowsMap.values());

                // 1. Fetch all existing products to check for duplicates by SKU and Product Name
                const existingBySkuMap = new Map<string, any[]>();
                const existingByNameMap = new Map<string, any[]>();

                try {
                    const res = await getProducts({ limit: 10000, isActive: 'all' });
                    const existingList: any[] = Array.isArray(res.data) 
                        ? res.data 
                        : (res.data?.products || res.data?.data?.products || res.data?.data || []);

                    existingList.forEach((p: any) => {
                        const mainSku = getProductSku(p);
                        if (mainSku && mainSku.trim() !== '' && mainSku.toLowerCase() !== 'n/a') {
                            const k = mainSku.toLowerCase().trim();
                            if (!existingBySkuMap.has(k)) existingBySkuMap.set(k, []);
                            existingBySkuMap.get(k)!.push(p);
                        }

                        if (Array.isArray(p.specifications)) {
                            p.specifications.forEach((s: any) => {
                                const k = (s?.key || '').toLowerCase().trim();
                                if (k === 'sku' || k === 'product code' || k.includes('sku') || k === 'code') {
                                    if (s?.value && String(s.value).trim() !== '' && String(s.value).toLowerCase() !== 'n/a') {
                                        const skuKey = String(s.value).trim().toLowerCase();
                                        if (!existingBySkuMap.has(skuKey)) existingBySkuMap.set(skuKey, []);
                                        existingBySkuMap.get(skuKey)!.push(p);
                                    }
                                }
                            });
                        }

                        if (p.name && String(p.name).trim() !== '') {
                            const nameKey = String(p.name).trim().toLowerCase();
                            if (!existingByNameMap.has(nameKey)) existingByNameMap.set(nameKey, []);
                            existingByNameMap.get(nameKey)!.push(p);
                        }
                    });
                } catch (fetchErr) {
                    console.error('Error fetching existing products for SKU/Name duplicate check:', fetchErr);
                }

                let createdCount = 0;
                let updatedCount = 0;
                let skippedCount = 0;
                let errorCount = 0;

                const auditRecords: BulkAuditRecord[] = [];

                for (let i = 0; i < data.length; i++) {
                    const originalRow: any = data[i];
                    const row = normalizeCsvRow(originalRow);

                    try {
                        const specs = extractRowSpecifications(row);

                        // Extract SKU & Product Name from CSV row
                        const skuSpec = specs.find(s => {
                            const k = s.key.toLowerCase();
                            return k.includes('sku') || k.includes('product code') || k === 'code';
                        });

                        const skuValue = (skuSpec?.value || row['Product Code (SKU)'] || row['Product Code'] || row['SKU'] || '').trim();
                        const normalizedSku = skuValue.toLowerCase();

                        const rowName = String(row.name || '').trim();
                        const normalizedName = rowName.toLowerCase();

                        // Match all duplicate product instances in DB (Priority 1 = SKU, Priority 2 = Product Name)
                        const matchingProductsMap = new Map<string, any>();

                        if (normalizedSku && normalizedSku !== 'n/a') {
                            const list = existingBySkuMap.get(normalizedSku) || [];
                            list.forEach(p => matchingProductsMap.set(p._id, p));
                        }
                        if (matchingProductsMap.size === 0 && normalizedName) {
                            const list = existingByNameMap.get(normalizedName) || [];
                            list.forEach(p => matchingProductsMap.set(p._id, p));
                        }

                        const allMatchingProducts = Array.from(matchingProductsMap.values());

                        // 2. If matching product(s) EXIST in DB -> UPDATE them in place (NO NEW ROW CREATED)
                        if (allMatchingProducts.length > 0) {
                            const primaryProduct = allMatchingProducts[0];
                            const { isChanged, updatePayload, changes } = compareAndUpdateProduct(row, primaryProduct);

                            if (isChanged) {
                                // Update all database instances of this product to keep DB in sync
                                for (const prodToUpdate of allMatchingProducts) {
                                    console.log(`[BulkUpload] Updating DB product ID ${prodToUpdate._id} with payload:`, updatePayload);
                                    const updateRes = await updateProduct(prodToUpdate._id, updatePayload);
                                    console.log(`[BulkUpload] DB update result for ${prodToUpdate._id}:`, updateRes);
                                    Object.assign(prodToUpdate, updatePayload);
                                }

                                updatedCount++;

                                auditRecords.push({
                                    sku: getProductSku(primaryProduct) || skuValue || 'N/A',
                                    productName: primaryProduct.name || rowName || 'Product',
                                    changes
                                });
                            } else {
                                // Data are identical -> Skip
                                skippedCount++;
                            }
                        } else {
                            // 3. New Product -> Create new product
                            const productData = {
                                name: rowName,
                                type: row.type || '',
                                description: row.description || row.overview || '',
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

                            const createRes = await createProduct(productData);
                            createdCount++;

                            const newProdObj = createRes?.data?.product || createRes?.data || productData;
                            if (normalizedSku && normalizedSku !== 'n/a') {
                                if (!existingBySkuMap.has(normalizedSku)) existingBySkuMap.set(normalizedSku, []);
                                existingBySkuMap.get(normalizedSku)!.push(newProdObj);
                            }
                            if (normalizedName) {
                                if (!existingByNameMap.has(normalizedName)) existingByNameMap.set(normalizedName, []);
                                existingByNameMap.get(normalizedName)!.push(newProdObj);
                            }
                        }
                    } catch (err) {
                        console.error(`Error uploading row ${i + 1}:`, err);
                        errorCount++;
                    }
                }

                // 4. Auto-download PDF audit report if any existing products were updated
                if (auditRecords.length > 0) {
                    toast.success(`Generating PDF audit report for ${auditRecords.length} updated product(s)...`);
                    await generateBulkUploadPdfReport(auditRecords);
                }

                // Show summary popup modal with audit records log
                setUploadSummary({
                    createdCount,
                    updatedCount,
                    skippedCount,
                    errorCount,
                    totalCount: data.length,
                    auditRecords
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
        const hasChanges = uploadSummary && (uploadSummary.createdCount > 0 || uploadSummary.updatedCount > 0);
        setUploadSummary(null);
        if (hasChanges) {
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
                            <p className="text-xs text-gray-500 mt-1">Updating existing products & applying field changes</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Summary Popup Modal - Portal to document.body for dead-center positioning */}
            {uploadSummary && (
                <div className="fixed inset-0 top-0 left-0 w-screen h-screen min-h-[100dvh] bg-black/60 backdrop-blur-xs z-[9999] flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-lg shadow-2xl max-w-[340px] sm:max-w-md w-full overflow-hidden border border-gray-100 my-auto animate-in zoom-in-95 duration-200">
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
                                    <p className="text-[10px] sm:text-xs text-gray-500">Import status & SKU update report</p>
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

                        {/* Content Stats: 4 Metric Cards (Total, Created, Updated, Unchanged) */}
                        <div className="p-3 sm:p-5 space-y-2.5 sm:space-y-3">
                            <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                                <div className="bg-blue-50/70 border border-blue-200/80 rounded-lg p-2 text-center">
                                    <span className="block text-sm sm:text-xl font-extrabold text-blue-600 leading-tight">{uploadSummary.totalCount}</span>
                                    <span className="text-[9px] sm:text-[10px] font-bold text-blue-800 uppercase tracking-wider block mt-0.5">Total</span>
                                </div>

                                <div className="bg-green-50/70 border border-green-200/80 rounded-lg p-2 text-center">
                                    <span className="block text-sm sm:text-xl font-extrabold text-[#458500] leading-tight">{uploadSummary.createdCount}</span>
                                    <span className="text-[9px] sm:text-[10px] font-bold text-green-800 uppercase tracking-wider block mt-0.5">Created</span>
                                </div>

                                <div className="bg-purple-50/70 border border-purple-200/80 rounded-lg p-2 text-center">
                                    <span className="block text-sm sm:text-xl font-extrabold text-purple-600 leading-tight">{uploadSummary.updatedCount}</span>
                                    <span className="text-[9px] sm:text-[10px] font-bold text-purple-800 uppercase tracking-wider block mt-0.5">Updated</span>
                                </div>

                                <div className="bg-amber-50/70 border border-amber-200/80 rounded-lg p-2 text-center">
                                    <span className="block text-sm sm:text-xl font-extrabold text-amber-600 leading-tight">{uploadSummary.skippedCount}</span>
                                    <span className="text-[9px] sm:text-[10px] font-bold text-amber-800 uppercase tracking-wider block mt-0.5">No Change</span>
                                </div>
                            </div>

                            {/* Detailed Log Breakdown of Updated Fields */}
                            {uploadSummary.auditRecords && uploadSummary.auditRecords.length > 0 && (
                                <div className="mt-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-2 bg-gray-50 text-xs">
                                    <p className="font-bold text-gray-700 mb-1.5 text-[11px]">Updated Products Log ({uploadSummary.auditRecords.length}):</p>
                                    <div className="space-y-1.5">
                                        {uploadSummary.auditRecords.map((rec, i) => (
                                            <div key={i} className="bg-white p-2 rounded border border-gray-200 text-[10px] leading-snug">
                                                <p className="font-bold text-gray-900 truncate">{rec.productName} <span className="text-blue-600 font-mono">({rec.sku})</span></p>
                                                <div className="mt-1 space-y-0.5">
                                                    {rec.changes.map((c, j) => (
                                                        <p key={j} className="text-gray-600 truncate">
                                                            <span className="font-semibold text-gray-800">{c.fieldName}:</span> <span className="line-through text-red-500">{c.oldValue}</span> &rarr; <span className="font-bold text-green-600">{c.newValue}</span>
                                                        </p>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

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
