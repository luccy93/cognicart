import React from 'react'
import { Canvas } from '@react-three/fiber'
import { Float, OrbitControls, MeshDistortMaterial } from '@react-three/drei'
import { motion } from 'framer-motion'
import { user } from '../data/mock'

function Hologram() {
  return (
    <Float rotationIntensity={0.6} floatIntensity={1.2} speed={2}>
      <mesh>
        <torusKnotGeometry args={[1.1, 0.35, 128, 32]} />
        <MeshDistortMaterial
          color="#6C63FF"
          emissive="#00E5FF"
          emissiveIntensity={0.3}
          metalness={0.4}
          roughness={0.15}
          transparent
          opacity={0.85}
          distort={0.15}
          speed={1.5}
        />
      </mesh>
      <mesh scale={[1.8, 1.8, 1.8]}>
        <icosahedronGeometry args={[0.5, 1]} />
        <meshBasicMaterial color="#6C63FF" wireframe transparent opacity={0.08} />
      </mesh>
    </Float>
  )
}

function FloatingOrbit() {
  return (
    <>
      {[[2.5, 1], [-2, -1.5], [1.8, -2], [-2.8, 1.8]].map((pos, i) => (
        <Float key={i} speed={1 + i * 0.3} rotationIntensity={0.3} floatIntensity={0.5}>
          <mesh position={[pos[0], pos[1], -1]}>
            <boxGeometry args={[0.08, 0.08, 0.08]} />
            <meshBasicMaterial color={i % 2 === 0 ? '#6C63FF' : '#00E5FF'} transparent opacity={0.3} />
          </mesh>
        </Float>
      ))}
    </>
  )
}

export default function Hero() {
  return (
    <section className="pt-24 pb-4 relative">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="lg:col-span-5 space-y-6"
        >
          <div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-2 mb-2"
            >
              <span className="text-sm text-[--secondary] font-medium">Welcome Back, {user.name}</span>
              <span className="text-lg">👋</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[--primary]/15 text-[--primary] border border-[--primary]/20">
                {user.level}
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-4xl md:text-5xl font-extrabold leading-tight bg-gradient-to-r from-white to-[--muted] bg-clip-text text-transparent"
            >
              Your AI Shopping<br />Universe Awaits
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-[--muted] mt-3 max-w-md text-sm leading-relaxed"
            >
              CogniCart AI analyzed your interests and curated <span className="text-white font-medium">12 personalized recommendations</span> for you.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex gap-3"
          >
            <motion.button
              whileHover={{ scale: 1.03, boxShadow: '0 0 30px rgba(108,99,255,0.3)' }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-[--highlight] to-[#ff8a58] text-black font-semibold text-sm shadow-lg"
            >
              Explore Recommendations
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="btn-magnetic px-6 py-3 rounded-lg border border-white/10 text-white glass text-sm"
            >
              Discover New Products
            </motion.button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex items-center gap-4"
          >
            <div className="glass px-4 py-2.5 rounded-lg flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[--primary] to-[--secondary] flex items-center justify-center text-sm">★</div>
              <div>
                <div className="text-[11px] text-[--muted]">AI Confidence Score</div>
                <div className="font-bold text-white">97.2%</div>
              </div>
            </div>

            <div className="glass px-4 py-2.5 rounded-lg">
              <div className="text-[11px] text-[--muted]">Loyalty Points</div>
              <div className="font-bold text-white flex items-center gap-1">
                ⭐ {user.loyaltyPoints.toLocaleString()}
                <span className="text-[10px] text-[--muted] font-normal">{user.tier}</span>
              </div>
            </div>

            <div className="glass px-4 py-2.5 rounded-lg">
              <div className="text-[11px] text-[--muted]">Personalized</div>
              <div className="font-bold text-white">
                12 <span className="text-[10px] text-[--secondary] font-normal">new items</span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="lg:col-span-7"
        >
          <div className="glass rounded-xl h-80 md:h-96 overflow-hidden relative group">
            <Canvas camera={{ position: [0, 0, 6], fov: 50 }} dpr={[1, 1.5]}>
              <ambientLight intensity={0.4} />
              <pointLight color="#6C63FF" intensity={2} position={[5, 5, 5]} />
              <pointLight color="#00E5FF" intensity={0.8} position={[-5, -3, -5]} />
              <pointLight color="#FF6B35" intensity={0.3} position={[0, -5, 3]} />
              <FloatingOrbit />
              <Hologram />
              <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
            </Canvas>

            <div className="absolute left-4 top-4 glass px-3 py-1.5 rounded-md text-xs font-medium">AI Recommendation Engine</div>
            <div className="absolute right-4 bottom-4 glass px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[--secondary] animate-pulse" />
              Live • 97% match accuracy
            </div>
            <div className="absolute left-4 bottom-4 glass px-3 py-1.5 rounded-md text-xs text-[--muted]">
              {user.preferences.slice(0, 3).join(' • ')}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
