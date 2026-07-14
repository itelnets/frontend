'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

type CartItem = {
    product: any;
    quantity: number;
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
    clearCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [myLists, setMyLists] = useState<any[]>([]);

    // Load from localStorage on mount
    useEffect(() => {
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
    }, []);

    // Save to localStorage when states change
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cartItems));
    }, [cartItems]);

    useEffect(() => {
        localStorage.setItem('myLists', JSON.stringify(myLists));
    }, [myLists]);

    const addToCart = (product: any, quantity = 1) => {
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
    };

    const removeFromCart = (productId: string) => {
        setCartItems(prev => prev.filter(item => item.product._id !== productId));
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const updateQuantity = (productId: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }
        setCartItems(prev => prev.map(item => 
            item.product._id === productId ? { ...item, quantity } : item
        ));
    };

    const moveToList = (product: any) => {
        removeFromCart(product._id);
        setMyLists(prev => {
            if (!prev.find(item => item._id === product._id)) {
                return [...prev, product];
            }
            return prev;
        });
        toast.success('Moved to lists');
    };

    const moveToCartFromList = (product: any) => {
        removeFromList(product._id);
        addToCart(product, 1);
    };

    const removeFromList = (productId: string) => {
        setMyLists(prev => prev.filter(item => item._id !== productId));
    };

    const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <CartContext.Provider value={{ 
            cartItems, addToCart, removeFromCart, updateQuantity, cartCount, 
            myLists, moveToList, moveToCartFromList, removeFromList, clearCart
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
