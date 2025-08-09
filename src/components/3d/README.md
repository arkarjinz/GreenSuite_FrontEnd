# 3D Model Implementation Guide

This guide explains how to implement 3D models in your GreenSuite Frontend project.

## Prerequisites

Before you can use 3D models, you need to install the required dependencies:

```bash
npm install three @react-three/fiber @react-three/drei @types/three
```

## Components Overview

### 1. Simple3DScene
A basic 3D scene with simple geometric shapes (cube, sphere, cylinder).

**Usage:**
```tsx
import Simple3DScene from '@/components/3d/Simple3DScene';

<Simple3DScene width="100%" height="400px" showControls={true} />
```

### 2. Model3D
Load and display custom 3D model files.

**Usage:**
```tsx
import Model3D from '@/components/3d/Model3D';

<Model3D 
  modelPath="/models/your-model.glb"
  scale={1}
  position={[0, 0, 0]}
  rotation={[0, 0, 0]}
  autoRotate={true}
  showControls={true}
/>
```

### 3. ModelLoader
A wrapper component that provides loading states and controls for 3D content.

**Usage:**
```tsx
import ModelLoader from '@/components/3d/ModelLoader';
import { Box, Sphere } from '@react-three/drei';

<ModelLoader width="100%" height="400px" showControls={true}>
  <ambientLight intensity={0.6} />
  <directionalLight position={[10, 10, 5]} intensity={1} />
  
  <Box position={[-1, 0, 0]} args={[1, 1, 1]}>
    <meshStandardMaterial color="hotpink" />
  </Box>
  
  <Sphere position={[1, 0, 0]} args={[0.5, 32, 32]}>
    <meshStandardMaterial color="lightblue" />
  </Sphere>
</ModelLoader>
```

## Supported File Formats

- **GLB/GLTF** (recommended) - Most efficient and widely supported
- **OBJ** - Simple and widely supported
- **FBX** - Autodesk format
- **DAE** - Collada format
- **PLY** - Stanford format

## File Structure

```
public/
  models/          # Place your 3D model files here
    example.glb
    character.fbx
    building.obj
```

## Best Practices

### 1. Model Optimization
- Use GLB/GLTF format when possible
- Optimize textures and reduce polygon count
- Compress textures appropriately
- Remove unnecessary materials and animations

### 2. Performance
- Use `Suspense` for loading states
- Implement level-of-detail (LOD) for complex models
- Consider using draco compression for large models
- Preload models when possible

### 3. User Experience
- Provide loading indicators
- Add fallback content for unsupported browsers
- Implement proper error handling
- Consider mobile performance

## Example Implementation

Here's a complete example of how to implement a 3D model viewer:

```tsx
'use client';

import { useState } from 'react';
import Model3D from '@/components/3d/Model3D';

export default function ModelViewer() {
  const [currentModel, setCurrentModel] = useState('/models/example.glb');
  const [scale, setScale] = useState(1);
  const [autoRotate, setAutoRotate] = useState(false);

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4">3D Model Viewer</h1>
        
        <div className="flex gap-4 mb-4">
          <button
            onClick={() => setCurrentModel('/models/example.glb')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Load Example Model
          </button>
          
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={autoRotate}
              onChange={(e) => setAutoRotate(e.target.checked)}
            />
            Auto Rotate
          </label>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Scale: {scale}
          </label>
          <input
            type="range"
            min="0.1"
            max="3"
            step="0.1"
            value={scale}
            onChange={(e) => setScale(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>
      </div>
      
      <div className="bg-gray-100 rounded-lg p-4">
        <Model3D
          modelPath={currentModel}
          scale={scale}
          autoRotate={autoRotate}
          showControls={true}
        />
      </div>
    </div>
  );
}
```

## Troubleshooting

### Common Issues

1. **Model not loading**
   - Check file path is correct
   - Ensure file format is supported
   - Verify file is in the `public/models/` directory

2. **Performance issues**
   - Optimize model file size
   - Reduce polygon count
   - Use compressed textures

3. **Lighting problems**
   - Add ambient light for basic illumination
   - Use directional light for shadows
   - Consider environment maps for realistic lighting

4. **Controls not working**
   - Ensure `showControls={true}` is set
   - Check for conflicting event handlers
   - Verify OrbitControls is properly imported

## Resources

- [Three.js Documentation](https://threejs.org/docs/)
- [React Three Fiber Documentation](https://docs.pmnd.rs/react-three-fiber/)
- [React Three Drei Documentation](https://github.com/pmndrs/drei)
- [GLTF Tools](https://gltf.pmnd.rs/)

## Demo

Visit `/3d-demo` to see working examples of all components. 