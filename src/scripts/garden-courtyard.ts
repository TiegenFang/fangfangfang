import * as THREE from "three";

/** Open courtyard behind an eight-sided plaster garden window. */
export function createCourtyard(plaque: THREE.Texture) {
  const group = new THREE.Group();
  const plaster = new THREE.MeshStandardMaterial({
    color: "#f2efe6",
    roughness: 1,
  });
  const stone = new THREE.MeshStandardMaterial({
    color: "#b6b3a7",
    roughness: 1,
  });
  const tile = new THREE.MeshStandardMaterial({
    color: "#555c58",
    roughness: 0.96,
  });
  const grout = new THREE.MeshStandardMaterial({
    color: "#c3c2b6",
    roughness: 1,
  });
  const paving = ["#dad8cc", "#d4d2c6", "#dfdccf"].map(
    color => new THREE.MeshStandardMaterial({ color, roughness: 1 })
  );
  const box = (
    w: number,
    h: number,
    d: number,
    x: number,
    y: number,
    z: number,
    material: THREE.Material
  ) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
    return mesh;
  };
  box(11.6, 0.25, 5.2, 0, -0.18, 0, stone);
  box(11.35, 0.07, 4.98, 0, -0.02, 0, grout);
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 12; col++) {
      box(
        0.92,
        0.025,
        0.96,
        -5.16 + col * 0.94,
        0.03,
        -1.97 + row * 0.985,
        paving[(col + row * 2) % 3]
      );
    }
  }
  box(11.3, 3.6, 0.18, 0, 1.8, -2.46, plaster);
  box(0.18, 2.75, 4.7, -5.56, 1.375, -0.12, plaster);
  box(0.18, 2.75, 4.7, 5.56, 1.375, -0.12, plaster);
  box(0.3, 0.1, 4.85, -5.56, 2.8, -0.12, tile);
  box(0.3, 0.1, 4.85, 5.56, 2.8, -0.12, tile);
  box(11.55, 0.13, 0.45, 0, 3.64, -2.46, tile);
  const outline = new THREE.Shape();
  outline.moveTo(-5.8, 0);
  outline.lineTo(5.8, 0);
  outline.lineTo(5.8, 4.65);
  outline.lineTo(-5.8, 4.65);
  outline.closePath();
  // Clockwise inner path cuts a real opening through the plaster.
  const corners = [
    [-4.65, 0.28],
    [-5.12, 0.78],
    [-5.12, 3.65],
    [-4.48, 4.23],
    [4.48, 4.23],
    [5.12, 3.65],
    [5.12, 0.78],
    [4.65, 0.28],
  ];
  const opening = new THREE.Path();
  corners.forEach(([x, y], i) => {
    if (i === 0) opening.moveTo(x, y);
    else opening.lineTo(x, y);
  });
  opening.closePath();
  outline.holes.push(opening);
  const frame = new THREE.Mesh(
    new THREE.ExtrudeGeometry(outline, {
      depth: 0.24,
      bevelEnabled: true,
      bevelSize: 0.025,
      bevelThickness: 0.025,
      bevelSegments: 1,
      steps: 1,
    }),
    plaster
  );
  frame.position.z = 2.18;
  frame.castShadow = true;
  frame.receiveShadow = true;
  group.add(frame);
  for (let i = 0; i < corners.length; i++) {
    const [x1, y1] = corners[i];
    const [x2, y2] = corners[(i + 1) % corners.length];
    const edge = box(
      Math.hypot(x2 - x1, y2 - y1),
      0.04,
      0.28,
      (x1 + x2) / 2,
      (y1 + y2) / 2,
      2.32,
      stone
    );
    edge.rotation.z = Math.atan2(y2 - y1, x2 - x1);
  }
  box(11.8, 0.065, 0.64, 0, 4.68, 2.22, stone);
  // A shallow swept eave keeps the garden-window silhouette quiet.
  const eaveHeight = (x: number) => 4.77 + 0.19 * Math.pow(Math.abs(x) / 6, 6);
  for (let i = 0; i < 67; i++) {
    const x = -5.83 + i * 0.177;
    box(0.184, 0.055, 0.84, x, eaveHeight(x), 2.21, tile);
  }
  const tiles = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.045, 0.045, 0.86, 12),
    tile,
    67
  );
  const dummy = new THREE.Object3D();
  for (let i = 0; i < 67; i++) {
    const x = -5.83 + i * 0.177;
    dummy.position.set(x, eaveHeight(x) + 0.025, 2.22);
    dummy.rotation.x = Math.PI / 2;
    dummy.updateMatrix();
    tiles.setMatrixAt(i, dummy.matrix);
  }
  tiles.castShadow = true;
  group.add(tiles);
  const wood = new THREE.MeshStandardMaterial({
    color: "#433c30",
    roughness: 0.85,
  });
  box(2.72, 0.74, 0.16, 0, 4.43, 2.52, wood);
  plaque.colorSpace = THREE.SRGBColorSpace;
  const inscription = new THREE.Mesh(
    new THREE.PlaneGeometry(2.6, 0.676),
    new THREE.MeshBasicMaterial({ map: plaque })
  );
  inscription.position.set(0, 4.43, 2.607);
  group.add(inscription);
  box(11.9, 0.1, 0.54, 0, 0.08, 2.5, stone);
  return group;
}

export function contactShadow(width: number, depth: number, opacity: number) {
  const material = new THREE.ShaderMaterial({
    uniforms: { opacity: { value: opacity } },
    vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `
      varying vec2 vUv;
      uniform float opacity;
      void main() {
        float d = length((vUv - .5) * 2.);
        gl_FragColor = vec4(.15, .17, .13, pow(max(0., 1. - d), 2.) * opacity);
        #include <colorspace_fragment>
      }
    `,
    transparent: true,
    depthWrite: false,
  });
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(width, depth),
    material
  );
  shadow.rotation.x = -Math.PI / 2;
  return shadow;
}
