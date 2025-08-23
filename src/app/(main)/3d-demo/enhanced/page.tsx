'use client';

import { useState } from 'react';
import EnhancedModel3D from '@/components/3d/EnhancedModel3D';
import { 
  SparklesIcon, 
  SunIcon, 
  MoonIcon, 
  CubeIcon,
  CogIcon,
  EyeIcon,
  LightBulbIcon,
  StarIcon
} from '@heroicons/react/24/outline';

interface PresetConfig {
  name: string;
  icon: any;
  description: string;
  config: {
    environment: string;
    quality: string;
    enableBloom: boolean;
    enableFloating: boolean;
    enableSparkles: boolean;
    enableShadows: boolean;
    customLighting: boolean;
    backgroundColor: string;
    enableDistortion: boolean;
    enableWobble: boolean;
    enableReflection: boolean;
  };
}

const presets: PresetConfig[] = [
  {
    name: 'Default',
    icon: CubeIcon,
    description: 'Standard rendering with good performance',
    config: {
      environment: 'city',
      quality: 'medium',
      enableBloom: true,
      enableFloating: false,
      enableSparkles: false,
      enableShadows: true,
      customLighting: false,
      backgroundColor: '#f8fafc',
      enableDistortion: false,
      enableWobble: false,
      enableReflection: false,
    }
  },
  {
    name: 'Magical',
    icon: SparklesIcon,
    description: 'Sparkles and floating animation',
    config: {
      environment: 'night',
      quality: 'high',
      enableBloom: true,
      enableFloating: true,
      enableSparkles: true,
      enableShadows: true,
      customLighting: true,
      backgroundColor: '#0f172a',
      enableDistortion: false,
      enableWobble: false,
      enableReflection: false,
    }
  },
  {
    name: 'Studio',
    icon: LightBulbIcon,
    description: 'Professional studio lighting',
    config: {
      environment: 'studio',
      quality: 'high',
      enableBloom: false,
      enableFloating: false,
      enableSparkles: false,
      enableShadows: true,
      customLighting: true,
      backgroundColor: '#ffffff',
      enableDistortion: false,
      enableWobble: false,
      enableReflection: true,
    }
  },
  {
    name: 'Distorted',
    icon: EyeIcon,
    description: 'Wobble and distortion effects',
    config: {
      environment: 'sunset',
      quality: 'medium',
      enableBloom: true,
      enableFloating: false,
      enableSparkles: false,
      enableShadows: false,
      customLighting: false,
      backgroundColor: '#fef3c7',
      enableDistortion: true,
      enableWobble: true,
      enableReflection: false,
    }
  },
  {
    name: 'Ultra Quality',
    icon: StarIcon,
    description: 'Maximum quality settings',
    config: {
      environment: 'forest',
      quality: 'ultra',
      enableBloom: true,
      enableFloating: false,
      enableSparkles: false,
      enableShadows: true,
      customLighting: true,
      backgroundColor: '#ecfdf5',
      enableDistortion: false,
      enableWobble: false,
      enableReflection: true,
    }
  },
  {
    name: 'Performance',
    icon: CogIcon,
    description: 'Optimized for performance',
    config: {
      environment: 'warehouse',
      quality: 'low',
      enableBloom: false,
      enableFloating: false,
      enableSparkles: false,
      enableShadows: false,
      customLighting: false,
      backgroundColor: '#f1f5f9',
      enableDistortion: false,
      enableWobble: false,
      enableReflection: false,
    }
  }
];

