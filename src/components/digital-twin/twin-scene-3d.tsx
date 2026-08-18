"use client";

/**
 * 3D digital twin — Twin Cities desk hub; talent across MSP waiting for clients.
 * Cursor: left-drag orbit · right-drag pan · scroll zoom · click to select.
 */

import { useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  ContactShadows,
  Text,
  PerspectiveCamera,
} from "@react-three/drei";
import * as THREE from "three";
import type { Candidate } from "@/lib/fitscore";
import type { JobReq } from "@/lib/fitscore";

export type TwinPick =
  | { kind: "home" }
  | { kind: "person"; id: string }
  | { kind: "client"; id: string };

/** Map MSP-ish metro into world XZ (Lakeville home at origin-ish south). */
const CITY_ANCHORS: Record<string, [number, number]> = {
  Lakeville: [0, 4],
  Minneapolis: [-1, -8],
  "St Paul": [5, -6],
  "St. Paul": [5, -6],
  Bloomington: [-3, -3],
  Edina: [-4, -5],
  "Maple Grove": [-7, -9],
  Plymouth: [-6, -7],
  Burnsville: [1, 1],
  Eagan: [4, -1],
  "Woodbury": [8, -4],
  "St Louis Park": [-3, -6],
  Fargo: [16, -2],
  Rochester: [10, 8],
  Duluth: [4, -16],
  "Sioux Falls": [14, 10],
};

function cityFromLocation(loc: string): string {
  const city = loc.split(",")[0]?.trim() ?? "Minneapolis";
  return city;
}

function posForCity(city: string, salt: number): [number, number, number] {
  const base = CITY_ANCHORS[city] ?? CITY_ANCHORS.Minneapolis;
  // scatter so people don't stack
  const jx = Math.sin(salt * 12.9898) * 1.6;
  const jz = Math.cos(salt * 78.233) * 1.6;
  return [base[0] + jx, 0, base[1] + jz];
}

function industryColor(industry: string): string {
  switch (industry) {
    case "construction":
      return "#e85d2a";
    case "engineering":
      return "#3d8ec4";
    case "architecture":
      return "#8b9bb0";
    case "accounting":
      return "#5baf8a";
    default:
      return "#5b9fd4";
  }
}

function Ground() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <circleGeometry args={[32, 72]} />
        <meshStandardMaterial color="#0a0e14" roughness={0.96} metalness={0.04} />
      </mesh>
      {/* Soft MSP metro ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[1, 0.02, -5]} receiveShadow>
        <ringGeometry args={[3, 11, 64]} />
        <meshStandardMaterial
          color="#121a24"
          transparent
          opacity={0.55}
          roughness={0.9}
          side={THREE.DoubleSide}
        />
      </mesh>
      <gridHelper args={[56, 56, "#152030", "#0e141c"]} position={[0, 0.03, 0]} />
      {/* Label bands */}
      <Text position={[0, 0.08, 6]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.45} color="#2a5f85">
        LAKEVILLE
      </Text>
      <Text position={[-1, 0.08, -9]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.4} color="#2a5f85">
        MINNEAPOLIS
      </Text>
      <Text position={[5.5, 0.08, -7]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.35} color="#2a5f85">
        ST PAUL
      </Text>
    </group>
  );
}

