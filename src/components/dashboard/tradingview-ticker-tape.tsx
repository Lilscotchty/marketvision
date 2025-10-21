
"use client";

import React, { useEffect, useRef, memo } from 'react';
import { useTheme } from '@/contexts/theme-context'; // Import useTheme

function TradingViewTickerTape() {
  const container = useRef<HTMLDivElement>(null);
  const { theme } = useTheme(); // Get the current theme
  const scriptExists = useRef(false);

  useEffect(() => {
    // Function to create and append the script
    const createScript = () => {
      if (container.current && !scriptExists.current) {
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
        scriptExists.current = true;
      }
    };

    // Clear the container and recreate script on theme change
    const containerRef = container.current;
    if (containerRef) {
      containerRef.innerHTML = '';
      scriptExists.current = false;
      createScript();
    }
    
    return () => {
      // Clean up the widget when the component unmounts
      if (containerRef) {
        containerRef.innerHTML = '';
        scriptExists.current = false;
      }
    };
  }, [theme]); // Re-run effect if theme changes

  return (
    <div className="tradingview-widget-container" ref={container}>
      <div className="tradingview-widget-container__widget"></div>
    </div>
  );
}

export default memo(TradingViewTickerTape);