export default function Enhanced3DDemoPage() {
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [customConfig, setCustomConfig] = useState(presets[0].config);

  const handlePresetChange = (index: number) => {
    setSelectedPreset(index);
    setCustomConfig(presets[index].config);
  };

  const updateConfig = (key: string, value: any) => {
    setCustomConfig(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <CubeIcon className="w-8 h-8 text-emerald-600" />
              <h1 className="text-2xl font-bold text-gray-900">Enhanced 3D Model Renderer</h1>
            </div>
            <div className="text-sm text-gray-500">
              Advanced 3D rendering with post-processing effects
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 3D Model Viewer */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {presets[selectedPreset].name} Preset
                </h2>
                <p className="text-gray-600">{presets[selectedPreset].description}</p>
              </div>
              <div className="h-[600px] relative">
                <EnhancedModel3D
                  modelPath="/models/just_a_girl.glb"
                  fitMargin={1.1}
                  autoRotate={true}
                  {...customConfig}
                />
              </div>
            </div>
          </div>

          {/* Controls Panel */}
          <div className="space-y-6">
            {/* Preset Selection */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Render Presets</h3>
              <div className="space-y-2">
                {presets.map((preset, index) => {
                  const Icon = preset.icon;
                  return (
                    <button
                      key={preset.name}
                      onClick={() => handlePresetChange(index)}
                      className={`w-full flex items-center space-x-3 p-3 rounded-xl text-left transition-all duration-200 ${
                        selectedPreset === index
                          ? 'bg-emerald-50 border-2 border-emerald-200 text-emerald-700'
                          : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <div>
                        <div className="font-medium">{preset.name}</div>
                        <div className="text-xs opacity-75">{preset.description}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Settings */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Custom Settings</h3>
              
              {/* Environment */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Environment
                </label>
                <select
                  value={customConfig.environment}
                  onChange={(e) => updateConfig('environment', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="city">City</option>
                  <option value="sunset">Sunset</option>
                  <option value="dawn">Dawn</option>
                  <option value="night">Night</option>
                  <option value="warehouse">Warehouse</option>
                  <option value="forest">Forest</option>
                  <option value="apartment">Apartment</option>
                  <option value="studio">Studio</option>
                  <option value="park">Park</option>
                  <option value="lobby">Lobby</option>
                </select>
              </div>

              {/* Quality */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quality
                </label>
                <select
                  value={customConfig.quality}
                  onChange={(e) => updateConfig('quality', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="low">Low (Performance)</option>
                  <option value="medium">Medium (Balanced)</option>
                  <option value="high">High (Quality)</option>
                  <option value="ultra">Ultra (Maximum)</option>
                </select>
              </div>

              {/* Effects Toggles */}
              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={customConfig.enableBloom}
                    onChange={(e) => updateConfig('enableBloom', e.target.checked)}
                    className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                  />
                  <span className="text-sm text-gray-700">Bloom Effect</span>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={customConfig.enableFloating}
                    onChange={(e) => updateConfig('enableFloating', e.target.checked)}
                    className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                  />
                  <span className="text-sm text-gray-700">Floating Animation</span>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={customConfig.enableSparkles}
                    onChange={(e) => updateConfig('enableSparkles', e.target.checked)}
                    className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                  />
                  <span className="text-sm text-gray-700">Sparkles</span>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={customConfig.enableShadows}
                    onChange={(e) => updateConfig('enableShadows', e.target.checked)}
                    className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                  />
                  <span className="text-sm text-gray-700">Shadows</span>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={customConfig.customLighting}
                    onChange={(e) => updateConfig('customLighting', e.target.checked)}
                    className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                  />
                  <span className="text-sm text-gray-700">Advanced Lighting</span>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={customConfig.enableDistortion}
                    onChange={(e) => updateConfig('enableDistortion', e.target.checked)}
                    className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                  />
                  <span className="text-sm text-gray-700">Distortion Effect</span>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={customConfig.enableWobble}
                    onChange={(e) => updateConfig('enableWobble', e.target.checked)}
                    className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                  />
                  <span className="text-sm text-gray-700">Wobble Effect</span>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={customConfig.enableReflection}
                    onChange={(e) => updateConfig('enableReflection', e.target.checked)}
                    className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                  />
                  <span className="text-sm text-gray-700">Ground Reflection</span>
                </label>
              </div>
            </div>

            {/* Performance Info */}
            <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-200">
              <h3 className="text-lg font-semibold text-emerald-900 mb-3">Performance Tips</h3>
              <ul className="space-y-2 text-sm text-emerald-800">
                <li>• Use "Performance" preset for mobile devices</li>
                <li>• Disable shadows and bloom for better FPS</li>
                <li>• Lower quality settings for smoother interaction</li>
                <li>• Effects like sparkles and distortion impact performance</li>
              </ul>
            </div>

            {/* Features List */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Features</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center space-x-2">
                  <SparklesIcon className="w-4 h-4 text-emerald-500" />
                  <span>Post-processing effects (Bloom, Chromatic Aberration)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <SunIcon className="w-4 h-4 text-emerald-500" />
                  <span>Multiple environment presets</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CogIcon className="w-4 h-4 text-emerald-500" />
                  <span>Quality settings (Low to Ultra)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <LightBulbIcon className="w-4 h-4 text-emerald-500" />
                  <span>Advanced lighting system</span>
                </li>
                <li className="flex items-center space-x-2">
                  <EyeIcon className="w-4 h-4 text-emerald-500" />
                  <span>Material effects (Distortion, Wobble)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <StarIcon className="w-4 h-4 text-emerald-500" />
                  <span>Contact shadows and reflections</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 