/** Desk hub of the twin */
function CjHouse({
  selected,
  onPick,
}: {
  selected: boolean;
  onPick: (p: TwinPick) => void;
}) {
  const light = useRef<THREE.PointLight>(null);
  useFrame(({ clock }) => {
    if (light.current) {
      light.current.intensity = 0.9 + Math.sin(clock.elapsedTime * 2) * 0.2;
    }
  });

  return (
    <group
      position={[0, 0, 4.2]}
      onClick={(e) => {
        e.stopPropagation();
        onPick({ kind: "home" });
      }}
      onPointerOver={() => {
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "default";
      }}
    >
      {/* Lot */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]} receiveShadow>
        <planeGeometry args={[5.5, 4.2]} />
        <meshStandardMaterial
          color="#152018"
          roughness={0.95}
          emissive={selected ? "#1a4030" : "#000"}
          emissiveIntensity={selected ? 0.3 : 0}
        />
      </mesh>
      {/* Driveway */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[1.4, 0.05, 1.2]} receiveShadow>
        <planeGeometry args={[1.2, 2.2]} />
        <meshStandardMaterial color="#1a1e24" roughness={0.9} />
      </mesh>
      {/* Main house body */}
      <mesh castShadow position={[0, 0.75, 0]}>
        <boxGeometry args={[2.8, 1.5, 2.2]} />
        <meshStandardMaterial
          color="#2a3544"
          roughness={0.7}
          metalness={0.15}
          emissive={selected ? "#3d8ec4" : "#000"}
          emissiveIntensity={selected ? 0.12 : 0}
        />
      </mesh>
      {/* Roof */}
      <mesh castShadow position={[0, 1.7, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[2.1, 0.9, 4]} />
        <meshStandardMaterial color="#1a222d" roughness={0.55} metalness={0.25} />
      </mesh>
      {/* Garage */}
      <mesh castShadow position={[2.0, 0.55, 0.3]}>
        <boxGeometry args={[1.4, 1.1, 1.6]} />
        <meshStandardMaterial color="#243040" roughness={0.75} />
      </mesh>
      {/* Front door glow — HQ */}
      <mesh position={[0, 0.55, 1.12]}>
        <boxGeometry args={[0.45, 0.85, 0.08]} />
        <meshStandardMaterial
          color="#e85d2a"
          emissive="#e85d2a"
          emissiveIntensity={0.5}
          toneMapped={false}
        />
      </mesh>
      {/* Window lights */}
      <mesh position={[-0.7, 0.9, 1.12]}>
        <boxGeometry args={[0.4, 0.35, 0.06]} />
        <meshStandardMaterial
          color="#d4a574"
          emissive="#d4a574"
          emissiveIntensity={0.8}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[0.7, 0.9, 1.12]}>
        <boxGeometry args={[0.4, 0.35, 0.06]} />
        <meshStandardMaterial
          color="#d4a574"
          emissive="#d4a574"
          emissiveIntensity={0.8}
          toneMapped={false}
        />
      </mesh>
      <pointLight
        ref={light}
        position={[0, 2.2, 1.5]}
        color="#d4a574"
        distance={8}
        decay={2}
      />
      {/* Desk figure on porch */}
      <PersonFigure
        position={[0.15, 0, 1.55]}
        color="#5b9fd4"
        label="HQ"
        scale={1.05}
        idle
      />
      <Text position={[0, 2.55, 0]} fontSize={0.28} color="#e8f0f6" anchorX="center">
        DESK · HQ
      </Text>
      <Text position={[0, 2.25, 0]} fontSize={0.16} color="#8aa0b4" anchorX="center">
        Twin Cities
      </Text>
    </group>
  );
}

