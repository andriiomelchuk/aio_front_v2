import { isAnyOf, type Middleware } from "@reduxjs/toolkit";
import { saveComparisonToStorage } from "./comparisonStorage";
import { toggleProductInComparison } from "./comparisonSlice";



const isComparisonAction = isAnyOf(
    toggleProductInComparison
);

export const comparisonMiddleware: Middleware = (store) => (next) => (action) => {
    const result = next(action);

    if (isComparisonAction(action)) {
        saveComparisonToStorage(store.getState().comparison);
    }
    return result;
}