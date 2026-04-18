// ============================================================
// scene3d.js — Three.js 3D scene with draggable sources + listener
// ============================================================

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export class Scene3D {
  constructor(container) {
    this.container = container;
    this.sourceMeshes = new Map();   // sourceId -> mesh
    this.listenerMesh = null;
    this.selectedObject = null;
    this.isDragging = false;
    this.dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -1);
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.intersection = new THREE.Vector3();

    // Callbacks
    this.onSourceMoved = null;    // (id, x, y, z)
    this.onListenerMoved = null;  // (x, y, z)
    this.onSourceSelected = null; // (id)

    this._init();
  }

  _init() {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.8;
    this.container.appendChild(this.renderer.domElement);

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x08080e);
    this.scene.fog = new THREE.FogExp2(0x08080e, 0.03);

    // Camera
    this.camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
    this.camera.position.set(8, 10, 12);
    this.camera.lookAt(0, 0, 0);

    // Orbit controls
    this.orbit = new OrbitControls(this.camera, this.renderer.domElement);
    this.orbit.enableDamping = true;
    this.orbit.dampingFactor = 0.08;
    this.orbit.maxPolarAngle = Math.PI / 2.1;
    this.orbit.minDistance = 3;
    this.orbit.maxDistance = 30;

    // Lights
    const ambientLight = new THREE.AmbientLight(0x222240, 0.5);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x4a6aff, 0.3);
    dirLight.position.set(5, 10, 5);
    this.scene.add(dirLight);

    // Grid floor
    this._createFloor();

    // Room wireframe
    this._createRoom();

    // Listener mesh
    this._createListener();

    // Events
    this.container.addEventListener('pointerdown', this._onPointerDown.bind(this));
    this.container.addEventListener('pointermove', this._onPointerMove.bind(this));
    this.container.addEventListener('pointerup', this._onPointerUp.bind(this));
    window.addEventListener('resize', this._onResize.bind(this));

    // Start render loop
    this._animate();
  }

  _createFloor() {
    // Grid
    const grid = new THREE.GridHelper(20, 20, 0x1a1a2e, 0x12121e);
    grid.position.y = 0;
    this.scene.add(grid);

    // Center marker
    const ringGeo = new THREE.RingGeometry(0.3, 0.35, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x4a9eff, side: THREE.DoubleSide, transparent: true, opacity: 0.3
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.01;
    this.scene.add(ring);
  }

  _createRoom() {
    const size = 10;
    const height = 4;
    const edges = new THREE.EdgesGeometry(new THREE.BoxGeometry(size * 2, height, size * 2));
    const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({
      color: 0x1a1a3e, transparent: true, opacity: 0.3
    }));
    line.position.y = height / 2;
    this.scene.add(line);
  }

  _createListener() {
    // Listener — a small cone + sphere (head-like)
    const group = new THREE.Group();

    // Head sphere
    const headGeo = new THREE.SphereGeometry(0.25, 16, 16);
    const headMat = new THREE.MeshPhongMaterial({
      color: 0xe8e8ec, emissive: 0x4a9eff, emissiveIntensity: 0.2
    });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 0.25;
    group.add(head);

    // Direction indicator (nose cone)
    const noseGeo = new THREE.ConeGeometry(0.08, 0.3, 8);
    const noseMat = new THREE.MeshPhongMaterial({ color: 0x4af0ff, emissive: 0x4af0ff, emissiveIntensity: 0.5 });
    const nose = new THREE.Mesh(noseGeo, noseMat);
    nose.position.set(0, 0.25, -0.35);
    nose.rotation.x = -Math.PI / 2;
    group.add(nose);

    // Base ring
    const baseGeo = new THREE.RingGeometry(0.15, 0.35, 16);
    const baseMat = new THREE.MeshBasicMaterial({
      color: 0x4af0ff, side: THREE.DoubleSide, transparent: true, opacity: 0.3
    });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.rotation.x = -Math.PI / 2;
    base.position.y = 0.01;
    group.add(base);

    group.position.set(0, 1, 0);
    group.userData = { type: 'listener' };
    this.listenerMesh = group;
    this.scene.add(group);
  }

  addSourceMesh(id, color, position, name) {
    const group = new THREE.Group();

    // Glowing sphere
    const geo = new THREE.SphereGeometry(0.2, 24, 24);
    const mat = new THREE.MeshPhongMaterial({
      color: new THREE.Color(color),
      emissive: new THREE.Color(color),
      emissiveIntensity: 0.6,
      transparent: true,
      opacity: 0.9
    });
    const sphere = new THREE.Mesh(geo, mat);
    group.add(sphere);

    // Outer glow ring
    const glowGeo = new THREE.RingGeometry(0.25, 0.4, 32);
    const glowMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(color),
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.15
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.rotation.x = -Math.PI / 2;
    glow.position.y = -position.y + 0.01;
    group.add(glow);

    // Point light for glow effect
    const light = new THREE.PointLight(new THREE.Color(color), 0.5, 5);
    group.add(light);

    group.position.set(position.x, position.y, position.z);
    group.userData = { type: 'source', id, name };

    this.sourceMeshes.set(id, group);
    this.scene.add(group);
    return group;
  }

  removeSourceMesh(id) {
    const mesh = this.sourceMeshes.get(id);
    if (mesh) {
      this.scene.remove(mesh);
      this.sourceMeshes.delete(id);
    }
  }

  updateSourcePosition(id, x, y, z) {
    const mesh = this.sourceMeshes.get(id);
    if (mesh) {
      mesh.position.set(x, y, z);
    }
  }

  updateListenerPosition(x, y, z) {
    if (this.listenerMesh) {
      this.listenerMesh.position.set(x, y, z);
    }
  }

  highlightSource(id) {
    this.sourceMeshes.forEach((mesh, sid) => {
      const sphere = mesh.children[0];
      if (sphere.material) {
        sphere.material.emissiveIntensity = sid === id ? 1.0 : 0.6;
      }
    });
  }

  // --- Pulse animation for playing sources ---
  setPulsing(id, active) {
    const mesh = this.sourceMeshes.get(id);
    if (mesh) {
      mesh.userData.pulsing = active;
    }
  }

  // --- Raycasting & drag ---
  _getInteractables() {
    const objects = [];
    this.sourceMeshes.forEach(m => objects.push(m.children[0])); // sphere children
    if (this.listenerMesh) objects.push(this.listenerMesh.children[0]); // head
    return objects;
  }

  _updateMouse(event) {
    const rect = this.container.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  _onPointerDown(event) {
    if (event.button !== 0) return;
    this._updateMouse(event);
    this.raycaster.setFromCamera(this.mouse, this.camera);

    const hits = this.raycaster.intersectObjects(this._getInteractables());
    if (hits.length > 0) {
      this.orbit.enabled = false;
      this.isDragging = true;

      // Find parent group
      let obj = hits[0].object;
      while (obj.parent && !obj.userData.type) obj = obj.parent;

      this.selectedObject = obj;

      // Update drag plane to pass through the object
      this.dragPlane.constant = -obj.position.y;

      if (obj.userData.type === 'source' && this.onSourceSelected) {
        this.onSourceSelected(obj.userData.id);
      }

      this.container.style.cursor = 'grabbing';
    }
  }

  _onPointerMove(event) {
    this._updateMouse(event);

    if (this.isDragging && this.selectedObject) {
      this.raycaster.setFromCamera(this.mouse, this.camera);
      if (this.raycaster.ray.intersectPlane(this.dragPlane, this.intersection)) {
        const obj = this.selectedObject;
        obj.position.x = Math.max(-9.5, Math.min(9.5, this.intersection.x));
        obj.position.z = Math.max(-9.5, Math.min(9.5, this.intersection.z));

        if (obj.userData.type === 'source' && this.onSourceMoved) {
          this.onSourceMoved(obj.userData.id, obj.position.x, obj.position.y, obj.position.z);
        } else if (obj.userData.type === 'listener' && this.onListenerMoved) {
          this.onListenerMoved(obj.position.x, obj.position.y, obj.position.z);
        }
      }
    } else {
      // Hover cursor
      this.raycaster.setFromCamera(this.mouse, this.camera);
      const hits = this.raycaster.intersectObjects(this._getInteractables());
      this.container.style.cursor = hits.length > 0 ? 'grab' : 'default';
    }
  }

  _onPointerUp() {
    this.isDragging = false;
    this.selectedObject = null;
    this.orbit.enabled = true;
    this.container.style.cursor = 'default';
  }

  _onResize() {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  _animate() {
    requestAnimationFrame(() => this._animate());

    const time = performance.now() * 0.001;

    // Pulse animation for active sources
    this.sourceMeshes.forEach(mesh => {
      if (mesh.userData.pulsing) {
        const scale = 1 + 0.1 * Math.sin(time * 3);
        mesh.children[0].scale.setScalar(scale);
        // Glow ring pulse
        if (mesh.children[1]) {
          mesh.children[1].material.opacity = 0.1 + 0.1 * Math.sin(time * 2);
        }
      }
    });

    this.orbit.update();
    this.renderer.render(this.scene, this.camera);
  }
}