function PersonFigure({
  position,
  color,
  label,
  scale = 1,
  idle,
  selected,
  onClick,
}: {
  position: [number, number, number];
  color: string;
  label: string;
  scale?: number;
  idle?: boolean;
  selected?: boolean;
  onClick?: () => void;
}) {
  const g = useRef<THREE.Group>(null);
  const phase = useMemo(() => Math.random() * Math.PI * 2, []);

  useFrame(({ clock }) => {
    if (!g.current) return;
    // Gentle “waiting” bob
    const t = clock.elapsedTime;
    g.current.position.y = position[1] + Math.sin(t * 1.8 + phase) * 0.04;
    if (!idle) {
      g.current.rotation.y = Math.sin(t * 0.4 + phase) * 0.15;
    }
  });

  return (
    <group
      ref={g}
      position={position}
      scale={scale}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "default";
      }}
    >
      {/* Body */}
      <mesh castShadow position={[0, 0.55, 0]}>
        <capsuleGeometry args={[0.14, 0.35, 6, 12]} />
        <meshStandardMaterial
          color={color}
          roughness={0.55}
          metalness={0.15}
          emissive={selected ? color : "#000"}
          emissiveIntensity={selected ? 0.35 : 0.08}
        />
      </mesh>
      {/* Head */}
      <mesh castShadow position={[0, 0.95, 0]}>
        <sphereGeometry args={[0.16, 16, 16]} />
        <meshStandardMaterial color="#c4b5a0" roughness={0.7} />
      </mesh>
      {/* Waiting ring on ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <ringGeometry args={[0.22, 0.32, 24]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={selected ? 0.55 : 0.28}
          side={THREE.DoubleSide}
        />
      </mesh>
      <Text
        position={[0, 1.25, 0]}
        fontSize={0.14}
        color="#dce6ee"
        anchorX="center"
        outlineWidth={0.008}
        outlineColor="#000"
      >
        {label.length > 14 ? `${label.slice(0, 12)}…` : label}
      </Text>
    </group>
  );
}

function ClientBuilding({
  job,
  position,
  selected,
  onPick,
}: {
  job: JobReq;
  position: [number, number, number];
  selected: boolean;
  onPick: (p: TwinPick) => void;
}) {
  const color = industryColor(job.industry);
  return (
    <group
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        onPick({ kind: "client", id: job.id });
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "default";
      }}
    >
      <mesh castShadow position={[0, 0.9, 0]}>
        <boxGeometry args={[1.4, 1.8, 1.2]} />
        <meshStandardMaterial
          color="#1a2430"
          roughness={0.6}
          metalness={0.2}
          emissive={color}
          emissiveIntensity={selected ? 0.3 : 0.1}
        />
      </mesh>
      <mesh position={[0.72, 1.0, 0]}>
        <boxGeometry args={[0.06, 0.9, 0.5]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.7}
          toneMapped={false}
        />
      </mesh>
      <Text position={[0, 2.05, 0]} fontSize={0.16} color="#a8bcc8" anchorX="center">
        {job.company.length > 18 ? `${job.company.slice(0, 16)}…` : job.company}
      </Text>
      <Text position={[0, 2.28, 0]} fontSize={0.13} color={color} anchorX="center">
        NEEDS TALENT
      </Text>
    </group>
  );
}

/** Soft link from person → home (waiting for the desk / clients) */
function WaitingLink({
  from,
  to,
  color,
}: {
  from: [number, number, number];
  to: [number, number, number];
  color: string;
}) {
  const geom = useMemo(() => {
    const a = new THREE.Vector3(...from);
    const b = new THREE.Vector3(...to);
    const mid = a.clone().lerp(b, 0.5);
    mid.y += 1.2 + a.distanceTo(b) * 0.08;
    const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
    return new THREE.TubeGeometry(curve, 20, 0.02, 6, false);
  }, [from, to]);

  return (
    <mesh geometry={geom}>
      <meshBasicMaterial color={color} transparent opacity={0.22} />
    </mesh>
  );
}

function SceneContent({
  people,
  jobs,
  selected,
  onPick,
}: {
  people: Candidate[];
  jobs: JobReq[];
  selected: TwinPick | null;
  onPick: (p: TwinPick) => void;
}) {
  const peoplePlaced = useMemo(() => {
    return people.map((p, i) => {
      const city = cityFromLocation(p.location);
      const pos = posForCity(city, i + 1);
      return { person: p, pos, color: industryColor(p.industry) };
    });
  }, [people]);

  const clientsPlaced = useMemo(() => {
    return jobs
      .filter((j) => !j.status || j.status === "open")
      .map((j, i) => {
        const city = cityFromLocation(j.location);
        // clients slightly offset from talent clusters
        const [x, , z] = posForCity(city, i + 40);
        return {
          job: j,
          pos: [x + 1.8, 0, z - 1.2] as [number, number, number],
        };
      });
  }, [jobs]);

  const homePos: [number, number, number] = [0, 0.2, 4.2];

  return (
    <>
      <PerspectiveCamera makeDefault position={[8, 14, 16]} fov={40} />
      <color attach="background" args={["#06090e"]} />
      <fog attach="fog" args={["#06090e", 30, 58]} />
      <ambientLight intensity={0.38} />
      <directionalLight
        castShadow
        position={[10, 20, 8]}
        intensity={1.05}
        shadow-mapSize={[1024, 1024]}
      />
      <hemisphereLight args={["#3d5a80", "#0a0e14", 0.4]} />
      <pointLight position={[0, 5, 5]} intensity={0.35} color="#d4a574" />

      <Ground />
      <CjHouse selected={selected?.kind === "home"} onPick={onPick} />

      {/* Waiting arcs home ← people */}
      {peoplePlaced.map(({ person, pos, color }) => (
        <WaitingLink
          key={`link-${person.id}`}
          from={[pos[0], 0.3, pos[2]]}
          to={homePos}
          color={color}
        />
      ))}

      {peoplePlaced.map(({ person, pos, color }) => (
        <PersonFigure
          key={person.id}
          position={pos}
          color={color}
          label={person.name.split(" ")[0] ?? person.name}
          selected={selected?.kind === "person" && selected.id === person.id}
          onClick={() => onPick({ kind: "person", id: person.id })}
        />
      ))}

      {clientsPlaced.map(({ job, pos }) => (
        <ClientBuilding
          key={job.id}
          job={job}
          position={pos}
          selected={selected?.kind === "client" && selected.id === job.id}
          onPick={onPick}
        />
      ))}

      <ContactShadows
        position={[0, 0.02, 0]}
        opacity={0.4}
        scale={48}
        blur={2.8}
        far={24}
      />

      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.08}
        minDistance={5}
        maxDistance={42}
        maxPolarAngle={Math.PI / 2.08}
        target={[1, 0.4, -1]}
        mouseButtons={{
          LEFT: THREE.MOUSE.ROTATE,
          MIDDLE: THREE.MOUSE.DOLLY,
          RIGHT: THREE.MOUSE.PAN,
        }}
      />
    </>
  );
}

export interface TwinScene3DProps {
  people: Candidate[];
  jobs: JobReq[];
  selected: TwinPick | null;
  onPick: (p: TwinPick) => void;
}

export function TwinScene3D({ people, jobs, selected, onPick }: TwinScene3DProps) {
  return (
    <div className="relative h-[min(72vh,580px)] w-full min-h-[340px] touch-none">
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: false }}
        onPointerMissed={() => onPick({ kind: "home" })}
      >
        <SceneContent
          people={people}
          jobs={jobs}
          selected={selected}
          onPick={onPick}
        />
      </Canvas>
      <div className="pointer-events-none absolute bottom-3 left-3 rounded border border-[#1e4a6a]/70 bg-[rgba(6,12,20,0.9)] px-3 py-2 font-mono text-[10px] leading-relaxed text-[#8aa0b4] sm:text-[11px]">
        <p className="text-[#e85d2a]">HQ · TWIN CITIES</p>
        <p className="text-[#3d8ec4]">Talent across MSP · waiting</p>
        <p className="mt-1">Left-drag · orbit</p>
        <p>Scroll · zoom · click people / clients</p>
      </div>
    </div>
  );
}
