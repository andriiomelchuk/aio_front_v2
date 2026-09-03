import { useDispatch, useSelector } from "react-redux";
import type { T_AppDispatch, T_RootState } from "./store";

export const useAppDispatch = useDispatch.withTypes<T_AppDispatch>();
export const useAppSelector = useSelector.withTypes<T_RootState>();