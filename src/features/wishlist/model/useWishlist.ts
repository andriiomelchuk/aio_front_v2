import { T_Product } from "@/entities/product/model/types";

export const useWishlist = () => {

    const wishlistProductIds = new Set<string>();

    const addToWishlist = (product: T_Product) => {
        console.log("Add to wishlist:", product);
    };

    const removeFromWishlist = (product: T_Product) => {
        console.log("Remove from wishlist:", product);
    }

    const isInWishlist = (productId: string) => {
        return wishlistProductIds.has(productId);
    };


    return {
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
    };
}