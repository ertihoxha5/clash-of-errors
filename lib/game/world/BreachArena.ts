import {
  BoxGeometry, CylinderGeometry, Group, Mesh, MeshBasicMaterial,
  MeshStandardMaterial, OctahedronGeometry, TorusGeometry,
} from "three";
import { ResourceScope } from "../core/ResourceScope";

/** Original primitive arena. Physics and the player arrive in Phase 2. */
export class BreachArena {
  readonly root = new Group();
  private resources = new ResourceScope();
  private core = new Group();
  private rings = new Group();
  private time = 0;

  constructor() {
    try { this.build(); } catch (error) { this.dispose(); throw error; }
  }

  private build(): void {
    this.root.name = "System Breach / Archive Zero";
    const box = this.resources.own(new BoxGeometry(1, 1, 1));
    const metal = this.resources.own(new MeshStandardMaterial({ color: 0x243444, roughness: .75, metalness: .4 }));
    const dark = this.resources.own(new MeshStandardMaterial({ color: 0x111c2b, roughness: .8, metalness: .3 }));
    const floor = this.resources.own(new MeshStandardMaterial({ color: 0x304456, roughness: .9, metalness: .15 }));
    const cyan = this.resources.own(new MeshBasicMaterial({ color: 0x76d6dd }));
    const purple = this.resources.own(new MeshBasicMaterial({ color: 0xab80cb }));
    const gold = this.resources.own(new MeshBasicMaterial({ color: 0xd5b77d }));
    const block = (x: number, y: number, z: number, w: number, h: number, d: number, material = metal) => {
      const mesh = new Mesh(box, material);
      mesh.position.set(x, y, z);
      mesh.scale.set(w, h, d);
      mesh.castShadow = mesh.receiveShadow = true;
      this.root.add(mesh);
      return mesh;
    };
    const strip = (x: number, y: number, z: number, w: number, h: number, d: number, material = cyan) => {
      const mesh = new Mesh(box, material);
      mesh.position.set(x, y, z);
      mesh.scale.set(w, h, d);
      this.root.add(mesh);
    };

    // Tile seams make distances legible and expose the depth of the foundation.
    block(0, -1.15, 0, 38, 1.6, 34, dark);
    for (let x = -16; x <= 16; x += 4) {
      for (let z = -14; z <= 14; z += 4) block(x, -.2, z, 3.94, .4, 3.94, floor);
    }
    for (const x of [-18.4, 18.4]) strip(x, .03, 0, .09, .05, 32);
    for (const z of [-16.4, 16.4]) strip(0, .03, z, 36.8, .05, .09);
    for (const x of [-6, 6]) strip(x, .025, 2, .06, .04, 28, gold);

    // Raised server galleries, with real sloped geometry linking to ground level.
    for (const side of [-1, 1]) {
      block(side * 14, 2.65, -5, 7, .7, 17);
      block(side * 14, 1.1, -10, 1.1, 2.2, 1.1, dark);
      block(side * 14, 1.1, 0, 1.1, 2.2, 1.1, dark);
      const ramp = block(side * 14, 1.4, 7.2, 5, .4, 8.65, floor);
      ramp.rotation.x = Math.atan2(3, 8);
      strip(side * 17.35, 3.04, -5, .08, .08, 16.7);
      for (const z of [-11, -5, 1]) {
        block(side * 15.5, 5.7, z, 2.5, 5.4, 2.8, dark);
        block(side * 15.5, 8.5, z, 2.7, .25, 3);
        for (let i = 0; i < 7; i++) {
          strip(side * 15.5, 3.6 + i * .65, z + 1.42, 1.9, .08, .04, i % 3 === 0 ? purple : cyan);
        }
      }
    }
    block(0, 2.65, -12, 22, .7, 4);
    strip(0, 3.04, -10.1, 21, .06, .08, purple);

    const pedestal = new Mesh(this.resources.own(new CylinderGeometry(3.8, 4.4, .9, 8)), dark);
    pedestal.position.set(0, .45, -3);
    pedestal.receiveShadow = true;
    pedestal.castShadow = true;
    this.root.add(pedestal);
    this.core.position.set(0, 4.1, -3);
    const heart = new Mesh(this.resources.own(new OctahedronGeometry(1.25)), cyan);
    const shell = new Mesh(this.resources.own(new OctahedronGeometry(1.65)), this.resources.own(new MeshBasicMaterial({ color: 0xd5b77d, wireframe: true })));
    this.core.add(heart, shell);
    this.root.add(this.core);
    this.rings.position.set(0, 4.1, -3);
    const ringGeometry = this.resources.own(new TorusGeometry(2.8, .045, 6, 64));
    for (let i = 0; i < 3; i++) {
      const ring = new Mesh(ringGeometry, i === 1 ? purple : gold);
      ring.rotation.set(Math.PI / 2 + i * .5, i * .7, i * .6);
      this.rings.add(ring);
    }
    this.root.add(this.rings);
    for (const x of [-4.8, 4.8]) {
      block(x, 3.3, -3, .7, 6.6, .7, dark);
      strip(x, 3.3, -2.63, .12, 5.7, .04);
    }

    // Rear gate and silhouettes in the void remain distinct from traversable floor.
    for (const x of [-5, 5]) block(x, 6.5, -14, 1.4, 7, 1.4, dark);
    block(0, 10.2, -14, 11.4, .8, 1.4, dark);
    strip(0, 9.7, -13.25, 9.5, .12, .06, purple);
    for (let i = 0; i < 22; i++) {
      const angle = (i / 22) * Math.PI * 2;
      const height = 10 + ((i * 7) % 17);
      const x = Math.cos(angle) * 46, z = Math.sin(angle) * 43;
      block(x, height / 2 - 9, z, 3 + i % 3, height, 4, dark);
      strip(x, height / 2 - 9, z + 2.02, .08, height * .7, .05, i % 4 === 0 ? purple : cyan);
    }
    for (const [x, z] of [[-7, 6], [7, 7], [-7, -8], [8, -7]]) {
      block(x, .7, z, 2.5, 1.4, 2, dark);
      strip(x, 1.42, z, 2.2, .04, .06, gold);
    }
  }

  update(delta: number): void { this.time += delta; }

  animate(alpha: number, reducedMotion: boolean): void {
    const time = reducedMotion ? 0 : this.time + alpha / 60;
    this.core.rotation.y = time * .28;
    this.core.position.y = 4.1 + Math.sin(time * .9) * .18;
    this.rings.rotation.y = -time * .09;
  }

  dispose(): void {
    this.root.removeFromParent();
    this.root.clear();
    this.core.clear();
    this.rings.clear();
    this.resources.dispose();
  }
}
