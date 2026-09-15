import assert from "node:assert/strict";
import test from "node:test";
import * as THREE from "three";
import { loadTs, scheduler } from "./helpers/game-harness.mjs";

const { PlayerController } = loadTs("lib/game/player/PlayerController.ts");
const { CollisionWorld } = loadTs("lib/game/world/CollisionWorld.ts");
const { ThirdPersonCamera } = loadTs("lib/game/player/ThirdPersonCamera.ts");
const { FrameLoop } = loadTs("lib/game/core/FrameLoop.ts");
const IDLE = { x: 0, forward: 0, sprint: false, jump: false, dodge: false, lookX: 0, lookY: 0 };
const command = values => ({ ...IDLE, ...values });

function sceneFixture(t, blocks = [], floorSize = 50) {
  const scene = new THREE.Group(), material = new THREE.MeshBasicMaterial();
  const addBox = (x, y, z, w, h, d, rotation = 0) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
    mesh.position.set(x, y, z); mesh.rotation.x = rotation; scene.add(mesh);
  };
  addBox(0, -.5, 0, floorSize, 1, floorSize);
  for (const block of blocks) addBox(...block);
  const world = new CollisionWorld(scene), player = new PlayerController(world);
  t.after(() => { world.dispose(); material.dispose(); scene.traverse(node => node.geometry?.dispose()); });
  return { world, player, scene };
}
function place(player, x, y, z) {
  const offset = new THREE.Vector3(x, y, z).sub(player.position);
  player.collider.translate(offset); player.position.add(offset); player.previousPosition.copy(player.position);
  player.velocity.set(0, 0, 0); player.grounded = false;
}
function run(player, seconds, input = IDLE, yaw = 0) {
  for (let i = 0; i < Math.round(seconds * 60); i++) player.update(1 / 60, input, yaw);
}
function settle(player) { run(player, .5); assert.equal(player.grounded, true); }

test("grounding, acceleration, sprint and release produce bounded responsive movement", t => {
  const { player } = sceneFixture(t); settle(player);
  assert.ok(Math.abs(player.position.y) < .01);
  player.update(1 / 60, command({ forward: 1 }), 0);
  assert.ok(-player.velocity.z > 0 && -player.velocity.z < 5.2);
  run(player, .5, command({ forward: 1 }));
  assert.ok(Math.abs(player.velocity.z + 5.2) < .05);
  run(player, .5, command({ forward: 1, sprint: true }));
  assert.ok(Math.abs(player.velocity.z + 8.5) < .05);
  assert.equal(player.state, "SPRINTING");
  run(player, .5);
  assert.ok(Math.hypot(player.velocity.x, player.velocity.z) < .03);
  assert.equal(player.state, "IDLE");
});

test("diagonal normalization and camera-relative motion are independent of facing", t => {
  const a = sceneFixture(t).player, b = sceneFixture(t).player;
  settle(a); settle(b);
  const startA = a.position.clone(), startB = b.position.clone();
  run(a, 1, command({ forward: 1 }));
  run(b, 1, command({ forward: 1, x: 1 }));
  assert.ok(Math.abs(a.position.distanceTo(startA) - b.position.distanceTo(startB)) < .01);
  const c = sceneFixture(t).player; settle(c);
  run(c, .5, command({ forward: 1 }), Math.PI / 2);
  assert.ok(c.position.x < -1);
  assert.ok(Math.abs(c.position.z - 10) < .01);
  const facing = c.facing;
  run(c, .5, IDLE, -Math.PI / 2);
  assert.equal(c.facing, facing);
});

test("jump leaves the floor, cannot double-jump and lands; a ceiling stops ascent", t => {
  const { player } = sceneFixture(t); settle(player);
  player.update(1 / 60, command({ jump: true }), 0);
  assert.equal(player.state, "JUMPING");
  assert.equal(player.grounded, false);
  let peak = 0;
  for (let i = 0; i < 35; i++) {
    player.update(1 / 60, command({ jump: i === 10 }), 0);
    peak = Math.max(peak, player.position.y);
  }
  assert.ok(peak > 1.3 && peak < 1.65, `jump peak ${peak}`);
  run(player, .5); assert.equal(player.grounded, true);
  const low = sceneFixture(t, [[0, 2.4, 10, 4, .2, 4]]).player; settle(low);
  low.update(1 / 60, command({ jump: true }), 0);
  let lowPeak = 0;
  for (let i = 0; i < 30; i++) { low.update(1 / 60, IDLE, 0); lowPeak = Math.max(lowPeak, low.position.y); }
  assert.ok(lowPeak <= .51, `ceiling peak ${lowPeak}`);
  assert.equal(low.grounded, true);
});

