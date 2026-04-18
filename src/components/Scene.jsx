import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Grid, Sparkles, Html } from '@react-three/drei';
import * as THREE from 'three';

// ============================================================
// Different stadium shapes based on sport type
// ============================================================
const CricketStadium = ({ activeTab }) => {
  const groupRef = useRef();
  useFrame((s, d) => { if (groupRef.current) groupRef.current.rotation.y += d * 0.05; });
  
  return (
    <group ref={groupRef}>
      {/* Circular ground - cricket is played on an oval */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
        <circleGeometry args={[20, 64]} />
        <meshStandardMaterial color="#0a2f1a" metalness={0.3} roughness={0.8} />
      </mesh>
      {/* Pitch strip in center */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.15, 0]}>
        <planeGeometry args={[2.5, 12]} />
        <meshStandardMaterial color="#3d2b1f" />
      </mesh>
      {/* Circular seating tiers */}
      {[0, 1, 2].map(i => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, i * 3 + 2, 0]}>
          <torusGeometry args={[22 + i * 6, 3, 16, 80]} />
          <meshStandardMaterial color="#0a0a1a" metalness={0.7} roughness={0.3} wireframe={activeTab === 'layout'} transparent opacity={activeTab === 'layout' ? 0.4 : 0.7} side={THREE.DoubleSide} />
        </mesh>
      ))}
      {activeTab === 'heat' && (
        <group>
          <mesh position={[18, 1, 0]}><sphereGeometry args={[6, 32, 32]} /><meshBasicMaterial color="#ff2a2a" transparent opacity={0.5} /></mesh>
          <Sparkles position={[18, 2, 0]} count={80} scale={12} size={5} speed={2} color="#ff2a2a" />
          <Html center position={[18, 8, 0]}><div className="scene-label danger">Main Gate: High Crowd</div></Html>
          <mesh position={[-14, 1, -14]}><sphereGeometry args={[5, 32, 32]} /><meshBasicMaterial color="#ffb800" transparent opacity={0.4} /></mesh>
          <Sparkles position={[-14, 2, -14]} count={40} scale={8} size={3} speed={1} color="#ffb800" />
          <Html center position={[-14, 7, -14]}><div className="scene-label warning">Food Court: Moderate</div></Html>
          <mesh position={[0, 1, -20]}><sphereGeometry args={[4, 32, 32]} /><meshBasicMaterial color="#00ff88" transparent opacity={0.35} /></mesh>
        </group>
      )}
      {activeTab === 'layout' && (
        <group>
          <mesh position={[22, 4, 0]}><boxGeometry args={[3, 8, 3]} /><meshStandardMaterial color="#00f0ff" emissive="#00f0ff" emissiveIntensity={0.5} /></mesh>
          <Html center position={[22, 9, 0]}><div className="scene-label">Gate A</div></Html>
          <mesh position={[-22, 4, 0]}><boxGeometry args={[3, 8, 3]} /><meshStandardMaterial color="#00f0ff" emissive="#00f0ff" emissiveIntensity={0.5} /></mesh>
          <Html center position={[-22, 9, 0]}><div className="scene-label">Gate B</div></Html>
          <mesh position={[0, 4, 22]}><boxGeometry args={[3, 8, 3]} /><meshStandardMaterial color="#00f0ff" emissive="#00f0ff" emissiveIntensity={0.5} /></mesh>
          <Html center position={[0, 9, 22]}><div className="scene-label">Gate C</div></Html>
        </group>
      )}
    </group>
  );
};

