import React, { useState, useEffect, useRef } from 'react';

const MetaPresenceLoading = () => {
  const [waveOffset, setWaveOffset] = useState(0);
  const animationRef = useRef(null);
  const startTimeRef = useRef(null);
  
  // Continuous wave animation with immediate start
  useEffect(() => {
    let animationFrameId:any;
    const waveSpeed = 0.002; // Adjusted for smoother animation
    
    const animateWave = (currentTime:any) => {
      // Initialize start time on first frame
      if (!startTimeRef.current) {
        startTimeRef.current = currentTime;
      }
      
      // Calculate elapsed time since animation started
      const elapsedTime = currentTime - startTimeRef.current!;
      
      // Update wave offset directly based on elapsed time
      setWaveOffset(elapsedTime * waveSpeed);
      
      animationFrameId = requestAnimationFrame(animateWave);
    };
    
    // Start animation immediately
    animationFrameId = requestAnimationFrame(animateWave);
    
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  const generateWavePath = () => {
    const points = [];
    const steps = 60; // Increased for smoother wave
    const amplitude = 12;
    const frequency = 0.015;
    const fillLevel = 50;
    
    // Start from bottom left
    points.push(`0% 100%`);
    
    // Generate wave points
    for (let i = 0; i <= steps; i++) {
      const x = (i / steps) * 100;
      const waveHeight = amplitude * Math.sin((waveOffset + x * frequency) * Math.PI);
      const y = 100 - fillLevel + waveHeight;
      points.push(`${x}% ${Math.max(0, Math.min(100, y))}%`);
    }
    
    // Close the polygon at bottom right
    points.push(`100% 100%`);
    
    return `polygon(${points.join(', ')})`;
  };

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1e3a8a 0%, #581c87 50%, #312e81 100%)',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  };

  const backgroundElementsStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    opacity: 0.2,
    pointerEvents: 'none'
  };

  const backgroundOrb1Style: React.CSSProperties = {
    position: 'absolute',
    width: '384px',
    height: '384px',
    background: 'radial-gradient(circle, rgba(96, 165, 250, 0.6) 0%, rgba(96, 165, 250, 0) 70%)',
    borderRadius: '50%',
    filter: 'blur(48px)',
    top: '20%',
    left: '10%',
    transform: `translate(${Math.sin(waveOffset * 0.001) * 50}px, ${Math.cos(waveOffset * 0.0008) * 30}px)`
  };

  const backgroundOrb2Style: React.CSSProperties = {
    position: 'absolute',
    width: '320px',
    height: '320px',
    background: 'radial-gradient(circle, rgba(196, 181, 253, 0.6) 0%, rgba(196, 181, 253, 0) 70%)',
    borderRadius: '50%',
    filter: 'blur(48px)',
    top: '60%',
    right: '15%',
    transform: `translate(${Math.cos(waveOffset * 0.0012) * 40}px, ${Math.sin(waveOffset * 0.001) * 35}px)`
  };

  const logoContainerStyle: React.CSSProperties = {
    position: 'relative',
    zIndex: 10,
    marginBottom: '32px'
  };

  const outerGlowStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(90deg, #60a5fa, #a855f7)',
    borderRadius: '16px',
    filter: 'blur(24px)',
    opacity: 0.3,
    transform: 'scale(1.1)'
  };

  const mainContentStyle: React.CSSProperties = {
    position: 'relative',
    background: 'rgba(0, 0, 0, 0.4)',
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '16px',
    padding: '32px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
  };

  const waveFillStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(90deg, rgba(59, 130, 246, 0.3), rgba(168, 85, 247, 0.3))',
    borderRadius: '16px',
    clipPath: generateWavePath(),
    transition: 'none'
  };

  const logoTextContainerStyle: React.CSSProperties = {
    position: 'relative',
    zIndex: 10,
    textAlign: 'center'
  };

  const logoTextStyle: React.CSSProperties = {
    fontSize: '2.25rem',
    fontWeight: 'bold',
    background: 'linear-gradient(90deg, #93c5fd, #c4b5fd)',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    color: 'transparent',
    marginBottom: '8px',
    margin: 0
  };

  const dividerStyle: React.CSSProperties = {
    height: '2px',
    width: '96px',
    background: 'linear-gradient(90deg, #60a5fa, #a855f7)',
    margin: '0 auto',
    borderRadius: '9999px'
  };

  const loadingTextStyle: React.CSSProperties = {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '1.125rem',
    fontWeight: 500,
    opacity: 0.5 + 0.5 * Math.sin(waveOffset * 0.003)
  };

  const particlesContainerStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none'
  };

  const getParticleStyle = (i: number): React.CSSProperties => ({
    position: 'absolute',
    width: '8px',
    height: '8px',
    background: 'rgba(255, 255, 255, 0.2)',
    borderRadius: '50%',
    left: `${20 + i * 15}%`,
    top: `${30 + (i % 3) * 20}%`,
    transform: `translateY(${Math.sin(waveOffset * 0.002 + i) * 20}px)`
  });

  return (
    <div style={containerStyle}>
      {/* Animated background elements */}
      <div style={backgroundElementsStyle}>
        <div style={backgroundOrb1Style} />
        <div style={backgroundOrb2Style} />
      </div>
      
      {/* Main logo container */}
      <div style={logoContainerStyle}>
        {/* Outer glow effect */}
        <div style={outerGlowStyle} />
        
        {/* Main content container */}
        <div style={mainContentStyle}>
          {/* Animated wave fill */}
          <div style={waveFillStyle} />
          
          {/* Logo text */}
          <div style={logoTextContainerStyle}>
            <h1 style={logoTextStyle}>
              MetaPresence
            </h1>
            <div style={dividerStyle} />
          </div>
        </div>
      </div>
      
      {/* Loading text with pulse animation */}
      <div style={loadingTextStyle}>
        loading...
      </div>
      
      {/* Floating particles */}
      <div style={particlesContainerStyle}>
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            style={getParticleStyle(i)}
          />
        ))}
      </div>
    </div>
  );
};

export default MetaPresenceLoading;