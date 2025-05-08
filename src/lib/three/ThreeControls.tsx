'use client';

import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls as ThreeOrbitControls } from 'three/examples/jsm/controls/OrbitControls';

interface ThreeControlsProps {
  camera: THREE.Camera;
  domElement: HTMLElement;
  enableZoom?: boolean;
  enableRotate?: boolean;
  enablePan?: boolean;
  zoomSpeed?: number;
  rotateSpeed?: number;
  panSpeed?: number;
  onUpdate?: () => void;
}

export const ThreeControls: React.FC<ThreeControlsProps> = ({
  camera,
  domElement,
  enableZoom = true,
  enableRotate = true,
  enablePan = true,
  zoomSpeed = 1.0,
  rotateSpeed = 1.0,
  panSpeed = 1.0,
  onUpdate,
}) => {
  const controlsRef = useRef<ThreeOrbitControls | null>(null);

  useEffect(() => {
    if (!camera || !domElement) return;

    // Initialize controls
    const controls = new ThreeOrbitControls(camera, domElement);
    
    // Configure controls
    controls.enableZoom = enableZoom;
    controls.enableRotate = enableRotate;
    controls.enablePan = enablePan;
    controls.zoomSpeed = zoomSpeed;
    controls.rotateSpeed = rotateSpeed;
    controls.panSpeed = panSpeed;
    
    // Set reasonable defaults
    controls.minDistance = 1;
    controls.maxDistance = 100;
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    
    if (onUpdate) {
      controls.addEventListener('change', onUpdate);
    }
    
    controlsRef.current = controls;
    
    return () => {
      if (onUpdate) {
        controls.removeEventListener('change', onUpdate);
      }
      controls.dispose();
    };
  }, [
    camera, 
    domElement, 
    enableZoom, 
    enableRotate, 
    enablePan, 
    zoomSpeed, 
    rotateSpeed, 
    panSpeed, 
    onUpdate
  ]);

  // Update controls when props change
  useEffect(() => {
    if (!controlsRef.current) return;
    
    controlsRef.current.enableZoom = enableZoom;
    controlsRef.current.enableRotate = enableRotate;
    controlsRef.current.enablePan = enablePan;
    controlsRef.current.zoomSpeed = zoomSpeed;
    controlsRef.current.rotateSpeed = rotateSpeed;
    controlsRef.current.panSpeed = panSpeed;
    
    controlsRef.current.update();
  }, [enableZoom, enableRotate, enablePan, zoomSpeed, rotateSpeed, panSpeed]);

  return null; // This is a non-visual component
};

export default ThreeControls;