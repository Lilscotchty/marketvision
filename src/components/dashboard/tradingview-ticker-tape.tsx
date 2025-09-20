
"use client";

import React, { useEffect, useRef, memo } from 'react';
import { useTheme } from '@/contexts/theme-context'; // Import useTheme

function TradingViewTickerTape() {
  const container = useRef<HTMLDivElement>(null);
  const scriptAppended = useRef(false); // Ref to track if script has been appended
  const { theme } = useTheme(); // Get the current theme

  useEffect(() => {
    // Check if the script has already been appended and if the container exists
    if (container.current && !scriptAppended.current) {
      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
      script.type = "text/javascript";
      script.async = true;
      script.innerHTML = JSON.stringify({
        "symbols": [
          { "proName": "FOREXCOM:SPXUSD", "title": "S&P 500 Index" },
          { "proName": "FOREXCOM:NSXUSD", "title": "US 100 Cash CFD" },
          { "proName": "FX_IDC:EURUSD", "title": "EUR to USD" },
          { "proName": "BITSTAMP:BTCUSD", "title": "Bitcoin" },
          { "proName": "BITSTAMP:ETHUSD", "title": "Ethereum" },
          { "proName": "ICMARKETS:USTEC", "title": "USTEC" }
        ],
        "showSymbolLogo": true,
        "colorTheme": theme, // Use the dynamic theme
        "isTransparent": true,
        "displayMode": "regular",
        "locale": "en"
      });
      
      container.current.appendChild(script);
      scriptAppended.current = true; // Mark script as appended
    }
  }, [theme]); // Re-run effect if theme changes

  return (
    <div className="tradingview-widget-container" ref={container}>
      <div className="tradingview-widget-container__widget"></div>
    </div>
  );
}

export default memo(TradingViewTickerTape);
