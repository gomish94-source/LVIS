import React, { useEffect, useRef } from "react";

export const CosmicOrrery: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    const canvas = containerRef.current.querySelector('#cosmos') as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let W: number, H: number, cx: number, cy: number;
    let playing = true;
    let showLabels = true;
    let showOrbits = true;
    let earthAngle = -1.05;
    let moonAngle = 0;
    let earthSpin = 0;
    let frame = 0;
    let dayCount = 0;
    let rAFId = 0;

    const ZODIAC = [
      { name: 'Aries',       sym: '\u2648', col: '#ff7777' },
      { name: 'Taurus',      sym: '\u2649', col: '#ffaa55' },
      { name: 'Gemini',      sym: '\u264a', col: '#ffdd55' },
      { name: 'Cancer',      sym: '\u264b', col: '#aaee88' },
      { name: 'Leo',         sym: '\u264c', col: '#ffcc44' },
      { name: 'Virgo',       sym: '\u264d', col: '#bbddff' },
      { name: 'Libra',       sym: '\u264e', col: '#aabbff' },
      { name: 'Scorpio',     sym: '\u264f', col: '#cc88ff' },
      { name: 'Sagittarius', sym: '\u2650', col: '#ff99cc' },
      { name: 'Capricorn',   sym: '\u2651', col: '#88ccdd' },
      { name: 'Aquarius',    sym: '\u2652', col: '#66bbff' },
      { name: 'Pisces',      sym: '\u2653', col: '#99ddcc' },
    ];

    const STARS: any[] = [];
    function initStars() {
      STARS.length = 0;
      for (let i = 0; i < 220; i++) {
        STARS.push({
          x: Math.random() * W,
          y: Math.random() * H,
          r: Math.random() < 0.08 ? 1.4 : 0.7,
          a: 0.15 + Math.random() * 0.5
        });
      }
    }

    function resize() {
      const parentWidth = containerRef.current?.offsetWidth || 680;
      W = parentWidth;
      H = 560;
      canvas.width = W;
      canvas.height = H;
      cx = W / 2;
      cy = H / 2;
      initStars();
    }

    function getSign(angle: number) {
      let deg = ((angle * 180 / Math.PI) % 360 + 360) % 360;
      return ZODIAC[Math.floor(deg / 30) % 12];
    }

    function moonPhaseLabel(relAngle: number) {
      let deg = ((relAngle * 180 / Math.PI) % 360 + 360) % 360;
      if (deg < 15 || deg > 345) return 'New Moon';
      if (deg < 80) return 'Waxing crescent';
      if (deg < 100) return 'First quarter';
      if (deg < 170) return 'Waxing gibbous';
      if (deg < 195) return 'Full Moon';
      if (deg < 260) return 'Waning gibbous';
      if (deg < 280) return 'Last quarter';
      return 'Waning crescent';
    }

    function drawStars() {
      STARS.forEach(s => {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${s.a})`;
        ctx.fill();
      });
    }

    function drawZodiacRing(R: number) {
      const bandW = 44;
      ctx.beginPath();
      ctx.arc(cx, cy, R + bandW / 2, 0, Math.PI * 2);
      ctx.strokeStyle = '#1a1a3a';
      ctx.lineWidth = bandW;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx, cy, R + bandW, 0, Math.PI * 2);
      ctx.strokeStyle = '#2a2a55';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.strokeStyle = '#2a2a55';
      ctx.lineWidth = 1;
      ctx.stroke();

      ZODIAC.forEach((z, i) => {
        const startA = (i / 12) * Math.PI * 2 - Math.PI / 2;
        const midA   = ((i + 0.5) / 12) * Math.PI * 2 - Math.PI / 2;
        const endA   = ((i + 1) / 12) * Math.PI * 2 - Math.PI / 2;

        const lx = cx + Math.cos(startA) * (R + bandW);
        const ly = cy + Math.sin(startA) * (R + bandW);
        const sx = cx + Math.cos(startA) * R;
        const sy = cy + Math.sin(startA) * R;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(lx, ly);
        ctx.strokeStyle = '#3a3a6a';
        ctx.lineWidth = 0.8;
        ctx.stroke();

        if (showLabels) {
          const sr = R + 14;
          const nr = R + 32;
          const sx2 = cx + Math.cos(midA) * sr;
          const sy2 = cy + Math.sin(midA) * sr;
          const nx  = cx + Math.cos(midA) * nr;
          const ny  = cy + Math.sin(midA) * nr;

          ctx.font = '13px serif';
          ctx.fillStyle = z.col;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(z.sym, sx2, sy2);

          ctx.font = '9px sans-serif';
          ctx.fillStyle = z.col + '99';
          ctx.fillText(z.name, nx, ny);
        }
      });
    }

    function drawSun(r: number) {
      const rays = 14;
      for (let i = 0; i < rays; i++) {
        const a = (i / rays) * Math.PI * 2 + frame * 0.003;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * (r + 3), cy + Math.sin(a) * (r + 3));
        ctx.lineTo(cx + Math.cos(a) * (r + 10 + Math.sin(frame * 0.05 + i) * 3), cy + Math.sin(a) * (r + 10 + Math.sin(frame * 0.05 + i) * 3));
        ctx.strokeStyle = '#cc9900';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = '#FFD700';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx, cy, r - 5, 0, Math.PI * 2);
      ctx.fillStyle = '#FFF4a0';
      ctx.fill();
      if (showLabels) {
        ctx.font = 'bold 11px sans-serif';
        ctx.fillStyle = '#854F0B';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Sun', cx, cy + r + 14);
      }
    }

    function drawEarth(ex: number, ey: number, spin: number) {
      const r = 13;
      ctx.save();
      ctx.translate(ex, ey);

      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fillStyle = '#1D9E75';
      ctx.fill();

      ctx.save();
      ctx.rotate(spin);
      ctx.beginPath();
      ctx.arc(-4, -4, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#3B8BD4';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(5, 4, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#3B8BD4';
      ctx.fill();
      ctx.restore();

      const toSunAngle = Math.atan2(cy - ey, cx - ex);
      ctx.beginPath();
      ctx.arc(0, 0, r, toSunAngle + Math.PI / 2, toSunAngle - Math.PI / 2);
      ctx.fillStyle = 'rgba(0,0,20,0.45)';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.strokeStyle = '#4488aa';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      if (showLabels) {
        ctx.font = 'bold 10px sans-serif';
        ctx.fillStyle = '#5DCAA5';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText('Earth', 0, r + 4);
      }
      ctx.restore();
    }

    function drawMoon(mx: number, my: number, ex: number, ey: number) {
      const r = 6;
      ctx.save();
      ctx.translate(mx, my);

      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fillStyle = '#aabbcc';
      ctx.fill();

      const toSunAngle = Math.atan2(cy - my, cx - mx);
      ctx.beginPath();
      ctx.arc(0, 0, r, toSunAngle + Math.PI / 2, toSunAngle - Math.PI / 2);
      ctx.fillStyle = 'rgba(0,0,20,0.75)';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.strokeStyle = '#778899';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      if (showLabels) {
        ctx.font = '9px sans-serif';
        ctx.fillStyle = '#8899aa';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText('Moon', 0, r + 3);
      }
      ctx.restore();
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#03030f';
      ctx.fillRect(0, 0, W, H);

      drawStars();

      const earthOrbitR = Math.min(W, H) * 0.3;
      const moonOrbitR  = earthOrbitR * 0.22;
      const zodiacR     = Math.min(W, H) * 0.43;
      const sunR        = 22;

      if (showOrbits) {
        ctx.beginPath();
        ctx.arc(cx, cy, earthOrbitR, 0, Math.PI * 2);
        ctx.strokeStyle = '#1e2244';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 6]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      drawZodiacRing(zodiacR);
      drawSun(sunR);

      const ex = cx + Math.cos(earthAngle) * earthOrbitR;
      const ey = cy + Math.sin(earthAngle) * earthOrbitR;

      if (showOrbits) {
        ctx.beginPath();
        ctx.arc(ex, ey, moonOrbitR, 0, Math.PI * 2);
        ctx.strokeStyle = '#223355';
        ctx.lineWidth = 0.8;
        ctx.setLineDash([2, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      const mx = ex + Math.cos(moonAngle) * moonOrbitR;
      const my = ey + Math.sin(moonAngle) * moonOrbitR;

      drawMoon(mx, my, ex, ey);
      drawEarth(ex, ey, earthSpin);

      const relMoonAngle = moonAngle - earthAngle + Math.PI;
      const earthSign = getSign(earthAngle + Math.PI);
      const phase     = moonPhaseLabel(relMoonAngle);

      const earthSignEl = containerRef.current?.querySelector('#earth-sign');
      const moonPhaseEl = containerRef.current?.querySelector('#moon-phase');
      const dayCountEl = containerRef.current?.querySelector('#day-count');

      if (earthSignEl) earthSignEl.textContent = earthSign.name;
      if (moonPhaseEl) moonPhaseEl.textContent = phase;
      if (dayCountEl) dayCountEl.textContent  = Math.floor(dayCount).toString();
    }

    const speedInput = containerRef.current.querySelector('#speed') as HTMLInputElement;
    const speedOut = containerRef.current.querySelector('#speed-out') as HTMLElement;

    function step() {
      if (!playing) return;
      const spd = speedInput ? parseInt(speedInput.value) : 5;
      if (speedOut) speedOut.textContent = spd.toString();

      const earthSpeed = (2 * Math.PI / 365) * spd * 0.05;
      const moonSpeed  = (2 * Math.PI / 27.3) * spd * 0.05;
      const spinSpeed  = (2 * Math.PI) * spd * 0.05 / 1;

      earthAngle += earthSpeed;
      moonAngle  += moonSpeed;
      earthSpin  += spinSpeed * 0.08;
      dayCount   += spd * 0.05;
      frame++;

      draw();
      rAFId = requestAnimationFrame(step);
    }

    const btnPlay = containerRef.current.querySelector('#btn-play') as HTMLButtonElement;
    const btnLbl = containerRef.current.querySelector('#btn-lbl') as HTMLButtonElement;
    const btnOrb = containerRef.current.querySelector('#btn-orb') as HTMLButtonElement;

    const handlePlayClick = () => {
      playing = !playing;
      if (btnPlay) {
        btnPlay.textContent = playing ? 'Pause' : 'Play';
        btnPlay.classList.toggle('on', playing);
      }
      if (playing) {
        rAFId = requestAnimationFrame(step);
      } else {
        cancelAnimationFrame(rAFId);
      }
    };

    const handleResetClick = () => {
      earthAngle = -1.05;
      moonAngle = 0;
      earthSpin = 0;
      dayCount = 0;
      frame = 0;
      if (!playing) draw();
    };

    const handleLblClick = () => {
      showLabels = !showLabels;
      if (btnLbl) {
        btnLbl.textContent = showLabels ? 'On' : 'Off';
        btnLbl.classList.toggle('on', showLabels);
      }
      if (!playing) draw();
    };

    const handleOrbClick = () => {
      showOrbits = !showOrbits;
      if (btnOrb) {
        btnOrb.textContent = showOrbits ? 'On' : 'Off';
        btnOrb.classList.toggle('on', showOrbits);
      }
      if (!playing) draw();
    };

    const handleSpeedChange = () => {
      if (speedInput && speedOut) {
        speedOut.textContent = speedInput.value;
      }
    };

    if (btnPlay) btnPlay.addEventListener('click', handlePlayClick);
    const resetBtn = containerRef.current.querySelectorAll('button')[1]; // reset is 2nd button
    if (resetBtn) resetBtn.addEventListener('click', handleResetClick);
    if (btnLbl) btnLbl.addEventListener('click', handleLblClick);
    if (btnOrb) btnOrb.addEventListener('click', handleOrbClick);
    if (speedInput) speedInput.addEventListener('input', handleSpeedChange);

    const handleWindowResize = () => {
      resize();
      draw();
    };

    window.addEventListener('resize', handleWindowResize);
    
    // Initial load
    resize();
    rAFId = requestAnimationFrame(step);

    // Cleanup
    return () => {
      cancelAnimationFrame(rAFId);
      window.removeEventListener('resize', handleWindowResize);
      if (btnPlay) btnPlay.removeEventListener('click', handlePlayClick);
      if (resetBtn) resetBtn.removeEventListener('click', handleResetClick);
      if (btnLbl) btnLbl.removeEventListener('click', handleLblClick);
      if (btnOrb) btnOrb.removeEventListener('click', handleOrbClick);
      if (speedInput) speedInput.removeEventListener('input', handleSpeedChange);
    };
  }, []);

  return (
    <div ref={containerRef} className="w-full flex flex-col bg-black/40 border border-white/5 rounded-2xl overflow-hidden shadow-2xl relative">
      <style dangerouslySetInnerHTML={{ __html: `
        #cosmos { background: #03030f; display: block; width: 100%; border-radius: 12px; }
        .ctrl { display: flex; align-items: center; gap: 12px; padding: 10px 14px; flex-wrap: wrap; background: #06060f; border-radius: 0 0 12px 12px; }
        .ctrl label { font-size: 12px; color: #7788aa; }
        .ctrl button { font-size: 12px; padding: 4px 14px; border-radius: 6px; border: 0.5px solid #3a3a6a; background: #0d0d22; color: #9999cc; cursor: pointer; }
        .ctrl button:hover { background: #16163a; }
        .ctrl button.on { border-color: #FFD700; color: #FFD700; }
        #info-bar { display: flex; gap: 8px; padding: 8px 14px; background: #050510; flex-wrap: wrap; }
        .istat { font-size: 11px; color: #556677; }
        .istat span { color: #8899bb; font-weight: 500; }
      `}} />
      
      <canvas id="cosmos" height="560"></canvas>
      <div id="info-bar">
        <div className="istat">Sun: <span id="sun-pos">centre</span></div>
        <div className="istat">Earth sign: <span id="earth-sign">—</span></div>
        <div className="istat">Moon phase: <span id="moon-phase">—</span></div>
        <div className="istat">Day: <span id="day-count">0</span></div>
      </div>
      <div className="ctrl">
        <label>Speed</label>
        <input type="range" min="1" max="20" defaultValue="5" id="speed" step="1" style={{ width: "100px" }} />
        <span id="speed-out" style={{ fontSize: "12px", color: "#7788aa", minWidth: "20px" }}>5</span>
        <button id="btn-play" className="on">Pause</button>
        <button>Reset</button>
        <label style={{ marginLeft: "8px" }}>Labels</label>
        <button id="btn-lbl" className="on">On</button>
        <label style={{ marginLeft: "8px" }}>Orbits</label>
        <button id="btn-orb" className="on">On</button>
      </div>
    </div>
  );
};
