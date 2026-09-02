'use client';

import { useState, useEffect, useMemo } from 'react';
import { getProducts, updateProduct } from '@/services/product';
import toast from 'react-hot-toast';
import Spinner from '@/components/Spinner';
import SortDropdown from '@/components/SortDropdown';
import ConfirmModal from '@/components/ConfirmModal';
import BulkProductTable, { ProductItem } from '@/components/BulkProductTable';

const BULK_FIELDS = [
    { id: 'name', label: 'Product Name', type: 'text', placeholder: 'e.g. Premium Widget' },
    { id: 'type', label: 'Product Type', type: 'typeSelect', placeholder: 'Select Product Type' },
    { id: 'brand', label: 'Brand', type: 'text', placeholder: 'e.g. Pratham Herbs Brands' },
    { id: 'manufacturer', label: 'Manufacturer', type: 'text', placeholder: 'e.g. Pratham Herbs Healthcare' },
    { id: 'price', label: 'Price (₹)', type: 'number', placeholder: '0.00' },
    { id: 'discount', label: 'Discount (%)', type: 'number', placeholder: '10' },
    { id: 'inStock', label: 'In Stock', type: 'radio', options: ['Yes', 'No'] },
    { id: 'bestSeller', label: 'Best Seller', type: 'toggle' },
    { id: 'categories', label: 'Categories (comma-separated)', type: 'text', placeholder: 'e.g. Supplements, Vitamins' },
    { id: 'hsn', label: 'HSN Code', type: 'text', placeholder: 'e.g. 123456' },
    { id: 'batchNo', label: 'Batch No.', type: 'text', placeholder: 'e.g. BATCH-001' },
    { id: 'expiredOn', label: 'Expired On', type: 'text', placeholder: '08-2026' },
    { id: 'overview', label: 'Overview', type: 'textarea', placeholder: 'Extensive product overview...' },
    { id: 'suggestedUse', label: 'Suggested Use', type: 'textarea', placeholder: 'Take 1 daily after meals...' },
    { id: 'otherIngredients', label: 'Key Ingredients', type: 'textarea', placeholder: 'Vitamin C, Zinc, Herbal Extracts...' },
    { id: 'warnings', label: 'Direction of use/dosage', type: 'textarea', placeholder: '1 capsule daily with water...' },
    { id: 'disclaimer', label: 'Safety Information', type: 'textarea', placeholder: 'Store in a cool dry place...' },
    { id: 'spec_Pack Size', label: 'Pack Size', type: 'text', placeholder: 'e.g. 500 gm' },
    { id: 'spec_Units in Pack', label: 'Units in Pack', type: 'text', placeholder: 'e.g. 1' },
    { id: 'spec_Dimensions (l x b h)', label: 'Dimensions (l x b h)', type: 'dimensions' },
    { id: 'spec_Form', label: 'Form', type: 'text', placeholder: 'e.g. Tablet, Capsule, Syrup, Oil etc.' },
    { id: 'spec_Treatment', label: 'Treatment', type: 'text', placeholder: 'e.g. Immunity, Hair Care' },
    { id: 'spec_Benefits', label: 'Benefits', type: 'text', placeholder: 'e.g. Energy Boost, Wellness' },
    { id: 'spec_Varient', label: 'Variant', type: 'text', placeholder: 'e.g. 500gm, Red, Small' },
];

