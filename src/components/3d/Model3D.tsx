'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, Bounds, Html, Center } from '@react-three/drei';
import { Suspense, useEffect, useState } from 'react';

interface Model3DProps {
  modelPath: string;
  scale?: number | [number, number, number];
  position?: [number, number, number];
  rotation?: [number, number, number];
  autoRotate?: boolean;
  showControls?: boolean;
  fitMargin?: number; // margin when fitting model into view
}

function GLTFModel({ modelPath, scale = 1, position = [0, 0, 0], rotation = [0, 0, 0] }: Model3DProps) {
  const { scene } = useGLTF(modelPath);
  const [currentY, setCurrentY] = useState(25);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(true);
      setCurrentY(15);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isAnimating) return;

    const startY = 25;
    const endY = 10;
    const duration = 2000; // 2 seconds
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const newY = startY + (endY - startY) * easeOutQuart;
      
      setCurrentY(newY);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isAnimating]);

  return (
    <primitive 
      object={scene} 
      scale={scale as any}
      position={[position[0], currentY, position[2]]} 
      rotation={rotation}
    />
  );
}

function LoaderOverlay() {
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center px-4 py-3 rounded-lg bg-white/80 shadow border border-gray-200">
        <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
        <p className="mt-2 text-xs text-gray-700 font-medium">Loading…</p>
      </div>
    </Html>
  );
}

export default function Model3D({ 
  modelPath, 
  scale = 1, 
  position = [0, 0, 0], 
  rotation = [0, 0, 0],
  autoRotate = false,
  showControls = true,
  fitMargin = 1.2,
}: Model3DProps) {
  // Preload model to speed up first paint
  useEffect(() => {
    try {
      // @ts-ignore - preload is available on the hook
      useGLTF.preload(modelPath);
    } catch {}
  }, [modelPath]);

  return (
    <div className="w-full h-full">
      <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0.4, 2.5], fov: 40, near: 0.01, far: 1000 }}>
        <Suspense fallback={<LoaderOverlay />}>
          <ambientLight intensity={0.4} />
          <directionalLight position={[10, 10, 5]} intensity={1.2} />
          <directionalLight position={[-10, -10, -5]} intensity={0.8} />
          <pointLight position={[0, 10, 0]} intensity={0.5} />

          {/* Center and auto-fit the model into the camera view */}
          <Bounds fit observe margin={fitMargin}>
            <Center>
              <GLTFModel 
                modelPath={modelPath} 
                scale={scale} 
                position={[position[0], position[1] - 1, position[2]]} 
                rotation={rotation}
              />
            </Center>
          </Bounds>

          {showControls && (
            <OrbitControls 
              autoRotate={autoRotate} 
              autoRotateSpeed={1}
              enablePan={false}
              enableZoom
              enableRotate
              // Allow vertical orbit while avoiding flipping
              minPolarAngle={Math.PI / 4}
              maxPolarAngle={(3 * Math.PI) / 4}
              target={[0, 0, 0]}
            />
          )}
        </Suspense>
      </Canvas>
    </div>
  );
}

// Optional: preload common models
// useGLTF.preload('/models/just_a_girl.glb'); 