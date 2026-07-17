'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { getCart, addToCart as apiAddToCart, updateCartItem as apiUpdateCartItem, removeFromCart as apiRemoveFromCart, clearCart as apiClearCart } from '@/services/cart';
import { getWishlist as apiGetWishlist, addToWishlist as apiAddToWishlist, removeFromWishlist as apiRemoveFromWishlist } from '@/services/lists';

type CartItem = {
    product: any;
    quantity: number;
    [key: string]: any;
};

type CartContextType = {
    cartItems: CartItem[];
    addToCart: (product: any, quantity?: number) => void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    cartCount: number;
    myLists: any[];
    moveToList: (product: any) => void;
    moveToCartFromList: (product: any) => void;
    removeFromList: (productId: string) => void;
    wishlist: any[];
    addToWishlist: (product: any) => void;
    removeFromWishlist: (productId: string) => void;
    savedForLater: any[];
    saveForLater: (product: any) => void;
    moveToCartFromSaved: (product: any) => void;
    removeFromSaved: (item: any) => void;
    clearCart: () => void;
    isCartLoading: boolean;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [myLists, setMyLists] = useState<any[]>([]);
    const [wishlist, setWishlist] = useState<any[]>([]);
    const [savedForLater, setSavedForLater] = useState<any[]>([]);
    const [isCartLoading, setIsCartLoading] = useState(false);

    const getProductFromItem = (item: any) => item?.product || item;
    const getProductIdFromItem = (item: any) => getProductFromItem(item)?._id;
    const normalizeProductList = (items: any[]) => (Array.isArray(items) ? items.map(item => getProductFromItem(item)) : []);

    // Check if user is logged in
    const isUserLoggedIn = () => {
        if (typeof window !== 'undefined') {
            return !!localStorage.getItem('userInfo');
        }
        return false;
    };

    const fetchBackendCart = useCallback(async () => {
        setIsCartLoading(true);
        try {
            const { data } = await getCart();
            if (data) {
                setCartItems(data.items || []);
                setSavedForLater(normalizeProductList(data.savedItems || []));
            }
        } catch (error) {
            console.error('Failed to fetch backend cart', error);
        } finally {
            setIsCartLoading(false);
        }
    }, []);

    // Load from localStorage or API on mount
    useEffect(() => {
        const loadData = async () => {
            if (isUserLoggedIn()) {
                // load server-side cart + wishlist for authenticated users
                fetchBackendCart();
                try {
                    const { data } = await apiGetWishlist();
                    setMyLists(normalizeProductList(data.wishlist || []));
                } catch (error) {
                    console.error('Failed to fetch wishlist API', error);
                }
            } else {
                // guests: load from localStorage
                const storedCart = localStorage.getItem('cart');
                if (storedCart) {
                    try {
                        setCartItems(JSON.parse(storedCart));
                    } catch (e) {
                        console.error("Failed to parse cart", e);
                    }
                }

                const storedLists = localStorage.getItem('myLists');
                if (storedLists) {
                    try {
                        setMyLists(JSON.parse(storedLists));
                    } catch (e) {
                        console.error("Failed to parse myLists", e);
                    }
                }

                const storedSaved = localStorage.getItem('savedForLater');
                if (storedSaved) {
                    try {
                        setSavedForLater(normalizeProductList(JSON.parse(storedSaved)));
                    } catch (e) {
                        console.error("Failed to parse savedForLater", e);
                    }
                }
            }
        };

        loadData();
    }, [fetchBackendCart]);

    // Save to localStorage when states change (only for guests)
    useEffect(() => {
        if (!isUserLoggedIn()) {
            localStorage.setItem('cart', JSON.stringify(cartItems));
        }
    }, [cartItems]);

    useEffect(() => {
        localStorage.setItem('myLists', JSON.stringify(myLists));
    }, [myLists]);

    useEffect(() => {
        // Persist saved-for-later only for guests. Authenticated users' saved items come from server.
        if (!isUserLoggedIn()) {
            localStorage.setItem('savedForLater', JSON.stringify(savedForLater));
        }
    }, [savedForLater]);

    const addToCart = async (product: any, quantity = 1) => {
        if (isUserLoggedIn()) {
            try {
                const { data } = await apiAddToCart(product._id, quantity, false);
                setCartItems(data.items || []);
                setSavedForLater(normalizeProductList(data.savedItems || []));
                toast.success('Item Added to Cart');
            } catch (error) {
                console.error('Failed to add to cart API', error);
                toast.error('Failed to add to cart');
            }
        } else {
            setCartItems((prev) => {
                const existing = prev.find(item => item.product._id === product._id);
                if (existing) {
                    return prev.map(item =>
                        item.product._id === product._id
                            ? { ...item, quantity: item.quantity + quantity }
                            : item
                    );
                }
                return [...prev, { product, quantity }];
            });
            toast.success('Item Added to Cart');
        }
    };

    const removeFromCart = async (productId: string) => {
        if (isUserLoggedIn()) {
            try {
                const { data } = await apiRemoveFromCart(productId);
                setCartItems(data.items || []);
                setSavedForLater(data.savedItems || []);
                toast.success('Item removed from cart');
            } catch (error) {
                console.error('Failed to remove from cart API', error);
                toast.error('Failed to remove item');
            }
        } else {
            setCartItems(prev => prev.filter(item => item.product._id !== productId));
            toast.success('Item removed from cart');
        }
    };

    const clearCart = async () => {
        if (isUserLoggedIn()) {
            try {
                const { data } = await apiClearCart();
                setCartItems(data.items || []);
                setSavedForLater(normalizeProductList(data.savedItems || []));
            } catch (error) {
                console.error('Failed to clear cart API', error);
            }
        } else {
            setCartItems([]);
        }
    };

    const updateQuantity = async (productId: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }

        if (isUserLoggedIn()) {
            try {
                const { data } = await apiUpdateCartItem(productId, { quantity });
                setCartItems(data.items || []);
                setSavedForLater(normalizeProductList(data.savedItems || []));
            } catch (error) {
                console.error('Failed to update cart quantity API', error);
                toast.error('Failed to update quantity');
            }
        } else {
            setCartItems(prev => prev.map(item =>
                item.product._id === productId ? { ...item, quantity } : item
            ));
        }
    };

    const moveToList = async (product: any) => {
        const productObj = getProductFromItem(product);
        const productId = getProductIdFromItem(product);

        if (isUserLoggedIn()) {
            try {
                const { data } = await apiAddToWishlist(productId);
                setMyLists(normalizeProductList(data.wishlist || []));
                toast.success('Added to my lists');
            } catch (error) {
                console.error('Failed to add to wishlist API', error);
                toast.error('Failed to add to my lists');
            }
            return;
        }

        if (cartItems.some(item => getProductIdFromItem(item) === productId)) {
            removeFromCart(productId);
        }
        setMyLists(prev => {
            if (!prev.find(item => getProductIdFromItem(item) === productId)) {
                return [...prev, productObj];
            }
            return prev;
        });
        toast.success('Added to my lists');
    };

    const moveToCartFromList = (product: any) => {
        removeFromList(product._id);
        addToCart(product, 1);
    };

    const removeFromList = async (productId: string) => {
        if (isUserLoggedIn()) {
            try {
                const { data } = await apiRemoveFromWishlist(productId);
                setMyLists(normalizeProductList(data.wishlist || []));
                toast.success('Item removed from my lists');
            } catch (error) {
                console.error('Failed to remove from wishlist API', error);
                toast.error('Failed to remove from my lists');
            }
            return;
        }

        setMyLists(prev => prev.filter(item => item._id !== productId));
        toast.success('Item removed from my lists');
    };

    const saveForLater = async (product: any) => {
        const productObj = getProductFromItem(product);
        const productId = getProductIdFromItem(product);

        if (isUserLoggedIn()) {
            try {
                const { data } = await apiUpdateCartItem(productId, { saveForLater: true });
                setCartItems(data.items || []);
                setSavedForLater(normalizeProductList(data.savedItems || []));
                toast.success('Item has been moved to save for later');
            } catch (error) {
                console.error('Failed to save item for later API', error);
                toast.error('Failed to save for later');
            }
            return;
        }

        setCartItems(prev => prev.filter(item => item.product._id !== productId));
        setSavedForLater(prev => {
            if (!prev.find(item => getProductIdFromItem(item) === productId)) {
                return [...prev, productObj];
            }
            return prev;
        });
        toast.success('Item has been moved to save for later');
    };

    const moveToCartFromSaved = async (item: any) => {
        const productObj = getProductFromItem(item);
        const productId = getProductIdFromItem(item);

        if (isUserLoggedIn()) {
            try {
                const { data } = await apiUpdateCartItem(productId, { saveForLater: false });
                setCartItems(data.items || []);
                setSavedForLater(normalizeProductList(data.savedItems || []));
            } catch (error) {
                console.error('Failed to move saved item to cart API', error);
                toast.error('Failed to move to cart');
            }
            return;
        }

        removeFromSaved(item);
        addToCart(productObj, 1);
    };

    const removeFromSaved = async (item: any) => {
        const productId = typeof item === 'string' ? item : getProductIdFromItem(item);

        if (isUserLoggedIn()) {
            try {
                const { data } = await apiRemoveFromCart(productId);
                setCartItems(data.items || []);
                setSavedForLater(normalizeProductList(data.savedItems || []));
                toast.success('Item removed from saved for later');
            } catch (error) {
                console.error('Failed to remove saved item API', error);
                toast.error('Failed to remove saved item');
            }
            return;
        }

        setSavedForLater(prev => prev.filter(entry => getProductIdFromItem(entry) !== productId));
        toast.success('Item removed from saved for later');
    };

    const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <CartContext.Provider value={{
            cartItems, addToCart, removeFromCart, updateQuantity, cartCount,
            myLists, moveToList, moveToCartFromList, removeFromList,
            wishlist, addToWishlist: moveToList, removeFromWishlist: removeFromList,
            savedForLater, saveForLater, moveToCartFromSaved, removeFromSaved,
            clearCart, isCartLoading
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
