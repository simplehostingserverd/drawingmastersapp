'use client';

import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

interface ThreeCanvasProps {
  width: number;
  height: number;
  className?: string;
}

// Scene setup component
const Scene: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.01;
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <mesh ref={meshRef}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="orange" />
      </mesh>
    </>
  );
};

// Drawing plane component
const DrawingPlane: React.FC = () => {
  const planeRef = useRef<THREE.Mesh>(null);
  const { camera, scene } = useThree();
  const [drawing, setDrawing] = useState(false);
  const [points, setPoints] = useState<THREE.Vector3[]>([]);
  const lineRef = useRef<THREE.Line>(null);

  useEffect(() => {
    // Create a line geometry
    if (points.length > 1) {
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({ color: 0x000000 });
      const line = new THREE.Line(geometry, material);
      scene.add(line);

      return () => {
        scene.remove(line);
        geometry.dispose();
        material.dispose();
      };
    }
  }, [points, scene]);

  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    setDrawing(true);
    
    // Get intersection point
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(e.point, camera);
    const intersects = raycaster.intersectObject(planeRef.current!);
    
    if (intersects.length > 0) {
      const point = intersects[0].point;
      setPoints([point]);
    }
  };

  const handlePointerMove = (e: any) => {
    if (!drawing) return;
    e.stopPropagation();
    
    // Get intersection point
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(e.point, camera);
    const intersects = raycaster.intersectObject(planeRef.current!);
    
    if (intersects.length > 0) {
      const point = intersects[0].point;
      setPoints(prev => [...prev, point]);
    }
  };

  const handlePointerUp = () => {
    setDrawing(false);
  };

  return (
    <mesh 
      ref={planeRef}
      rotation={[-Math.PI / 2, 0, 0]}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <planeGeometry args={[10, 10]} />
      <meshStandardMaterial color="white" side={THREE.DoubleSide} />
    </mesh>
  );
};

export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({ 
  width, 
  height,
  className
}) => {
  return (
    <div style={{ width, height }} className={className}>
      <Canvas camera={{ position: [0, 5, 5], fov: 75 }}>
        <Scene />
        <DrawingPlane />
        <OrbitControls />
      </Canvas>
    </div>
  );
};

export default ThreeCanvas;