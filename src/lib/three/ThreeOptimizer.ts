'use client';

import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader';
import Stats from 'three/examples/jsm/libs/stats.module';

// Performance levels
export enum PerformanceLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  ULTRA = 'ultra',
}

// Optimizer options
interface ThreeOptimizerOptions {
  enableStats?: boolean;
  targetFPS?: number;
  adaptiveResolution?: boolean;
  performanceLevel?: PerformanceLevel;
  enableFXAA?: boolean;
  enableOcclusionCulling?: boolean;
  enableLevelOfDetail?: boolean;
}

// Default options
const defaultOptions: ThreeOptimizerOptions = {
  enableStats: false,
  targetFPS: 60,
  adaptiveResolution: true,
  performanceLevel: PerformanceLevel.MEDIUM,
  enableFXAA: true,
  enableOcclusionCulling: true,
  enableLevelOfDetail: true,
};

// Three.js Optimizer
export class ThreeOptimizer {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.Camera;
  private options: ThreeOptimizerOptions;
  private stats: Stats | null = null;
  private composer: EffectComposer | null = null;
  private renderPass: RenderPass | null = null;
  private fxaaPass: ShaderPass | null = null;
  private clock: THREE.Clock = new THREE.Clock();
  private frameCount: number = 0;
  private lastFPSUpdate: number = 0;
  private currentFPS: number = 0;
  private resolutionScale: number = 1.0;
  private frustum: THREE.Frustum = new THREE.Frustum();
  private projScreenMatrix: THREE.Matrix4 = new THREE.Matrix4();
  private lodObjects: Map<THREE.Object3D, { distances: number[], meshes: THREE.Mesh[] }> = new Map();

  constructor(
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    camera: THREE.Camera,
    options: ThreeOptimizerOptions = {}
  ) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    this.options = { ...defaultOptions, ...options };

