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
  const target = new THREE.Vector2();
  const current = new THREE.Vector2();
  let distance = 19;
  const stop = () => {
    cancelAnimationFrame(frame);
    frame = 0;
  };
  const draw = () => {
    if (!renderer) return;
    camera.position.set(
      current.x * 1.05,
      2.55 + distance * 0.105 + current.y * 0.55,
      distance
    );
    camera.lookAt(current.x * 0.09, 2.3, 0);
    renderer.render(scene, camera);
  };
  const render = () => {
    frame = 0;
    if (disposed || !visible || document.hidden) return;
    current.lerp(target, 0.07);
    draw();
    if (current.distanceTo(target) > 0.0005)
      frame = requestAnimationFrame(render);
  };
  const requestRender = () => {
    if (!frame && !disposed) frame = requestAnimationFrame(render);
  };
  const home = () => {
    target.set(0, 0);
    if (motion.matches) current.set(0, 0);
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
      scene.add(new THREE.HemisphereLight("#fffaf5", "#999b88", 1.8));
      const sun = new THREE.DirectionalLight("#fffaf3", 1.7);
      sun.position.set(-4, 9, 7);
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
      addLayer(trees, 4.5, 3.6, -3.5, 1.85, -1.88);
      addLayer(trees, 4.9, 3.92, 3.6, 2.02, -1.75);
      addLayer(trees, 2.5, 2, -0.7, 1.07, -1.65);
      // The building (excluding flagpole) and cat both rise about 2.7 units.
      addLayer(gate, 5.35, 4.02, -1.92, 1.67, -0.55);
      addLayer(cat, 4.9, 3.27, 1.65, 1.48, 0.92);
      const foreground = addLayer(trees, 2.4, 1.92, -4.46, 0.92, 1.53);
      foreground.rotation.y = 0.05;
      for (const [x, z, w, d, opacity] of [
        [1.7, 0.95, 4.8, 1.8, 0.43],
        [-1.9, -0.5, 5.0, 1.0, 0.26],
        [-4.4, 1.5, 2.3, 1.0, 0.23],
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
        "pointermove",
        event => {
          if (motion.matches) return;
          const rect = stage.getBoundingClientRect();
          target.set(
            ((event.clientX - rect.left) / rect.width) * 2 - 1,
            1 - ((event.clientY - rect.top) / rect.height) * 2
          );
          requestRender();
        },
        { signal }
      );
      stage.addEventListener("pointerleave", home, { signal });
      stage.addEventListener("pointercancel", home, { signal });
      stage.addEventListener(
        "pointerup",
        event => {
          if (event.pointerType === "touch") home();
        },
        { signal }
      );
      motion.addEventListener("change", home, { signal });
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
