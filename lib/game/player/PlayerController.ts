import { Vector3 } from "three";
import { Capsule } from "three/addons/math/Capsule.js";
import type { CollisionWorld } from "../world/CollisionWorld";

export interface PlayerCommand {
  x: number;
  forward: number;
  sprint: boolean;
  jump: boolean;
  dodge: boolean;
  lookX: number;
  lookY: number;
}
export type MovementState = "IDLE" | "RUNNING" | "SPRINTING" | "JUMPING" | "FALLING" | "DODGING";
export interface MovementSnapshot { state: MovementState; dodgeCooldown: number; }

export class PlayerController {
  readonly position = new Vector3();
  readonly previousPosition = new Vector3();
  readonly velocity = new Vector3();
  readonly collider = new Capsule(new Vector3(), new Vector3(), .36);
  grounded = false;
  facing = 0;
  state: MovementState = "IDLE";
  dodgeCooldown = 0;
  private coyote = 0;
  private jumpBuffer = 0;
  private dodgeTime = 0;
  private direction = new Vector3();
  private dodgeDirection = new Vector3();
  private spawn = new Vector3(0, .04, 10);
  resets = 0;

  constructor(private world: CollisionWorld) { this.reset(); }

  reset(): void {
    this.position.copy(this.spawn);
    this.previousPosition.copy(this.position);
    this.collider.start.copy(this.position).y += this.collider.radius;
    this.collider.end.copy(this.position).y += 1.8 - this.collider.radius;
    this.velocity.set(0, 0, 0);
    this.facing = 0;
    this.grounded = false;
    this.coyote = this.jumpBuffer = this.dodgeTime = this.dodgeCooldown = 0;
    this.state = "FALLING";
    this.resets++;
  }

  clearActions(): void { this.jumpBuffer = 0; }

  update(delta: number, command: PlayerCommand, cameraYaw: number): void {
    this.previousPosition.copy(this.position);
    this.coyote = this.grounded ? .1 : Math.max(0, this.coyote - delta);
    this.jumpBuffer = command.jump ? .12 : Math.max(0, this.jumpBuffer - delta);
    this.dodgeCooldown = Math.max(0, this.dodgeCooldown - delta);
    this.dodgeTime = Math.max(0, this.dodgeTime - delta);
    // yaw zero looks toward -Z. Diagonal commands are normalized before acceleration.
    this.direction.set(command.x * Math.cos(cameraYaw) - command.forward * Math.sin(cameraYaw), 0,
      -command.x * Math.sin(cameraYaw) - command.forward * Math.cos(cameraYaw));
    const moving = this.direction.lengthSq() > .001;
    if (moving) this.direction.normalize();
    if (command.dodge && this.grounded && this.dodgeCooldown === 0) {
      this.dodgeTime = .24;
      this.dodgeCooldown = .95;
      this.dodgeDirection.copy(moving ? this.direction : this.direction.set(-Math.sin(this.facing), 0, -Math.cos(this.facing)));
    }
    const dodging = this.dodgeTime > 0;
    if (this.jumpBuffer > 0 && this.coyote > 0 && !dodging) {
      this.velocity.y = 8.6;
      this.grounded = false;
      this.coyote = this.jumpBuffer = 0;
    }
    if (dodging) {
      this.velocity.x = this.dodgeDirection.x * 15;
      this.velocity.z = this.dodgeDirection.z * 15;
    } else {
      const speed = command.sprint ? 8.5 : 5.2;
      const acceleration = this.grounded ? (moving ? 16 : 22) : 5;
      const blend = 1 - Math.exp(-acceleration * delta);
      this.velocity.x += (this.direction.x * (moving ? speed : 0) - this.velocity.x) * blend;
      this.velocity.z += (this.direction.z * (moving ? speed : 0) - this.velocity.z) * blend;
    }
    if (moving || dodging) {
      const dir = dodging ? this.dodgeDirection : this.direction;
      const target = Math.atan2(-dir.x, -dir.z);
      const difference = Math.atan2(Math.sin(target - this.facing), Math.cos(target - this.facing));
      this.facing += difference * (1 - Math.exp(-18 * delta));
    }
    this.velocity.y = Math.max(-35, this.velocity.y - 24 * delta);
    this.grounded = this.world.move(this.collider, this.velocity, delta, this.grounded);
    this.position.copy(this.collider.start).y -= this.collider.radius;
    this.state = dodging ? "DODGING" : !this.grounded ? (this.velocity.y > .1 ? "JUMPING" : "FALLING") :
      Math.hypot(this.velocity.x, this.velocity.z) < .15 ? "IDLE" : command.sprint ? "SPRINTING" : "RUNNING";
    if (this.position.y < -12 || Math.abs(this.position.x) > 60 || Math.abs(this.position.z) > 60) this.reset();
  }
}