export default function BulkEditProductsPage() {
    const [products, setProducts] = useState<ProductItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    // Product Selection & Type Filter State
    const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());
    const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('All Types');

    // Field Update State
    const [selectedFieldId, setSelectedFieldId] = useState<string>('name');
    const [newValue, setNewValue] = useState<string>('');

    // Dimensions State (L, B, H) - Max 2 Digits each
    const [dimL, setDimL] = useState('');
    const [dimB, setDimB] = useState('');
    const [dimH, setDimH] = useState('');

    // Fetch Products
    const fetchAllProducts = async () => {
        setIsLoading(true);
        try {
            const res = await getProducts({ limit: 10000, isActive: 'all' });
            const list: ProductItem[] = Array.isArray(res.data) ? res.data : (res.data?.products || []);
            setProducts(list);
        } catch (err) {
            console.error('Error fetching products for bulk edit:', err);
            toast.error('Failed to load products');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAllProducts();
    }, []);

    // Dynamic Product Type Options
    const productTypeOptions = useMemo(() => {
        const defaults = ['Supplements', 'Sports', 'Bath', 'Beauty', 'Grocery', 'Home', 'Baby', 'Pets'];
        const existing = products.map(p => p.type).filter((t): t is string => Boolean(t));
        return Array.from(new Set([...defaults, ...existing])).sort();
    }, [products]);

    // Selected Field Metadata
    const selectedFieldObj = BULK_FIELDS.find(f => f.id === selectedFieldId) || BULK_FIELDS[0];

    // Compute effective target value for update
    const getEffectiveValue = (): string => {
        if (selectedFieldObj.type === 'dimensions') {
            const l = dimL.trim();
            const b = dimB.trim();
            const h = dimH.trim();
            if (l || b || h) {
                return `${l} x ${b} x ${h}`;
            }
            return '';
        }
        return newValue;
    };

    // Form Submit Handler -> triggers custom Confirm Modal
    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (selectedProductIds.size === 0) {
            toast.error('Please select at least one product to update.');
            return;
        }

        setShowConfirmModal(true);
    };

    // Execute Bulk Update Action
    const executeBulkUpdate = async () => {
        setShowConfirmModal(false);
        setIsSaving(true);

        const valueToApply = getEffectiveValue();
        const toastId = toast.loading(`Updating ${selectedProductIds.size} products...`);

        let updatedCount = 0;

        try {
            const selectedList = products.filter(p => selectedProductIds.has(p._id));

            for (const p of selectedList) {
                try {
                    let updatePayload: Record<string, any> = {};

                    if (selectedFieldObj.id.startsWith('spec_')) {
                        const targetSpecKey = selectedFieldObj.id.replace('spec_', '');
                        const existingSpecs = Array.isArray(p.specifications) ? [...p.specifications] : [];

                        const specIdx = existingSpecs.findIndex(s => (s.key || '').trim().toLowerCase() === targetSpecKey.toLowerCase());
                        if (specIdx >= 0) {
                            existingSpecs[specIdx] = { ...existingSpecs[specIdx], key: targetSpecKey, value: valueToApply };
                        } else {
                            existingSpecs.push({ key: targetSpecKey, value: valueToApply });
                        }
                        updatePayload.specifications = existingSpecs;
                    } else if (selectedFieldObj.id === 'categories') {
                        updatePayload.categories = valueToApply ? valueToApply.split(',').map(c => c.trim()).filter(Boolean) : [];
                    } else if (selectedFieldObj.id === 'price') {
                        updatePayload.price = Number(valueToApply) || 0;
                    } else if (selectedFieldObj.id === 'discount') {
                        updatePayload.discount = Number(valueToApply) || 0;
                    } else {
                        updatePayload[selectedFieldObj.id] = valueToApply;
                    }

                    await updateProduct(p._id, updatePayload);
                    updatedCount++;
                } catch (err) {
                    console.error(`Error updating product ${p._id}:`, err);
                }
            }

            toast.success(`Successfully updated ${updatedCount} products!`, { id: toastId });
            await fetchAllProducts();
        } catch (err: any) {
            console.error('Bulk update error:', err);
            toast.error('Failed to complete bulk update', { id: toastId });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="font-sans p-0 sm:p-4 lg:h-full lg:flex lg:flex-col lg:overflow-hidden">
            {/* Custom Styled Confirm Modal */}
            <ConfirmModal
                isOpen={showConfirmModal}
                title="Confirm Bulk Edit"
                description={`Are you sure you want to update "${selectedFieldObj.label}" to "${getEffectiveValue() || '(empty)'}" for ${selectedProductIds.size} selected product(s)?`}
                onCancel={() => setShowConfirmModal(false)}
                onConfirm={executeBulkUpdate}
                confirmText="Apply Update"
                cancelText="Cancel"
                isLoading={isSaving}
            />

            <div className="relative w-full lg:flex-1 bg-white/80 backdrop-blur-xl border border-white/50 rounded-md shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-3 sm:p-6 transition-all lg:overflow-hidden lg:flex lg:flex-col">
                {isSaving && (
                    <div className="absolute inset-0 z-50 bg-white/60 backdrop-blur-sm rounded-md">
                        <div className="sticky top-0 h-[80vh] lg:h-full flex flex-col items-center justify-center">
                            <Spinner className="w-10 h-10 sm:w-12 sm:h-12 text-green-600 mb-4" />
                            <span className="text-gray-700 font-medium">Updating products, please wait...</span>
                        </div>
                    </div>
                )}

                <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 items-start lg:flex-1 lg:overflow-hidden">
                    {/* Left Column: Field Selection & Action (4/12) */}
                    <div className="w-full lg:w-4/12 space-y-4 lg:h-full lg:overflow-y-auto lg:pr-2 scrollbar-thin scrollbar-thumb-gray-200">
                        <form onSubmit={handleFormSubmit} className="space-y-4 sm:space-y-5">
                            <div>
                                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                                    Select Field to Update <span className="text-red-500">*</span>
                                </label>
                                <SortDropdown
                                    isAdmin={true}
                                    options={BULK_FIELDS.map(f => f.label)}
                                    value={selectedFieldObj.label}
                                    onChange={(val) => {
                                        const found = BULK_FIELDS.find(f => f.label === val);
                                        if (found) {
                                            setSelectedFieldId(found.id);
                                            if (found.type === 'typeSelect') {
                                                const defaultType = productTypeOptions[0] || 'Supplements';
                                                setNewValue(defaultType);
                                                setSelectedTypeFilter(defaultType);
                                            } else if (found.type === 'radio' || found.type === 'toggle') {
                                                setNewValue('Yes');
                                            } else if (found.type === 'dimensions') {
                                                setDimL('');
                                                setDimB('');
                                                setDimH('');
                                                setNewValue('');
                                            } else {
                                                setNewValue('');
                                            }
                                        }
                                    }}
                                    className="w-full"
                                    buttonClassName="w-full h-[36px] sm:h-[40px] text-xs sm:text-sm bg-white border border-green-500 rounded-lg font-bold hover:border-green-600 shadow-sm px-3"
                                    menuClassName="w-full"
                                    listClassName="max-h-[250px] sm:max-h-[300px]"
                                />
                            </div>

                            <div>
                                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                                    Set New Value for "{selectedFieldObj.label}" <span className="text-red-500">*</span>
                                </label>

                                {selectedFieldObj.type === 'typeSelect' ? (
                                    /* Custom Dropdown for Product Type with Auto-Filter */
                                    <SortDropdown
                                        isAdmin={true}
                                        options={productTypeOptions}
                                        value={newValue || productTypeOptions[0] || 'Supplements'}
                                        onChange={(val) => {
                                            setNewValue(val);
                                            setSelectedTypeFilter(val);
                                        }}
                                        className="w-full"
                                        buttonClassName="w-full h-[36px] sm:h-[40px] text-xs sm:text-sm bg-white border border-green-500 rounded-lg font-bold hover:border-green-600 shadow-sm px-3"
                                        menuClassName="w-full"
                                        listClassName="max-h-[220px] sm:max-h-[250px]"
                                    />
                                ) : selectedFieldObj.type === 'dimensions' ? (
                                    /* 3 Inputs for Dimensions L x B x H with strict 2-digit number validation */
                                    <div className="w-full flex items-center gap-2">
                                        <input
                                            type="text"
                                            placeholder="L"
                                            maxLength={2}
                                            value={dimL}
                                            onChange={(e) => setDimL(e.target.value.replace(/\D/g, '').slice(0, 2))}
                                            className="w-full min-w-0 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm h-[36px] sm:h-[40px] bg-white border border-gray-200 focus:border-green-600 rounded-md focus:outline-none text-center transition-all"
                                        />
                                        <span className="text-gray-400 font-bold text-xs sm:text-sm shrink-0">x</span>
                                        <input
                                            type="text"
                                            placeholder="B"
                                            maxLength={2}
                                            value={dimB}
                                            onChange={(e) => setDimB(e.target.value.replace(/\D/g, '').slice(0, 2))}
                                            className="w-full min-w-0 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm h-[36px] sm:h-[40px] bg-white border border-gray-200 focus:border-green-600 rounded-md focus:outline-none text-center transition-all"
                                        />
                                        <span className="text-gray-400 font-bold text-xs sm:text-sm shrink-0">x</span>
                                        <input
                                            type="text"
                                            placeholder="H"
                                            maxLength={2}
                                            value={dimH}
                                            onChange={(e) => setDimH(e.target.value.replace(/\D/g, '').slice(0, 2))}
                                            className="w-full min-w-0 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm h-[36px] sm:h-[40px] bg-white border border-gray-200 focus:border-green-600 rounded-md focus:outline-none text-center transition-all"
                                        />
                                    </div>
                                ) : selectedFieldObj.type === 'radio' ? (
                                    /* Radio options (Yes / No) with green accent */
                                    <div className="flex items-center gap-6 px-3 py-1.5 sm:py-2 h-[36px] sm:h-[40px] bg-white border border-gray-200 rounded-md">
                                        <label className="flex items-center gap-2 cursor-pointer text-xs sm:text-sm font-semibold text-gray-700">
                                            <input
                                                type="radio"
                                                name="bulkRadio"
                                                value="Yes"
                                                checked={newValue.toLowerCase() === 'yes' || !newValue}
                                                onChange={() => setNewValue('Yes')}
                                                className="accent-green-600 w-3.5 h-3.5 sm:w-4 sm:h-4 cursor-pointer"
                                            />
                                            <span>Yes</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer text-xs sm:text-sm font-semibold text-gray-700">
                                            <input
                                                type="radio"
                                                name="bulkRadio"
                                                value="No"
                                                checked={newValue.toLowerCase() === 'no'}
                                                onChange={() => setNewValue('No')}
                                                className="accent-green-600 w-3.5 h-3.5 sm:w-4 sm:h-4 cursor-pointer"
                                            />
                                            <span>No</span>
                                        </label>
                                    </div>
                                ) : selectedFieldObj.type === 'toggle' ? (
                                    /* Toggle Switch */
                                    <div className="flex items-center justify-between px-3 py-1.5 sm:py-2.5 h-[36px] sm:h-[40px] bg-white border border-gray-200 rounded-md transition-all hover:border-green-600/30">
                                        <label className="text-xs sm:text-sm font-semibold text-gray-700 cursor-pointer" onClick={() => setNewValue(prev => (prev.toLowerCase() === 'yes' ? '' : 'Yes'))}>
                                            {selectedFieldObj.label}
                                        </label>
                                        <button
                                            type="button"
                                            role="switch"
                                            aria-checked={newValue.toLowerCase() === 'yes'}
                                            onClick={() => setNewValue(prev => (prev.toLowerCase() === 'yes' ? '' : 'Yes'))}
                                            className={`${newValue.toLowerCase() === 'yes' ? 'bg-green-600' : 'bg-gray-200'
                                                } relative inline-flex h-5 sm:h-6 w-9 sm:w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none`}
                                        >
                                            <span
                                                aria-hidden="true"
                                                className={`${newValue.toLowerCase() === 'yes' ? 'translate-x-4 sm:translate-x-5' : 'translate-x-0'
                                                    } pointer-events-none inline-block h-4 sm:h-5 w-4 sm:w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                                            />
                                        </button>
                                    </div>
                                ) : selectedFieldObj.type === 'textarea' ? (
                                    <textarea
                                        rows={4}
                                        value={newValue}
                                        onChange={(e) => setNewValue(e.target.value)}
                                        placeholder={selectedFieldObj.placeholder}
                                        className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-gray-200 rounded-md focus:border-green-600 focus:outline-none transition-all text-gray-900 placeholder-gray-400"
                                    />
                                ) : (
                                    <input
                                        type={selectedFieldObj.type}
                                        value={newValue}
                                        onChange={(e) => {
                                            let val = e.target.value;
                                            if (selectedFieldObj.id === 'expiredOn') {
                                                val = val.replace(/\D/g, '');
                                                if (val.length >= 3) {
                                                    val = val.substring(0, 2) + '-' + val.substring(2, 6);
                                                }
                                            }
                                            setNewValue(val);
                                        }}
                                        placeholder={selectedFieldObj.placeholder}
                                        maxLength={selectedFieldObj.id === 'expiredOn' ? 7 : undefined}
                                        className="w-full px-3 py-1.5 sm:py-2 text-xs sm:text-sm h-[36px] sm:h-[40px] bg-white border border-gray-200 rounded-md focus:border-green-600 focus:outline-none transition-all text-gray-900 placeholder-gray-400"
                                    />
                                )}
                            </div>

                            <div className="pt-1 sm:pt-2">
                                <button
                                    type="submit"
                                    disabled={isSaving || selectedProductIds.size === 0}
                                    className={`w-full h-[36px] sm:h-[40px] py-1.5 sm:py-2.5 px-4 rounded-md font-semibold text-xs sm:text-sm text-white shadow-sm flex items-center justify-center gap-2 transition cursor-pointer ${isSaving || selectedProductIds.size === 0
                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            : 'bg-green-600 hover:bg-green-700'
                                        }`}
                                >
                                    {isSaving ? (
                                        <>
                                            <Spinner />
                                            <span>Updating Products...</span>
                                        </>
                                    ) : (
                                        <span>Apply Update to {selectedProductIds.size} Products</span>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Right Column: Product Table Component (8/12) */}
                    <BulkProductTable
                        products={products}
                        isLoading={isLoading}
                        selectedProductIds={selectedProductIds}
                        setSelectedProductIds={setSelectedProductIds}
                        selectedTypeFilter={selectedTypeFilter}
                        setSelectedTypeFilter={setSelectedTypeFilter}
                        productTypeOptions={productTypeOptions}
                    />
                </div>
            </div>
        </div>
    );
}
