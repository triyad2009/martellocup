import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";

/** Subtle floating 3D orbs + wireframe rings behind the hero. Purely decorative. */
function Orb({
  position,
  radius,
  speed,
  color,
}: {
  position: [number, number, number];
  radius: number;
  speed: number;
  color: string;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const t0 = useMemo(() => Math.random() * 10, []);

  useFrame((state) => {
    const m = ref.current;
    if (!m) return;
    const t = state.clock.elapsedTime * speed + t0;
    m.position.y = position[1] + Math.sin(t) * 0.5;
    m.position.x = position[0] + Math.cos(t * 0.6) * 0.35;
    m.rotation.y += 0.002;
  });

  return (
    <mesh ref={ref} position={position}>
      <icosahedronGeometry args={[radius, 3]} />
      <meshStandardMaterial
        color={color}
        roughness={0.25}
        metalness={0.6}
        transparent
        opacity={0.45}
      />
    </mesh>
  );
}

function Ring({ position, scale }: { position: [number, number, number]; scale: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    if (ref.current) {
      ref.current.rotation.x += dt * 0.12;
      ref.current.rotation.y += dt * 0.18;
    }
  });
  return (
    <mesh ref={ref} position={position} scale={scale}>
      <torusGeometry args={[1.6, 0.03, 12, 90]} />
      <meshStandardMaterial color="#ffffff" transparent opacity={0.2} roughness={0.4} />
    </mesh>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[6, 8, 6]} intensity={1.1} />
      <Environment>
        <Lightformer intensity={1.6} position={[0, 5, 2]} scale={[10, 10, 1]} />
        <Lightformer
          intensity={1}
          color="#9ecbff"
          position={[-6, 1, -1]}
          rotation-y={Math.PI / 2}
          scale={[20, 1, 1]}
        />
      </Environment>

      <Orb position={[-5.2, 1.2, -3]} radius={0.5} speed={0.5} color="#8fd0ff" />
      <Orb position={[5.4, -1.2, -4]} radius={0.6} speed={0.35} color="#ffffff" />
      <Orb position={[4.2, 2.2, -5]} radius={0.32} speed={0.7} color="#ffd27a" />
      <Orb position={[-4.2, -2.2, -4]} radius={0.28} speed={0.6} color="#7fb6e8" />

      <Ring position={[-5.6, -1.8, -4]} scale={0.8} />
      <Ring position={[5.2, 2.0, -5]} scale={1.0} />
    </>
  );
}

export default function Hero3D() {
  return (
    <div className="absolute inset-0 pointer-events-none opacity-60">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 7], fov: 55 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
}
