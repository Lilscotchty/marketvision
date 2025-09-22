
"use client";

import { useState, useEffect, useRef } from 'react';

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected';
type FinnhubTrade = {
  p: number; // Price
  s: string; // Symbol
  t: number; // Timestamp
  v: number; // Volume
};

const FINNHUB_API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;

function symbolToFinnhub(symbol: string): string {
    // Basic conversion, can be expanded
    // OANDA:EUR_USD, BINANCE:BTCUSDT, AAPL
    if (symbol.includes('/')) {
        return `OANDA:${symbol.replace('/', '_')}`;
    }
    // Simple check for crypto - can be improved
    if (symbol.endsWith('USD') || symbol.endsWith('USDT')) {
        // This is a simplification. Finnhub needs exchange info.
        // Assuming Binance for this example.
        return `BINANCE:${symbol.replace('USD', 'USDT')}`;
    }
    return symbol; // Assume stock
}


export function useFinnhubTrades(
  symbols: string[],
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

    if (symbols.length === 0) {
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
        // Resubscribe to all current symbols
        const finnhubSymbols = symbols.map(symbolToFinnhub);
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
    const finnhubSymbolsToSubscribe = symbols.map(symbolToFinnhub);
    for (const symbol of finnhubSymbolsToSubscribe) {
        if (!subscribedSymbols.current.has(symbol) && socket.current?.readyState === WebSocket.OPEN) {
            socket.current.send(JSON.stringify({ type: 'subscribe', symbol }));
            subscribedSymbols.current.add(symbol);
        }
    }
    
    // Unsubscribe from old symbols
    const symbolsToUnsubscribe: string[] = [];
    subscribedSymbols.current.forEach(subscribedSymbol => {
        const originalSymbol = subscribedSymbol.startsWith('OANDA:') 
            ? subscribedSymbol.replace('OANDA:', '').replace('_', '/')
            : subscribedSymbol.startsWith('BINANCE:')
            ? subscribedSymbol.replace('BINANCE:', '')
            : subscribedSymbol;

        if (!symbols.includes(originalSymbol)) {
            symbolsToUnsubscribe.push(subscribedSymbol);
        }
    });

    for (const symbol of symbolsToUnsubscribe) {
        if (socket.current?.readyState === WebSocket.OPEN) {
            socket.current.send(JSON.stringify({ type: 'unsubscribe', symbol }));
            subscribedSymbols.current.delete(symbol);
        }
    }


    return () => {
      // Don't close the socket on every render, just when component unmounts
      if (socket.current && symbols.length === 0) {
        socket.current.close();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbols]); // Only re-run when symbols array reference changes

  return { connectionStatus };
}
