import { PerspectiveCamera, Vector3 } from "three";
import type { CollisionWorld } from "../world/CollisionWorld";

export class ThirdPersonCamera {
  yaw = 0;
  pitch = .23;
  private anchor = new Vector3();
  private previousAnchor = new Vector3();
  private eye = new Vector3();
  private previousEye = new Vector3();
  private desired = new Vector3();
  private safe = new Vector3();
  private renderAnchor = new Vector3();
  private renderEye = new Vector3();
  private target = new Vector3();

  constructor(private camera: PerspectiveCamera, private world: CollisionWorld, position: Vector3) {
    this.reset(position);
  }

  look(x: number, y: number): void {
    this.yaw -= x * .0024;
    this.yaw = Math.atan2(Math.sin(this.yaw), Math.cos(this.yaw));
    this.pitch = Math.max(-.25, Math.min(1.12, this.pitch + y * .0024));
  }

  reset(position: Vector3): void {
    this.yaw = 0;
    this.pitch = .23;
    this.anchor.copy(position).y += 1.35;
    this.placeDesired();
    this.world.constrainCamera(this.anchor, this.desired, this.eye);
    this.previousAnchor.copy(this.anchor);
    this.previousEye.copy(this.eye);
    this.render(1);
  }

  private placeDesired(): void {
    const distance = 5.5, horizontal = Math.cos(this.pitch) * distance;
    this.desired.set(Math.sin(this.yaw) * horizontal, Math.sin(this.pitch) * distance, Math.cos(this.yaw) * horizontal).add(this.anchor);
  }

  update(delta: number, position: Vector3): void {
    this.previousAnchor.copy(this.anchor);
    this.previousEye.copy(this.eye);
    this.target.copy(position).y += 1.35;
    // Keep the pivot inside the player capsule; smoothing it across a corner can put it in a wall.
    this.anchor.copy(this.target);
    this.placeDesired();
    this.world.constrainCamera(this.anchor, this.desired, this.safe);
    // Retract immediately near geometry; only the outward recovery is smoothed.
    if (this.safe.distanceToSquared(this.anchor) < this.eye.distanceToSquared(this.anchor)) this.eye.copy(this.safe);
    else this.eye.lerp(this.safe, 1 - Math.exp(-14 * delta));
    this.world.constrainCamera(this.anchor, this.eye, this.safe);
    this.eye.copy(this.safe);
  }

  render(alpha: number): void {
    this.renderAnchor.lerpVectors(this.previousAnchor, this.anchor, alpha);
    this.renderEye.lerpVectors(this.previousEye, this.eye, alpha);
    // The interpolated segment is checked as well, so rounding a corner cannot clip.
    this.world.constrainCamera(this.renderAnchor, this.renderEye, this.camera.position);
    this.camera.lookAt(this.renderAnchor);
  }
}
