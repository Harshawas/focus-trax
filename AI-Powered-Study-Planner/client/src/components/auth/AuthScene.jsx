import React, { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, OrbitControls, Sparkles } from "@react-three/drei";

function PremiumPlanet({ dark }) {
  const groupRef = useRef();

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.22;
    groupRef.current.rotation.x =
      Math.sin(state.clock.elapsedTime * 0.18) * 0.05;
  });

  const planetColor = dark ? "#cf8c1f" : "#8c5400";
  const ringColor = dark ? "#f6d893" : "#c8911a";

  return (
    <Float speed={1.7} rotationIntensity={0.3} floatIntensity={1.3}>
      <group ref={groupRef}>
        <mesh position={[0.9, -0.1, 0]}>
          <sphereGeometry args={[1.55, 64, 64]} />
          <meshStandardMaterial
            color={planetColor}
            roughness={0.18}
            metalness={0.52}
            emissive={dark ? "#5b3300" : "#4a2800"}
            emissiveIntensity={0.38}
          />
        </mesh>

        <mesh rotation={[1.08, 0.3, -0.3]} position={[0.85, -0.08, 0.02]}>
          <torusGeometry args={[2.25, 0.09, 32, 200]} />
          <meshStandardMaterial
            color={ringColor}
            roughness={0.12}
            metalness={0.82}
            emissive={dark ? "#a96f12" : "#d3a12d"}
            emissiveIntensity={0.28}
          />
        </mesh>
      </group>
    </Float>
  );
}

function AuthScene({ dark = false }) {
  const bg = useMemo(() => (dark ? "#060b16" : "#f8f1e4"), [dark]);

  return (
    <div
      className="absolute inset-0"
      style={{ backgroundColor: bg }}
    >
      <Canvas
        dpr={[1, 2]}
        gl={{ alpha: false, antialias: true, powerPreference: "high-performance" }}
        camera={{ position: [0, 0, 5.5], fov: 40 }}
        style={{ background: bg }}
      >
        <color attach="background" args={[bg]} />
        <ambientLight intensity={1.45} />
        <directionalLight position={[3, 4, 3]} intensity={2.4} />
        <pointLight position={[-4, 0, 3]} intensity={2.5} color="#ffd27a" />
        <pointLight position={[3, 1, 2]} intensity={2.2} color="#fff2d2" />

        <PremiumPlanet dark={dark} />

        <Sparkles
          count={140}
          scale={8}
          size={3.2}
          speed={0.55}
          color={dark ? "#ffd27a" : "#c6911f"}
        />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.7}
        />
      </Canvas>
    </div>
  );
}

export default AuthScene;