import { motion, AnimatePresence, useScroll, useSpring } from 'motion/react';
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, X, Maximize2, Users, BookOpen, Skull, Zap, Info, Swords, Shield, Target, Star, Volume2, VolumeX } from 'lucide-react';
import { CHARACTERS, ACTS, MISSIONS, CHEATS, SCENES_CONFIG, GANGS } from './data';
import { ViceCityMap } from './components/ViceCityMap';
import { CharacterNetwork } from './components/CharacterNetwork';
import { playClick, playHover, playWhoosh, playCheatUnlock, playSaveSynth, isAudioMuted, setAudioMuted } from './utils/audio';

export default function App() {
  const [currentScene, setCurrentScene] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const scrollAcc = useRef(0);

  // Swipe tracking
  const touchStartY = useRef(0);
  const touchStartX = useRef(0);

  // User Progress and Bookmarking States
  const [completedMissions, setCompletedMissions] = useState<string[]>([]);
  const [readCharacters, setReadCharacters] = useState<string[]>([]);
  const [securedTerritories, setSecuredTerritories] = useState<string[]>([]);
  const [favoriteCheats, setFavoriteCheats] = useState<string[]>([]);
  const [notification, setNotification] = useState<string | null>(null);
  const [muted, setMuted] = useState(isAudioMuted());
  const [lowDataMode, setLowDataMode] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const imageLoading = lowDataMode ? 'lazy' : 'eager';
  const imageFetchPriority = lowDataMode ? 'low' : 'auto';
  const transitionDuration = lowDataMode ? 0.2 : 0.4;
  const sceneTransition = lowDataMode ? { duration: 0.35, ease: 'easeOut' as const } : { duration: 1.2, ease: 'easeOut' as const };

  const reducedMotionEnabled = prefersReducedMotion || lowDataMode;

  // Image-by-Image (i-by-i) Lightbox State
  const [lightbox, setLightbox] = useState<{
    images: { src: string; title: string; description?: string; role?: string }[];
    index: number;
  } | null>(null);

  const openLightbox = (images: { src: string; title: string; description?: string; role?: string }[], index: number) => {
    setLightbox({ images, index });
    playClick();
  };

  const nextLightboxImage = useCallback(() => {
    if (!lightbox) return;
    setLightbox(prev => prev ? {
      ...prev,
      index: (prev.index + 1) % prev.images.length
    } : null);
    playClick();
  }, [lightbox]);

  const prevLightboxImage = useCallback(() => {
    if (!lightbox) return;
    setLightbox(prev => prev ? {
      ...prev,
      index: (prev.index - 1 + prev.images.length) % prev.images.length
    } : null);
    playClick();
  }, [lightbox]);

  const closeLightbox = useCallback(() => {
    setLightbox(null);
    playClick();
  }, []);

  useEffect(() => {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    const effectiveType = connection?.effectiveType;
    const saveData = connection?.saveData;

    setLowDataMode(Boolean(saveData || effectiveType?.includes('2g') || effectiveType?.includes('slow-2g') || effectiveType?.includes('3g')));
    setPrefersReducedMotion(window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false);

    const mediaQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const handleMotionChange = (event: MediaQueryListEvent) => setPrefersReducedMotion(event.matches);
    mediaQuery?.addEventListener?.('change', handleMotionChange);
    return () => {
      mediaQuery?.removeEventListener?.('change', handleMotionChange);
    };
  }, []);

  // Keyboard navigation for image-by-image lightbox view
  useEffect(() => {
    if (!lightbox) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        prevLightboxImage();
        e.preventDefault();
      } else if (e.key === 'ArrowRight') {
        nextLightboxImage();
        e.preventDefault();
      } else if (e.key === 'Escape') {
        closeLightbox();
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [lightbox, prevLightboxImage, nextLightboxImage, closeLightbox]);

  const toggleMute = () => {
    const nextChoice = !muted;
    setAudioMuted(nextChoice);
    setMuted(nextChoice);
    if (!nextChoice) {
      playClick();
    }
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Load custom parameters on mount
  useEffect(() => {
    const savedLive = localStorage.getItem('gta_vc_live_progress');
    if (savedLive) {
      try {
        const parsed = JSON.parse(savedLive);
        if (parsed.completedMissions) setCompletedMissions(parsed.completedMissions);
        if (parsed.readCharacters) setReadCharacters(parsed.readCharacters);
        if (parsed.securedTerritories) setSecuredTerritories(parsed.securedTerritories);
        if (parsed.favoriteCheats) setFavoriteCheats(parsed.favoriteCheats);
        if (parsed.currentScene !== undefined) setCurrentScene(parsed.currentScene);
      } catch (err) {
        console.error("Error loading live progress:", err);
      }
    }
  }, []);

  // Sync Live Progress to LocalStorage
  useEffect(() => {
    const dataToSave = {
      currentScene,
      completedMissions,
      readCharacters,
      securedTerritories,
      favoriteCheats,
    };
    localStorage.setItem('gta_vc_live_progress', JSON.stringify(dataToSave));
  }, [currentScene, completedMissions, readCharacters, securedTerritories, favoriteCheats]);

  const goToScene = useCallback((index: number) => {
    if (index >= 0 && index < SCENES_CONFIG.length && !isAnimating) {
      setIsAnimating(true);
      setCurrentScene(index);
      playWhoosh();
      
      setTimeout(() => {
        setIsAnimating(false);
      }, 350);
    }
  }, [isAnimating]);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (lightbox) return;
      // Prevent wheel if inside a scrollable element that hasn't reached its end
      const target = e.target as HTMLElement;
      const isScrollable = target.closest('.scrollable');
      if (isScrollable) {
        const { scrollTop, scrollHeight, clientHeight } = isScrollable;
        const atBottom = scrollTop + clientHeight >= scrollHeight - 5;
        const atTop = scrollTop <= 5;
        
        if (e.deltaY > 0 && !atBottom) return;
        if (e.deltaY < 0 && !atTop) return;
      }

      e.preventDefault();
      scrollAcc.current += e.deltaY;
      if (Math.abs(scrollAcc.current) > 100) {
        if (scrollAcc.current > 0) goToScene(currentScene + 1);
        else goToScene(currentScene - 1);
        scrollAcc.current = 0;
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightbox) return;
      if (e.key === 'ArrowDown') goToScene(currentScene + 1);
      if (e.key === 'ArrowUp') goToScene(currentScene - 1);
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentScene, goToScene, lightbox]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const target = e.target as HTMLElement;
    const isScrollable = target.closest('.scrollable');
    
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    
    // Swipe threshold & slope check (must be mostly vertical swipe)
    if (Math.abs(deltaY) > 50 && Math.abs(deltaY) > Math.abs(deltaX)) {
      if (isScrollable) {
        const { scrollTop, scrollHeight, clientHeight } = isScrollable;
        const atBottom = scrollTop + clientHeight >= scrollHeight - 10;
        const atTop = scrollTop <= 10;
        
        if (deltaY < 0 && !atBottom) return; // User wants to scroll down inside container
        if (deltaY > 0 && !atTop) return;    // User wants to scroll up inside container
      }
      
      if (deltaY < 0) {
        goToScene(currentScene + 1);
      } else {
        goToScene(currentScene - 1);
      }
    }
  };

  return (
    <div 
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative h-screen w-screen overflow-hidden bg-black font-sans text-white selection:bg-pink selection:text-white"
    >
      {lowDataMode && (
        <div className="fixed inset-x-4 top-4 z-50 rounded-3xl border border-white/10 bg-black/80 px-4 py-3 text-center text-[11px] text-white/80 backdrop-blur-xl shadow-lg">
          Low data mode enabled — animations are reduced and images load lazily for a smoother experience.
        </div>
      )}
      {/* Retro Audio Control button fixed in top right */}
      <div className="fixed top-6 right-6 lg:top-8 lg:right-16 z-55 flex items-center gap-3">
        <button
          onClick={toggleMute}
          onMouseEnter={playHover}
          className={`glass flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl border transition-all cursor-pointer ${
            muted 
              ? 'border-pink/30 bg-pink/5 text-pink/60 hover:bg-pink/20 hover:border-pink hover:text-white hover:shadow-[0_0_10px_rgba(236,72,153,0.3)]' 
              : 'border-cyan/30 bg-cyan/5 text-cyan hover:bg-cyan/20 hover:border-cyan hover:text-white hover:shadow-[0_0_15px_rgba(34,211,238,0.4)]'
          }`}
          title={muted ? 'Enable Sound FX' : 'Mute Sound FX'}
        >
          {muted ? <VolumeX size={18} className="animate-pulse text-pink" /> : <Volume2 size={18} className="text-cyan" />}
        </button>
        {/* Subtle status text that glows */}
        <span className={`hidden sm:inline font-mono text-[8px] tracking-[2px] uppercase select-none transition-all duration-300 ${muted ? 'text-pink/60' : 'text-cyan/80 font-bold'}`}>
          {muted ? 'AUDIO: OFF' : 'AUDIO: ON'}
        </span>
      </div>
      {/* Premium Retro Static Gradient Background and Grid */}
      <div className="absolute inset-0 z-0 bg-black overflow-hidden select-none pointer-events-none">
        {/* Synthwave Horizon Grid Line */}
        <div className="absolute inset-x-0 bottom-0 h-[30%] bg-[linear-gradient(to_top,rgba(236,72,153,0.03),transparent)] border-t border-white/5" />
        {/* Retro Neon Mesh/Glow */}
        <div className="absolute top-[10%] left-[10%] h-[300px] w-[300px] sm:h-[500px] sm:w-[500px] rounded-full bg-pink/5 blur-[120px]" />
        <div className="absolute bottom-[5%] right-[10%] h-[300px] w-[300px] sm:h-[600px] sm:w-[600px] rounded-full bg-cyan/5 blur-[150px]" />
      </div>

      {/* Dynamic Backgrounds */}
      <AnimatePresence mode="wait">
        <motion.div
          key={SCENES_CONFIG[currentScene].bgImage}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 0.45, scale: 1 }}
          exit={{ opacity: 0, scale: 1.08 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute inset-0 z-0 pointer-events-none"
        >
          {SCENES_CONFIG[currentScene].bgImage ? (
            <img 
              src={SCENES_CONFIG[currentScene].bgImage} 
              alt="background" 
              loading={imageLoading}
              decoding="async"
              fetchPriority={imageFetchPriority}
              className="h-full w-full object-cover grayscale-[25%] brightness-[38%] contrast-[122%]"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-deep-purple via-black to-pink/15" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-deep-purple/90 via-transparent to-deep-purple" />
        </motion.div>
      </AnimatePresence>



      {/* Background Atmosphere Elements */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-25">
        <div className="absolute top-[-10%] left-[-10%] h-[50%] w-[50%] rounded-full bg-purple/15 blur-[150px]" />
        <div className="absolute right-[-10%] bottom-[-10%] h-[50%] w-[50%] rounded-full bg-pink/15 blur-[150px]" />
      </div>

      {/* Navigation - Dots (Hidden completely on mobile/tablet to prevent clutter) */}
      <div className="fixed right-8 top-1/2 z-50 flex -translate-y-1/2 flex-col gap-6 hidden lg:flex">
        {SCENES_CONFIG.map((scene, i) => (
          <button
            key={scene.id}
            onClick={() => goToScene(i)}
            onMouseEnter={playHover}
            className="group relative flex items-center justify-end"
          >
            <span className={`mr-4 font-mono text-[10px] tracking-[2px] uppercase transition-all duration-300 ${i === currentScene ? 'text-pink opacity-100' : 'text-white/20 opacity-0 group-hover:opacity-100'}`}>
              {scene.label}
            </span>
            <div className={`h-2.5 w-2.5 rounded-full border-2 transition-all duration-500 ${i === currentScene ? 'bg-pink border-pink scale-125 shadow-[0_0_10px_#ff2d78]' : 'border-white/20 hover:border-pink/50'}`} />
          </button>
        ))}
      </div>

      {/* Navigation - Arrow controls (Adaptive floating pill at the bottom center on mobile / bottom-right on desktop) */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-auto md:right-8 md:bottom-8 z-50 flex gap-4 bg-black/60 md:bg-transparent backdrop-blur-md md:backdrop-blur-none p-2 rounded-full border border-white/10 md:border-0 shadow-lg md:shadow-none items-center">
        <button
          onClick={() => goToScene(currentScene - 1)}
          onMouseEnter={() => { if (currentScene !== 0) playHover(); }}
          disabled={currentScene === 0}
          className="glass flex h-12 w-12 items-center justify-center rounded-full md:rounded-lg transition-all hover:bg-pink/20 disabled:opacity-20 cursor-pointer"
          title="Previous Scene"
        >
          <ChevronUp className="text-pink" size={20} />
        </button>
        <button
          onClick={() => goToScene(currentScene + 1)}
          onMouseEnter={() => { if (currentScene !== SCENES_CONFIG.length - 1) playHover(); }}
          disabled={currentScene === SCENES_CONFIG.length - 1}
          className="glass flex h-12 w-12 items-center justify-center rounded-full md:rounded-lg transition-all hover:bg-pink/20 disabled:opacity-20 cursor-pointer"
          title="Next Scene"
        >
          <ChevronDown className="text-pink" size={20} />
        </button>
      </div>

      {/* Progress Counter */}
      <div className="fixed bottom-6 left-6 md:bottom-8 md:left-8 z-55 flex items-center gap-3 md:gap-4">
        <div className="font-mono text-[9px] sm:text-xs tracking-[2px] sm:tracking-[4px] text-pink/80">
          PAGE {String(currentScene + 1).padStart(2, '0')} / {String(SCENES_CONFIG.length).padStart(2, '0')}
        </div>
        <div className="h-0.5 w-8 sm:w-12 bg-white/10">
          <motion.div 
            className="h-full bg-pink"
            initial={{ width: 0 }}
            animate={{ width: `${((currentScene + 1) / SCENES_CONFIG.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Floating Retro Alert Overlay */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className="fixed bottom-24 left-1/2 z-[999] glass-heavy border border-cyan px-6 py-3 rounded-xl bg-black/95 text-cyan font-mono text-[9px] sm:text-[10px] tracking-[2px] uppercase font-bold shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center gap-3"
          >
            <div className="h-2 w-2 rounded-full bg-cyan animate-ping" />
            <span>{notification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Scene Stack */}
      <div className="relative h-full w-full">
        <AnimatePresence mode="popLayout">
          <SceneContainer key={currentScene}>
            {currentScene === 0 && (
              <HeroScene onStart={() => goToScene(1)} />
            )}

            {currentScene === 1 && (
              <CharacterScene 
                readCharacters={readCharacters}
                onToggleRead={(id) => {
                  if (readCharacters.includes(id)) {
                    setReadCharacters(readCharacters.filter(x => x !== id));
                    showNotification('INTEL ANALYSIS SUSPENDED.');
                  } else {
                    setReadCharacters([...readCharacters, id]);
                    showNotification('VCPD INTEL LOG: TARGET FILE ARCHIVED.');
                    playCheatUnlock();
                  }
                }}
                onViewImage={(index: number) => {
                  const media = CHARACTERS.map(c => ({
                    src: c.image || '',
                    title: c.name,
                    description: c.description,
                    role: `${c.role} | Syndicate: ${c.type}`
                  }));
                  openLightbox(media, index);
                }}
              />
            )}
            
            {currentScene === 2 && (
              <GangScene 
                securedTerritories={securedTerritories}
                onToggleSecured={(id) => {
                  if (securedTerritories.includes(id)) {
                    setSecuredTerritories(securedTerritories.filter(x => x !== id));
                    showNotification('TERRITORY SURVEILLANCE RELEASED.');
                  } else {
                    setSecuredTerritories([...securedTerritories, id]);
                    showNotification('SYNDICATE PLOTTED & INTEL SECURED.');
                    playCheatUnlock();
                  }
                }}
                onViewImage={(index: number) => {
                  const filteredGangs = GANGS.filter(g => g.image);
                  const media = filteredGangs.map(g => ({
                    src: g.image || '',
                    title: g.name,
                    description: g.description,
                    role: `Turf Leader: ${g.leader} | District: ${g.territory}`
                  }));
                  openLightbox(media, index);
                }}
              />
            )}
            
            {currentScene === 3 && <StoryScene />}
            
            {currentScene === 4 && (
              <MissionScene 
                completedMissions={completedMissions}
                onToggleCompleted={(id) => {
                  if (completedMissions.includes(id)) {
                    setCompletedMissions(completedMissions.filter(x => x !== id));
                    showNotification('CONTRACT ARCHIVE RESTORED.');
                  } else {
                    setCompletedMissions([...completedMissions, id]);
                    showNotification('MISSION ACCOMPLISHED: SUCCESS!');
                    playCheatUnlock();
                  }
                }}
                onViewImage={(index: number) => {
                  const filteredMissions = MISSIONS.filter(m => m.image);
                  const media = filteredMissions.map(m => ({
                    src: m.image || '',
                    title: m.title,
                    description: `${m.description}\n\nSTRATEGY: ${m.strategy}\n\nTIP: ${m.tip}`,
                    role: `Contractor: ${m.giver} | Reward: ${m.rewards?.join(', ') || 'None'}`
                  }));
                  openLightbox(media, index);
                }}
              />
            )}
            
            {currentScene === 5 && (
              <CheatScene 
                favoriteCheats={favoriteCheats}
                onToggleFavorite={(effect) => {
                  if (favoriteCheats.includes(effect)) {
                    setFavoriteCheats(favoriteCheats.filter(x => x !== effect));
                    showNotification('FAVORITE DETACHED FROM SHORTCUTS.');
                  } else {
                    setFavoriteCheats([...favoriteCheats, effect]);
                    showNotification('OVERRIDE MEMORIZED.');
                    playSaveSynth();
                  }
                }}
              />
            )}
          </SceneContainer>
        </AnimatePresence>
      </div>

      {/* Global CRT Scanline Effect Overlay */}
      <div className="pointer-events-none fixed inset-0 z-[100] opacity-[0.03]">
        <div className="h-full w-full bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
      </div>
      <div className="pointer-events-none fixed inset-0 z-[101] bg-[radial-gradient(circle,transparent_40%,black_100%)] opacity-30" />

      {/* Immersive Image-by-Image Media Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex flex-col md:flex-row items-center justify-center p-4 sm:p-10 md:p-16 bg-black/95 backdrop-blur-3xl"
          >
            {/* Classy Top Control Bar */}
            <div className="absolute top-4 left-4 right-4 sm:top-8 sm:left-8 sm:right-8 flex items-center justify-between z-30 select-none">
              <div className="flex items-center gap-2 font-mono text-[8px] sm:text-[10px] tracking-[4px] text-pink font-bold">
                <Maximize2 size={12} className="animate-pulse" />
                <span>IMAGE-BY-IMAGE SURVEILLANCE FEED</span>
              </div>
              <button
                onClick={closeLightbox}
                onMouseEnter={playHover}
                className="glass p-2 rounded-full border border-white/20 text-white hover:text-pink hover:border-pink hover:scale-110 transition-all cursor-pointer bg-black/60 shadow-lg"
              >
                <X size={16} />
              </button>
            </div>

            {/* Central Slide & Details Group Wrapper */}
            <div className="relative w-full max-w-6xl h-full flex flex-col lg:flex-row items-center justify-center gap-6 sm:gap-12 py-12 sm:py-20">
              
              {/* Carousel Panel - Left/Right controls & center 1-by-1 aspect showarea */}
              <div className="flex-1 flex items-center justify-between w-full min-h-0 select-none">
                {/* Left navigation */}
                <button
                  onClick={prevLightboxImage}
                  onMouseEnter={playHover}
                  className="z-20 glass p-2.5 sm:p-4 rounded-full border border-white/15 text-white/70 hover:text-cyan hover:border-cyan hover:scale-110 hover:shadow-[0_0_15px_rgba(34,211,238,0.4)] transition-all cursor-pointer bg-black/65 backdrop-blur-md"
                  title="Previous Image"
                >
                  <ChevronLeft size={20} />
                </button>

                {/* The containing framework displaying image fully */}
                <div className="flex-1 flex flex-col items-center justify-center min-h-0 px-2 sm:px-6">
                  <motion.div
                    key={lightbox.index}
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -15 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="relative max-h-[40vh] sm:max-h-[50vh] md:max-h-[55vh] h-full w-full max-w-xl aspect-square flex items-center justify-center bg-black/50 border border-white/10 rounded-[20px] sm:rounded-[32px] overflow-hidden p-3 sm:p-6 shadow-[0_0_50px_rgba(236,72,153,0.1)]"
                  >
                    {/* Retro Grid Corners */}
                    <div className="absolute top-4 left-4 h-4 w-4 border-t-2 border-l-2 border-pink/50 pointer-events-none" />
                    <div className="absolute top-4 right-4 h-4 w-4 border-t-2 border-r-2 border-pink/50 pointer-events-none" />
                    <div className="absolute bottom-4 left-4 h-4 w-4 border-b-2 border-l-2 border-pink/50 pointer-events-none" />
                    <div className="absolute bottom-4 right-4 h-4 w-4 border-b-2 border-r-2 border-pink/50 pointer-events-none" />

                    <img
                      src={lightbox.images[lightbox.index].src}
                      alt={lightbox.images[lightbox.index].title}
                      loading={imageLoading}
                      decoding="async"
                      fetchPriority={imageFetchPriority}
                      className="max-h-full max-w-full object-contain saturate-[110%] contrast-[105%]"
                      referrerPolicy="no-referrer"
                    />

                    {/* Scanning Matrix Lines */}
                    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] opacity-20" />
                  </motion.div>

                  {/* Progressive indicator */}
                  <div className="mt-4 font-mono text-[8px] sm:text-[9px] tracking-[4px] text-white/40 uppercase">
                    FILE {String(lightbox.index + 1).padStart(2, '0')} / {String(lightbox.images.length).padStart(2, '0')}
                  </div>
                </div>

                {/* Right navigation */}
                <button
                  onClick={nextLightboxImage}
                  onMouseEnter={playHover}
                  className="z-20 glass p-2.5 sm:p-4 rounded-full border border-white/15 text-white/70 hover:text-cyan hover:border-cyan hover:scale-110 hover:shadow-[0_0_15px_rgba(34,211,238,0.4)] transition-all cursor-pointer bg-black/65 backdrop-blur-md"
                  title="Next Image"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              {/* Side dossier details panel next to image ("info-by-info") */}
              <div className="w-full lg:w-80 shrink-0 flex flex-col justify-center glass-heavy border border-white/10 rounded-[20px] sm:rounded-[28px] p-5 sm:p-8 bg-black/65 max-h-[25vh] lg:max-h-[60vh] overflow-y-auto scrollable select-none">
                <div className="font-mono text-[7px] sm:text-[8px] tracking-[2px] text-pink font-black uppercase mb-1 sm:mb-2 text-shadow-glow">CLASSIFIED LOG SUMMARY</div>
                <h3 className="font-display italic text-xl sm:text-3xl font-black text-white uppercase tracking-tight mb-2 leading-none">
                  {lightbox.images[lightbox.index].title}
                </h3>
                {lightbox.images[lightbox.index].role && (
                  <div className="font-mono text-[8px] text-cyan uppercase tracking-wider font-bold mb-4 pb-1.5 border-b border-white/15">
                    {lightbox.images[lightbox.index].role}
                  </div>
                )}
                {lightbox.images[lightbox.index].description && (
                  <p className="font-sans text-[11px] sm:text-xs font-light text-white/75 leading-relaxed italic border-l-2 border-white/20 pl-3 whitespace-pre-line">
                    "{lightbox.images[lightbox.index].description}"
                  </p>
                )}
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

function SceneContainer({ children, ...props }: { children: React.ReactNode; [key: string]: any }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ 
        duration: 0.25, 
        ease: "easeInOut" 
      }}
      className="absolute inset-0 flex items-center justify-center z-10"
    >
      <div className="scrollable h-full w-full overflow-y-auto px-4 sm:px-6 lg:px-16 py-8 sm:py-12 lg:py-16 hide-scrollbar pt-10 sm:pt-14 lg:pt-16 pb-24">
        <div className="mx-auto w-full max-w-6xl lg:max-w-none">
          {children}
        </div>
      </div>
    </motion.div>
  );
}




function StatItem({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className={`font-display text-5xl ${color}`}>{value}</span>
      <span className="mt-2 font-mono text-[10px] tracking-[3px] text-white/40 uppercase">{label}</span>
    </div>
  );
}

function CharacterScene({ 
  readCharacters = [], 
  onToggleRead,
  onViewImage 
}: { 
  readCharacters: string[]; 
  onToggleRead: (id: string) => void;
  onViewImage?: (index: number) => void;
}) {
  const [selectedCharId, setSelectedCharId] = useState(CHARACTERS[0].id);
  const selectedChar = CHARACTERS.find(c => c.id === selectedCharId) || CHARACTERS[0];

  return (
    <div className="w-full">
      <SectionHeader 
        label="VICE CITY POLIDEPT / CASE 86-VC" 
        title="Criminal Intel" 
        sub="Priority targets and high-value assets under surveillance" 
      />
      
      {/* Dossier status progress ticker */}
      <div className="max-w-4xl mx-auto mb-8 bg-white/5 border border-white/10 rounded-2xl p-4 flex justify-between items-center font-mono text-[9px] text-white/60 tracking-[2px] uppercase select-none">
        <span>COLLECTED DOSSIERS: {readCharacters.length} / {CHARACTERS.length}</span>
        <div className="flex gap-1.5 overflow-hidden">
          {CHARACTERS.map(c => (
            <div 
              key={c.id} 
              className={`h-2 w-2 rounded-full transition-all ${readCharacters.includes(c.id) ? 'bg-pink shadow-[0_0_8px_pink]' : 'bg-white/10'}`}
              title={c.name}
            />
          ))}
        </div>
      </div>
      
      {/* Mobile/Tablet View - Multi-step interactive slider and individual active dossier */}
      <div className="block lg:hidden">
        <div className="flex flex-col gap-6 items-stretch min-h-0">
          {/* Horizontal Scroller Section list */}
          <div className="w-full flex flex-row gap-3 overflow-x-auto max-h-[140px] pb-3 hide-scrollbar select-none shrink-0 border-b border-white/5">
            {CHARACTERS.map((char) => (
              <button
                key={char.id}
                onClick={() => {
                  setSelectedCharId(char.id);
                  playClick();
                }}
                onMouseEnter={() => {
                  if (selectedCharId !== char.id) {
                    playHover();
                  }
                }}
                className={`group flex items-center shrink-0 gap-3 p-3 rounded-2xl transition-all duration-300 border text-left cursor-pointer ${
                  selectedCharId === char.id 
                    ? 'bg-pink/25 border-pink shadow-[0_0_15px_rgba(236,72,153,0.25)]' 
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-white/20">
                  <img src={char.image} loading={imageLoading} decoding="async" fetchPriority={imageFetchPriority} className="h-full w-full object-cover saturate-[110%]" />
                  {selectedCharId === char.id && (
                    <div className="absolute inset-0 bg-pink/20 animate-pulse" />
                  )}
                </div>
                <div className="flex-1 min-w-[100px]">
                  <div className={`font-display italic text-sm uppercase truncate ${selectedCharId === char.id ? 'text-white' : 'text-white/60'}`}>
                    {char.name}
                  </div>
                  <div className="font-mono text-[7px] tracking-[1px] text-white/30 uppercase truncate">
                    {char.role}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Individual Dossier Card */}
          <div className="w-full relative min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedChar.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="glass-heavy rounded-[24px] border-white/20 shadow-2xl flex flex-col overflow-hidden bg-black/30"
              >
                {/* Photo Section */}
                <div 
                  onClick={() => {
                    const idx = CHARACTERS.findIndex(c => c.id === selectedChar.id);
                    onViewImage?.(idx !== -1 ? idx : 0);
                  }}
                  className="w-full relative h-[250px] min-h-[220px] shrink-0 bg-black/60 cursor-zoom-in"
                  title="View photo image-by-image"
                >
                  <img 
                    src={selectedChar.image} 
                    loading={imageLoading}
                    decoding="async"
                    fetchPriority={imageFetchPriority}
                    className="h-full w-full object-cover object-[center_14%] saturate-[115%] contrast-[105%]"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent pointer-events-none" />
                  <div className="absolute inset-0 bg-pink/5 mix-blend-overlay pointer-events-none" />
                  
                  {/* Floating inspect icon */}
                  <div className="absolute top-4 right-4 z-10 glass p-2 rounded-xl border border-white/20 text-white/85 bg-black/40 backdrop-blur-md">
                    <Maximize2 size={13} />
                  </div>
                  
                  {/* VCPD Case Stamp Overlay */}
                  <div className="absolute bottom-4 right-4 z-10">
                     <div className={`border-2 ${selectedChar.status === 'ACTIVE' || selectedChar.status === 'EVADED' ? 'border-cyan text-cyan shadow-[0_0_10px_rgba(34,211,238,0.2)]' : 'border-pink text-pink shadow-[0_0_10px_rgba(236,72,153,0.2)]'} px-4 py-2 rounded-lg font-display italic text-xl uppercase -rotate-12 opacity-90 backdrop-blur-sm border-dashed select-none`}>
                        {selectedChar.status || 'UNIDENTIFIED'}
                     </div>
                  </div>

                  {/* Corner Label */}
                  <div className="absolute top-4 left-4 glass px-3 py-1.5 rounded-lg">
                    <span className="font-mono text-[8px] tracking-[2px] text-white/60 uppercase">CASE_FILE_{selectedChar.id.toUpperCase()}</span>
                  </div>
                </div>

                {/* Intel Section */}
                <div className="flex-1 p-5 flex flex-col justify-center bg-black/60">
                   <div className="flex items-center gap-3 mb-4 select-none">
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className={`h-1 w-4 ${i < 3 ? 'bg-pink shadow-[0_0_8px_pink]' : 'bg-white/10'}`} />
                        ))}
                      </div>
                      <span className="font-mono text-[8px] tracking-[2px] text-pink font-black uppercase">VCPD_INTEL_STREAM</span>
                   </div>

                   <h2 className="font-display italic text-4xl text-white uppercase leading-none mb-6 tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.15)]">
                     {selectedChar.name}
                   </h2>

                   <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="space-y-0.5">
                        <div className="font-mono text-[7px] tracking-[2px] text-white/30 uppercase">CURRENT STATUS</div>
                        <div className={`font-sans text-xs font-bold tracking-wider ${selectedChar.status === 'ACTIVE' || selectedChar.status === 'EVADED' ? 'text-cyan' : 'text-pink'}`}>
                          {selectedChar.status || 'UNK'}
                        </div>
                      </div>
                      <div className="space-y-0.5">
                        <div className="font-mono text-[7px] tracking-[2px] text-white/30 uppercase">THREAT LEVEL</div>
                        <div className="font-sans text-xs font-bold text-white tracking-wider">
                          {selectedChar.threat || 'MODERATE'}
                        </div>
                      </div>
                      <div className="space-y-0.5">
                        <div className="font-mono text-[7px] tracking-[2px] text-white/30 uppercase">LAST SEEN</div>
                        <div className="font-sans text-xs font-light text-white/70 italic">
                          {selectedChar.lastSeen || 'VICE CITY'}
                        </div>
                      </div>
                      <div className="space-y-0.5">
                        <div className="font-mono text-[7px] tracking-[2px] text-white/30 uppercase">AFFILIATION</div>
                        <div className="font-sans text-xs font-bold text-cyan tracking-wider">
                          {selectedChar.type}
                        </div>
                      </div>
                   </div>

                   <p className="font-sans text-sm font-light leading-relaxed text-white/70 border-l-2 border-white/20 pl-4 mb-6 italic">
                     "{selectedChar.description}"
                   </p>

                   {/* Interactive Intel Secured Button */}
                   <div className="mb-6 w-full">
                     <button
                       onClick={() => onToggleRead?.(selectedChar.id)}
                       onMouseEnter={playHover}
                       className={`w-full py-3 px-4 rounded-xl border font-mono text-[8.5px] tracking-[2px] uppercase font-black transition-all flex items-center justify-center gap-3 cursor-pointer ${
                         readCharacters.includes(selectedChar.id)
                           ? 'bg-pink/25 border-pink text-white shadow-[0_0_15px_rgba(236,72,153,0.25)]'
                           : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:border-cyan hover:text-cyan'
                       }`}
                     >
                       <div className={`h-1.5 w-1.5 rounded-full ${readCharacters.includes(selectedChar.id) ? 'bg-pink shadow-[0_0_8px_rgba(236,72,153,0.8)] animate-pulse' : 'bg-white/30'}`} />
                       {readCharacters.includes(selectedChar.id) ? '✓ AUDITED CASE FILE: SECURED' : '◻ AUDIT INTEL CASE DOSSIER'}
                     </button>
                   </div>

                   {/* Relationships Mini-Graph */}
                   <div className="select-none">
                      <div className="font-mono text-[7px] tracking-[2px] text-white/30 uppercase mb-3">SUSPECTED CONNECTIONS</div>
                      <div className="flex flex-wrap gap-2">
                        {selectedChar.relationships?.map((rel, idx) => (
                          <div key={idx} className="glass px-3 py-1.5 rounded-lg flex items-center gap-2 border-white/10">
                            <div className={`h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full ${rel.type === 'Enemy' || rel.type === 'Traitor' ? 'bg-pink animate-pulse' : 'bg-cyan'}`} />
                            <span className="font-mono text-[7px] text-white/60 tracking-wider uppercase">{rel.label}</span>
                          </div>
                        ))}
                      </div>
                   </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Desktop View - Immersive Retro-Futuristic Surveillance Grid (All dossiers displayed simultaneously) */}
      <div className="hidden lg:grid lg:grid-cols-2 xl:grid-cols-3 gap-6 w-full items-stretch animate-fade-in-up select-none">
        {CHARACTERS.map((char, index) => {
          const isAudited = readCharacters.includes(char.id);
          return (
            <motion.div
              key={char.id}
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: Math.min(index * 0.08, 0.4) }}
              className={`glass-heavy rounded-[24px] border shadow-2xl flex flex-col overflow-hidden bg-black/40 transition-all duration-500 hover:scale-[1.01] hover:border-pink/40 relative select-none ${
                isAudited 
                  ? 'border-pink/20 hover:shadow-[0_0_20px_rgba(236,72,153,0.15)]' 
                  : 'border-white/10 hover:shadow-[0_0_20px_rgba(34,211,238,0.15)]'
              }`}
            >
              {/* Tactical Top Tape Deco / Tech Header - Clickable soft switch */}
              <div 
                onClick={() => {
                  onToggleRead?.(char.id);
                  playClick();
                }}
                onMouseEnter={playHover}
                className="px-4.5 py-2.5 bg-black/60 border-b border-white/5 flex items-center justify-between select-none shrink-0 font-mono text-[8px] tracking-[2px] text-white/40 cursor-pointer hover:bg-black/80 transition-colors duration-300"
                title="Toggle Active Surveillance Case File"
              >
                <div className="flex items-center gap-2">
                  <div className={`h-1.5 w-1.5 rounded-full transition-all duration-500 ${char.status === 'ACTIVE' || char.status === 'EVADED' ? 'bg-cyan shadow-[0_0_6px_rgba(34,211,238,0.5)] animate-pulse' : 'bg-pink shadow-[0_0_6px_rgba(236,72,153,0.5)]'}`} />
                  <span>VCPD_FILE_{char.id.toUpperCase()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[7px] tracking-wider transition-colors duration-300 ${isAudited ? 'text-pink font-bold' : 'text-white/20'}`}>
                    {isAudited ? 'SECURED FEED' : 'DEcrypt intel'}
                  </span>
                  <div className={`h-3.5 w-7 rounded-full p-0.5 transition-all duration-300 flex items-center ${isAudited ? 'bg-pink/30 border border-pink/30' : 'bg-white/5 border border-white/10 hover:border-white/20'}`}>
                    <div className={`h-2 w-2 rounded-full transition-transform duration-300 ${isAudited ? 'translate-x-[11px] bg-pink shadow-[0_0_8px_#ec4899]' : 'translate-x-0 bg-white/30'}`} />
                  </div>
                </div>
              </div>

              {/* Card Image Cover Section - CLICKABLE to toggle read/audited state */}
              <div 
                onClick={() => {
                  onToggleRead?.(char.id);
                  playClick();
                }}
                onMouseEnter={playHover}
                className="relative h-52 w-full overflow-hidden shrink-0 group cursor-pointer select-none bg-black/50 border-b border-white/5"
                title="Click Photo to Toggle Secure Audit File"
              >
                <img 
                  src={char.image} 
                  alt={char.name}
                  loading={imageLoading}
                  decoding="async"
                  fetchPriority={imageFetchPriority}
                  className="h-full w-full object-cover object-[center_14%] saturate-[110%] contrast-[105%] transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent z-10" />
                <div className={`absolute inset-0 mix-blend-color opacity-35 transition-all duration-300 ${isAudited ? 'bg-pink/25' : 'bg-cyan/5'}`} />

                {/* VCPD Stamp Overlay */}
                <div className="absolute bottom-4 right-4 z-20 select-none">
                   <div className={`border-2 ${char.status === 'ACTIVE' || char.status === 'EVADED' ? 'border-cyan text-cyan shadow-[0_0_8px_rgba(34,211,238,0.25)]' : 'border-pink text-pink shadow-[0_0_8px_rgba(236,72,153,0.25)]'} px-3 py-1 rounded-md font-display italic text-sm uppercase -rotate-6 backdrop-blur-sm border-dashed select-none font-bold tracking-wider`}>
                      {char.status || 'UNKNOWN'}
                   </div>
                </div>

                {/* Interactive Action Indicator on Hover */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-30">
                  <div className="flex flex-col items-center gap-2 text-center p-4 select-none">
                    <span className="font-mono text-[9px] tracking-[2px] text-pink font-black uppercase">
                      {isAudited ? '✓ FILE SECURED' : '◻ AUDIT INTEL DOSSIER'}
                    </span>
                    <span className="font-sans text-[9px] text-white/50 tracking-wide uppercase">
                      Click image to decrypt/secure
                    </span>
                  </div>
                </div>

                {/* Corner Label */}
                <div className="absolute top-4 left-4 z-20 glass px-2 py-0.5 rounded-md border border-white/10 select-none">
                  <span className="font-mono text-[6.5px] tracking-[1.5px] text-white/50 uppercase">CASE_REF_{char.id.toUpperCase()}</span>
                </div>

                {/* Inspect Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewImage?.(index);
                  }}
                  className="absolute top-4 right-4 z-40 p-2 rounded-xl bg-black/85 border border-white/20 text-white hover:text-pink hover:border-pink hover:scale-115 transition-all cursor-pointer backdrop-blur-md shadow-lg"
                  title="Expand Image"
                >
                  <Maximize2 size={13} />
                </button>
              </div>

              {/* Dossier Detail Body */}
              <div className="flex-1 p-4.5 flex flex-col justify-between bg-gradient-to-b from-black/60 to-black/80 relative select-none">
                {/* Radial Gradient Glow for high visual touch */}
                <div className={`absolute inset-0 pointer-events-none ${isAudited ? 'bg-[radial-gradient(ellipse_at_bottom_right,rgba(236,72,153,0.02),transparent_50%)]' : 'bg-[radial-gradient(ellipse_at_bottom_right,rgba(6,182,212,0.02),transparent_50%)]'}`} />

                <div className="relative z-10 mb-3.5">
                  <div className="flex items-center gap-2 mb-2 select-none">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className={`h-0.5 w-3.5 ${i < (isAudited ? 4 : 2) ? 'bg-pink shadow-[0_0_6px_pink]' : 'bg-white/15'}`} />
                      ))}
                    </div>
                    <span className="font-mono text-[7px] tracking-[2.5px] text-pink font-black uppercase">VCPD_INTEL // STREAM</span>
                  </div>

                  <h3 className="font-display italic text-2xl text-white uppercase leading-none tracking-tight mb-3">
                    {char.name}
                  </h3>

                  <div className="font-mono text-[7px] tracking-[1.2px] text-white/40 uppercase font-black mb-3 pb-1 border-b border-white/10">
                    ROLE: {char.role}
                  </div>

                  {/* 2x2 Tactical Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-3.5 select-none">
                    <div className="space-y-0.5">
                      <span className="font-mono text-[6px] tracking-[1.2px] text-white/20 uppercase block">SECURITY STANCE</span>
                      <span className={`font-sans text-[11px] font-bold tracking-wide ${char.status === 'ACTIVE' || char.status === 'EVADED' ? 'text-cyan' : 'text-pink'}`}>{char.status || 'UNRANKED'}</span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="font-mono text-[6px] tracking-[1.2px] text-white/20 uppercase block">RISK INDEX</span>
                      <span className="font-sans text-[11px] font-bold text-white/90">{char.threat || 'MODERATE'}</span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="font-mono text-[6px] tracking-[1.2px] text-white/20 uppercase block">LAST TRACED SITE</span>
                      <span className="font-sans text-[11px] font-light text-white/60 italic truncate block">{char.lastSeen || 'VICE CITY'}</span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="font-mono text-[6px] tracking-[1.2px] text-white/20 uppercase block">SYNDICATE GROUP</span>
                      <span className="font-sans text-[11px] font-bold text-cyan truncate block">{char.type}</span>
                    </div>
                  </div>

                  <p className="font-sans text-[11px] font-light leading-relaxed text-white/50 border-l border-white/20 pl-3 italic">
                    "{char.description}"
                  </p>
                </div>

                {/* Footer Section: Visual suspected connections */}
                <div className="relative z-10 pt-3 border-t border-white/5 mt-auto select-none">
                  <span className="font-mono text-[6px] tracking-[1.2px] text-white/20 uppercase block mb-1.5">SUSPECTED CONNECTIONS</span>
                  <div className="flex flex-wrap gap-1">
                    {char.relationships?.map((rel, idx) => (
                      <div key={idx} className="glass px-2 py-0.5 rounded-md flex items-center gap-1 border-white/10">
                        <div className={`h-1 w-1 rounded-full ${rel.type === 'Enemy' || rel.type === 'Traitor' ? 'bg-pink animate-pulse' : 'bg-cyan'}`} />
                        <span className="font-mono text-[6px] text-white/50 tracking-wider uppercase">{rel.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-16 sm:mt-24">
        <div className="mb-8 sm:mb-12 flex items-center gap-4">
           <div className="h-0.5 w-12 bg-cyan/50" />
           <span className="font-mono text-[9px] sm:text-[10px] tracking-[4px] sm:tracking-[6px] text-cyan uppercase font-bold text-shadow-glow">Strategic Network Analysis</span>
        </div>
        <div className="px-1 sm:px-4 overflow-hidden">
          <CharacterNetwork lowDataMode={lowDataMode} />
        </div>
      </div>
    </div>
  );
}

function GangScene({ 
  securedTerritories = [], 
  onToggleSecured,
  onViewImage 
}: { 
  securedTerritories: string[]; 
  onToggleSecured: (id: string) => void;
  onViewImage?: (index: number) => void;
}) {
  const [hoveredGangId, setHoveredGangId] = useState<string | null>(null);
  const [selectedGangId, setSelectedGangId] = useState(GANGS[0].id);

  const activeGangId = hoveredGangId || selectedGangId;
  const activeGang = GANGS.find(g => g.id === activeGangId) || GANGS[0];

  return (
    <div className="w-full">
      <SectionHeader label="CITY FACTIONS" title="The Turf War" sub="Controlled territories and active syndicates" />
      
      {/* Turf status progress ticker */}
      <div className="max-w-4xl mx-auto mb-8 bg-white/5 border border-white/10 rounded-2xl p-4 flex justify-between items-center font-mono text-[9px] text-white/60 tracking-[2px] uppercase select-none">
        <span>SECURED DISTRICTS: {securedTerritories.length} / {GANGS.length}</span>
        <div className="flex gap-1.5 overflow-hidden">
          {GANGS.map(g => (
            <div 
              key={g.id} 
              className={`h-2 w-2 rounded-full transition-all ${securedTerritories.includes(g.id) ? 'bg-cyan shadow-[0_0_8px_cyan]' : 'bg-white/10'}`}
              title={g.name}
            />
          ))}
        </div>
      </div>

      {/* Mobile/Tablet Layout (Map, then list of everything) */}
      <div className="block lg:hidden">
         <div className="mb-10 px-1 overflow-hidden">
            <ViceCityMap hoveredGangId={hoveredGangId} onGangHover={setHoveredGangId} />
         </div>
         <div className="flex flex-col gap-8 w-full">
            {GANGS.map((gang, i) => (
              <motion.div
                key={gang.id}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                onMouseEnter={() => setHoveredGangId(gang.id)}
                onMouseLeave={() => setHoveredGangId(null)}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * i }}
                className={`glass-heavy overflow-hidden rounded-[24px] sm:rounded-[40px] shadow-2xl relative flex flex-col items-stretch transition-all duration-500 bg-black/30 border-white/10 ${
                  hoveredGangId === gang.id ? 'border-cyan/50 ring-1 ring-cyan/20 scale-[1.01]' : 'border-white/20'
                }`}
              >
                {/* Gang Visual Section */}
                <div 
                  onClick={() => {
                    if (gang.image) {
                      const idx = GANGS.filter(g => g.image).findIndex(g => g.id === gang.id);
                      onViewImage?.(idx !== -1 ? idx : 0);
                    }
                  }}
                  className="w-full h-[220px] sm:h-[300px] relative overflow-hidden group shrink-0 bg-black/60 cursor-zoom-in"
                  title="View image-by-image"
                >
                  {gang.image ? (
                    <>
                      <img 
                        src={gang.image} 
                        alt={gang.name} 
                        loading={imageLoading}
                        decoding="async"
                        fetchPriority={imageFetchPriority}
                        className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105 saturate-[110%]"
                        referrerPolicy="no-referrer"
                      />
                      {/* Floating inspect icon */}
                      <div className="absolute top-4 right-4 z-10 glass p-2 rounded-xl border border-white/20 text-white bg-black/40 backdrop-blur-md">
                        <Maximize2 size={13} />
                      </div>
                    </>
                  ) : (
                    <div className={`h-full w-full ${gang.color} opacity-40 flex items-center justify-center`}>
                      <Swords size={60} className="text-white/20 animate-pulse" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-deep-purple/60 via-transparent to-transparent pointer-events-none" />
                  
                  {/* Territory Indicator Badge */}
                  <div className="absolute bottom-4 left-4 sm:bottom-8 sm:left-8 flex items-center gap-2 sm:gap-3 glass px-4 py-2 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl border-white/20 shadow-[0_0_20px_rgba(0,0,0,0.5)] select-none">
                    <Target className="text-cyan animate-pulse" size={14} />
                    <span className="font-mono text-[8px] sm:text-[9px] font-black tracking-[2px] sm:tracking-[4px] text-white uppercase">{gang.territory}</span>
                  </div>
                </div>

                {/* Gang Info Section */}
                <div className="w-full p-6 sm:p-10 flex flex-col justify-center bg-black/50">
                  <div className="mb-3 sm:mb-4 flex items-center gap-3 sm:gap-4 select-none">
                    <div className={`h-1 w-8 sm:w-12 ${gang.color} shadow-[0_0_10px_currentColor]`} />
                    <span className="font-mono text-[8px] sm:text-[10px] font-black tracking-[4px] sm:tracking-[6px] text-pink uppercase font-bold">ORGANIZATION</span>
                  </div>
                  
                  <h3 className="font-display italic text-3xl sm:text-5xl md:text-6xl tracking-tighter text-white leading-none uppercase mb-6 drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">
                    {gang.name}
                  </h3>

                  <div className="space-y-6">
                    <div>
                      <div className="font-mono text-[8px] sm:text-[9px] font-black tracking-[2px] sm:tracking-[4px] text-cyan/80 uppercase mb-2 flex items-center gap-2 select-none">
                        <Shield size={12} /> Leadership
                      </div>
                      <div className="font-sans text-lg sm:text-2xl font-light text-white">{gang.leader}</div>
                    </div>

                    <div className="p-4 sm:p-6 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
                       <p className="font-sans text-sm sm:text-base font-light leading-relaxed text-white/60 italic">
                         "{gang.description}"
                       </p>
                    </div>

                    <div>
                      <div className="font-mono text-[8px] sm:text-[9px] font-black tracking-[2px] sm:tracking-[4px] text-pink/80 uppercase mb-3 select-none">Known Associates</div>
                      <div className="flex flex-wrap gap-2">
                        {gang.members.map((member, idx) => (
                          <span 
                            key={idx} 
                            className="px-3 py-1.5 rounded-full glass border-white/10 font-mono text-[8px] sm:text-[10px] tracking-[1px] text-white/50 uppercase hover:text-cyan transition-colors"
                          >
                            {member}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Territory/District Secure Button */}
                    <div className="mt-8 pt-6 border-t border-white/10">
                      <button
                        onClick={() => onToggleSecured?.(gang.id)}
                        onMouseEnter={playHover}
                        className={`w-full py-3 px-4 rounded-xl border font-mono text-[8.5px] sm:text-[10px] tracking-[2px] uppercase font-black transition-all flex items-center justify-center gap-3 cursor-pointer ${
                          securedTerritories.includes(gang.id)
                            ? 'bg-cyan/25 border-cyan text-white shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                            : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:border-cyan hover:text-cyan'
                        }`}
                      >
                        <div className={`h-1.5 w-1.5 rounded-full ${securedTerritories.includes(gang.id) ? 'bg-cyan shadow-[0_0_8px_cyan] animate-pulse' : 'bg-white/30'}`} />
                        {securedTerritories.includes(gang.id) ? '✓ DISTRICT SECURED & MONITORING' : '◻ SECURE DISTRICT TURF'}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
         </div>
      </div>

      {/* Desktop Layout (Tactical split screen) */}
      <div className="hidden lg:grid lg:grid-cols-[1.1fr_1fr] xl:grid-cols-[1.3fr_1fr] gap-8 w-full items-start">
         {/* Left Side: Interactive Map Visual Panel */}
         <div className="glass-heavy rounded-[40px] p-6 border-white/20 shadow-2xl bg-black/20 flex flex-col h-full sticky top-4">
            <div className="mb-4 flex items-center justify-between font-mono text-[8px] tracking-[3px] text-cyan/70 select-none pb-2 border-b border-white/10">
               <span>GEOGRAPHIC TURF ANALYZER</span>
               <span>INTEL SATELLITE FEED v4.1</span>
            </div>
            <div className="w-full relative overflow-hidden rounded-[24px]">
               <ViceCityMap hoveredGangId={hoveredGangId} onGangHover={(id) => {
                 setHoveredGangId(id);
                 if (id) {
                   setSelectedGangId(id);
                 }
               }} />
            </div>
            
            {/* Quick Select Buttons */}
            <div className="mt-6 flex flex-wrap gap-2 select-none justify-center">
              {GANGS.map((g) => {
                const isActive = g.id === activeGangId;
                const isSecured = securedTerritories.includes(g.id);
                return (
                  <button
                    key={g.id}
                    onClick={() => {
                      setSelectedGangId(g.id);
                      playClick();
                    }}
                    onMouseEnter={() => {
                      setHoveredGangId(g.id);
                      playHover();
                    }}
                    onMouseLeave={() => setHoveredGangId(null)}
                    className={`px-3 py-2 rounded-xl border font-mono text-[8.5px] tracking-[1.5px] uppercase flex items-center gap-2 cursor-pointer transition-all ${
                      isActive
                        ? 'bg-cyan/20 border-cyan text-white shadow-[0_0_12px_rgba(34,211,238,0.3)]'
                        : 'bg-black/50 border-white/10 text-white/50 hover:bg-white/15 hover:border-white/25'
                    }`}
                  >
                    <div className={`h-1.5 w-1.5 rounded-full ${isSecured ? 'bg-cyan shadow-[0_0_8px_cyan]' : 'bg-white/20'}`} />
                    <span>{g.name}</span>
                  </button>
                );
              })}
            </div>
         </div>

         {/* Right Side: Active Gang detailed dossier */}
         <div className="relative h-full min-h-[500px]">
           <AnimatePresence mode="wait">
             <motion.div
               key={activeGang.id}
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
               transition={{ duration: 0.35 }}
               className="glass-heavy overflow-hidden rounded-[40px] shadow-2xl flex flex-col items-stretch transition-all duration-500 bg-black/30 border-white/10 h-full hover:border-cyan/30"
             >
               {/* Gang Visual Section */}
               <div 
                 onClick={() => {
                   if (activeGang.image) {
                     const idx = GANGS.filter(g => g.image).findIndex(g => g.id === activeGang.id);
                     onViewImage?.(idx !== -1 ? idx : 0);
                   }
                 }}
                 className="w-full h-[25vh] min-h-[240px] relative overflow-hidden group shrink-0 bg-black/80 flex items-center justify-center p-4 cursor-zoom-in"
                 title="View image-by-image"
               >
                 {activeGang.image ? (
                   <>
                     <img 
                       src={activeGang.image} 
                       alt={activeGang.name} 
                       loading={imageLoading}
                       decoding="async"
                       fetchPriority={imageFetchPriority}
                       className="h-full w-full object-contain transition-transform duration-1000 group-hover:scale-105 saturate-[110%]"
                       referrerPolicy="no-referrer"
                     />
                     {/* Floating inspect icon */}
                     <div className="absolute top-4 right-4 z-30 glass p-2 rounded-xl border border-white/20 text-white bg-black/45 backdrop-blur-md hover:text-pink hover:border-pink transition-all">
                       <Maximize2 size={13} />
                     </div>
                   </>
                 ) : (
                   <div className={`h-full w-full ${activeGang.color} opacity-40 flex items-center justify-center`}>
                     <Swords size={60} className="text-white/20 animate-pulse" />
                   </div>
                 )}
                 <div className="absolute inset-0 bg-gradient-to-t from-deep-purple via-deep-purple/10 to-transparent" />
                 
                 {/* Territory Indicator Badge */}
                 <div className="absolute bottom-6 left-6 flex items-center gap-2.5 glass px-4 py-2 rounded-xl border-white/20 shadow-[0_0_20px_rgba(0,0,0,0.5)] select-none border">
                   <Target className="text-cyan animate-pulse" size={12} />
                   <span className="font-mono text-[8px] font-black tracking-[2px] text-white uppercase">{activeGang.territory}</span>
                 </div>
               </div>

               {/* Gang Info Section */}
               <div className="flex-1 p-8 sm:p-10 flex flex-col justify-center bg-black/50 relative">
                 <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(6,182,212,0.03),transparent_50%)] pointer-events-none" />

                 <div className="mb-4 flex items-center gap-3 select-none relative z-10">
                   <div className={`h-1 w-10 ${activeGang.color} shadow-[0_0_10px_currentColor]`} />
                   <span className="font-mono text-[8px] font-black tracking-[4px] text-pink uppercase font-bold">ORGANIZATION</span>
                 </div>
                 
                 <h3 className="font-display italic text-4xl sm:text-5xl lg:text-6xl tracking-tighter text-white leading-none uppercase mb-6 drop-shadow-[0_0_10px_rgba(255,255,255,0.1)] relative z-10">
                   {activeGang.name}
                 </h3>

                 <div className="space-y-6 relative z-10">
                   <div>
                     <div className="font-mono text-[8px] font-black tracking-[2px] text-cyan/80 uppercase mb-1.5 flex items-center gap-2 select-none">
                       <Shield size={11} /> Leadership
                     </div>
                     <div className="font-sans text-xl sm:text-2xl font-light text-white">{activeGang.leader}</div>
                   </div>

                   <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                      <p className="font-sans text-sm font-light leading-relaxed text-white/60 italic">
                        "{activeGang.description}"
                      </p>
                   </div>

                   <div>
                     <div className="font-mono text-[8px] font-black tracking-[2px] text-pink/80 uppercase mb-2 select-none">Known Associates</div>
                     <div className="flex flex-wrap gap-1.5">
                       {activeGang.members.map((member, idx) => (
                         <span 
                           key={idx} 
                           className="px-3 py-1 rounded-lg glass border-white/10 font-mono text-[8px] tracking-[1.5px] text-white/50 uppercase hover:text-cyan transition-colors"
                         >
                           {member}
                         </span>
                       ))}
                     </div>
                   </div>

                   {/* Territory/District Secure Button */}
                   <div className="pt-6 border-t border-white/10">
                     <button
                       onClick={() => onToggleSecured?.(activeGang.id)}
                       onMouseEnter={playHover}
                       className={`w-full py-3.5 px-4 rounded-xl border font-mono text-[9px] tracking-[3px] uppercase font-black transition-all flex items-center justify-center gap-3 cursor-pointer ${
                         securedTerritories.includes(activeGang.id)
                           ? 'bg-cyan/25 border-cyan text-white shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                           : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:border-cyan hover:text-cyan'
                       }`}
                     >
                       <div className={`h-1.5 w-1.5 rounded-full ${securedTerritories.includes(activeGang.id) ? 'bg-cyan shadow-[0_0_8px_cyan] animate-pulse' : 'bg-white/30'}`} />
                       {securedTerritories.includes(activeGang.id) ? '✓ DISTRICT SECURED & MONITORING' : '◻ SECURE DISTRICT TURF'}
                     </button>
                   </div>
                 </div>
               </div>
             </motion.div>
           </AnimatePresence>
         </div>
      </div>
    </div>
  );
}

function StoryScene() {
  return (
    <div className="mx-auto w-full max-w-5xl lg:max-w-none px-1 sm:px-4">
      <SectionHeader label="THE CHRONICLES" title="Timeline" sub="Tracing the path of vengeance" />
      <div className="relative flex flex-col lg:grid lg:grid-cols-3 gap-8 w-full space-y-0 gap-y-12">
        {ACTS.map((act, i) => (
          <motion.div
            key={act.id}
            initial={{ y: 40, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="glass-heavy relative rounded-[24px] sm:rounded-[40px] p-6 sm:p-12 md:p-16 border-white/20 shadow-xl overflow-hidden bg-black/40"
          >
            <div className="absolute top-0 right-0 p-4 sm:p-12 select-none pointer-events-none opacity-[0.03] sm:opacity-[0.05]">
              <span className="font-display italic text-[80px] sm:text-[160px] font-black leading-none bg-gradient-to-br from-cyan to-pink bg-clip-text text-transparent">ACT {act.id}</span>
            </div>
            
            <div className="relative z-10">
              <div className="mb-4 font-mono text-[8px] sm:text-[10px] tracking-[4px] sm:tracking-[6px] text-pink font-black uppercase select-none">PHASE {String(act.id).padStart(2, '0')}</div>
              <h3 className="mb-4 sm:mb-8 font-display italic text-2xl sm:text-4xl md:text-5xl tracking-tighter text-white leading-none uppercase">{act.title}</h3>
              <p className="font-sans text-sm sm:text-base lg:text-lg font-light leading-relaxed text-white/70 max-w-3xl border-l-[3px] border-pink/30 pl-4 sm:pl-8">{act.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function MissionScene({ 
  completedMissions = [], 
  onToggleCompleted,
  onViewImage 
}: { 
  completedMissions: string[]; 
  onToggleCompleted: (id: string) => void;
  onViewImage?: (index: number) => void;
}) {
  return (
    <div className="w-full">
      <SectionHeader label="OPERATIONS" title="Major Jobs" sub="Strategic walkthroughs for the bold" />
      
      {/* Operations status progress ticker */}
      <div className="max-w-4xl mx-auto mb-8 bg-white/5 border border-white/10 rounded-2xl p-4 flex justify-between items-center font-mono text-[9px] text-white/60 tracking-[2px] uppercase select-none">
        <span>COMPLETED JOBS: {completedMissions.length} / {MISSIONS.length}</span>
        <div className="flex gap-1.5 overflow-hidden">
          {MISSIONS.map(m => (
            <div 
              key={m.id} 
              className={`h-2 w-2 rounded-full transition-all ${completedMissions.includes(m.id) ? 'bg-pink shadow-[0_0_8px_pink]' : 'bg-white/10'}`}
              title={m.title}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 lg:gap-12 w-full space-y-0 gap-y-12">
        {MISSIONS.map((mission, i) => (
          <motion.div
            key={mission.id}
            initial={{ y: 40, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 * i }}
            className="glass-heavy flex flex-col overflow-hidden rounded-[24px] sm:rounded-[40px] border-white/25 shadow-2xl bg-black/20"
          >
            {mission.image && (
              <div 
                onClick={() => {
                  const filteredMissions = MISSIONS.filter(m => m.image);
                  const idx = filteredMissions.findIndex(m => m.id === mission.id);
                  onViewImage?.(idx !== -1 ? idx : 0);
                }}
                className="relative h-44 sm:h-64 lg:h-80 w-full overflow-hidden bg-black/60 cursor-zoom-in group/mission"
                title="View image-by-image"
              >
                <img 
                  src={mission.image} 
                  alt={mission.title} 
                  loading={imageLoading}
                  decoding="async"
                  fetchPriority={imageFetchPriority}
                  className="h-full w-full object-cover object-[center_20%] transition-transform duration-700 hover:scale-105 saturate-[110%]"
                  referrerPolicy="no-referrer"
                />
                
                {/* Floating inspect icon popup */}
                <div className="absolute top-4 right-4 z-20 glass p-2 rounded-xl border border-white/20 text-white bg-black/45 backdrop-blur-md opacity-0 group-hover/mission:opacity-100 transition-all hover:text-pink hover:border-pink">
                  <Maximize2 size={13} />
                </div>
                {/* Scanline Overlay */}
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] opacity-30" />
                {/* Vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-85" />
                
                {/* UI-style corner elements */}
                <div className="absolute top-4 left-4 sm:top-6 sm:left-6 flex flex-col gap-1 select-none z-10">
                  <div className={`font-mono text-[7px] sm:text-[9px] font-black uppercase tracking-[2px] sm:tracking-[4px] ${completedMissions.includes(mission.id) ? 'text-pink animate-pulse' : 'text-cyan'}`}>
                    {completedMissions.includes(mission.id) ? 'MISSION ACCOMPLISHED' : 'MISSION ACTIVE'}
                  </div>
                  <div className={`h-[2px] w-8 sm:w-12 bg-cyan transition-all ${completedMissions.includes(mission.id) ? 'bg-pink shadow-[0_0_8px_#ff2d78] w-12 sm:w-20' : 'bg-cyan shadow-[0_0_8px_cyan]'}`} />
                </div>
              </div>
            )}
            
            <div className="flex flex-col gap-6 p-6 sm:p-10 lg:p-12 lg:flex-row lg:items-start bg-black/35">
              <div className="shrink-0 lg:w-56">
                <div className="font-mono text-[8px] sm:text-[10px] tracking-[4px] sm:tracking-[6px] text-pink font-black uppercase mb-1 sm:mb-2 select-none">{mission.number}</div>
                <h3 className="font-display italic text-3xl sm:text-4xl md:text-5xl tracking-tight text-white uppercase leading-none drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">{mission.title}</h3>
                <div className="mt-3 font-mono text-[7px] sm:text-[8px] tracking-[2px] sm:tracking-[4px] text-white/30 uppercase select-none">CONTRACTOR: {mission.giver}</div>
                
                {/* Mission Completion Switch */}
                <div className="mt-6 select-none">
                  <button
                    onClick={() => onToggleCompleted?.(mission.id)}
                    onMouseEnter={playHover}
                    className={`w-full py-2.5 px-4 rounded-xl border font-mono text-[8px] sm:text-[9.5px] tracking-[2px] sm:tracking-[3px] uppercase font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      completedMissions.includes(mission.id)
                        ? 'bg-pink border-pink text-white shadow-[0_0_15px_rgba(236,72,153,0.35)]'
                        : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/15 hover:border-pink hover:text-white'
                    }`}
                  >
                    {completedMissions.includes(mission.id) ? '✓ ACCOMPLISHED' : '◻ MARK ACCOMPLISHED'}
                  </button>
                </div>
              </div>
              <div className="flex-1">
                <p className="mb-6 sm:mb-10 font-sans text-base sm:text-lg lg:text-xl font-light text-white/70 leading-relaxed italic border-l-2 border-cyan/30 pl-4 sm:pl-8">{mission.description}</p>
                <div className="grid grid-cols-1 gap-4 sm:gap-8 sm:grid-cols-2">
                  <div className="rounded-xl sm:rounded-[24px] bg-white/5 p-4 sm:p-6 lg:p-8 border border-white/10 backdrop-blur-md">
                    <div className="mb-3 font-mono text-[8px] sm:text-[10px] tracking-[2px] sm:tracking-[4px] text-cyan font-black uppercase flex items-center gap-2 select-none">
                      <div className="w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-cyan shadow-[0_0_8px_cyan]" /> Strategy
                    </div>
                    <p className="font-sans text-xs sm:text-sm font-light text-white/50 leading-relaxed">{mission.strategy}</p>
                  </div>
                  <div className="rounded-xl sm:rounded-[24px] bg-pink/5 p-4 sm:p-6 lg:p-8 border border-pink/10 backdrop-blur-md">
                    <div className="mb-3 font-mono text-[8px] sm:text-[10px] tracking-[2px] sm:tracking-[4px] text-yellow font-black uppercase flex items-center gap-2 select-none">
                      <div className="w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-yellow shadow-[0_0_8px_yellow]" /> Classified Tip
                    </div>
                    <p className="font-sans text-xs sm:text-sm font-light text-yellow/60 leading-relaxed italic">{mission.tip}</p>
                  </div>
                </div>
                {mission.rewards && (
                  <div className="mt-6 sm:mt-8 rounded-xl sm:rounded-[24px] bg-cyan/5 p-4 sm:p-6 lg:p-8 border border-cyan/10 backdrop-blur-md select-none">
                    <div className="mb-4 font-mono text-[8px] sm:text-[10px] tracking-[2px] sm:tracking-[4px] text-cyan font-black uppercase flex items-center gap-2">
                      <div className="w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-cyan shadow-[0_0_8px_cyan]" /> Operational Rewards
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {mission.rewards.map((reward, idx) => (
                        <motion.div 
                          key={idx}
                          initial={{ scale: 0.9, opacity: 0 }}
                          whileInView={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.05 * idx }}
                          className="flex items-center gap-2 sm:gap-3 glass px-3 py-1.5 sm:px-5 sm:py-3 rounded-lg sm:rounded-2xl border-white/10"
                        >
                          <div className="h-1.5 w-1.5 rounded-full bg-pink shadow-[0_0_8px_#ff2d78]" />
                          <span className="font-mono text-[8px] sm:text-[10px] text-white tracking-[1px] sm:tracking-[2px] uppercase">{reward}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function CheatScene({ favoriteCheats = [], onToggleFavorite }: { favoriteCheats: string[]; onToggleFavorite: (effect: string) => void }) {
  const [activeTab, setActiveTab] = useState('Player / Weapons');

  const getCheatsToRender = () => {
    if (activeTab === '⭐ Saved Overrides') {
      const allCheats: any[] = [];
      Object.keys(CHEATS).forEach(key => {
        CHEATS[key].forEach((c: any) => {
          if (favoriteCheats.includes(c.effect)) {
            allCheats.push(c);
          }
        });
      });
      return allCheats;
    }
    return CHEATS[activeTab] || [];
  };
  
  return (
    <div className="w-full">
      <SectionHeader label="UNAUTHORIZED ACCESS" title="Cheat Database" sub="Manipulating the reality of 1986" />
      
      <div className="mb-8 flex overflow-x-auto pb-3 gap-3 w-full justify-start md:justify-center px-4 md:px-0 hide-scrollbar scroll-smooth select-none">
        {['⭐ Saved Overrides', ...Object.keys(CHEATS)].map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              playCheatUnlock();
            }}
            onMouseEnter={() => {
              if (activeTab !== tab) {
                playHover();
              }
            }}
            className={`whitespace-nowrap px-6 py-2.5 sm:px-10 sm:py-4 font-mono text-[8.5px] sm:text-[10px] font-black tracking-[2px] sm:tracking-[4px] uppercase transition-all rounded-full border cursor-pointer ${
              activeTab === tab 
                ? 'bg-pink text-white border-pink shadow-[0_0_15px_rgba(236,72,153,0.4)]' 
                : 'text-white/40 hover:text-white bg-white/5 border-white/10 hover:bg-white/10'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="glass-heavy overflow-hidden rounded-[16px] sm:rounded-[32px] border-white/20 shadow-2xl bg-black/45">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 font-display italic text-lg sm:text-3xl tracking-tighter text-cyan uppercase select-none">
                <th className="px-4 sm:px-8 py-4 sm:py-8 font-black text-center w-16">STAR</th>
                <th className="px-4 sm:px-12 py-4 sm:py-8 font-black">EFFECT</th>
                <th className="px-4 sm:px-12 py-4 sm:py-8 font-black">PC TERMINAL</th>
                <th className="px-4 sm:px-12 py-4 sm:py-8 font-black text-pink-400">CONSOLE COMBO (PS2)</th>
              </tr>
            </thead>
            <tbody>
              {getCheatsToRender().map((cheat, i) => {
                const isFav = favoriteCheats.includes(cheat.effect);
                return (
                  <tr key={i} onMouseEnter={playHover} className="border-b border-white/5 transition-colors hover:bg-white/5">
                    <td className="px-4 sm:px-8 py-3 sm:py-5 text-center select-none">
                      <button
                        onClick={() => onToggleFavorite?.(cheat.effect)}
                        className={`p-1.5 sm:p-2.5 rounded-xl cursor-pointer transition-all ${
                          isFav 
                            ? 'text-yellow shadow-[0_0_10px_rgba(234,179,8,0.35)] scale-110 bg-yellow-500/10' 
                            : 'text-white/25 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <Star size={14} className="sm:size-[16px]" fill={isFav ? "currentColor" : "none"} />
                      </button>
                    </td>
                    <td className="px-4 sm:px-12 py-4 sm:py-6 font-sans text-xs sm:text-lg text-white/95">{cheat.effect}</td>
                    <td className="px-4 sm:px-12 py-4 sm:py-6 font-mono text-[11px] sm:text-sm text-cyan tracking-[1px] sm:tracking-[2px] font-bold">{cheat.pc}</td>
                    <td className="px-4 sm:px-12 py-4 sm:py-6 font-mono text-[9px] sm:text-[11px] text-yellow/60 leading-normal sm:leading-relaxed max-w-[200px] sm:max-w-[280px] tracking-[2px] sm:tracking-[4px] font-bold">{cheat.ps2}</td>
                  </tr>
                );
              })}
              {getCheatsToRender().length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-16 text-center text-white/20 font-mono text-xs uppercase tracking-[3px] select-none">
                    No codes bookmarked. Select other categories and tap the STAR button to populate your custom override hotlist.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="mt-8 rounded-xl sm:rounded-[24px] bg-deep-purple/60 p-6 sm:p-10 border border-white/10 text-center backdrop-blur-xl max-w-2xl mx-auto px-4 select-none">
        <p className="font-mono text-[8px] sm:text-[10px] font-bold text-white/25 uppercase tracking-[3px] sm:tracking-[6px] leading-relaxed">
          Note: Use of database overrides may destabilize local timeline synchronization.
        </p>
      </div>

      <footer className="mt-20 sm:mt-32 py-8 sm:py-12 text-center text-white/10 font-mono text-[7px] sm:text-[9px] font-black tracking-[4px] sm:tracking-[10px] uppercase select-none">
        © 1986 | VERCETTI ESTATE MASTER DATABASE | ENCRYPTED
      </footer>
    </div>
  );
}

function SectionHeader({ label, title, sub }: { label: string; title: string; sub: string }) {
  return (
    <div className="mb-6 lg:mb-10 flex flex-col items-center text-center px-4">
      <motion.span
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        className="mb-2 lg:mb-4 font-mono text-[8px] sm:text-[10px] tracking-[4px] sm:tracking-[10px] text-cyan uppercase font-bold"
      >
        {label}
      </motion.span>
      <motion.h2
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        className="font-display italic text-[clamp(28px,6vw,80px)] leading-none font-black tracking-tighter text-white uppercase"
      >
        {title}
      </motion.h2>
      <div className="my-3 lg:my-6 h-0.5 w-40 sm:w-64 bg-gradient-to-r from-transparent via-pink to-transparent opacity-50" />
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        className="font-sans text-xs sm:text-sm lg:text-base font-light tracking-[2px] lg:tracking-[3px] text-white/40 uppercase max-w-xl"
      >
        {sub}
      </motion.p>
    </div>
  );
}

function HeroScene({ onStart }: { onStart: () => void }) {
  return (
    <div className="relative flex min-h-[75vh] py-6 sm:py-10 md:py-12 w-full flex-col items-center justify-center overflow-hidden">
      {/* Background Collage Overlay */}
      <motion.div 
        initial={{ opacity: 0, scale: 1.15 }}
        animate={{ opacity: 0.65, scale: 1 }}
        transition={{ duration: 1.5 }}
        className="absolute inset-0 z-0 pointer-events-none rounded-[16px] sm:rounded-[32px] overflow-hidden"
      >
        <img 
          src="/src/assets/images/vice_city_collage_hero_1779187868741.png" 
          alt="Collage Background" 
          loading={imageLoading}
          decoding="async"
          fetchPriority={imageFetchPriority}
          className="h-full w-full object-cover scale-100"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/35 to-black/85" />
      </motion.div>

      {/* Visual Background Elements */}
      <div className="pointer-events-none absolute inset-0 z-1 flex items-center justify-center overflow-hidden rounded-[16px] sm:rounded-[32px]">
        {/* Large Retro Sun */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.22 }}
          transition={{ duration: 1.5 }}
          className="absolute h-[250px] w-[250px] sm:h-[450px] sm:w-[450px] md:h-[650px] md:w-[650px] rounded-full bg-gradient-to-t from-pink/50 to-cyan/10 blur-[60px] sm:blur-[100px]"
        />
        
        {/* Skyline Silhouette */}
        <div className="absolute bottom-0 left-0 right-0 h-[15vh] sm:h-[20vh] md:h-[25vh] w-full z-10">
          <svg className="h-full w-full fill-black/90 opacity-90" viewBox="0 0 1400 300" preserveAspectRatio="none">
             <path d="M0,300 L0,250 L100,250 L100,200 L180,200 L180,260 L240,260 L240,180 L320,180 L320,270 L400,270 L400,220 L480,220 L480,260 L560,260 L560,150 L640,150 L640,250 L720,250 L720,190 L800,190 L800,260 L880,260 L880,140 L960,140 L960,250 L1040,250 L1040,190 L1120,190 L1120,270 L1200,270 L1200,210 L1280,210 L1280,260 L1400,260 L1400,300 Z" />
          </svg>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-20 flex flex-col items-center text-center w-full max-w-sm sm:max-w-xl md:max-w-4xl px-4 select-none">
        <motion.div
          initial={{ y: -15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mb-2 sm:mb-4 md:mb-5 font-mono text-[8px] sm:text-[10px] tracking-[5px] sm:tracking-[10px] text-pink uppercase font-bold text-shadow-glow"
        >
          Rockstar Games Presents
        </motion.div>

        <div className="relative mb-6 sm:mb-12 md:mb-16 w-full flex flex-col items-center">
          {/* Main Logo Container */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 1 }}
            className="flex flex-col items-center w-full"
          >
            <h1 className="font-display italic text-[clamp(24px,6.5vw,86px)] font-black leading-none tracking-tighter text-white uppercase drop-shadow-[0_0_15px_rgba(255,255,255,0.25)]">
              GRAND THEFT AUTO
            </h1>
            <motion.div
              initial={{ x: -10, opacity: 0, rotate: -15 }}
              animate={{ x: 0, opacity: 1, rotate: -6 }}
              transition={{ delay: 0.8, duration: 0.8, type: "spring" }}
              className="mt-[-8px] sm:mt-[-18px] md:mt-[-28px] ml-[10%] sm:ml-[22%] font-script text-[clamp(36px,9.5vw,120px)] text-pink leading-none drop-shadow-[0_0_25px_rgba(236,72,153,0.9)]"
            >
              Vice City
            </motion.div>
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="max-w-[180px] sm:max-w-md md:max-w-xl font-mono text-[6px] sm:text-[8px] md:text-[9px] tracking-[3px] sm:tracking-[6px] text-cyan uppercase mb-6 sm:mb-12 md:mb-16 leading-relaxed"
        >
          The harwood butcher legacy • interactive database v3.1
        </motion.p>
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.3 }}
        >
          <button
            onClick={onStart}
            onMouseEnter={playHover}
            className="group relative flex flex-col items-center justify-center cursor-pointer"
          >
            <div className="absolute h-10 w-10 sm:h-16 sm:w-16 rounded-full bg-cyan/10 blur-xl group-hover:bg-cyan/30 transition-all" />
            <div className="glass flex h-12 w-12 sm:h-20 sm:w-20 items-center justify-center rounded-full border-white/20 transition-all group-hover:scale-110 group-hover:border-cyan group-active:scale-95 shadow-[0_0_20px_rgba(0,0,0,0.5)] bg-black/45 backdrop-blur-md">
               <ChevronDown className="text-cyan group-hover:text-white group-hover:animate-bounce" size={24} />
            </div>
            <span className="mt-4 font-mono text-[6px] sm:text-[8px] tracking-[3px] sm:tracking-[6px] text-white/30 uppercase group-hover:text-pink transition-colors">ESTABLISH CONNECTION</span>
          </button>
        </motion.div>
      </div>

      {/* Decorative Copyright Text */}
      <div className="absolute bottom-4 left-0 right-0 text-center z-30 opacity-20 pointer-events-none px-4">
         <p className="font-sans text-[6px] sm:text-[8px] tracking-[1px] text-white uppercase">
           © 2002 Rockstar Games. Portions © 2026 Antigravity Systems. All Rights Reserved.
         </p>
      </div>
    </div>
  );
}
