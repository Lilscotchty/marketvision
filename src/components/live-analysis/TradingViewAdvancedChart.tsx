"use client";

import React, { useEffect, useRef, memo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Maximize, X } from 'lucide-react';

function TradingViewAdvancedChart() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isBlurred, setIsBlurred] = useState(false);

  // Timer to trigger blur after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsBlurred(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let script = document.getElementById('tradingview-widget-script') as HTMLScriptElement | null;

    if (!script) {
      script = document.createElement('script');
      script.id = 'tradingview-widget-script';
      script.src = 'https://s3.tradingview.com/tv.js';
      script.type = 'text/javascript';
      script.async = true;
      script.onload = () => {
        if (typeof window !== 'undefined' && 'TradingView' in window) {
          createWidget();
        }
      };
      document.head.appendChild(script);
    } else {
      if (typeof window !== 'undefined' && 'TradingView' in window) {
        createWidget();
      }
    }

    function createWidget() {
      if (containerRef.current && 'TradingView' in window) {
        new (window as any).TradingView.widget({
          autosize: true, // This allows it to fill the h-full container
          symbol: "NASDAQ:AAPL",
          interval: "D",
          timezone: "Etc/UTC",
          theme: "dark",
          style: "1",
          locale: "en",
          enable_publishing: false,
          allow_symbol_change: true,
          container_id: containerRef.current.id,
          hide_side_toolbar: false,
          
          // Seamless Blending Configuration
          toolbar_bg: "#09090b", // Matches dashboard background
          
          overrides: {
            "paneProperties.background": "#09090b",
            "paneProperties.backgroundType": "solid",
            "paneProperties.vertGridProperties.color": "rgba(252, 13, 13, 0.03)", // Very subtle grid
            "paneProperties.horzGridProperties.color": "rgba(255, 255, 255, 0.03)",
            "scalesProperties.lineColor": "rgba(255, 255, 255, 0)", // Hide axis lines
            "mainSeriesProperties.candleStyle.upColor": "#2b8cee", // Modern Green
            "mainSeriesProperties.candleStyle.downColor": "white", // Modern Red
            "mainSeriesProperties.candleStyle.borderUpColor": "#2b8cee",
            "mainSeriesProperties.candleStyle.borderDownColor": "white",
            "mainSeriesProperties.candleStyle.wickUpColor": "gray",
            "mainSeriesProperties.candleStyle.wickDownColor": "gray",
          },
          disabled_features: [
            "header_widget", 
            "header_compare",
            "display_market_status",
            "header_screenshot",
            "header_saveload"
          ],
        });
      }
    }
  }, []);

  const handleFullScreen = () => {
    setIsBlurred(false);
    if (containerRef.current) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      } else if ((containerRef.current as any).webkitRequestFullscreen) {
        (containerRef.current as any).webkitRequestFullscreen();
      } else if ((containerRef.current as any).msRequestFullscreen) {
        (containerRef.current as any).msRequestFullscreen();
      }
    }
  };

  return (
    <div className='relative w-full h-full group'>
      
      {/* Blur Overlay & Buttons */}
      <div 
        className={`absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm transition-all duration-700 ${
          isBlurred ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className={`flex gap-4 transform transition-all duration-500 ${isBlurred ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>
          <Button onClick={handleFullScreen} className="gap-2 bg-primary hover:bg-primary/90 text-white shadow-lg">
            <Maximize className="w-4 h-4" />
            View in Full Screen
          </Button>
          <Button onClick={() => setIsBlurred(false)} variant="outline" className="gap-2 border-white/20 bg-black/50 text-white hover:bg-white/10">
            <X className="w-4 h-4" />
            Cancel
          </Button>
        </div>
      </div>

      {/* Chart Container */}
      <div 
        id='tradingview_advanced_chart' 
        ref={containerRef} 
        className={`w-full h-full rounded-2xl overflow-hidden bg-[#09090b] transition-all duration-700 ${isBlurred ? 'blur-sm scale-[0.99]' : ''}`}
      />
    </div>
  );
}

export default memo(TradingViewAdvancedChart);