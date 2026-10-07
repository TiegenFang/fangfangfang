import * as THREE from "three";
import { contactShadow, createCourtyard } from "./garden-courtyard";

// Image-editor cutouts use a controlled magenta backing, keyed in the renderer.
function cutout(texture: THREE.Texture, width: number, height: number) {
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.ShaderMaterial({
    uniforms: { map: { value: texture } },
    vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `
      uniform sampler2D map;
      varying vec2 vUv;
      void main() {
        vec4 ink = texture2D(map, vUv);
        float spill = max(0., min(ink.r, ink.b) - ink.g);
        float alpha = 1. - smoothstep(.025, .24, spill);
        if (alpha < .03) discard;
        ink.r -= spill;
        ink.b -= spill;
        gl_FragColor = vec4(ink.rgb, alpha * ink.a);
        #include <colorspace_fragment>
      }
    `,
    transparent: true,
    depthWrite: true,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height), material);
  const depth = new THREE.MeshDepthMaterial({
    depthPacking: THREE.RGBADepthPacking,
  });
  depth.onBeforeCompile = shader => {
    shader.uniforms.keyMap = { value: texture };
    shader.vertexShader = `varying vec2 keyUv;\n${shader.vertexShader}`.replace(
      "#include <uv_vertex>",
      "#include <uv_vertex>\nkeyUv = uv;"
    );
    shader.fragmentShader = `uniform sampler2D keyMap;\nvarying vec2 keyUv;\n${shader.fragmentShader}`;
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <alphatest_fragment>",
      `vec3 ink = texture2D(keyMap, keyUv).rgb;
       if (min(ink.r, ink.b) - ink.g > .13) discard;`
    );
  };
  mesh.customDepthMaterial = depth;
  mesh.castShadow = true;
  return mesh;
}

