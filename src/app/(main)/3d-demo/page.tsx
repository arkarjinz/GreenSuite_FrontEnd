'use client';

import Simple3DScene from '@/components/3d/Simple3DScene';
import ModelLoader from '@/components/3d/ModelLoader';
import { Box, Sphere, Cylinder } from '@react-three/drei';
import Model3D from '@/components/3d/Model3D';

export default function ThreeDDemoPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">3D Model Demo</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Simple 3D Scene */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Simple 3D Scene</h2>
            <p className="text-gray-600 mb-4">
              Basic 3D objects with lighting and controls
            </p>
            <Simple3DScene height="300px" />
          </div>

          {/* Custom 3D Scene */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Custom 3D Scene</h2>
            <p className="text-gray-600 mb-4">
              Custom 3D objects with ModelLoader
            </p>
            <ModelLoader height="300px">
              <ambientLight intensity={0.6} />
              <directionalLight position={[10, 10, 5]} intensity={1} />
              
              <Box position={[-1.5, 0, 0]} args={[1, 1, 1]}>
                <meshStandardMaterial color="#FF6B6B" />
              </Box>
              
              <Sphere position={[0, 0, 0]} args={[0.7, 32, 32]}>
                <meshStandardMaterial color="#4ECDC4" />
              </Sphere>
              
              <Cylinder position={[1.5, 0, 0]} args={[0.5, 0.5, 1.5, 32]}>
                <meshStandardMaterial color="#45B7D1" />
              </Cylinder>
            </ModelLoader>
          </div>

          {/* Your GLB Model */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Your GLB Model</h2>
            <p className="text-gray-600 mb-4">Rendering public/models/just_a_girl.glb</p>
            <div className="h-[300px]">
              <Model3D modelPath="/models/just_a_girl.glb" fitMargin={1.05} />
            </div>
          </div>
        </div>

        {/* Usage Instructions */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">How to Use 3D Models</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900">1. Install Dependencies</h3>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`npm install three @react-three/fiber @react-three/drei @types/three`}
              </pre>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900">2. Basic Usage</h3>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`import Simple3DScene from '@/components/3d/Simple3DScene';

<Simple3DScene width="100%" height="400px" />`}
              </pre>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900">3. Load Custom 3D Models</h3>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`import Model3D from '@/components/3d/Model3D';

<Model3D 
  modelPath="/models/your-model.glb"
  scale={1}
  position={[0, 0, 0]}
  autoRotate={true}
/>`}
              </pre>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900">4. Supported File Formats</h3>
              <ul className="list-disc list-inside text-gray-600 ml-4">
                <li>GLB/GLTF (recommended)</li>
                <li>OBJ</li>
                <li>FBX</li>
                <li>DAE (Collada)</li>
                <li>PLY</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Model Sources */}
        <div className="bg-white rounded-lg shadow-lg p-6 mt-8">
          <h2 className="text-2xl font-semibold mb-4">Where to Get 3D Models</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Free Resources</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li><a href="https://sketchfab.com" className="text-blue-600 hover:underline">Sketchfab</a></li>
                <li><a href="https://free3d.com" className="text-blue-600 hover:underline">Free3D</a></li>
                <li><a href="https://clara.io" className="text-blue-600 hover:underline">Clara.io</a></li>
                <li><a href="https://www.blendswap.com" className="text-blue-600 hover:underline">BlendSwap</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Paid Resources</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li><a href="https://www.turbosquid.com" className="text-blue-600 hover:underline">TurboSquid</a></li>
                <li><a href="https://www.cgtrader.com" className="text-blue-600 hover:underline">CGTrader</a></li>
                <li><a href="https://www.artstation.com" className="text-blue-600 hover:underline">ArtStation</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 