test("jump buffering lands then jumps, and coyote time expires after leaving a ledge", t => {
  const { player } = sceneFixture(t); place(player, 0, .08, 10);
  player.velocity.y = -2;
  player.update(1 / 60, command({ jump: true }), 0);
  run(player, .1);
  assert.ok(player.velocity.y > 0 && player.position.y > .2);
  const ledge = sceneFixture(t, [], 4).player; place(ledge, 0, .02, 0); settle(ledge);
  for (let i = 0; i < 180 && ledge.grounded; i++) ledge.update(1 / 60, command({ forward: 1 }), 0);
  assert.equal(ledge.grounded, false);
  ledge.update(1 / 60, command({ jump: true }), 0);
  assert.ok(ledge.velocity.y > 0, "coyote jump");
  const late = sceneFixture(t, [], 4).player; place(late, 0, .02, 0); settle(late);
  for (let i = 0; i < 180 && late.grounded; i++) late.update(1 / 60, command({ forward: 1 }), 0);
  assert.equal(late.grounded, false);
  run(late, .2, command({ forward: 1 }));
  late.update(1 / 60, command({ jump: true }), 0);
  assert.ok(late.velocity.y < 0, "expired coyote window");
});

test("dodge cannot cross a thin wall and repeated presses respect its cooldown", t => {
  const { player } = sceneFixture(t, [[0, 2, 8, 8, 4, .04]]); settle(player);
  player.update(1 / 60, command({ forward: 1, dodge: true }), 0);
  assert.equal(player.state, "DODGING");
  run(player, .35, command({ forward: 1, dodge: true }));
  assert.ok(player.position.z >= 8.37, `thin wall z=${player.position.z}`);
  assert.ok(player.dodgeCooldown > .5 && player.dodgeCooldown < .7);
  assert.notEqual(player.state, "DODGING");
  assert.ok(player.position.y < .02, "wall cannot be climbed by dodging");
});

test("walls slide, low steps climb, and high steps block", t => {
  const { player } = sceneFixture(t, [[0, 2, 8, 20, 4, .1]]); settle(player);
  run(player, 1.5, command({ forward: 1, x: 1 }));
  assert.ok(player.position.x > 4);
  assert.ok(player.position.z > 8.4);
  const step = sceneFixture(t, [[0, .1, 6, 5, .2, 3]]).player; settle(step);
  run(step, .7, command({ forward: 1 }));
  assert.ok(step.position.z < 7.5, `low step z=${step.position.z}`);
  assert.ok(Math.abs(step.position.y - .2) < .03, `low step y=${step.position.y}`);
  const high = sceneFixture(t, [[0, .7, 6, 5, 1.4, 3]]).player; settle(high);
  run(high, 1.3, command({ forward: 1 }));
  assert.ok(high.position.z > 7.8);
  assert.ok(high.position.y < .03);
});

test("Archive Zero ramps connect the floor and elevated galleries in both directions", t => {
  const { BreachArena } = loadTs("lib/game/world/BreachArena.ts");
  const arena = new BreachArena(), world = new CollisionWorld(arena.solids), player = new PlayerController(world);
  t.after(() => { world.dispose(); arena.dispose(); });
  place(player, 13.3, .04, 14); settle(player);
  run(player, 2.7, command({ forward: 1 }));
  assert.ok(player.position.z < 3.4, `gallery z=${player.position.z}`);
  assert.ok(player.position.y > 2.98 && player.position.y < 3.2, `gallery y=${player.position.y}`);
  assert.equal(player.grounded, true);
  run(player, 2.7, command({ forward: -1 }));
  assert.ok(player.position.z > 12.5);
  assert.ok(player.position.y < .05, `ramp descent y=${player.position.y}`);
  assert.equal(player.grounded, true);
});

test("steep slopes are not climbable and falling returns to the entrance", t => {
  const { player } = sceneFixture(t, [[0, 2.5, 5, 5, .2, 6, Math.PI / 3]]); settle(player);
  run(player, 1.5, command({ forward: 1, sprint: true }));
  assert.ok(player.position.y < .5, `steep slope y=${player.position.y}`);
  const resets = player.resets;
  place(player, 40, -11, 0);
  player.velocity.y = -20;
  run(player, .2);
  assert.equal(player.resets, resets + 1);
  assert.ok(Math.abs(player.position.x) < .001 && Math.abs(player.position.z - 10) < .001);
});

test("fixed simulation gives the same movement at 30, 60 and 144 Hz rendering", t => {
  const positions = [];
  for (const hz of [30, 60, 144]) {
    const { player } = sceneFixture(t); settle(player);
    const frames = scheduler();
    const loop = new FrameLoop(frames, dt => player.update(dt, command({ forward: 1, x: 1 }), 0), () => {}, assert.fail);
    loop.start(); frames.tick(0);
    for (let i = 1; i <= hz * 2; i++) frames.tick(i * 1000 / hz);
    positions.push(player.position.clone()); loop.stop();
  }
  for (const pos of positions) assert.ok(pos.distanceTo(positions[0]) < .001);
});

