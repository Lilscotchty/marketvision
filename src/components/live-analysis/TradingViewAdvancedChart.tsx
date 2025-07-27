
"use client";

import React, { useEffect, useRef, memo } from 'react';

function TradingViewWidget() {
  const container = useRef<HTMLDivElement>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  useEffect(() => {
    if (!container.current || container.current.querySelector('script')) {
      return;
    }

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      "allow_symbol_change": true,
      "calendar": false,
      "details": false,
      "hide_side_toolbar": false,
      "hide_top_toolbar": false,
      "hide_legend": false,
      "hide_volume": false,
      "hotlist": true,
      "interval": "D",
      "locale": "en",
      "save_image": true,
      "style": "1",
      "symbol": "NASDAQ:AAPL",
      "theme": "dark",
      "timezone": "Etc/UTC",
      "backgroundColor": "rgba(1, 3, 21, 0.31)",
      "gridColor": "rgba(242, 242, 242, 0.06)",
      "watchlist": [],
      "withdateranges": true,
      "compareSymbols": [],
      "show_popup_button": true,
      "popup_height": "650",
      "popup_width": "1000",
      "studies": [],
      "autosize": true
    });
    
    container.current.appendChild(script);
    scriptRef.current = script;

    return () => {
      if (scriptRef.current && scriptRef.current.parentNode === container.current) {
        container.current?.removeChild(scriptRef.current);
        scriptRef.current = null;
        // Clean up the widget itself
        const widgetContainer = container.current?.querySelector('.tradingview-widget-container__widget');
        if (widgetContainer) {
          widgetContainer.innerHTML = '';
        }
      }
    };
  }, []);

  return (
    <div className="tradingview-widget-container h-full w-full" ref={container}>
      <div className="tradingview-widget-container__widget h-full w-full"></div>
    </div>
  );
}

export default memo(TradingViewWidget);
