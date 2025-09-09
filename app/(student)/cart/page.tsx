'use client';

import { useEffect, useState, useRef } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import EmptyCartMessage from '@/components/cart/EmptyCartMessage';
import CartItemCard from '@/components/cart/CartItemCard';
import CheckoutSummary from '@/components/cart/CheckoutSummary';
import { useToast } from '@/hooks/use-toast';

export default function Cart() {
    const { cartItems, isLoading, removeFromCart, refreshCart } = useCart();
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [localLoading, setLocalLoading] = useState(false);
    const [removingItems, setRemovingItems] = useState<Set<string | number>>(new Set());
    
    // Use this to track if we've already loaded the cart in this session
    const cartLoadedRef = useRef(false);

    useEffect(() => {
        // If not authenticated and finished checking auth, redirect to login
        if (!isAuthenticated && !authLoading) {
            router.push('/login?redirect=/cart');
            return;
        }

        // Only load cart once when authenticated and not already loaded
        if (isAuthenticated && !cartLoadedRef.current && !isLoading) {
            const loadCart = async () => {
                try {
                    setLocalLoading(true);
                    await refreshCart();
                    cartLoadedRef.current = true;
                } catch (error) {
                    console.error('Error loading cart:', error);
                    toast({
                        title: 'Không thể tải giỏ hàng',
                        description: 'Đã xảy ra lỗi khi tải giỏ hàng của bạn.',
                        variant: 'destructive'
                    });
                } finally {
                    setLocalLoading(false);
                }
            };

            loadCart();
        }

      
        // No cleanup that resets cartLoadedRef to prevent multiple refreshes
    }, [isAuthenticated, authLoading, router]); // Remove refreshCart from dependencies


    const handleRemoveItem = async (id: number) => {
        console.log("handleRemoveItem called with id:", id);
        
        // Add item to removing list
        setRemovingItems(prev => new Set([...prev, id]));

        try {
            console.log("Calling removeFromCart with id:", id);
            const success = await removeFromCart(id);
            console.log("removeFromCart result:", success);

            if (!success) {
                toast({
                    title: 'Không thể xóa khóa học',
                    description: 'Đã xảy ra lỗi khi xóa khóa học khỏi giỏ hàng.',
                    variant: 'destructive'
                });
            }
        } catch (error) {
            console.error('Error removing item:', error);
            toast({
                title: 'Không thể xóa khóa học',
                description: 'Đã xảy ra lỗi khi xóa khóa học khỏi giỏ hàng.',
                variant: 'destructive'
            });
        } finally {
            // Remove item from removing list
            setRemovingItems(prev => {
                const newSet = new Set(prev);
                newSet.delete(id);
                return newSet;
            });
        }
    };

    const handleSaveForLater = (id: string | number) => {
        toast({
            title: 'Tính năng đang phát triển',
            description: 'Tính năng lưu khóa học sẽ sớm được ra mắt.',
        });
    };

    const handleAddToFavorites = (id: string | number) => {
        toast({
            title: 'Tính năng đang phát triển',
            description: 'Tính năng thêm vào danh sách yêu thích sẽ sớm được ra mắt.',
        });
    };

    // Show loading state
    if (isLoading || localLoading || authLoading) {
        return (
            <div className="container mx-auto py-6 px-4 flex justify-center items-center min-h-[61vh]">
                <div className="inline-block animate-spin rounded-full border-4 border-solid border-current border-r-transparent w-6 h-6" role="status">
                    <span className="sr-only">Loading...</span>
                </div>
                <span className="ml-2">Đang tải giỏ hàng...</span>
            </div>
        );
    }

    return (
        <div className="min-h-screen container mx-auto py-6 px-4">
            <h1 className="text-2xl font-bold mb-6">Giỏ hàng</h1>

            {cartItems.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Cart Content */}
                    <div className="lg:col-span-2">
                        <div className="space-y-4">
                            {cartItems.map((item) => (
                                <CartItemCard
                                    key={item.id}
                                    item={item}
                                    onRemove={handleRemoveItem}
                                    onSaveForLater={handleSaveForLater}
                                    onAddToFavorites={handleAddToFavorites}
                                    isRemoving={removingItems.has(item.id)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Checkout Summary */}
                    <div className="lg:col-span-1">
                        <CheckoutSummary cartItems={cartItems} />
                    </div>
                </div>
            ): (<EmptyCartMessage />)}
        </div>
    );
}