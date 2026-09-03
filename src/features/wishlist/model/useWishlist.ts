
import { useAppDispatch, useAppSelector } from "@/shared/store/hooks";
import { toggleWishlist } from "./wishlistSlice";

export const useWishlist = () => {

    const dispatch = useAppDispatch();

    const productIds = useAppSelector((state) => state.wishlist.productIds);

    const isInWishlist = (productId: string) => {
        return productIds.includes(productId);
    }

    const toggleProductWishlist = (productId: string) => {
        dispatch(toggleWishlist(productId));
    }

    return {
        productIds,
        isInWishlist,
        toggleProductWishlist,
    };
}