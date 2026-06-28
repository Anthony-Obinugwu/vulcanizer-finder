import { useEffect, useState } from 'react';

export default function AnimatedBackground() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Only run parallax if motion is allowed
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) return;

    const handleMouseMove = (e: MouseEvent) => {
      // Calculate normalized mouse position (-1 to 1)
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Parallax transform amount (max 20px)
  const transform = `translate(${mousePos.x * -20}px, ${mousePos.y * -20}px)`;

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-[#060B18]">
      {/* Radial soft glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-[#060B18]/50 to-[#060B18] z-0" />
      
      <div 
        className="absolute inset-[-5%] w-[110%] h-[110%] z-10 transition-transform duration-700 ease-out"
        style={{ transform }}
      >
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 opacity-20">
          <defs>
            <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
              <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#3b82f6" strokeWidth="0.5" className="opacity-30" />
              <path d="M 0 100 L 100 100 100 0" fill="none" stroke="#3b82f6" strokeWidth="0.5" className="opacity-30" />
            </pattern>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Main stylistic paths simulating roads */}
          <g stroke="#1e40af" strokeWidth="1" fill="none" className="opacity-50">
            <path d="M-100,200 Q300,300 500,100 T1200,400" />
            <path d="M200,-100 Q400,400 800,200 T1500,800" />
            <path d="M0,800 Q400,600 600,800 T1200,900" />
            <path d="M800,0 Q700,500 900,700 T800,1200" />
            <path d="M1000,-100 Q1200,300 1400,500 T1800,900" />
          </g>

          {/* Animated routes (dashed lines moving) */}
          <g stroke="#3b82f6" strokeWidth="2.5" fill="none" filter="url(#glow)" className="opacity-80">
            <path d="M-100,200 Q300,300 500,100" strokeDasharray="8, 16" className="animate-dash" />
            <path d="M800,0 Q700,500 900,700" strokeDasharray="8, 16" className="animate-dash-reverse" />
            <path d="M1000,-100 Q1200,300 1400,500" strokeDasharray="6, 12" className="animate-dash" />
          </g>

          {/* GPS Nodes */}
          <g fill="#60a5fa">
            <circle cx="300" cy="245" r="4" filter="url(#glow)">
              <animate attributeName="r" values="4;7;4" dur="4s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.6;1;0.6" dur="4s" repeatCount="indefinite" />
            </circle>
            <circle cx="300" cy="245" r="15" fill="none" stroke="#60a5fa" strokeWidth="1" opacity="0.3">
              <animate attributeName="r" values="4;30" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.8;0" dur="2s" repeatCount="indefinite" />
            </circle>

            <circle cx="760" cy="425" r="3" opacity="0.6" filter="url(#glow)" />
            
            <circle cx="500" cy="100" r="4" filter="url(#glow)">
              <animate attributeName="r" values="3;6;3" dur="3s" repeatCount="indefinite" />
            </circle>

            <circle cx="1200" cy="400" r="5" filter="url(#glow)">
              <animate attributeName="r" values="4;8;4" dur="5s" repeatCount="indefinite" />
            </circle>
            <circle cx="1200" cy="400" r="20" fill="none" stroke="#60a5fa" strokeWidth="1.5" opacity="0.3">
              <animate attributeName="r" values="5;40" dur="3s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.6;0" dur="3s" repeatCount="indefinite" />
            </circle>

            <circle cx="1400" cy="500" r="3" opacity="0.5" filter="url(#glow)" />
          </g>

          {/* Drifting particles */}
          <g fill="#93c5fd" className="opacity-50">
            <circle cx="15%" cy="60%" r="2" className="animate-drift-slow" filter="url(#glow)" />
            <circle cx="85%" cy="25%" r="2.5" className="animate-drift" filter="url(#glow)" />
            <circle cx="45%" cy="85%" r="1.5" className="animate-drift-fast" filter="url(#glow)" />
            <circle cx="70%" cy="65%" r="2" className="animate-drift-slow" filter="url(#glow)" />
            <circle cx="30%" cy="15%" r="1" className="animate-drift" />
          </g>
        </svg>
      </div>
    </div>
  );
}
