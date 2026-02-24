
import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'motion/react';

const DottedWorldMap: React.FC = () => {
  // A simplified representation of a world map using a grid
  // 1 = dot (land), 0 = no dot (water)
  const mapData = [
    "00000000000000000000000000000000000000000000000000000000000000000000000000000000",
    "00000000000000000001111000000000000000000000000000000000000000000000000000000000",
    "00000000000000000111111100000000001111111111111111111111111111111111111111111100",
    "00000000000000111111111111000000011111111111111111111111111111111111111111111110",
    "00011111111111111111111111100000111111111111111111111111111111111111111111111111",
    "00111111111111111111111111110000111111111111111111111111111111111111111111111111",
    "00011111111111111111111111110000111111111111111111111111111111111111111111111111",
    "00001111111111111111111111100000011111111111111111111111111111111111111111111110",
    "00000111111111111111111111000000001111111111111111111111111111111111111111111110",
    "00000011111111111111111110000000000111111111111111111111111111111111111111111110",
    "00000001111111111111111100000000000011111111111111111111111111111111111111111110",
    "00000000111111111111111000000000000001111111111111111111111111111111111111111110",
    "00000000011111111111110000000000000000111111111111111111111111111111111111111110",
    "00000000001111111111100000000000000000011111111111111111111111111111111111111110",
    "00000000000111111111000000000000000000001111111111111111111111111111111111111110",
    "00000000000011111110000000000000000000000111111111111111111111111111111111111110",
    "00000000000001111100000000000000000000000011111111111111111111111111111111111110",
    "00000000000000111000000000000000000000000001111111111111111111111111111111111110",
    "00000000000000010000000000000000000000000000111111111111111111111111111111111110",
    "00000000000000000000000000000000000000000000011111111111111111111111111111111110",
    "00000000000000000000000000000000000000000000001111111111111111111111111111111110",
    "00000000000000000000000000000000000000000000000111111111111111111111111111111110",
    "00000000000000000000000000000000000000000000000011111111111111111111111111111110",
    "00000000000000000000000000000000000000000000000000000000000000000000000000000000",
    "00000000000000000000000000000000000000000000000000000000000000000000000000000000",
  ];

  const rows = mapData.length;
  const cols = mapData[0].length;

  const dots = useMemo(() => {
    const d = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (mapData[r][c] === '1') {
          d.push({ r, c, id: `${r}-${c}` });
        }
      }
    }
    return d;
  }, []);

  const [blinkingDots, setBlinkingDots] = useState<Set<string>>(new Set());

  useEffect(() => {
    const interval = setInterval(() => {
      const newBlinking = new Set<string>();
      // Randomly pick about 5% of dots to blink
      dots.forEach(dot => {
        if (Math.random() < 0.05) {
          newBlinking.add(dot.id);
        }
      });
      setBlinkingDots(newBlinking);
    }, 1000);

    return () => clearInterval(interval);
  }, [dots]);

  return (
    <div className="relative w-full aspect-[2/1] bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border border-gray-800 p-8 flex items-center justify-center">
      <div 
        className="grid gap-1"
        style={{ 
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          width: '100%',
          height: '100%'
        }}
      >
        {Array.from({ length: rows * cols }).map((_, i) => {
          const r = Math.floor(i / cols);
          const c = i % cols;
          const isLand = mapData[r][c] === '1';
          const id = `${r}-${c}`;
          const isBlinking = blinkingDots.has(id);

          return (
            <div 
              key={i}
              className={`rounded-full transition-all duration-700 ${
                isLand 
                  ? isBlinking 
                    ? 'bg-blue-400 scale-150 shadow-[0_0_8px_rgba(96,165,250,0.8)]' 
                    : 'bg-blue-900/40' 
                  : 'bg-transparent'
              }`}
              style={{ width: '4px', height: '4px' }}
            />
          );
        })}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent pointer-events-none" />
      <div className="absolute bottom-6 left-6 flex items-center gap-2">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
        <span className="text-[10px] font-mono text-blue-400 uppercase tracking-widest">Live Global Extraction Active</span>
      </div>
    </div>
  );
};

export default DottedWorldMap;
