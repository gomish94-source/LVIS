import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Moon, Sun, MapPin, Loader2, Info, RefreshCw } from 'lucide-react';
import { getMoonData, MoonData } from './utils/astro';
import { getCurrentMuhurta, Muhurta, MUHURTAS } from './utils/vedic';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [sunrise, setSunrise] = useState<Date | null>(null);
  const [sunset, setSunset] = useState<Date | null>(null);
  const [moonData, setMoonData] = useState<MoonData | null>(null);
  const [currentMuhurta, setCurrentMuhurta] = useState<Muhurta | null>(null);
  const [synergy, setSynergy] = useState<{ status: string; percentage: number; situation: string; advice: string } | null>(null);

  const fetchAstroData = async (lat: number, lng: number) => {
    try {
      const response = await fetch(`https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lng}&formatted=0`);
      const data = await response.json();
      if (data.status === 'OK') {
        return {
          sunrise: new Date(data.results.sunrise),
          sunset: new Date(data.results.sunset)
        };
      }
    } catch (e) {
      console.error('Failed to fetch sunrise/sunset', e);
    }
    const defSr = new Date(); defSr.setHours(6, 0, 0, 0);
    const defSs = new Date(); defSs.setHours(18, 0, 0, 0);
    return { sunrise: defSr, sunset: defSs };
  };

  const calculateAll = async () => {
    setLoading(true);
    try {
      const now = new Date();
      
      // Moon Data
      const md = getMoonData(now, location?.lat, location?.lng);
      setMoonData(md);

      // Sunrise/Muhurta base
      let sr = sunrise;
      if (location && (!sr || !sunset)) {
        try {
          const astro = await fetchAstroData(location.lat, location.lng);
          sr = astro.sunrise;
          setSunrise(sr);
          setSunset(astro.sunset);
        } catch (fetchErr) {
          console.warn("Sunrise fetch failed", fetchErr);
        }
      }
      
      if (!sr) {
        sr = new Date();
        sr.setHours(6, 0, 0, 0);
      }

      const muhurta = getCurrentMuhurta(now, sr);
      setCurrentMuhurta(muhurta);

      // New Theory Integration
      const mi = md.illumination * 100; // Actual illumination, no inversion
      const pm = muhurta.cumulativePercentage;
      
      // Synergy calculation (synchronization of stage and time)
      const synergyValue = (mi + pm) / 2.0;
      
      // Determine Status and Situation
      let status = "Neutral";
      let situation = "";
      let advice = "";

      const isAuspicious = !muhurta.nature.includes('Inauspicious');

      if (!isAuspicious) {
        status = "Challenging";
        situation = `${muhurta.name} Muhurta is currently active, which is inherently ${muhurta.nature.toLowerCase()}.`;
        advice = "Avoid starting high-stakes projects. Maintain a low profile and focus on routine maintenance tasks.";
      } else {
        if (!md.isWaxing) {
          status = "High Autonomy";
          situation = "Waning Moon cycle is synchronizing with an auspicious Muhurta, maximizing the freedom of personal thought.";
          advice = "Ideal time for introspection, creative breakthroughs, and individual decision-making. Your free will is at its peak.";
        } else {
          status = "Guided Action";
          situation = "Waxing moon illumination is increasing. Personal free will is subtly guided by rising external frequencies.";
          advice = "Excellent for collective efforts and following established patterns. Practice mindfulness to distinguish your own voice from common trends.";
        }
      }

      setSynergy({ status, percentage: synergyValue, situation, advice });
    } catch (err) {
      console.error("Calculate synergy error", err);
      setError("Sync Error: Using basic mode.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 1. Initial calculation with defaults immediately so the screen isn't white
    calculateAll();

    // 2. Safety timeout: If everything hangs, stop the loading spinner after 4 seconds
    const timer = setTimeout(() => {
      setLoading(false);
    }, 4000);

    const init = async () => {
      try {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
              setError(null);
            },
            (err) => {
              console.warn('Geolocation failed', err);
              setError("Using default location (GPS timeout/denied).");
              // Already called calculateAll with defaults at start
            },
            { 
              enableHighAccuracy: false, 
              timeout: 6000, 
              maximumAge: 120000 
            }
          );
        } else {
          setError("Location services unavailable.");
        }
      } catch (e) {
        console.error("Initialization error", e);
        setError("Error initializing sensors. Using defaults.");
      }
    };

    init();
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (location || error) {
      calculateAll();
    }
  }, [location, error]);

  return (
    <div className="min-h-screen bg-dark-bg text-white font-sans selection:bg-gold/30 flex flex-col">
      <AnimatePresence>
        {loading && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-dark-bg flex flex-col items-center justify-center gap-6"
          >
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 border-2 border-gold/20 rounded-full" />
              <div className="absolute inset-0 border-t-2 border-gold rounded-full animate-spin" />
            </div>
            <div className="flex flex-col items-center gap-2">
              <h1 className="text-gold tracking-[0.4em] uppercase text-xs font-bold animate-pulse">Initializing Cosmic Synergy</h1>
              <span className="text-white/20 text-[10px] tracking-widest uppercase">Calibrating for Poco X5 Pro</span>
            </div>
            {error && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => setLoading(false)}
                className="mt-4 px-4 py-2 border border-white/10 rounded text-[9px] uppercase tracking-widest text-white/40 hover:bg-white/5"
              >
                Skip Wait & View
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background radial accent */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--color-gold)_0%,transparent_70%)]" />
      </div>

      <div className="relative z-10 max-w-[1400px] w-full mx-auto px-10 py-10 flex-1 flex flex-col">
        <header className="flex justify-between items-end border-b border-white/10 pb-6 mb-10">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-1"
          >
            <h1 className="text-2xl font-light tracking-wide uppercase">
              {location ? `BHAKTAPUR, NEPAL` : "GLOBAL POSITION"}
            </h1>
            <p className="text-dim text-[10px] uppercase tracking-[0.2em] flex items-center gap-2">
              {new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
              <span className="opacity-30">&bull;</span>
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </motion.div>
          
          <div className="flex flex-col items-end gap-2">
             <div className="text-[10px] text-gold border border-gold/40 px-3 py-1 rounded-full uppercase tracking-widest font-medium">
               EMA STABLE
             </div>
             {error && <span className="text-[9px] text-red-400 uppercase tracking-tighter italic">{error}</span>}
          </div>
        </header>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
          <div className="bg-white/5 border border-white/5 p-4 rounded-xl backdrop-blur-sm">
            <div className="text-[10px] text-gold uppercase tracking-widest mb-1 flex items-center gap-2">
              <Sun className="w-3 h-3" /> Sunrise
            </div>
            <div className="text-xl font-light">{sunrise ? sunrise.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</div>
          </div>
          <div className="bg-white/5 border border-white/5 p-4 rounded-xl backdrop-blur-sm">
            <div className="text-[10px] text-gold uppercase tracking-widest mb-1 flex items-center gap-2">
              <div className="w-3 h-3 border-2 border-white/20 border-t-gold rounded-full" /> Sunset
            </div>
            <div className="text-xl font-light">{sunset ? sunset.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</div>
          </div>
          <div className="bg-white/5 border border-white/5 p-4 rounded-xl backdrop-blur-sm">
            <div className="text-[10px] text-gold uppercase tracking-widest mb-1 flex items-center gap-2">
              <Moon className="w-3 h-3" /> Moonrise
            </div>
            <div className="text-xl font-light">{moonData?.moonrise ? moonData.moonrise.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</div>
          </div>
          <div className="bg-white/5 border border-white/5 p-4 rounded-xl backdrop-blur-sm">
            <div className="text-[10px] text-gold uppercase tracking-widest mb-1 flex items-center gap-2">
              <div className="w-3 h-3 border-2 border-white/20 border-b-gold rounded-full" /> Moonset
            </div>
            <div className="text-xl font-light">{moonData?.moonset ? moonData.moonset.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</div>
          </div>
          <div className="bg-white/5 border border-white/5 p-4 rounded-xl backdrop-blur-sm shadow-[0_4px_20px_-10px_rgba(0,0,0,0.5)]">
            <div className="text-[10px] text-gold uppercase tracking-widest mb-1 flex items-center gap-2">
              <Moon className="w-3 h-3 text-gold/60" /> Transit
            </div>
            <div className="text-xl font-light">{moonData?.moonTransit ? moonData.moonTransit.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</div>
            <div className="text-[8px] text-dim font-mono uppercase mt-1">High Point</div>
          </div>
          <div className="bg-white/5 border border-gold/10 p-4 rounded-xl backdrop-blur-sm relative overflow-hidden group shadow-[0_4px_20px_-10px_rgba(212,175,55,0.1)]">
            <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
              <RefreshCw className="w-8 h-8 text-gold" />
            </div>
            <div className="text-[10px] text-gold uppercase tracking-widest mb-1 flex items-center gap-2">
              Peak Lunar
            </div>
            <div className="text-xl font-light text-gold">{((moonData?.peakIllumination ?? 0) * 100).toFixed(1)}%</div>
            <div className="text-[9px] text-dim font-mono uppercase mt-1">at {moonData?.peakIlluminationTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_280px] gap-12 flex-1">
          {/* Left Sidebar: Lunar Phases */}
          <aside className="bg-white/[0.03] border border-white/5 rounded-sm p-6 flex flex-col h-full max-h-[600px]">
            <h2 className="text-[10px] uppercase tracking-[0.3em] text-dim mb-6 border-b border-white/5 pb-3">Lunar Phases</h2>
            
            <div className="space-y-1 overflow-y-auto pr-2 custom-scrollbar">
              {[
                { name: "New Moon", range: "0%" },
                { name: "Waxing Crescent", range: "1-49%" },
                { name: "First Quarter", range: "50%" },
                { name: "Waxing Gibbous", range: "51-99%" },
                { name: "Full Moon", range: "100%" },
                { name: "Waning Gibbous", range: "99-51%" },
                { name: "Last Quarter", range: "50%" },
                { name: "Waning Crescent", range: "49-1%" },
              ].map((phase) => {
                const isActive = moonData?.phaseName === phase.name;
                return (
                  <div 
                    key={phase.name}
                    className={`flex justify-between py-2 px-3 text-[11px] transition-all duration-500 rounded ${
                      isActive ? 'bg-gold/10 text-gold font-bold opacity-100' : 'opacity-40 text-white'
                    }`}
                  >
                    <span>{phase.name}</span>
                    <span className="font-mono">{isActive ? `${((moonData?.illumination ?? 0) * 100).toFixed(0)}%` : phase.range}</span>
                  </div>
                );
              })}
            </div>
          </aside>

          {/* Main Hero Panel */}
          <main className="flex flex-col items-center justify-center text-center space-y-8 min-h-[500px]">
            <AnimatePresence mode="wait">
              {loading ? null : (
                <motion.div 
                  key="result"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center"
                >
                  <div className="relative w-64 h-64 border border-white/10 rounded-full flex items-center justify-center mb-10 group">
                    <div className={`absolute inset-0 border border-dashed rounded-full animate-[spin_60s_linear_infinite] ${
                      synergy?.status === 'Good' ? 'border-gold/30' : synergy?.status === 'Less Favourable' ? 'border-orange-500/30' : 'border-white/10'
                    }`} />
                    <div className="absolute inset-4 border border-white/5 rounded-full" />
                    
                    {/* Visual Moon Projection */}
                    <div className="w-32 h-32 rounded-full overflow-hidden relative shadow-[0_0_50px_rgba(255,255,255,0.05)]">
                      <div 
                        className="absolute inset-0 bg-white"
                        style={{ 
                          clipPath: `inset(0 ${100 - (moonData?.illumination ?? 0) * 100}% 0 0)`
                        }}
                      />
                      <div className="absolute inset-0 bg-dark-bg/60 mix-blend-multiply" />
                    </div>
                  </div>

                  <span className="text-[11px] font-medium tracking-[0.4em] uppercase text-gold mb-4">Lunar-Muhurta Synergy</span>
                  <h2 className={`font-serif italic text-6xl md:text-7xl font-black transition-colors duration-700 drop-shadow-2xl mb-2 tracking-tighter ${
                    synergy?.status === 'High Autonomy' ? 'text-gold' : synergy?.status === 'Guided Action' ? 'text-blue-300' : 'text-red-400'
                  }`}>
                    {synergy?.status ?? "Initializing"} <span className="text-3xl not-italic font-sans font-light text-white/40">with {(synergy?.percentage ?? 0).toFixed(2)}%</span>
                  </h2>
                                    <div className="max-w-xl mx-auto mt-8 space-y-6">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-left backdrop-blur-md">
                      <div className="text-[10px] text-dim uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Info className="w-3 h-3 text-gold" />
                        Cosmic Analysis
                      </div>
                      <p className="text-white/80 text-sm leading-relaxed font-light mb-4">
                        {synergy?.situation}
                      </p>
                      
                      {currentMuhurta && (
                        <div className="pt-4 border-t border-white/5 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-gold uppercase tracking-[0.2em]">{currentMuhurta.name} Details</span>
                            <span className={`text-[9px] px-2 py-0.5 rounded-full border ${currentMuhurta.nature.includes('Inauspicious') ? 'border-red-500/30 text-red-400' : 'border-emerald-500/30 text-emerald-400'}`}>
                              {currentMuhurta.nature}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-4 py-1 border-y border-white/5">
                            <div>
                              <span className="text-[8px] text-dim uppercase block">Starts</span>
                              <span className="text-xs font-mono">{currentMuhurta.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <div className="w-full h-[1px] bg-white/5 relative">
                              <div className="absolute top-1/2 left-0 w-1 h-1 bg-gold rounded-full -translate-y-1/2" />
                              <div className="absolute top-1/2 right-0 w-1 h-1 bg-white/20 rounded-full -translate-y-1/2" />
                            </div>
                            <div className="text-right">
                              <span className="text-[8px] text-dim uppercase block">Ends</span>
                              <span className="text-xs font-mono">{currentMuhurta.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          </div>

                          <p className="text-white/60 text-xs italic leading-snug">
                            {currentMuhurta.description}
                          </p>
                          <div className="bg-white/5 p-3 rounded-xl">
                            <span className="text-[9px] text-dim uppercase block mb-1">Primary Focus</span>
                            <p className="text-white/90 text-xs">{currentMuhurta.focus}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="bg-gold/5 border border-gold/10 rounded-2xl p-6 text-left backdrop-blur-md">
                      <div className="text-[10px] text-gold uppercase tracking-widest mb-3">Celestial Advice</div>
                      <p className="text-gold/90 text-sm leading-relaxed">
                        {synergy?.advice}
                      </p>
                    </div>
                  </div>

                  {error && <p className="mt-4 text-xs text-red-400 opacity-50 max-w-xs">{error}</p>}
                </motion.div>
              )}
            </AnimatePresence>
          </main>

          {/* Right Sidebar: Muhurta Cycle */}
          <aside className="bg-white/[0.03] border border-white/5 rounded-sm p-6 flex flex-col h-full max-h-[600px]">
            <h2 className="text-[10px] uppercase tracking-[0.3em] text-dim mb-6 border-b border-white/5 pb-3">Muhurta Cycle</h2>
            <div className="space-y-1 overflow-y-auto pr-2 custom-scrollbar">
              {MUHURTAS.map((m) => {
                const isActive = currentMuhurta?.id === m.id;
                const perc = ((m.id) * 3.33);
                
                // Calculate time range for this specific muhurta
                let timeStr = "";
                if (sunrise) {
                  const s = new Date(sunrise);
                  const start = new Date(s.getTime() + ((m.id - 1) * 48 * 60 * 1000));
                  const end = new Date(start.getTime() + (48 * 60 * 1000));
                  timeStr = `\nTime: ${start.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} - ${end.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}`;
                }

                return (
                  <div 
                    key={m.id}
                    title={`${m.nature}: ${m.description}\nFocus: ${m.focus}${timeStr}`}
                    className={`flex justify-between py-1.5 px-3 text-[10px] transition-all duration-300 rounded cursor-help group ${
                      isActive ? 'bg-gold/10 text-gold font-bold opacity-100 border-l-2 border-gold shadow-[inset_0_0_10px_rgba(212,175,55,0.05)]' : 'opacity-40 text-dim hover:opacity-100 hover:bg-white/5'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                       <span className={`w-1 h-1 rounded-full ${isActive ? 'bg-gold animate-pulse' : 'bg-transparent'}`} />
                       <span className="opacity-30">{m.id.toString().padStart(2, '0')}</span>
                       {m.name}
                    </span>
                    <span className="font-mono group-hover:text-gold transition-colors">{perc.toFixed(2)}%</span>
                  </div>
                );
              })}
            </div>
          </aside>
        </div>

        <footer className="mt-12 pt-8 border-t border-white/10 text-center text-[10px] text-dim tracking-[0.1em] uppercase font-light">
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 opacity-60">
            <span>Free Will Impact Analysis</span>
            <span className="opacity-20">|</span>
            <span>Synergy = (Illumination + Muhurta) / 2</span>
            <span className="opacity-20">|</span>
            <span>Vedic Calibration Active</span>
            <span className="opacity-20">|</span>
            <span 
              className="flex items-center gap-1 cursor-pointer hover:text-gold transition-colors"
              onClick={calculateAll}
            >
              <RefreshCw className="w-2.5 h-2.5" /> Force Sync
            </span>
          </div>
        </footer>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(212, 175, 55, 0.2); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(212, 175, 55, 0.5); }
      `}</style>
    </div>
  );
}

