/**
 * Geometry of the table and of the hands.
 *
 * Everything to do with layout lives here, parameterised by the seat angle:
 * the local hand and an opponent's differ only by that angle.
 */

export type Vec3 = [number, number, number];

/* ------------------------------------------------------------------ */
/*  The table                                                         */
/* ------------------------------------------------------------------ */

/** The discard pile and the deck, sitting on the table. */
export const DISCARD_WORLD: Vec3 = [0, 0, 0];
export const DECK_WORLD: Vec3 = [7, 0.5, 0];

/** A card lands just above a pile, never inside it. */
const DROP_HEIGHT = 0.15;

const above = ([x, y, z]: Vec3): Vec3 => [x, y + DROP_HEIGHT, z];

/* ------------------------------------------------------------------ */
/*  The seats                                                         */
/* ------------------------------------------------------------------ */

/** Distance between the centre of the table and a hand. */
export const SEAT_RADIUS = 16;
/** Height at which a hand floats above the table. */
export const SEAT_HEIGHT = 4;
/** Tilt of the fan towards its player. */
export const HAND_TILT = -Math.PI / 8;

/** Position of the hand in its seat's frame. */
export const HAND_LOCAL_POS: Vec3 = [0, SEAT_HEIGHT, SEAT_RADIUS];

/**
 * Angle of a seat around the table. Seat 0 is the local player's, facing the
 * camera; `offset` is the number of seats between the two.
 */
export function seatAngle(offset: number, playerCount: number): number {
  return playerCount > 0 ? (offset * 2 * Math.PI) / playerCount : 0;
}

/* ------------------------------------------------------------------ */
/*  Frames                                                            */
/* ------------------------------------------------------------------ */

/** Rotates a vector by -angle around Y (world -> seat frame). */
function worldDirToSeat([x, y, z]: Vec3, angle: number): Vec3 {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return [x * cos - z * sin, y, x * sin + z * cos];
}

/** Rotates a vector by -HAND_TILT around X (seat -> hand frame). */
function seatDirToHand([x, y, z]: Vec3): Vec3 {
  const a = -HAND_TILT;
  return [
    x,
    y * Math.cos(a) - z * Math.sin(a),
    y * Math.sin(a) + z * Math.cos(a),
  ];
}

/** A world direction expressed in a hand's local frame. */
function worldDirToHand(dir: Vec3, angle: number): Vec3 {
  return seatDirToHand(worldDirToSeat(dir, angle));
}

/**
 * A world position expressed in a hand's local frame. Needed because the
 * discard pile and the deck sit in world space, while the animated cards are
 * children of the hand group.
 */
function worldPosToHand([x, y, z]: Vec3, angle: number): Vec3 {
  const [sx, sy, sz] = worldDirToSeat([x, y, z], angle);
  return seatDirToHand([
    sx - HAND_LOCAL_POS[0],
    sy - HAND_LOCAL_POS[1],
    sz - HAND_LOCAL_POS[2],
  ]);
}

/** A card lying flat: -PI/2 in the world, so -PI/2 - tilt in local space. */
export const FLAT_ROT: Vec3 = [-Math.PI / 2 - HAND_TILT, 0, 0];

/**
 * The targets of a flight, seen from a given seat. A card played from a turned
 * seat therefore lands on the discard pile with that seat's orientation.
 */
export type HandFrame = {
  angle: number;
  discard: Vec3;
  deck: Vec3;
  /** "Towards world up", expressed in the hand's frame. */
  arcUp: Vec3;
};

export function handFrame(angle: number): HandFrame {
  return {
    angle,
    discard: worldPosToHand(above(DISCARD_WORLD), angle),
    deck: worldPosToHand(above(DECK_WORLD), angle),
    arcUp: worldDirToHand([0, ARC_HEIGHT, 0], angle),
  };
}

/* ------------------------------------------------------------------ */
/*  The fan                                                           */
/* ------------------------------------------------------------------ */

const STEPS_POSITION = [0.8, 2, -2, -0.8];
const STEPS_ROTATION = [-2, -0.6, 0.6, 2];

/** Rank of each card from left to right in the fan. */
export const FAN_RANK: number[] = STEPS_POSITION.map(
  (sp) => STEPS_POSITION.filter((other) => other < sp).length,
);

/**
 * Stacking order: the further right a card sits, the further forward it is.
 * Without this offset the four cards are coplanar and fight over the depth
 * buffer wherever they overlap.
 */
const Z_STEP = 0.03;

export const REST_POS: Vec3[] = STEPS_POSITION.map((sp, i) => [
  1.5 * sp,
  0.8 * (Math.abs(STEPS_ROTATION[i]) - 1),
  FAN_RANK[i] * Z_STEP,
]);

export const REST_ROT: Vec3[] = STEPS_ROTATION.map((sr) => [
  0,
  Math.PI / 128,
  Math.PI / (sr * 7),
]);

/**
 * Hover: the card rises, moves towards its player — so in front of all the
 * others, whose max Z is 3 * Z_STEP — and straightens up halfway.
 */
const HOVER_LIFT = 0.7;
const HOVER_FORWARD = 0.9;
const HOVER_STRAIGHTEN = 0.5;

export const HOVER_POS: Vec3[] = REST_POS.map(([x, y, z]) => [
  x,
  y + HOVER_LIFT,
  z + HOVER_FORWARD,
]);

export const HOVER_ROT: Vec3[] = REST_ROT.map(([x, y, z]) => [
  x,
  y,
  z * HOVER_STRAIGHTEN,
]);

/* ------------------------------------------------------------------ */
/*  The flight arc                                                    */
/* ------------------------------------------------------------------ */

/**
 * A card in flight follows a quadratic Bézier whose control point is offset
 * towards world up, hence the height below.
 */
const ARC_HEIGHT = 12;

/**
 * Weight of the control point in a quadratic Bézier: zero at both ends, max in
 * the middle. Clamped because the spring overshoots 1 slightly at the end of
 * its travel, which would send the card diving under the table.
 */
export const arcWeight = (t: number) => Math.max(0, 2 * (1 - t) * t);