export function mountGarden(stage: HTMLElement): () => void {
  const canvas = stage.querySelector("canvas")!;
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const events = new AbortController();
  let disposed = false;
  let visible = true;
  let frame = 0;
  let renderer: THREE.WebGLRenderer | undefined;
  let observer: ResizeObserver | undefined;
  let intersection: IntersectionObserver | undefined;
  const textures: THREE.Texture[] = [];
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 70);
  let catMesh: THREE.Mesh | undefined;
  let feedingStarted: number | undefined;
  const catRestY = 1.11;
  let distance = 19;
  const stop = () => {
    cancelAnimationFrame(frame);
    frame = 0;
  };
  const draw = () => {
    if (!renderer) return;
    camera.position.set(0, 2.55 + distance * 0.105, distance);
    camera.lookAt(0, 2.25, 0);
    renderer.render(scene, camera);
  };
  const render = (now: number) => {
    frame = 0;
    if (disposed || !visible || document.hidden) return;
    if (catMesh && feedingStarted !== undefined) {
      const progress = Math.min((now - feedingStarted) / 750, 1);
      const response = Math.sin(progress * Math.PI);
      catMesh.position.y = catRestY + response * 0.05;
      catMesh.rotation.z = -response * 0.018;
      if (progress === 1) feedingStarted = undefined;
    }
    draw();
    if (feedingStarted !== undefined) frame = requestAnimationFrame(render);
  };
  const requestRender = () => {
    if (!frame && !disposed) frame = requestAnimationFrame(render);
  };
  const settle = () => {
    feedingStarted = undefined;
    if (catMesh) {
      catMesh.position.y = catRestY;
      catMesh.rotation.z = 0;
    }
    requestRender();
  };
  const cleanup = () => {
    if (disposed) return;
    disposed = true;
    stop();
    events.abort();
    observer?.disconnect();
    intersection?.disconnect();
    const materials = new Set<THREE.Material>();
    scene.traverse(object => {
      if (object instanceof THREE.Mesh) {
        if (object.customDepthMaterial)
          materials.add(object.customDepthMaterial);
        object.geometry.dispose();
        (Array.isArray(object.material)
          ? object.material
          : [object.material]
        ).forEach(m => materials.add(m));
        if (object instanceof THREE.InstancedMesh) object.dispose();
      }
      if (object instanceof THREE.DirectionalLight) object.shadow.dispose();
    });
    materials.forEach(material => material.dispose());
    textures.forEach(texture => texture.dispose());
    renderer?.dispose();
    delete stage.dataset.ready;
  };
  const initialize = async () => {
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: "low-power",
        // Retain the on-demand frame so the matching static poster can be exported.
        preserveDrawingBuffer: true,
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFShadowMap;
      const loader = new THREE.TextureLoader();
      const load = async (url: string) => {
        const texture = await loader.loadAsync(url);
        if (disposed) {
          texture.dispose();
          return undefined;
        }
        textures.push(texture);
        return texture;
      };
      const [gate, cat, trees, plaque] = await Promise.all([
        load(stage.dataset.gate!),
        load(stage.dataset.cat!),
        load(stage.dataset.trees!),
        load(stage.dataset.plaque!),
      ]);
      if (disposed || !gate || !cat || !trees || !plaque) return;
      scene.add(new THREE.HemisphereLight("#fff8ef", "#929a83", 1.65));
      const sun = new THREE.DirectionalLight("#fff1df", 1.9);
      sun.position.set(-5, 8, 6);
      sun.castShadow = true;
      Object.assign(sun.shadow.camera, {
        left: -8,
        right: 8,
        top: 8,
        bottom: -5,
        near: 0.5,
        far: 25,
      });
      sun.shadow.mapSize.set(1024, 1024);
      sun.shadow.normalBias = 0.035;
      sun.shadow.bias = -0.0003;
      sun.shadow.radius = 3;
      scene.add(sun, createCourtyard(plaque));
      const addLayer = (
        texture: THREE.Texture,
        width: number,
        height: number,
        x: number,
        y: number,
        z: number
      ) => {
        const mesh = cutout(texture, width, height);
        mesh.position.set(x, y, z);
        scene.add(mesh);
        return mesh;
      };
      addLayer(trees, 4.7, 3.76, -3.6, 1.95, -1.94);
      addLayer(trees, 4.5, 3.6, 3.7, 1.88, -1.8);
      addLayer(trees, 2.25, 1.8, 0.15, 0.99, -1.75);
      addLayer(gate, 5.35, 4.02, -1.7, 1.67, -1.03);
      catMesh = addLayer(cat, 3.75, 2.5, 2.15, catRestY, 1.24);
      const foreground = addLayer(trees, 2.05, 1.64, -4.65, 0.82, 1.54);
      foreground.rotation.y = 0.05;
      for (const [x, z, w, d, opacity] of [
        [2.15, 1.24, 3.65, 1.45, 0.4],
        [-1.7, -1.0, 5.0, 1.0, 0.24],
        [-4.6, 1.5, 2.0, 1.0, 0.2],
        [-3.4, 1.05, 0.85, 0.6, 0.2],
        [3.75, 1.05, 0.8, 0.55, 0.18],
      ]) {
        const shadow = contactShadow(w, d, opacity);
        shadow.position.set(x, 0.052, z);
        scene.add(shadow);
      }
      const resize = () => {
        const { width, height } = stage.getBoundingClientRect();
        if (!width || !height || !renderer) return;
        camera.aspect = width / height;
        distance =
          Math.max(6.4, 13.1 / camera.aspect) /
            (2 * Math.tan(THREE.MathUtils.degToRad(16))) +
          2.4;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height, false);
        requestRender();
      };
      observer = new ResizeObserver(resize);
      observer.observe(stage);
      intersection = new IntersectionObserver(entries => {
        visible = entries[0].isIntersecting;
        if (visible) requestRender();
        else stop();
      });
      intersection.observe(stage);
      const signal = events.signal;
      stage.addEventListener(
        "garden:feed",
        () => {
          if (motion.matches) return;
          feedingStarted = performance.now();
          requestRender();
        },
        { signal }
      );
      motion.addEventListener("change", settle, { signal });
      document.addEventListener(
        "visibilitychange",
        () => {
          if (document.hidden) stop();
          else requestRender();
        },
        { signal }
      );
      canvas.addEventListener(
        "webglcontextlost",
        event => {
          event.preventDefault();
          cleanup();
        },
        { signal }
      );
      resize();
      draw();
      stage.dataset.ready = "true";
    } catch {
      cleanup();
    }
  };
  void initialize();
  return cleanup;
}
