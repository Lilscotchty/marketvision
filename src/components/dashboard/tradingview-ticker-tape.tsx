
"use client";

import React, { useEffect, useRef, memo } from 'react';

function TradingViewTickerTape() {
  const container = useRef<HTMLDivElement>(null);
  const scriptAppended = useRef(false);

  useEffect(() => {
    // Ensure this only runs on the client
    if (typeof window === 'undefined') {
      return;
    }

    const script = document.createElement("script");
    if (container.current && !scriptAppended.current) {
        script.src = "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
        script.type = "text/javascript";
        script.async = true;
        script.innerHTML = JSON.stringify({
          "symbols": [
            {
              "proName": "FOREXCOM:SPXUSD",
              "title": "S&P 500 Index"
            },
            {
              "proName": "FOREXCOM:NSXUSD",
              "title": "US 100 Cash CFD"
            },
            {
              "proName": "FX_IDC:EURUSD",
              "title": "EUR to USD"
            },
            {
              "proName": "BITSTAMP:BTCUSD",
              "title": "Bitcoin"
            },
            {
              "proName": "BITSTAMP:ETHUSD",
              "title": "Ethereum"
            },
            {
              "proName": "ICMARKETS:USTEC",
              "title": "USTEC"
            }
          ],
          "showSymbolLogo": true,
          "colorTheme": "dark",
          "isTransparent": true,
          "displayMode": "regular",
          "locale": "en"
        });

        container.current.appendChild(script);
        scriptAppended.current = true;
    }

    // Cleanup function to remove the script and widget when the component unmounts
    return () => {
      if (container.current && script.parentNode === container.current) {
        container.current.removeChild(script);
      }
      // Also, clear the inner HTML to ensure the widget itself is gone
      if (container.current) {
        const widgetContainer = container.current.querySelector('.tradingview-widget-container__widget');
        if (widgetContainer) {
            widgetContainer.innerHTML = '';
        }
      }
      scriptAppended.current = false;
    };
  }, []);

  return (
    <div className="tradingview-widget-container" ref={container}>
      <div className="tradingview-widget-container__widget"></div>
    </div>
  );
}

export default memo(TradingViewTickerTape);