    this.init();
  }

  // Initialize optimizer
  private init(): void {
    // Initialize stats if enabled
    if (this.options.enableStats) {
      this.stats = Stats();
      document.body.appendChild(this.stats.dom);
    }

    // Initialize post-processing
    if (this.options.enableFXAA) {
      this.setupPostProcessing();
    }

    // Apply performance level settings
    this.applyPerformanceLevel();
  }

  // Set up post-processing
  private setupPostProcessing(): void {
    // Create composer
    this.composer = new EffectComposer(this.renderer);

    // Create render pass
    this.renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(this.renderPass);

    // Create FXAA pass
    if (this.options.enableFXAA) {
      this.fxaaPass = new ShaderPass(FXAAShader);
      const pixelRatio = this.renderer.getPixelRatio();
      this.fxaaPass.material.uniforms['resolution'].value.x = 1 / (window.innerWidth * pixelRatio);
      this.fxaaPass.material.uniforms['resolution'].value.y = 1 / (window.innerHeight * pixelRatio);
      this.composer.addPass(this.fxaaPass);
    }
  }

  // Apply performance level settings
  private applyPerformanceLevel(): void {
    switch (this.options.performanceLevel) {
      case PerformanceLevel.LOW:
        this.resolutionScale = 0.5;
        this.renderer.setPixelRatio(window.devicePixelRatio * this.resolutionScale);
        this.renderer.shadowMap.enabled = false;
        break;
      case PerformanceLevel.MEDIUM:
        this.resolutionScale = 0.75;
        this.renderer.setPixelRatio(window.devicePixelRatio * this.resolutionScale);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFShadowMap;
        break;
      case PerformanceLevel.HIGH:
        this.resolutionScale = 1.0;
        this.renderer.setPixelRatio(window.devicePixelRatio * this.resolutionScale);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        break;
      case PerformanceLevel.ULTRA:
        this.resolutionScale = 1.0;
        this.renderer.setPixelRatio(window.devicePixelRatio * this.resolutionScale);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.VSMShadowMap;
        break;
    }

    // Update FXAA resolution
    if (this.fxaaPass) {
      const pixelRatio = this.renderer.getPixelRatio();
      this.fxaaPass.material.uniforms['resolution'].value.x = 1 / (window.innerWidth * pixelRatio);
      this.fxaaPass.material.uniforms['resolution'].value.y = 1 / (window.innerHeight * pixelRatio);
    }
  }

  // Set performance level
  setPerformanceLevel(level: PerformanceLevel): void {
    this.options.performanceLevel = level;
    this.applyPerformanceLevel();
  }

  // Register object for level of detail
  registerLOD(object: THREE.Object3D, distances: number[], meshes: THREE.Mesh[]): void {
    if (distances.length !== meshes.length - 1) {
      console.error('ThreeOptimizer: distances array length should be meshes array length - 1');
      return;
    }

    this.lodObjects.set(object, { distances, meshes });
  }

  // Update level of detail for all registered objects
  private updateLOD(): void {
    if (!this.options.enableLevelOfDetail) return;

    const cameraPosition = new THREE.Vector3();
    if (this.camera instanceof THREE.PerspectiveCamera || this.camera instanceof THREE.OrthographicCamera) {
      this.camera.getWorldPosition(cameraPosition);
    }

    this.lodObjects.forEach((lod, object) => {
      const distance = cameraPosition.distanceTo(object.position);
      
      // Find the appropriate LOD level
      let lodIndex = lod.meshes.length - 1; // Default to lowest detail
      for (let i = 0; i < lod.distances.length; i++) {
        if (distance < lod.distances[i]) {
          lodIndex = i;
          break;
        }
      }
      
      // Set visibility based on LOD level
      lod.meshes.forEach((mesh, index) => {
        mesh.visible = index === lodIndex;
      });
    });
  }

  // Update frustum for occlusion culling
  private updateFrustum(): void {
    if (!this.options.enableOcclusionCulling) return;

    this.projScreenMatrix.multiplyMatrices(
      this.camera.projectionMatrix,
      this.camera.matrixWorldInverse
    );
    this.frustum.setFromProjectionMatrix(this.projScreenMatrix);
  }

  // Check if object is in frustum
  private isInFrustum(object: THREE.Object3D): boolean {
    if (!this.options.enableOcclusionCulling) return true;

    if (object instanceof THREE.Mesh && object.geometry.boundingSphere) {
      const boundingSphere = object.geometry.boundingSphere.clone();
      boundingSphere.applyMatrix4(object.matrixWorld);
      return this.frustum.intersectsSphere(boundingSphere);
    }
    
    return true;
  }

  // Adaptive resolution based on FPS
  private updateAdaptiveResolution(): void {
    if (!this.options.adaptiveResolution || !this.options.targetFPS) return;

    this.frameCount++;
    const elapsed = this.clock.getElapsedTime();
    
    // Update FPS every second
    if (elapsed - this.lastFPSUpdate >= 1.0) {
      this.currentFPS = this.frameCount / (elapsed - this.lastFPSUpdate);
      this.frameCount = 0;
      this.lastFPSUpdate = elapsed;
      
      // Adjust resolution based on FPS
      if (this.currentFPS < this.options.targetFPS * 0.8) {
        // FPS is too low, decrease resolution
        this.resolutionScale = Math.max(0.5, this.resolutionScale - 0.1);
        this.renderer.setPixelRatio(window.devicePixelRatio * this.resolutionScale);
        
        // Update FXAA resolution
        if (this.fxaaPass) {
          const pixelRatio = this.renderer.getPixelRatio();
          this.fxaaPass.material.uniforms['resolution'].value.x = 1 / (window.innerWidth * pixelRatio);
          this.fxaaPass.material.uniforms['resolution'].value.y = 1 / (window.innerHeight * pixelRatio);
        }
      } else if (this.currentFPS > this.options.targetFPS * 1.2 && this.resolutionScale < 1.0) {
        // FPS is high enough, increase resolution
        this.resolutionScale = Math.min(1.0, this.resolutionScale + 0.1);
        this.renderer.setPixelRatio(window.devicePixelRatio * this.resolutionScale);
        
        // Update FXAA resolution
        if (this.fxaaPass) {
          const pixelRatio = this.renderer.getPixelRatio();
          this.fxaaPass.material.uniforms['resolution'].value.x = 1 / (window.innerWidth * pixelRatio);
          this.fxaaPass.material.uniforms['resolution'].value.y = 1 / (window.innerHeight * pixelRatio);
        }
      }
    }
  }

  // Render scene with optimizations
  render(): void {
    if (this.stats) this.stats.begin();

    // Update adaptive resolution
    this.updateAdaptiveResolution();

    // Update frustum for occlusion culling
    this.updateFrustum();

    // Update level of detail
    this.updateLOD();

    // Apply occlusion culling
    if (this.options.enableOcclusionCulling) {
      this.scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.visible = this.isInFrustum(object);
        }
      });
    }

    // Render scene
    if (this.composer && this.options.enableFXAA) {
      this.composer.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }

    if (this.stats) this.stats.end();
  }

  // Handle window resize
  handleResize(width: number, height: number): void {
    // Update renderer size
    this.renderer.setSize(width, height);
    
    // Update composer size
    if (this.composer) {
      this.composer.setSize(width, height);
    }
    
    // Update FXAA resolution
    if (this.fxaaPass) {
      const pixelRatio = this.renderer.getPixelRatio();
      this.fxaaPass.material.uniforms['resolution'].value.x = 1 / (width * pixelRatio);
      this.fxaaPass.material.uniforms['resolution'].value.y = 1 / (height * pixelRatio);
    }
    
    // Update camera aspect ratio if it's a perspective camera
    if (this.camera instanceof THREE.PerspectiveCamera) {
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
    }
  }

  // Dispose resources
  dispose(): void {
    if (this.stats && this.stats.dom.parentElement) {
      this.stats.dom.parentElement.removeChild(this.stats.dom);
    }
    
    if (this.composer) {
      this.composer.dispose();
    }
  }
}

export default ThreeOptimizer;