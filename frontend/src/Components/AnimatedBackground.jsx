import React from 'react';
import { ShaderGradientCanvas, ShaderGradient } from 'shadergradient';

export default function AnimatedBackground() {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0, 
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      <ShaderGradientCanvas
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        }}
      >
        <ShaderGradient
          animate="on"
          type="waterPlane"
          shader="defaults"
          bgColor1="#000000"
          bgColor2="#000000"
          color1="#4338ca"
          color2="#7c3aed"
          color3="#9333ea"
          brightness={1.2}      
          cDistance={2.3}
          cAzimuthAngle={180}
          cPolarAngle={145}
          cameraZoom={9.1}
          fov={45}
          lightType="env"
          envPreset="city"
          positionX={0}
          positionY={0}
          positionZ={0}
          rotationX={50}
          rotationY={0}
          rotationZ={-60}
          uAmplitude={1.5}      
          uDensity={1.3}
          uFrequency={0.5}      
          uSpeed={0.3}
          uStrength={1.5}
          wireframe={false}
          grain="off"
        />
      </ShaderGradientCanvas>
    </div>
  );
}