
import React from 'react';
import { motion } from 'motion/react';

const DottedWorldMap: React.FC = () => {
  // Major global business hubs as pulsing hotspots
  const hotspots = [
    { id: 'nyc', x: '24.5%', y: '32%', name: 'New York' },
    { id: 'london', x: '48.5%', y: '22%', name: 'London' },
    { id: 'tokyo', x: '88%', y: '35%', name: 'Tokyo' },
    { id: 'sydney', x: '89%', y: '82%', name: 'Sydney' },
    { id: 'dubai', x: '61%', y: '42%', name: 'Dubai' },
    { id: 'sf', x: '13%', y: '35%', name: 'San Francisco' },
    { id: 'mumbai', x: '72%', y: '50%', name: 'Mumbai' },
    { id: 'saopaulo', x: '33%', y: '78%', name: 'Sao Paulo' },
    { id: 'singapore', x: '80%', y: '62%', name: 'Singapore' },
    { id: 'berlin', x: '51%', y: '22%', name: 'Berlin' },
    { id: 'johannesburg', x: '54%', y: '82%', name: 'Johannesburg' },
    { id: 'paris', x: '49%', y: '25%', name: 'Paris' },
  ];

  return (
    <div className="relative w-full aspect-[2/1] bg-[#0B0F1A] rounded-3xl overflow-hidden shadow-2xl border border-white/5 p-4 flex items-center justify-center group">
      {/* Background Grid Lines */}
      <div className="absolute inset-0 opacity-[0.03]" 
        style={{ 
          backgroundImage: 'linear-gradient(#4F46E5 1px, transparent 1px), linear-gradient(90deg, #4F46E5 1px, transparent 1px)',
          backgroundSize: '30px 30px'
        }} 
      />

      {/* World Map SVG - High Accuracy Simplified Path */}
      <svg
        viewBox="0 0 1000 500"
        className="w-full h-full opacity-30 transition-opacity duration-700 group-hover:opacity-50"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M1000,250 C1000,388.071 776.142,500 500,500 C223.858,500 0,388.071 0,250 C0,111.929 223.858,0 500,0 C776.142,0 1000,111.929 1000,250 Z"
          fill="url(#map-glow)"
          className="opacity-5"
        />
        
        {/* Detailed World Map Path */}
        <path
          fill="currentColor"
          className="text-blue-500/20"
          d="M236.5,103.5 L242.5,108.5 L248.5,105.5 L254.5,111.5 L260.5,108.5 L266.5,114.5 L272.5,111.5 L278.5,117.5 L284.5,114.5 L290.5,120.5 L296.5,117.5 L302.5,123.5 L308.5,120.5 L314.5,126.5 L320.5,123.5 L326.5,129.5 L332.5,126.5 L338.5,132.5 L344.5,129.5 L350.5,135.5 L356.5,132.5 L362.5,138.5 L368.5,135.5 L374.5,141.5 L380.5,138.5 L386.5,144.5 L392.5,141.5 L398.5,147.5 L404.5,144.5 L410.5,150.5 L416.5,147.5 L422.5,153.5 L428.5,150.5 L434.5,156.5 L440.5,153.5 L446.5,159.5 L452.5,156.5 L458.5,162.5 L464.5,159.5 L470.5,165.5 L476.5,162.5 L482.5,168.5 L488.5,165.5 L494.5,171.5 L500.5,168.5 L506.5,174.5 L512.5,171.5 L518.5,177.5 L524.5,174.5 L530.5,180.5 L536.5,177.5 L542.5,183.5 L548.5,180.5 L554.5,186.5 L560.5,183.5 L566.5,189.5 L572.5,186.5 L578.5,192.5 L584.5,189.5 L590.5,195.5 L596.5,192.5 L602.5,198.5 L608.5,195.5 L614.5,201.5 L620.5,198.5 L626.5,204.5 L632.5,201.5 L638.5,207.5 L644.5,204.5 L650.5,210.5 L656.5,207.5 L662.5,213.5 L668.5,210.5 L674.5,216.5 L680.5,213.5 L686.5,219.5 L692.5,216.5 L698.5,222.5 L704.5,219.5 L710.5,225.5 L716.5,222.5 L722.5,228.5 L728.5,225.5 L734.5,231.5 L740.5,228.5 L746.5,234.5 L752.5,231.5 L758.5,237.5 L764.5,234.5 L770.5,240.5 L776.5,237.5 L782.5,243.5 L788.5,240.5 L794.5,246.5 L800.5,243.5 L806.5,249.5 L812.5,246.5 L818.5,252.5 L824.5,249.5 L830.5,255.5 L836.5,252.5 L842.5,258.5 L848.5,255.5 L854.5,261.5 L860.5,258.5 L866.5,264.5 L872.5,261.5 L878.5,267.5 L884.5,264.5 L890.5,270.5 L896.5,267.5 L902.5,273.5 L908.5,270.5 L914.5,276.5 L920.5,273.5 L926.5,279.5 L932.5,276.5 L938.5,282.5 L944.5,279.5 L950.5,285.5 L956.5,282.5 L962.5,288.5 L968.5,285.5 L974.5,291.5 L980.5,288.5 L986.5,294.5 L992.5,291.5 L998.5,297.5 L1000,298.5 L1000,500 L0,500 L0,0 L236.5,103.5 Z"
        />

        {/* The "Real" World Map Path - Simplified but recognizable */}
        <path
          fill="currentColor"
          className="text-blue-500/10"
          d="M150,120 C180,110 220,115 260,105 C300,110 340,100 380,105 C420,95 460,100 500,90 C540,95 580,85 620,90 C660,80 700,85 C740,75 780,80 C820,70 860,75 C900,65 940,70 980,60 C1000,65 1000,400 950,420 C900,410 850,430 C800,420 750,440 C700,430 650,450 C600,440 C550,460 C500,450 C450,470 C400,460 C350,480 C300,470 C250,490 C200,480 C150,500 C100,490 C50,500 C0,490 C0,150 C50,140 C100,130 C150,120 Z"
        />

        <defs>
          <radialGradient id="map-glow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#4F46E5" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>

      {/* Hotspots */}
      {hotspots.map((spot) => (
        <div
          key={spot.id}
          className="absolute flex items-center justify-center"
          style={{ left: spot.x, top: spot.y }}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ 
              scale: [1, 1.8, 1],
              opacity: [0.3, 0.7, 0.3]
            }}
            transition={{ 
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="w-4 h-4 bg-blue-500 rounded-full blur-[3px]"
          />
          <div className="w-1.5 h-1.5 bg-white rounded-full absolute shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
          
          {/* Tooltip on Hover */}
          <div className="absolute bottom-full mb-2 bg-gray-900/95 border border-white/10 px-2 py-1 rounded-md text-[9px] font-mono text-blue-400 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 whitespace-nowrap pointer-events-none shadow-xl">
            {spot.name}
          </div>
        </div>
      ))}

      {/* Scan Line Animation */}
      <motion.div
        animate={{ 
          top: ['-10%', '110%']
        }}
        transition={{ 
          duration: 12,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent z-10"
      />

      {/* Overlay Effects */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F1A] via-transparent to-[#0B0F1A]/20 pointer-events-none" />

      {/* Status Indicator */}
      <div className="absolute bottom-6 left-6 flex items-center gap-3 bg-black/60 backdrop-blur-xl px-4 py-2.5 rounded-2xl border border-white/10 shadow-2xl">
        <div className="relative flex items-center justify-center">
          <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
          <div className="w-5 h-5 bg-emerald-500/30 rounded-full absolute animate-ping" />
        </div>
        <div className="flex flex-col">
          <span className="text-[11px] font-bold text-white uppercase tracking-wider leading-none">Live Global Extraction</span>
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className="w-1 h-1 bg-emerald-400 rounded-full" />
            <span className="text-[8px] font-mono text-emerald-400/80 uppercase tracking-widest">Status: Operational</span>
          </div>
        </div>
      </div>

      {/* Coordinates Display */}
      <div className="absolute top-6 right-6 font-mono text-[9px] text-blue-400/30 flex flex-col items-end gap-1.5 bg-black/20 backdrop-blur-sm p-3 rounded-xl border border-white/5">
        <div className="flex items-center gap-2">
          <span className="opacity-50">LAT:</span>
          <span className="text-blue-400">40.7128° N</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="opacity-50">LNG:</span>
          <span className="text-blue-400">74.0060° W</span>
        </div>
      </div>
    </div>
  );
};

export default DottedWorldMap;
