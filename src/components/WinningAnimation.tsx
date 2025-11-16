import { useEffect, useState } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  rotation: number;
  type: 'confetti' | 'coin' | 'sparkle';
  color?: string;
}

interface WinningAnimationProps {
  show: boolean;
  winAmount?: number;
  onComplete?: () => void;
}

export const WinningAnimation = ({ show, winAmount, onComplete }: WinningAnimationProps) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (show) {
      // Generate particles
      const newParticles: Particle[] = [];
      const particleCount = 50;

      for (let i = 0; i < particleCount; i++) {
        const type = Math.random() > 0.6 ? 'coin' : Math.random() > 0.5 ? 'sparkle' : 'confetti';
        
        newParticles.push({
          id: i,
          x: Math.random() * 100,
          y: -20,
          size: Math.random() * 20 + 10,
          delay: Math.random() * 0.5,
          duration: Math.random() * 2 + 2,
          rotation: Math.random() * 360,
          type,
          color: type === 'confetti' 
            ? ['hsl(45, 100%, 51%)', 'hsl(35, 100%, 45%)', 'hsl(48, 100%, 65%)', '#FFD700'][Math.floor(Math.random() * 4)]
            : undefined
        });
      }

      setParticles(newParticles);

      // Clean up after animation
      const timeout = setTimeout(() => {
        setParticles([]);
        onComplete?.();
      }, 4000);

      return () => clearTimeout(timeout);
    }
  }, [show, onComplete]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {/* Overlay with glow effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[hsl(45,100%,51%)]/10 to-transparent animate-pulse" />
      
      {/* Center winning message */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-gradient-to-r from-[hsl(45,100%,51%)] to-[hsl(35,100%,45%)] p-8 rounded-3xl shadow-2xl animate-scale-in">
          <div className="text-center">
            <div className="text-6xl mb-4 animate-lottery-bounce">🎉</div>
            <h2 className="text-5xl font-black text-white mb-2 animate-sparkle">
              ထီပေါက်ပါပြီ!
            </h2>
            <p className="text-3xl font-bold text-white/90">
              Winner!
            </p>
            {winAmount && (
              <div className="mt-4 text-4xl font-black text-white animate-gold-glow">
                +{winAmount.toLocaleString()} ကျပ်
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute animate-fall"
          style={{
            left: `${particle.x}%`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
          }}
        >
          {particle.type === 'coin' && (
            <div 
              className="text-4xl animate-spin-slow"
              style={{ 
                fontSize: `${particle.size}px`,
                animationDuration: '1s'
              }}
            >
              🪙
            </div>
          )}
          
          {particle.type === 'sparkle' && (
            <div 
              className="text-3xl animate-sparkle"
              style={{ fontSize: `${particle.size}px` }}
            >
              ✨
            </div>
          )}
          
          {particle.type === 'confetti' && (
            <div
              className="w-3 h-6 animate-spin"
              style={{
                width: `${particle.size * 0.3}px`,
                height: `${particle.size * 0.6}px`,
                backgroundColor: particle.color,
                transform: `rotate(${particle.rotation}deg)`,
                borderRadius: '2px',
                animationDuration: '0.8s'
              }}
            />
          )}
        </div>
      ))}

      {/* Side burst effects */}
      <div className="absolute top-1/2 left-0 w-32 h-32 bg-[hsl(45,100%,51%)]/30 rounded-full blur-3xl animate-ping" style={{ animationDuration: '2s' }} />
      <div className="absolute top-1/2 right-0 w-32 h-32 bg-[hsl(35,100%,45%)]/30 rounded-full blur-3xl animate-ping" style={{ animationDuration: '2s', animationDelay: '0.3s' }} />
      
      {/* Bottom glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-radial from-[hsl(45,100%,51%)]/40 via-[hsl(45,100%,51%)]/20 to-transparent rounded-full blur-3xl" />
    </div>
  );
};
