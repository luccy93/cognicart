'use client';

import { Component, ErrorInfo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Float, MeshDistortMaterial } from '@react-three/drei';

function ThreeScene() {
  return (
    <Canvas camera={{ position: [0, 0, 6], fov: 50 }} dpr={[1, 2]}>
      <ambientLight intensity={0.4} />
      <pointLight color="#6C63FF" intensity={2} position={[5, 5, 5]} />
      <pointLight color="#00E5FF" intensity={0.8} position={[-5, -3, -5]} />
      <Float rotationIntensity={0.6} floatIntensity={1.2} speed={2}>
        <mesh>
          <torusKnotGeometry args={[1.2, 0.4, 128, 32]} />
          <MeshDistortMaterial
            color="#6C63FF"
            emissive="#00E5FF"
            emissiveIntensity={0.4}
            metalness={0.5}
            roughness={0.1}
            transparent
            opacity={0.9}
            distort={0.2}
            speed={2}
          />
        </mesh>
      </Float>
    </Canvas>
  );
}

function Fallback() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="text-center">
        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-[--primary]/20 to-[--secondary]/20 flex items-center justify-center mb-3">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="url(#g)" strokeWidth="1.5">
            <defs>
              <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6C63FF" />
                <stop offset="100%" stopColor="#00E5FF" />
              </linearGradient>
            </defs>
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </div>
        <p className="text-xs text-[--muted]">3D visualization</p>
      </div>
    </div>
  );
}

interface ThreeHeroState {
  hasError: boolean;
}

export default class ThreeHero extends Component<Record<string, never>, ThreeHeroState> {
  state: ThreeHeroState = { hasError: false };
  componentDidCatch(_error: Error, _errorInfo: ErrorInfo) {
    this.setState({ hasError: true });
  }
  render() {
    if (this.state.hasError) return <Fallback />;
    return <ThreeScene />;
  }
}