test("camera orbits independently, clamps pitch and retracts before wall geometry", t => {
  const { world } = sceneFixture(t, [[0, 2, 3, 8, 4, .1]]);
  const camera = new THREE.PerspectiveCamera(60, 1.7, .08, 180);
  const follow = new ThirdPersonCamera(camera, world, new THREE.Vector3());
  assert.ok(camera.position.z < 2.75, `camera behind wall ${camera.position.z}`);
  follow.look(300, 1e6); assert.ok(follow.pitch <= 1.12);
  follow.look(0, -1e6); assert.ok(follow.pitch >= -.25);
  assert.ok(Math.abs(follow.yaw) > .5);
  for (let i = 0; i < 60; i++) {
    follow.update(1 / 60, new THREE.Vector3(-2, 0, 0)); follow.render(.5);
    assert.ok(camera.position.y > .2, "camera stays above floor");
  }
});

function inputHarness() {
  const frames = [], listeners = new Map();
  class Target extends EventTarget {
    addEventListener(name, fn) { super.addEventListener(name, fn); listeners.set(fn, this); }
    removeEventListener(name, fn) { super.removeEventListener(name, fn); listeners.delete(fn); }
  }
  const canvas = new Target(), document = new Target();
  document.activeElement = canvas;
  document.pointerLockElement = null;
  let paused = 0, unlocked = 0;
  canvas.focus = () => { document.activeElement = canvas; };
  document.exitPointerLock = () => { unlocked++; document.pointerLockElement = null; document.dispatchEvent(new Event("pointerlockchange")); };
  const { PlayerInput } = loadTs("lib/game/player/PlayerInput.ts", {}, { document });
  const input = new PlayerInput(canvas, () => { paused++; input.setActive(false); }, (...args) => frames.push(args));
  input.setActive(true);
  const dispatch = (target, type, values = {}) => {
    const e = new Event(type, { cancelable: true }); Object.assign(e, values); target.dispatchEvent(e); return e;
  };
  return { input, canvas, document, dispatch, frames, listeners, get paused() { return paused; }, get unlocked() { return unlocked; } };
}

test("input only consumes focused game keys and jump/dodge are edge-triggered", () => {
  const h = inputHarness();
  const press = (code, repeat = false) => h.dispatch(h.document, "keydown", { code, repeat });
  assert.equal(press("KeyW").defaultPrevented, true);
  assert.equal(h.input.sample().forward, 1);
  press("Space"); assert.equal(h.input.sample().jump, true);
  press("Space", true); assert.equal(h.input.sample().jump, false);
  press("KeyC"); assert.equal(h.input.sample().dodge, true);
  assert.equal(h.input.sample().dodge, false);
  h.input.clear(); h.document.activeElement = {};
  assert.equal(press("KeyW").defaultPrevented, false);
  assert.equal(h.input.sample().forward, 0);
  h.document.activeElement = h.canvas; press("KeyW"); press("Tab");
  assert.equal(h.paused, 1); assert.equal(h.input.sample().forward, 0);
  h.input.dispose(); assert.equal(h.listeners.size, 0);
});

test("losing mouse capture pauses, clears held keys, and disposal releases only its own lock", () => {
  const h = inputHarness();
  h.document.pointerLockElement = h.canvas; h.dispatch(h.document, "pointerlockchange");
  h.dispatch(h.document, "keydown", { code: "KeyW" });
  h.document.pointerLockElement = null; h.dispatch(h.document, "pointerlockchange");
  assert.equal(h.paused, 1); assert.equal(h.input.sample().forward, 0);
  h.input.setActive(true); h.document.pointerLockElement = {};
  h.input.dispose(); assert.equal(h.unlocked, 0); assert.equal(h.listeners.size, 0);
});

test("denied mouse capture supports drag camera without consuming unrelated mouse motion", () => {
  const h = inputHarness(); h.canvas.requestPointerLock = () => { throw new Error("denied"); };
  h.dispatch(h.canvas, "click"); assert.deepEqual(h.frames.at(-1), [false, true]);
  h.dispatch(h.document, "mousemove", { movementX: 50, movementY: 10 }); assert.equal(h.input.sample().lookX, 0);
  h.dispatch(h.canvas, "mousedown", { button: 0 });
  h.dispatch(h.document, "mousemove", { movementX: 50, movementY: 10 }); assert.equal(h.input.sample().lookX, 50);
  h.dispatch(h.document, "mouseup"); h.dispatch(h.document, "mousemove", { movementX: 50 });
  assert.equal(h.input.sample().lookX, 0); h.input.dispose();
});

test("a pending pointer-lock promise cannot retain mouse capture after disposal", async () => {
  const h = inputHarness(); let resolve;
  h.canvas.requestPointerLock = () => new Promise(done => { resolve = done; });
  h.dispatch(h.canvas, "click"); h.input.dispose();
  h.document.pointerLockElement = h.canvas; resolve();
  await new Promise(setImmediate);
  assert.equal(h.unlocked, 1); assert.equal(h.listeners.size, 0);
});

test("input listener cleanup completes even if the document rejects mouse unlock", () => {
  const h = inputHarness();
  h.document.pointerLockElement = h.canvas;
  h.document.exitPointerLock = () => { throw new Error("inactive document"); };
  h.input.dispose();
  assert.equal(h.listeners.size, 0);
});
