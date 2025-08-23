'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  OrbitControls, 
  useGLTF, 
  Environment, 
  Bounds, 
  Html, 
  Center,
  PresentationControls,
  ContactShadows,
  Float,
  Sparkles,
  useProgress,
  Preload,
  AccumulativeShadows,
  RandomizedLight,
  Decal,
  useTexture,
  Text3D,
  MeshDistortMaterial,
  MeshWobbleMaterial,
  MeshReflectorMaterial
} from '@react-three/drei';
import { Suspense, useEffect, useState, useRef } from 'react';
import { EffectComposer, Bloom, ChromaticAberration, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';

interface EnhancedModel3DProps {
  modelPath: string;
  scale?: number | [number, number, number];
  position?: [number, number, number];
  rotation?: [number, number, number];
  autoRotate?: boolean;
  showControls?: boolean;
  fitMargin?: number;
  enableShadows?: boolean;
  enableBloom?: boolean;
  enableFloating?: boolean;
  enableSparkles?: boolean;
  backgroundColor?: string;
  environment?: 'city' | 'sunset' | 'dawn' | 'night' | 'warehouse' | 'forest' | 'apartment' | 'studio' | 'park' | 'lobby';
  quality?: 'low' | 'medium' | 'high' | 'ultra';
  showContactShadows?: boolean;
  showAccumulativeShadows?: boolean;
  enableDistortion?: boolean;
  enableWobble?: boolean;
  enableReflection?: boolean;
  customLighting?: boolean;
}

function LoadingScreen() {
  const { progress } = useProgress();
  
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center px-6 py-4 rounded-2xl bg-white/90 backdrop-blur-sm shadow-xl border border-gray-200">
        <div className="relative w-16 h-16 mb-4">
          <div className="absolute inset-0 w-16 h-16 border-4 border-emerald-200 rounded-full"></div>
          <div 
            className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-emerald-600 rounded-full animate-spin"
            style={{ 
              background: `conic-gradient(from 0deg, transparent ${progress * 3.6}deg, #059669 ${progress * 3.6}deg, #059669 360deg)` 
            }}
          ></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold text-emerald-600">{Math.round(progress)}%</span>
          </div>
        </div>
        <p className="text-sm font-medium text-gray-700">Loading 3D Model...</p>
        <div className="mt-2 w-32 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-emerald-500 to-green-600 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    </Html>
  );
}

