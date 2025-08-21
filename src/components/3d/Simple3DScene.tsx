'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Box, Sphere, Cylinder } from '@react-three/drei';
import { Suspense } from 'react';

interface Simple3DSceneProps {
  width?: string;
  height?: string;
  showControls?: boolean;
}

export default function Simple3DScene({ 
  width = '100%', 
  height = '400px', 
  showControls = true 
}: Simple3DSceneProps) {
  return (
    <div style={{ width, height }}>
      <Canvas
        camera={{ position: [3, 3, 3], fov: 50 }}
        style={{ background: 'linear-gradient(to bottom, #87CEEB, #98FB98)' }}
      >
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />
          
          {/* 3D Objects */}
          <Box position={[-1, 0, 0]} args={[1, 1, 1]}>
            <meshStandardMaterial color="hotpink" />
          </Box>
          
          <Sphere position={[1, 0, 0]} args={[0.5, 32, 32]}>
            <meshStandardMaterial color="lightblue" />
          </Sphere>
          
          <Cylinder position={[0, 1, 0]} args={[0.5, 0.5, 1, 32]}>
            <meshStandardMaterial color="lightgreen" />
          </Cylinder>
          
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