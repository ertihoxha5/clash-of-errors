import { Object3D, Ray, Sphere, Vector3 } from "three";
import { Octree } from "three/addons/math/Octree.js";
import { Capsule } from "three/addons/math/Capsule.js";

const WALKABLE_Y = Math.cos(Math.PI / 4);
const SKIN = .001;

/** A static spatial index of the same meshes that are rendered as solid objects. */
export class CollisionWorld {
  private tree = new Octree();
  private offset = new Vector3();
  private before = new Capsule();
  private trial = new Capsule();
  private probe = new Capsule();
  private cameraSphere = new Sphere(new Vector3(), .24);
  private stepRay = new Ray(new Vector3(), new Vector3(0, -1, 0));

  constructor(solids: Object3D) { this.tree.fromGraphNode(solids); }

  move(capsule: Capsule, velocity: Vector3, delta: number, wasGrounded: boolean): boolean {
    // Never advance farther than a fraction of the radius, including during a dodge/fall.
    const steps = Math.max(1, Math.ceil(velocity.length() * delta / (capsule.radius * .35)));
    let grounded = false;
    for (let i = 0; i < steps; i++) {
      this.before.copy(capsule);
      this.offset.copy(velocity).multiplyScalar(delta / steps);
      capsule.translate(this.offset);
      const contact = this.tree.capsuleIntersect(capsule);
      if (contact && contact.normal.y < WALKABLE_Y && contact.normal.y > -.1 && wasGrounded && velocity.y <= 0 &&
          this.tryStep(capsule, this.before, this.offset)) {
        grounded = true;
        velocity.y = 0;
        continue;
      }
      for (let pass = 0; pass < 5; pass++) {
        const hit = pass === 0 ? contact : this.tree.capsuleIntersect(capsule);
        if (!hit) break;
        const { normal, depth } = hit;
        if (normal.y >= WALKABLE_Y) {
          capsule.translate(this.offset.set(0, (depth + SKIN) / normal.y, 0));
          if (velocity.y <= 0) { grounded = true; velocity.y = 0; }
        } else if (normal.y > 0 && normal.y < WALKABLE_Y) {
          // A steep face cannot propel the capsule upward into an unintended climb.
          const horizontal = normal.x * normal.x + normal.z * normal.z;
          this.offset.set(normal.x, 0, normal.z).multiplyScalar((depth + SKIN) / Math.max(.001, horizontal));
          capsule.translate(this.offset);
          this.offset.normalize();
          velocity.addScaledVector(this.offset, -Math.min(0, velocity.dot(this.offset)));
        } else {
          capsule.translate(this.offset.copy(normal).multiplyScalar(depth + SKIN));
          velocity.addScaledVector(normal, -Math.min(0, velocity.dot(normal)));
        }
      }
    }
    // Follow descending ramps/low steps without snapping across a ledge or during a jump.
    if (!grounded && wasGrounded && velocity.y <= 0) {
      this.probe.copy(capsule).translate(this.offset.set(0, -.16, 0));
      const hit = this.tree.capsuleIntersect(this.probe);
      if (hit && hit.normal.y >= WALKABLE_Y) {
        // Ground adhesion corrects height only, never adds downhill horizontal motion.
        this.probe.translate(this.offset.set(0, (hit.depth + SKIN) / hit.normal.y, 0));
        capsule.copy(this.probe);
        velocity.y = 0;
        grounded = true;
      }
    }
    return grounded;
  }

  private tryStep(capsule: Capsule, before: Capsule, displacement: Vector3): boolean {
    if (Math.hypot(displacement.x, displacement.z) < .0001) return false;
    const dx = displacement.x, dz = displacement.z;
    this.trial.copy(before).translate(this.offset.set(0, .28, 0));
    if (this.tree.capsuleIntersect(this.trial)) return false;
    this.trial.translate(this.offset.set(dx, 0, dz));
    if (this.tree.capsuleIntersect(this.trial)) return false;
    // Probe ahead of the rounded foot; an edge contact alone has a steep normal
    // even when its top is a perfectly walkable, low step.
    const length = Math.hypot(dx, dz), feetY = before.start.y - before.radius;
    this.stepRay.origin.set(this.trial.start.x + dx / length * before.radius,
      feetY + .281, this.trial.start.z + dz / length * before.radius);
    const top = this.tree.rayIntersect(this.stepRay);
    if (!top || top.distance > .28 || top.distance < SKIN) return false;
    const normal = top.triangle.getNormal(this.offset);
    if (normal.y < WALKABLE_Y) return false;
    const height = this.stepRay.origin.y - top.distance + SKIN;
    this.trial.translate(this.offset.set(0, height - (this.trial.start.y - this.trial.radius), 0));
    if (this.tree.capsuleIntersect(this.trial)) return false;
    capsule.copy(this.trial);
    return true;
  }

  /** Sweep a camera-sized sphere, stopping before obstacles and near-plane clipping. */
  constrainCamera(anchor: Vector3, desired: Vector3, target: Vector3): Vector3 {
    const distance = anchor.distanceTo(desired);
    const steps = Math.max(1, Math.ceil(distance / .12));
    target.copy(anchor);
    for (let i = 1; i <= steps; i++) {
      this.cameraSphere.center.lerpVectors(anchor, desired, i / steps);
      if (this.tree.sphereIntersect(this.cameraSphere)) break;
      target.copy(this.cameraSphere.center);
    }
    return target;
  }

  dispose(): void { this.tree.clear(); }
}
