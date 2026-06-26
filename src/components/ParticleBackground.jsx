import React, { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'

function Particles({ count = 80 }) {
  const mesh = useRef()
  const particles = useMemo(() => {
    const temp = []
    for (let i = 0; i < count; i++) {
      temp.push({
        position: [(Math.random() - 0.5) * 20, (Math.random() - 0.5) * 12, (Math.random() - 0.5) * 10 - 5],
        size: Math.random() * 0.04 + 0.02,
        color: Math.random() > 0.5 ? '#6C63FF' : '#00E5FF',
        speed: Math.random() * 0.2 + 0.05
      })
    }
    return temp
  }, [count])

  useFrame(({ clock }) => {
    if (mesh.current) {
      const positions = mesh.current.geometry.attributes.position.array
      for (let i = 0; i < count; i++) {
        positions[i * 3 + 1] += Math.sin(clock.elapsedTime * particles[i].speed + i) * 0.001
        positions[i * 3] += Math.cos(clock.elapsedTime * particles[i].speed * 0.5 + i) * 0.0005
      }
      mesh.current.geometry.attributes.position.needsUpdate = true
    }
  })

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.length}
          array={new Float32Array(particles.flatMap(p => p.position))}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#6C63FF" transparent opacity={0.4} sizeAttenuation />
    </points>
  )
}

function NeuralLines() {
  const lines = useMemo(() => {
    const temp = []
    for (let i = 0; i < 12; i++) {
      temp.push({
        points: [
          [(Math.random() - 0.5) * 15, (Math.random() - 0.5) * 8, -3],
          [(Math.random() - 0.5) * 15, (Math.random() - 0.5) * 8, -3]
        ]
      })
    }
    return temp
  }, [])

  return (
    <>
      {lines.map((line, i) => (
        <line key={i}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array([...line.points[0], ...line.points[1]])}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#6C63FF" transparent opacity={0.08} />
        </line>
      ))}
    </>
  )
}

export default function ParticleBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <Canvas camera={{ position: [0, 0, 6], fov: 60 }} dpr={[1, 1.5]} gl={{ alpha: true, antialias: false }}>
        <Particles count={100} />
        <NeuralLines />
        <Float speed={0.5} rotationIntensity={0.1} floatIntensity={0.2}>
          <mesh position={[4, 2, -4]}>
            <icosahedronGeometry args={[0.15, 0]} />
            <meshBasicMaterial color="#6C63FF" transparent opacity={0.15} wireframe />
          </mesh>
          <mesh position={[-3, -2, -5]}>
            <octahedronGeometry args={[0.12, 0]} />
            <meshBasicMaterial color="#00E5FF" transparent opacity={0.1} wireframe />
          </mesh>
        </Float>
      </Canvas>
    </div>
  )
}
