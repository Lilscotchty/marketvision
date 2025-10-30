
"use client";

import { useState, useEffect, useRef } from 'react';
import type { AlertConfig } from '@/types';

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected';
type FinnhubTrade = {
  p: number; // Price
  s: string; // Symbol
  t: number; // Timestamp
  v: number; // Volume
};

const FINNHUB_API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;

function symbolToFinnhub(alert: AlertConfig): string | null {
    const symbol = alert.asset.toUpperCase().trim();
    const category = alert.category;

    switch (category) {
        case 'Forex':
            // Convert 'EUR/USD' or 'EURUSD' to 'OANDA:EUR_USD'
            return `OANDA:${symbol.replace('/', '_')}`;
        
        case 'Crypto':
            // Convert 'BTC/USD' or 'BTCUSD' to 'BINANCE:BTCUSDT' - a common format.
            // This is still a simplification but more robust than before.
            const base = symbol.split('/')[0].replace('USDT', '').replace('USD', '');
            return `BINANCE:${base}USDT`;

        case 'Stock':
        case 'Index':
        case 'Commodity':
            // Assume the symbol is correct for stocks/commodities (e.g., AAPL, USO)
            return symbol.split('/')[0]; // Handle cases like XAU/USD for commodities

        default:
            // If category is unknown, make a best guess
            if (symbol.includes('/')) return `OANDA:${symbol.replace('/', '_')}`;
            if (symbol.length > 5) return `BINANCE:${symbol.replace('USD','').replace('/','')}USDT`;
            return symbol;
    }
}


export function useFinnhubTrades(
  alerts: AlertConfig[],
  onTrade: (trade: FinnhubTrade) => void
) {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const socket = useRef<WebSocket | null>(null);
  const subscribedSymbols = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!FINNHUB_API_KEY) {
        console.warn("Finnhub API key is not set. Real-time alerts are disabled.");
        setConnectionStatus('disconnected');
        return;
    }

    const activeAlerts = alerts.filter(a => a.isActive);

    if (activeAlerts.length === 0) {
      if (socket.current && socket.current.readyState === WebSocket.OPEN) {
        socket.current.close();
      }
      return;
    }
    
    if (!socket.current || socket.current.readyState === WebSocket.CLOSED) {
      socket.current = new WebSocket(`wss://ws.finnhub.io?token=${FINNHUB_API_KEY}`);
      subscribedSymbols.current.clear();
      setConnectionStatus('connecting');

      socket.current.onopen = () => {
        setConnectionStatus('connected');
        // Resubscribe on open
        const finnhubSymbols = activeAlerts.map(symbolToFinnhub).filter((s): s is string => s !== null);
        for (const symbol of finnhubSymbols) {
          if (!subscribedSymbols.current.has(symbol)) {
            socket.current?.send(JSON.stringify({ type: 'subscribe', symbol }));
            subscribedSymbols.current.add(symbol);
          }
        }
      };

      socket.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'trade') {
          data.data.forEach(onTrade);
        }
      };

      socket.current.onclose = () => {
        setConnectionStatus('disconnected');
        socket.current = null;
      };
      
      socket.current.onerror = (error) => {
        console.error('WebSocket Error:', error);
        setConnectionStatus('disconnected');
      };
    }
    
    // Subscribe to new symbols
    const finnhubSymbolsToSubscribe = new Set(activeAlerts.map(symbolToFinnhub).filter((s): s is string => s !== null));

    // Subscribe to symbols that are not yet subscribed
    finnhubSymbolsToSubscribe.forEach(symbol => {
      if (!subscribedSymbols.current.has(symbol) && socket.current?.readyState === WebSocket.OPEN) {
        socket.current.send(JSON.stringify({ type: 'subscribe', symbol }));
        subscribedSymbols.current.add(symbol);
      }
    });

    // Unsubscribe from symbols that are no longer active
    subscribedSymbols.current.forEach(subscribedSymbol => {
      if (!finnhubSymbolsToSubscribe.has(subscribedSymbol) && socket.current?.readyState === WebSocket.OPEN) {
        socket.current.send(JSON.stringify({ type: 'unsubscribe', symbol: subscribedSymbol }));
        subscribedSymbols.current.delete(subscribedSymbol);
      }
    });

    return () => {
      if (socket.current && socket.current.readyState === WebSocket.OPEN && activeAlerts.length === 0) {
        socket.current.close();
      }
    };
  }, [alerts, onTrade]);

  return { connectionStatus };
}