const FootballStadium = ({ activeTab }) => {
  const groupRef = useRef();
  useFrame((s, d) => { if (groupRef.current) groupRef.current.rotation.y += d * 0.05; });
  
  return (
    <group ref={groupRef}>
      {/* Rectangular pitch */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
        <planeGeometry args={[35, 55]} />
        <meshStandardMaterial color="#0a2f1a" metalness={0.3} roughness={0.8} />
      </mesh>
      {/* Pitch lines */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.15, 0]}>
        <ringGeometry args={[5, 5.2, 32]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.3} />
      </mesh>
      {/* Rectangular seating stands */}
      {[-1, 1].map(side => (
        <mesh key={`long-${side}`} position={[side * 20, 5, 0]}>
          <boxGeometry args={[4, 10, 50]} />
          <meshStandardMaterial color="#0a0a1a" metalness={0.7} roughness={0.3} wireframe={activeTab === 'layout'} transparent opacity={activeTab === 'layout' ? 0.4 : 0.7} />
        </mesh>
      ))}
      {[-1, 1].map(side => (
        <mesh key={`short-${side}`} position={[0, 5, side * 30]}>
          <boxGeometry args={[38, 10, 4]} />
          <meshStandardMaterial color="#0a0a1a" metalness={0.7} roughness={0.3} wireframe={activeTab === 'layout'} transparent opacity={activeTab === 'layout' ? 0.4 : 0.7} />
        </mesh>
      ))}
      {activeTab === 'heat' && (
        <group>
          <mesh position={[22, 1, 20]}><sphereGeometry args={[7, 32, 32]} /><meshBasicMaterial color="#ff2a2a" transparent opacity={0.5} /></mesh>
          <Sparkles position={[22, 2, 20]} count={80} scale={12} size={5} speed={2} color="#ff2a2a" />
          <Html center position={[22, 9, 20]}><div className="scene-label danger">East Stand: Packed</div></Html>
          <mesh position={[-20, 1, -10]}><sphereGeometry args={[5, 32, 32]} /><meshBasicMaterial color="#ffb800" transparent opacity={0.4} /></mesh>
          <Sparkles position={[-20, 2, -10]} count={40} scale={8} size={3} speed={1} color="#ffb800" />
        </group>
      )}
      {activeTab === 'layout' && (
        <group>
          {[[25, 0, 25], [-25, 0, 25], [25, 0, -25], [-25, 0, -25]].map((p, i) => (
            <group key={i}>
              <mesh position={[p[0], 4, p[2]]}><boxGeometry args={[3, 8, 3]} /><meshStandardMaterial color="#00f0ff" emissive="#00f0ff" emissiveIntensity={0.5} /></mesh>
              <Html center position={[p[0], 9, p[2]]}><div className="scene-label">Gate {String.fromCharCode(65 + i)}</div></Html>
            </group>
          ))}
        </group>
      )}
    </group>
  );
};

const GenericStadium = ({ activeTab }) => {
  const groupRef = useRef();
  useFrame((s, d) => { if (groupRef.current) groupRef.current.rotation.y += d * 0.05; });
  
  return (
    <group ref={groupRef}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
        <planeGeometry args={[30, 40]} />
        <meshStandardMaterial color="#051520" metalness={0.5} roughness={0.8} />
      </mesh>
      {[0, 1, 2].map(i => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, i * 3 + 2, 0]}>
          <torusGeometry args={[25 + i * 7, 3, 16, 60]} />
          <meshStandardMaterial color="#0a0a1a" metalness={0.7} roughness={0.3} wireframe={activeTab === 'layout'} transparent opacity={activeTab === 'layout' ? 0.4 : 0.7} side={THREE.DoubleSide} />
        </mesh>
      ))}
      {activeTab === 'heat' && (
        <group>
          <mesh position={[25, 1, 15]}><sphereGeometry args={[6, 32, 32]} /><meshBasicMaterial color="#ff2a2a" transparent opacity={0.5} /></mesh>
          <Sparkles position={[25, 2, 15]} count={60} scale={10} size={4} speed={2} color="#ff2a2a" />
        </group>
      )}
    </group>
  );
};

const Scene = ({ activeTab, sportType }) => {
  const sport = (sportType || '').toLowerCase();
  
  const StadiumComponent = sport.includes('cricket') ? CricketStadium
    : (sport.includes('soccer') || sport.includes('football')) ? FootballStadium
    : GenericStadium;

  return (
    <Canvas camera={{ position: [0, 25, 60], fov: 60 }} gl={{ antialias: true, alpha: true }}>
      <color attach="background" args={['#050505']} />
      <ambientLight intensity={0.2} />
      <directionalLight position={[10, 30, 20]} intensity={1} color="#ffffff" />
      <spotLight position={[-10, 50, 10]} intensity={2} color="#00f0ff" penumbra={1} angle={0.5} />
      <spotLight position={[20, 40, -20]} intensity={2} color="#8a2be2" penumbra={1} angle={0.5} />
      <Grid infiniteGrid fadeDistance={100} sectionColor="#00f0ff" cellColor="#050505" sectionSize={20} cellSize={5} position={[0, -0.1, 0]} />
      <StadiumComponent activeTab={activeTab} />
      <OrbitControls enablePan={false} enableZoom maxPolarAngle={Math.PI / 2 - 0.1} minDistance={20} maxDistance={120} autoRotate={activeTab === 'layout'} autoRotateSpeed={1.0} makeDefault />
      <Environment preset="city" />
    </Canvas>
  );
};

export default Scene;
