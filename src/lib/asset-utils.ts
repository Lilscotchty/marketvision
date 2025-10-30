
"use client";

// This file is no longer used for primary categorization logic but can be kept for color mappings or other client-side utilities.
// The primary logic is now handled by the `categorize-asset-flow` AI flow.

import type { AssetCategory } from "@/types";

export const categoryColors: Record<AssetCategory, string> = {
    Forex: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-green-500/30",
    Crypto: "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300 border-orange-500/30",
    Stock: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border-blue-500/30",
    Index: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300 border-indigo-500/30",
    Commodity: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 border-yellow-500/30",
    Unknown: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border-gray-500/30"
};
