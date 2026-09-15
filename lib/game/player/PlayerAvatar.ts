import { BoxGeometry, Group, Mesh, MeshBasicMaterial, MeshStandardMaterial, Vector3 } from "three";
import { ResourceScope } from "../core/ResourceScope";
import type { PlayerController } from "./PlayerController";

/** A small original debugger rig; each limb pivots independently for locomotion. */
export class PlayerAvatar {
  readonly root = new Group();
  private rig = new Group();
  private leftArm = new Group();
  private rightArm = new Group();
  private leftLeg = new Group();
  private rightLeg = new Group();
  private scope = new ResourceScope();
  private time = 0;
  private stride = 0;
  private lean = 0;
  private position = new Vector3();

  constructor() {
    try { this.build(); } catch (error) { this.dispose(); throw error; }
  }

  private build(): void {
    const geometry = this.scope.own(new BoxGeometry(1, 1, 1));
    const armor = this.scope.own(new MeshStandardMaterial({ color: 0x638898, roughness: .6, metalness: .55 }));
    const dark = this.scope.own(new MeshStandardMaterial({ color: 0x152536, roughness: .8 }));
    const trim = this.scope.own(new MeshBasicMaterial({ color: 0x76d6dd }));
    const gold = this.scope.own(new MeshBasicMaterial({ color: 0xd5b77d }));
    const part = (parent: Group, x: number, y: number, z: number, w: number, h: number, d: number,
      material: MeshStandardMaterial | MeshBasicMaterial = armor) => {
      const mesh = new Mesh(geometry, material);
      mesh.position.set(x, y, z); mesh.scale.set(w, h, d);
      mesh.castShadow = mesh.receiveShadow = true;
      parent.add(mesh);
    };
    this.root.name = "Debugger";
    this.root.add(this.rig);
    part(this.rig, 0, 1.13, 0, .55, .61, .32);
    part(this.rig, 0, 1.58, 0, .42, .38, .38);
    part(this.rig, 0, 1.61, -.2, .35, .085, .03, trim);
    part(this.rig, 0, 1.16, -.18, .12, .34, .04, gold);
    part(this.rig, 0, 1.17, .23, .4, .43, .18, dark);
    part(this.rig, 0, 1.17, .33, .08, .3, .02, trim);
    for (const [limb, x, y] of [[this.leftArm, -.37, 1.35], [this.rightArm, .37, 1.35],
      [this.leftLeg, -.17, .83], [this.rightLeg, .17, .83]] as const) {
      limb.position.set(x, y, 0);
      this.rig.add(limb);
      const leg = y < 1;
      part(limb, 0, leg ? -.34 : -.24, 0, leg ? .23 : .19, leg ? .64 : .48, .24, dark);
      part(limb, 0, -.08, 0, leg ? .25 : .24, .26, .28);
      if (leg) part(limb, 0, -.7, -.06, .25, .18, .38);
      else part(limb, 0, -.49, 0, .2, .17, .25);
    }
  }

  update(delta: number, player: PlayerController): void {
    const speed = Math.hypot(player.velocity.x, player.velocity.z);
    this.time += delta * Math.max(2, speed * 2.3);
    const walking = player.grounded && player.state !== "DODGING";
    const targetStride = walking ? Math.min(1, speed / 7) : 0;
    this.stride += (targetStride - this.stride) * (1 - Math.exp(-16 * delta));
    const targetLean = player.state === "DODGING" ? -.55 : player.state === "SPRINTING" ? -.15 : 0;
    this.lean += (targetLean - this.lean) * (1 - Math.exp(-20 * delta));
    const swing = Math.sin(this.time) * .72 * this.stride;
    this.leftLeg.rotation.x = swing;
    this.rightLeg.rotation.x = -swing;
    this.leftArm.rotation.x = -swing * .8;
    this.rightArm.rotation.x = swing * .8;
    if (!player.grounded) {
      this.leftLeg.rotation.x = -.32;
      this.rightLeg.rotation.x = .25;
      this.leftArm.rotation.z = -.22;
      this.rightArm.rotation.z = .22;
    } else { this.leftArm.rotation.z = this.rightArm.rotation.z = 0; }
    this.rig.rotation.x = this.lean;
  }

  render(alpha: number, player: PlayerController): void {
    this.position.lerpVectors(player.previousPosition, player.position, alpha);
    this.root.position.copy(this.position);
    this.root.rotation.y = player.facing;
  }

  dispose(): void {
    this.root.removeFromParent();
    this.root.clear();
    this.rig.clear();
    for (const limb of [this.leftArm, this.rightArm, this.leftLeg, this.rightLeg]) limb.clear();
    this.scope.dispose();
  }
}
