'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useProgress, Html } from '@react-three/drei';

interface ModelLoaderProps {
  children: React.ReactNode;
  width?: string;
  height?: string;
  showControls?: boolean;
}

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-sm text-gray-600">{progress.toFixed(0)}% loaded</p>
      </div>
    </Html>
  );
}

export default function ModelLoader({ 
  children, 
  width = '100%', 
  height = '400px',
  showControls = true 
}: ModelLoaderProps) {
  return (
    <div style={{ width, height }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={<Loader />}>
          {children}
          {showControls && (
            <OrbitControls 
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
            />
          )}
        </Suspense>
      </Canvas>
    </div>
  );
} 