function EnhancedGLTFModel({ 
  modelPath, 
  scale = 1, 
  position = [0, 0, 0], 
  rotation = [0, 0, 0],
  enableFloating = false,
  enableSparkles = false,
  enableDistortion = false,
  enableWobble = false,
  enableReflection = false,
  customLighting = false
}: EnhancedModel3DProps) {
  const { scene } = useGLTF(modelPath);
  const [currentY, setCurrentY] = useState(25);
  const [isAnimating, setIsAnimating] = useState(false);
  const meshRef = useRef<THREE.Group>(null);

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
    const duration = 2000;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const newY = startY + (endY - startY) * easeOutQuart;
      
      setCurrentY(newY);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isAnimating]);

  // Apply materials based on props
  useEffect(() => {
    if (scene) {
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          if (enableDistortion) {
            child.material = new MeshDistortMaterial({
              color: child.material.color,
              distort: 0.3,
              speed: 2,
              roughness: 0.5,
              metalness: 0.1
            });
          } else if (enableWobble) {
            child.material = new MeshWobbleMaterial({
              color: child.material.color,
              factor: 0.3,
              speed: 2,
              roughness: 0.5,
              metalness: 0.1
            });
          } else if (enableReflection) {
            child.material = new MeshReflectorMaterial({
              color: child.material.color,
              roughness: 0.1,
              metalness: 0.9,
              mirror: 0.8
            });
          }
        }
      });
    }
  }, [scene, enableDistortion, enableWobble, enableReflection]);

  // Floating animation
  useFrame((state) => {
    if (meshRef.current && enableFloating) {
      meshRef.current.position.y = currentY + Math.sin(state.clock.elapsedTime * 2) * 0.5;
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  const ModelWrapper = enableFloating ? Float : 'group';
  const floatProps = enableFloating ? {
    speed: 2,
    rotationIntensity: 0.5,
    floatIntensity: 0.5,
    floatingRange: [-0.5, 0.5]
  } : {};

  return (
    <ModelWrapper ref={meshRef} {...floatProps}>
      <primitive 
        object={scene} 
        scale={scale as any}
        position={[position[0], currentY, position[2]]} 
        rotation={rotation}
      />
      {enableSparkles && (
        <Sparkles 
          count={100} 
          scale={2} 
          size={2} 
          speed={0.3} 
          opacity={0.6}
          color="#10b981"
        />
      )}
    </ModelWrapper>
  );
}

function AdvancedLighting() {
  return (
    <>
      {/* Ambient lighting */}
      <ambientLight intensity={0.4} color="#ffffff" />
      
      {/* Main directional light */}
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={1.2} 
        color="#ffffff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      
      {/* Fill light */}
      <directionalLight 
        position={[-5, 5, -5]} 
        intensity={0.3} 
        color="#e0f2fe"
      />
      
      {/* Rim light */}
      <directionalLight 
        position={[0, 0, -10]} 
        intensity={0.2} 
        color="#fef3c7"
      />
      
      {/* Point lights for dramatic effect */}
      <pointLight 
        position={[5, 5, 5]} 
        intensity={0.5} 
        color="#10b981"
        distance={20}
      />
      <pointLight 
        position={[-5, 3, -5]} 
        intensity={0.3} 
        color="#3b82f6"
        distance={15}
      />
    </>
  );
}

function QualitySettings({ quality = 'medium' }: { quality: string }) {
  const { gl } = useThree();
  
  useEffect(() => {
    switch (quality) {
      case 'low':
        gl.setPixelRatio(1);
        gl.shadowMap.enabled = false;
        break;
      case 'medium':
        gl.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        gl.shadowMap.enabled = true;
        gl.shadowMap.type = THREE.PCFShadowMap;
        break;
      case 'high':
        gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        gl.shadowMap.enabled = true;
        gl.shadowMap.type = THREE.PCFSoftShadowMap;
        break;
      case 'ultra':
        gl.setPixelRatio(Math.min(window.devicePixelRatio, 3));
        gl.shadowMap.enabled = true;
        gl.shadowMap.type = THREE.PCFSoftShadowMap;
        gl.antialias = true;
        break;
    }
  }, [gl, quality]);

  return null;
}

export default function EnhancedModel3D({ 
  modelPath, 
  scale = 1, 
  position = [0, 0, 0], 
  rotation = [0, 0, 0],
  autoRotate = false,
  showControls = true,
  fitMargin = 1.2,
  enableShadows = true,
  enableBloom = true,
  enableFloating = false,
  enableSparkles = false,
  backgroundColor = '#f8fafc',
  environment = 'city',
  quality = 'medium',
  showContactShadows = true,
  showAccumulativeShadows = false,
  enableDistortion = false,
  enableWobble = false,
  enableReflection = false,
  customLighting = false,
}: EnhancedModel3DProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  // Preload model
  useEffect(() => {
    try {
      // @ts-ignore - preload is available on the hook
      useGLTF.preload(modelPath);
    } catch {}
  }, [modelPath]);

  const getCameraSettings = () => {
    switch (quality) {
      case 'low':
        return { position: [0, 0.4, 2.5], fov: 40, near: 0.01, far: 1000 };
      case 'medium':
        return { position: [0, 0.4, 2.5], fov: 40, near: 0.01, far: 1000 };
      case 'high':
        return { position: [0, 0.4, 2.5], fov: 35, near: 0.01, far: 1000 };
      case 'ultra':
        return { position: [0, 0.4, 2.5], fov: 30, near: 0.01, far: 1000 };
      default:
        return { position: [0, 0.4, 2.5], fov: 40, near: 0.01, far: 1000 };
    }
  };

  return (
    <div className="w-full h-full" style={{ backgroundColor }}>
      <Canvas 
        dpr={quality === 'low' ? [1, 1] : quality === 'medium' ? [1, 1.5] : quality === 'high' ? [1, 2] : [1, 3]}
        camera={getCameraSettings()}
        shadows={enableShadows}
        gl={{ 
          antialias: quality === 'ultra',
          alpha: true,
          powerPreference: "high-performance"
        }}
      >
        <QualitySettings quality={quality} />
        
        <Suspense fallback={<LoadingScreen />}>
          {/* Lighting */}
          {customLighting ? <AdvancedLighting /> : (
            <>
              <ambientLight intensity={0.6} />
              <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
            </>
          )}
          
          {/* Environment */}
          <Environment preset={environment} />
          
          {/* Ground reflection */}
          {enableReflection && (
            <MeshReflectorMaterial
              blur={[300, 100]}
              resolution={2048}
              mixBlur={1}
              mixStrength={80}
              roughness={1}
              depthScale={1.2}
              minDepthThreshold={0.4}
              maxDepthThreshold={1.4}
              color="#050505"
              metalness={0.8}
            />
          )}

          {/* Center and auto-fit the model */}
          <Bounds fit observe margin={fitMargin}>
            <Center>
              <EnhancedGLTFModel 
                modelPath={modelPath} 
                scale={scale} 
                position={[position[0], position[1] - 1, position[2]]} 
                rotation={rotation}
                enableFloating={enableFloating}
                enableSparkles={enableSparkles}
                enableDistortion={enableDistortion}
                enableWobble={enableWobble}
                enableReflection={enableReflection}
                customLighting={customLighting}
              />
            </Center>
          </Bounds>

          {/* Shadows */}
          {showContactShadows && (
            <ContactShadows 
              position={[0, -0.5, 0]} 
              opacity={0.5} 
              scale={10} 
              blur={1} 
              far={10} 
              resolution={256} 
              color="#000000"
            />
          )}
          
          {showAccumulativeShadows && (
            <AccumulativeShadows
              position={[0, -0.5, 0]}
              scale={10}
              opacity={0.8}
              frames={60}
              temporal
              blend={BlendFunction.MULTIPLY}
            >
              <RandomizedLight
                amount={8}
                radius={4}
                ambient={0.5}
                intensity={1}
                position={[5, 5, -10]}
                bias={0.001}
              />
            </AccumulativeShadows>
          )}

          {/* Controls */}
          {showControls && (
            <PresentationControls
              global
              rotation={[0.13, 0.1, 0]}
              polar={[-0.4, 0.2]}
              azimuth={[-1, 0.75]}
              config={{ mass: 2, tension: 400 }}
              snap={{ mass: 4, tension: 400 }}
            >
              <OrbitControls 
                autoRotate={autoRotate} 
                autoRotateSpeed={1}
                enablePan={false}
                enableZoom
                enableRotate
                minPolarAngle={Math.PI / 4}
                maxPolarAngle={(3 * Math.PI) / 4}
                target={[0, 0, 0]}
                makeDefault
              />
            </PresentationControls>
          )}

          {/* Post-processing effects */}
          {enableBloom && (
            <EffectComposer>
              <Bloom 
                intensity={0.5} 
                luminanceThreshold={0.8} 
                luminanceSmoothing={0.9} 
              />
              <ChromaticAberration 
                blendFunction={BlendFunction.NORMAL} 
                offset={[0.0005, 0.0005]} 
              />
              <Vignette 
                offset={0.5} 
                darkness={0.5} 
                blendFunction={BlendFunction.NORMAL} 
              />
            </EffectComposer>
          )}
        </Suspense>
        
        <Preload all />
      </Canvas>
    </div>
  );
}

// Preload common models
// useGLTF.preload('/models/just_a_girl.glb'); 