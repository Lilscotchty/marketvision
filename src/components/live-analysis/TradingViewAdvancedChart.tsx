
"use client";

import React, { useEffect, useRef, memo } from 'react';

function TradingViewAdvancedChartWidget() {
  const container = useRef<HTMLDivElement | null>(null);
  const scriptAdded = useRef(false);

  useEffect(() => {
    let scriptElement: HTMLScriptElement | null = null;
    if (container.current && !scriptAdded.current) {
      scriptElement = document.createElement("script");
      scriptElement.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
      scriptElement.type = "text/javascript";
      scriptElement.async = true;
      scriptElement.innerHTML = JSON.stringify({
        "width": "100%",
        "height": "650",
        "symbol": "NASDAQ:AAPL",
        "interval": "D",
        "timezone": "Etc/UTC",
        "theme": "dark",
        "style": "1", // 1 = Candles
        "locale": "en",
        "backgroundColor": "rgba(16, 19, 24, 1)", // Matches app background (hsl(220, 20%, 7%))
        "gridColor": "rgba(46, 51, 56, 0.3)", // Grid lines from app border (hsl(220, 15%, 20%)), slightly transparent
        "toolbar_bg": "rgba(16, 19, 24, 1)", // Toolbar background from app card (hsl(220, 20%, 10%))
        "withdateranges": true,
        "hide_side_toolbar": false,
        "allow_symbol_change": true,
        "support_host": "https://www.tradingview.com",
        "overrides": {
          "paneProperties.background": "rgba(16, 19, 24, 1)", // Chart pane background
          "paneProperties.vertGridProperties.color": "rgba(46, 51, 56, 0.3)", // Vertical grid
          "paneProperties.horzGridProperties.color": "rgba(46, 51, 56, 0.3)", // Horizontal grid
          "scalesProperties.textColor": "rgba(247, 250, 252, 0.7)", // Text on scales (from app foreground hsl(210, 40%, 98%))
          "mainSeriesProperties.candleStyle.upColor": "rgba(93, 184, 93, 1)",    // Green (chart-5: hsl(120, 50%, 55%))
          "mainSeriesProperties.candleStyle.downColor": "rgba(209, 41, 41, 1)",  // Red (destructive: hsl(0, 70%, 55%))
          "mainSeriesProperties.candleStyle.wickUpColor": "rgba(93, 184, 93, 1)",
          "mainSeriesProperties.candleStyle.wickDownColor": "rgba(209, 41, 41, 1)",
          "mainSeriesProperties.candleStyle.borderUpColor": "rgba(93, 184, 93, 1)", 
          "mainSeriesProperties.candleStyle.borderDownColor": "rgba(209, 41, 41, 1)"
        }
      });
      container.current.appendChild(scriptElement);
      scriptAdded.current = true;
    }

    return () => {
      if (scriptAdded.current && container.current) {
        
        if (scriptElement && scriptElement.parentNode) {
          scriptElement.parentNode.removeChild(scriptElement);
        } else {
          
          const scripts = container.current.getElementsByTagName('script');
          for (let i = 0; i < scripts.length; i++) {
            if (scripts[i].src.includes('embed-widget-advanced-chart.js')) {
              scripts[i].remove();
              break; 
            }
          }
        }
        
        
        const widgetInnerContainer = container.current.querySelector('.tradingview-widget-container__widget');
        if (widgetInnerContainer) {
          widgetInnerContainer.innerHTML = '';
        }
        
        while (container.current.firstChild && container.current.firstChild !== widgetInnerContainer) {
            if(container.current.firstChild.nodeName !== "SCRIPT"){ 
                 container.current.removeChild(container.current.firstChild);
            } else if (container.current.firstChild.nodeName === "SCRIPT" && !scriptElement) {
                
                 container.current.removeChild(container.current.firstChild);
            } else {
                break; 
            }
        }

        scriptAdded.current = false;
      }
    };
  }, []);

  return (
    <div 
      className="tradingview-widget-container w-full"
      ref={container} 
    > 
      <div className="tradingview-widget-container__widget" style={{ height: "calc(100% - 32px)", width: "100%" }}></div>
      <div className="tradingview-widget-copyright" style={{textAlign: 'center', fontSize: '0.75rem', paddingTop: '8px'}}>
        <a href="https://www.tradingview.com/" rel="noopener nofollow" target="_blank" style={{color: 'hsl(var(--primary))'}}>
          Track all markets on TradingView
        </a>
      </div>
    </div>
  );
}

export default memo(TradingViewAdvancedChartWidget);

