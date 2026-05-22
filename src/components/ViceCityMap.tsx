import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { motion, AnimatePresence } from 'motion/react';
import { GANGS } from '../data';
import { playHover } from '../utils/audio';

interface ViceCityMapProps {
  onGangHover: (gangId: string | null) => void;
  hoveredGangId: string | null;
}

export function ViceCityMap({ onGangHover, hoveredGangId }: ViceCityMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  // Define static city bounds for the background if overlaying on image
  const cityBounds = [
    { id: 'west-island', d: 'M50,40 L190,40 L200,460 L40,460 Z' }, // Main West Island
    { id: 'starfish', d: 'M220,210 L300,210 L310,310 L230,310 Z' }, // Starfish Island
    { id: 'leaflinks', d: 'M250,60 L290,60 L300,190 L240,190 Z' }, // Golf Course
    { id: 'east-island', d: 'M330,80 L440,80 L460,450 L340,450 Z' }, // Main East Island
    { id: 'links-bridges', d: 'M190,100 L250,110 M300,110 L340,100 M190,250 L220,255 M310,255 L340,250 M190,380 L340,380' }, // Bridges
  ];

  const locations = [
    { id: 'vercetti-estate', name: 'Vercetti Estate', x: 265, y: 255, icon: '🏠' },
    { id: 'malibu-club', name: 'Malibu Club', x: 380, y: 150, icon: '🍸' },
    { id: 'ocean-view', name: 'Ocean View Hotel', x: 410, y: 380, icon: '🏨' },
    { id: 'prawn-island', name: 'Interglobal Studios', x: 380, y: 50, icon: '🎬' },
    { id: 'greasy-chopper', name: 'The Greasy Chopper', x: 120, y: 110, icon: '🏍️' },
    { id: 'cafe-robina', name: 'Cafe Robina', x: 120, y: 380, icon: '☕' },
  ];

  const [is3D, setIs3D] = useState(false);

  return (
    <div className="relative w-full aspect-square md:aspect-video rounded-[40px] overflow-hidden bg-black border-white/20 shadow-2xl group transition-all duration-700">
      
      {/* 3D Wireframe Grid Background Effect when 3D is active */}
      {is3D && (
        <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,rgba(236,72,153,0.1),transparent_70%)] opacity-80 pointer-events-none animate-pulse" />
      )}

      {/* Floating Tactical Controls - Top Right of Map Component */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex flex-col sm:flex-row gap-2 sm:gap-3 z-35 select-none pointer-events-auto">
        <button
          onClick={() => {
            setIs3D(!is3D);
            try { playHover(); } catch(e){}
          }}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border font-mono text-[8px] sm:text-[9.5px] tracking-[2px] uppercase font-black cursor-pointer transition-all ${
            is3D 
              ? 'bg-cyan/25 border-cyan text-white shadow-[0_0_15px_rgba(34,211,238,0.3)]' 
              : 'bg-black/80 border-white/10 text-white/60 hover:border-cyan hover:text-cyan'
          }`}
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${is3D ? 'bg-cyan' : 'bg-white/40'}`}></span>
            <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${is3D ? 'bg-cyan' : 'bg-white/40'}`}></span>
          </span>
          {is3D ? '3D PROJECTION: ON' : 'ACTIVATE TACTICAL 3D'}
        </button>

        <a
          href="https://mapgenie.io/grand-theft-auto-vice-city/maps/vice-city"
          target="_blank"
          rel="noopener noreferrer"
          onMouseEnter={() => { try { playHover(); } catch(e){} }}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-black/80 border border-pink/50 text-pink hover:bg-pink/25 hover:text-white hover:border-pink hover:shadow-[0_0_15px_rgba(236,72,153,0.3)] font-mono text-[8px] sm:text-[9.5px] tracking-[2px] uppercase font-black cursor-pointer transition-all"
        >
          <span>LAUNCH INTERACTIVE 3D MAP</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-external-link"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
        </a>
      </div>

      <div 
        className="w-full h-full relative"
        style={{ perspective: '1100px' }}
      >
        <div
          className="w-full h-full relative"
          style={{
            transform: is3D ? 'rotateX(52deg) rotateZ(-26deg) translateY(-2%) scale(1.05)' : 'none',
            transformStyle: 'preserve-3d',
            transition: 'transform 1s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          {/* Background Image Layer */}
          <div className="absolute inset-0 opacity-40 mix-blend-screen pointer-events-none">
            <img 
              src="/src/assets/images/vice_city_map_tactical_1779187625165.png" 
              alt="Tactical Map" 
              className="w-full h-full object-cover grayscale brightness-50"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Map Content SVG */}
          <svg
            ref={svgRef}
            viewBox="0 0 500 500"
            className="relative z-10 w-full h-full cursor-crosshair"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Grids */}
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(34,211,238,0.1)" strokeWidth="0.5"/>
              </pattern>
              <radialGradient id="radar-gradient">
                <stop offset="0%" stopColor="rgba(34,211,238,0.5)" />
                <stop offset="100%" stopColor="rgba(34,211,238,0)" />
              </radialGradient>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Static Background City Outlines */}
            <g className="city-bg fill-white/5 stroke-cyan/10" strokeWidth="1">
              {cityBounds.map(bound => (
                <path key={bound.id} d={bound.d} />
              ))}
            </g>

            {/* Territory Layers */}
            <g className="territories">
              {GANGS.map((gang) => (
                <motion.path
                  key={gang.id}
                  d={gang.territoryPath}
                  initial={{ opacity: 0.3 }}
                  animate={{ 
                    opacity: hoveredGangId === gang.id ? 0.7 : 0.2,
                    strokeWidth: hoveredGangId === gang.id ? 3 : 1,
                    fill: gang.hexColor
                  }}
                  className="transition-all cursor-pointer"
                  stroke={gang.hexColor}
                  onMouseEnter={() => {
                    onGangHover(gang.id);
                    playHover();
                  }}
                  onMouseLeave={() => onGangHover(null)}
                  style={{ filter: hoveredGangId === gang.id ? `drop-shadow(0 0 15px ${gang.hexColor})` : 'none' }}
                />
              ))}
            </g>

            {/* Location Markers */}
            <g className="locations">
              {locations.map(loc => (
                <g key={loc.id} className="cursor-help">
                  <circle cx={loc.x} cy={loc.y} r="3" fill="#22d3ee" className="animate-pulse" />
                  <text 
                    x={loc.x + 8} 
                    y={loc.y + 3} 
                    className="font-mono text-[6px] fill-white/60 pointer-events-none uppercase tracking-tighter"
                  >
                    {loc.name}
                  </text>
                </g>
              ))}
            </g>

            {/* Radar Sweep Animation */}
            <motion.rect
              x="0"
              y="0"
              width="500"
              height="100"
              fill="url(#radar-gradient)"
              animate={{ y: [-100, 500] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="pointer-events-none opacity-20"
            />
          </svg>
        </div>
      </div>

      {/* Legend / Key Overlay */}
      <div className="absolute top-24 right-8 w-40 glass p-4 rounded-xl border-white/10 hidden md:block select-none pointer-events-none z-20">
        <div className="font-mono text-[7px] tracking-[4px] text-cyan font-black uppercase mb-3 border-b border-cyan/20 pb-1">MAP_LEGEND</div>
        <div className="space-y-2">
          {GANGS.map(gang => (
            <div key={gang.id} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: gang.hexColor }} />
              <span className="font-mono text-[8px] text-white/50 uppercase tracking-tight">{gang.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Tactical Data Display */}
      <div className="absolute top-4 left-4 sm:top-8 sm:left-8 p-3 sm:p-6 glass-heavy rounded-xl sm:rounded-2xl border-white/20 pointer-events-none select-none z-20">
        <div className="font-mono text-[7px] sm:text-[9px] tracking-[3px] sm:tracking-[6px] text-cyan font-black uppercase mb-0.5 sm:mb-1">LOCAL_MAP_VD_Archive</div>
        <div className="font-display italic text-lg sm:text-2xl md:text-3xl text-white uppercase leading-tight">TERRITORY ANALYSIS</div>
        <div className="mt-2 sm:mt-4 flex flex-col gap-1 sm:gap-2">
          <div className="flex items-center gap-2 sm:gap-3">
             <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-cyan shadow-[0_0_8px_cyan] animate-pulse" />
             <span className="font-mono text-[8px] sm:text-[10px] text-white/40 tracking-[1px] sm:tracking-[2px]">SYNC STATUS: ACTIVE</span>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {hoveredGangId ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-4 left-4 right-4 sm:bottom-8 sm:left-8 sm:right-8 flex flex-col sm:flex-row gap-3 sm:gap-6 sm:items-center justify-between p-4 sm:p-8 glass-heavy rounded-[16px] sm:rounded-[32px] border-cyan/30 shadow-[0_0_30px_rgba(0,255,255,0.1)] pointer-events-none"
          >
            <div>
              <div className="font-mono text-[8px] sm:text-[10px] tracking-[2px] sm:tracking-[4px] text-pink font-black uppercase mb-1 sm:mb-2">TARGET DETECTED</div>
              <div className="font-display italic text-xl sm:text-4xl text-white uppercase leading-none">{GANGS.find(g => g.id === hoveredGangId)?.name}</div>
            </div>
            <div className="text-left sm:text-right">
              <div className="font-mono text-[7px] sm:text-[9px] tracking-[1px] sm:tracking-[2px] text-white/40 uppercase mb-0.5 sm:mb-1">TERRITORY CONTROL</div>
              <div className="font-sans text-xs sm:text-lg text-cyan font-light tracking-[1px] sm:tracking-[2px]">{GANGS.find(g => g.id === hoveredGangId)?.territory}</div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute bottom-4 sm:bottom-12 left-1/2 -translate-x-1/2 font-mono text-[7px] sm:text-[9px] tracking-[2px] sm:tracking-[5px] text-white/30 uppercase animate-pulse whitespace-nowrap text-center text-shadow-glow"
          >
            Hover territories for tactical analysis
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Corner Brackets */}
      <div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-cyan/30" />
      <div className="absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2 border-cyan/30" />
      <div className="absolute bottom-6 left-6 w-8 h-8 border-b-2 border-l-2 border-cyan/30" />
      <div className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-cyan/30" />
    </div>
  );
}
