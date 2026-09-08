"use client";

import { useCompare } from "@/features/comparison/model/useCompare";
import { useEffect } from "react";


export const ComparisonInitializer = () => {
  const { restoreComparisonFromStorage } = useCompare();

  useEffect(() => {
    restoreComparisonFromStorage();
  }, [restoreComparisonFromStorage]);

  return null;
};