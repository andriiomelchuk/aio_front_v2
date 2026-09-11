
import { useAppDispatch, useAppSelector } from "@/shared/store/hooks";
import { useCallback } from "react";
import { loadWishlistFromStorage } from "./wishlistStorage";
import {
    clearWishlist,
    restoreWishlist,
    toggleWishlist,
} from "./wishlistSlice";

export const useWishlist = () => {

    const dispatch = useAppDispatch();

    const productIds = useAppSelector((state) => state.wishlist.productIds);

    const isInWishlist = (productId: string) => {
        return productIds.includes(productId);
    }

    const toggleProductWishlist = (productId: string) => {
        dispatch(toggleWishlist(productId));
    }

    const clearAllWishlist = () => {
        dispatch(clearWishlist());
    };

    const restoreWishlistFromStorage = useCallback(() => {
        const savedWishlist = loadWishlistFromStorage();

        if (!savedWishlist) return;

        dispatch(restoreWishlist(savedWishlist));
    }, [dispatch]);

    return {
        productIds,
        isInWishlist,
        toggleProductWishlist,
        clearAllWishlist,
        restoreWishlistFromStorage,
    };
}
