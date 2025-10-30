
"use client";

export type AssetCategory = 'Forex' | 'Crypto' | 'Stock' | 'Index' | 'Commodity' | 'Unknown';

// A simplified version of the server-side `determineAssetType` for client-side category tagging.
export function getAssetCategory(symbol: string): AssetCategory {
    if (!symbol) return 'Unknown';
    const upperSymbol = symbol.toUpperCase().trim();

    // Forex check (e.g., EUR/USD, GBP_JPY)
    if ((upperSymbol.includes('/') || upperSymbol.includes('_')) && upperSymbol.length >= 7) {
        const parts = upperSymbol.split(/\/|_/);
        if (parts.length === 2 && parts[0].length === 3 && parts[1].length === 3) {
            return 'Forex';
        }
    }
    
    // Index check (common prefixes/suffixes)
    if (['SPX', 'NSX', 'DJI', 'DAX', 'UKX', 'NDX', 'VIX'].some(ix => upperSymbol.includes(ix)) || upperSymbol.startsWith('^')) {
        return 'Index';
    }

    // Commodity check (crude oil, gold, silver)
    if (['XAU', 'XAG', 'WTI', 'BRENT', 'USO'].some(cmd => upperSymbol.includes(cmd)) || upperSymbol.startsWith('GC=')) {
        return 'Commodity';
    }

    // Crypto check
    const commonFiats = ['USD', 'EUR', 'GBP', 'JPY', 'USDT', 'USDC', 'BUSD'];
    for (const fiat of commonFiats) {
        if (upperSymbol.endsWith(fiat)) {
            const cryptoPart = upperSymbol.substring(0, upperSymbol.length - fiat.length);
            if (cryptoPart.length >= 2 && cryptoPart.length <= 5) {
                return 'Crypto';
            }
        }
    }
    if (['BTC', 'ETH', 'SOL', 'XRP', 'DOGE', 'ADA'].includes(upperSymbol)) return 'Crypto';

    // Stock check (alphanumeric, 1-5 chars)
    if (/^[A-Z0-9\.]{1,5}$/.test(upperSymbol)) {
        return 'Stock';
    }

    return 'Unknown';
}

export const categoryColors: Record<AssetCategory, string> = {
    Forex: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-green-500/30",
    Crypto: "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300 border-orange-500/30",
    Stock: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border-blue-500/30",
    Index: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300 border-indigo-500/30",
    Commodity: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 border-yellow-500/30",
    Unknown: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border-gray-500/30"
};
