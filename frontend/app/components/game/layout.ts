/**
 * Géométrie de la table et des mains.
 *
 * Tout ce qui touche à la disposition vit ici, paramétré par l'angle du siège :
 * la main locale et celle d'un adversaire ne diffèrent que par cet angle.
 */

export type Vec3 = [number, number, number];

/* ------------------------------------------------------------------ */
/*  La table                                                          */
/* ------------------------------------------------------------------ */

/** La pile de défausse et la pioche, posées sur la table. */
export const DISCARD_WORLD: Vec3 = [0, 0, 0];
export const DECK_WORLD: Vec3 = [7, 0, 0];

/** Une carte se pose juste au-dessus d'une pile, jamais dedans. */
const DROP_HEIGHT = 0.15;

const above = ([x, y, z]: Vec3): Vec3 => [x, y + DROP_HEIGHT, z];

/* ------------------------------------------------------------------ */
/*  Les sièges                                                        */
/* ------------------------------------------------------------------ */

/** Distance entre le centre de la table et une main. */
export const SEAT_RADIUS = 16;
/** Hauteur à laquelle une main flotte au-dessus de la table. */
export const SEAT_HEIGHT = 4;
/** Inclinaison de l'éventail vers son joueur. */
export const HAND_TILT = -Math.PI / 8;

/** Position de la main dans le repère de son siège. */
export const HAND_LOCAL_POS: Vec3 = [0, SEAT_HEIGHT, SEAT_RADIUS];

/**
 * Angle d'un siège autour de la table. Le siège 0 est celui du joueur local,
 * face à la caméra ; `offset` est le nombre de sièges qui l'en séparent.
 */
export function seatAngle(offset: number, playerCount: number): number {
  return playerCount > 0 ? (offset * 2 * Math.PI) / playerCount : 0;
}

/* ------------------------------------------------------------------ */
/*  Repères                                                           */
/* ------------------------------------------------------------------ */

/** Rotation d'un vecteur de -angle autour de Y (monde -> repère du siège). */
function worldDirToSeat([x, y, z]: Vec3, angle: number): Vec3 {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return [x * cos - z * sin, y, x * sin + z * cos];
}

/** Rotation d'un vecteur de -HAND_TILT autour de X (siège -> repère de la main). */
function seatDirToHand([x, y, z]: Vec3): Vec3 {
  const a = -HAND_TILT;
  return [
    x,
    y * Math.cos(a) - z * Math.sin(a),
    y * Math.sin(a) + z * Math.cos(a),
  ];
}

/** Direction du monde exprimée dans le repère local d'une main. */
function worldDirToHand(dir: Vec3, angle: number): Vec3 {
  return seatDirToHand(worldDirToSeat(dir, angle));
}

/**
 * Position du monde exprimée dans le repère local d'une main. Nécessaire parce
 * que la défausse et la pioche sont posées dans le monde, alors que les cartes
 * animées sont enfants du groupe main.
 */
function worldPosToHand([x, y, z]: Vec3, angle: number): Vec3 {
  const [sx, sy, sz] = worldDirToSeat([x, y, z], angle);
  return seatDirToHand([
    sx - HAND_LOCAL_POS[0],
    sy - HAND_LOCAL_POS[1],
    sz - HAND_LOCAL_POS[2],
  ]);
}

/** Une carte posée à plat : -PI/2 dans le monde, donc -PI/2 - tilt en local. */
export const FLAT_ROT: Vec3 = [-Math.PI / 2 - HAND_TILT, 0, 0];

/**
 * Les cibles d'un vol, vues depuis un siège donné. Une carte jouée depuis un
 * siège tourné se pose donc sur la défausse avec l'orientation de ce siège.
 */
export type HandFrame = {
  angle: number;
  discard: Vec3;
  deck: Vec3;
  /** "Vers le haut du monde", exprimé dans le repère de la main. */
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
/*  L'éventail                                                        */
/* ------------------------------------------------------------------ */

const STEPS_POSITION = [1, 2, -2, -1];
const STEPS_ROTATION = [-2, -1, 1, 2];

/** Rang de chaque carte de gauche à droite dans l'éventail. */
export const FAN_RANK: number[] = STEPS_POSITION.map(
  (sp) => STEPS_POSITION.filter((other) => other < sp).length,
);

/**
 * Ordre d'empilement : plus une carte est à droite, plus elle est devant. Sans
 * ce décalage les quatre cartes sont coplanaires et se disputent le depth
 * buffer sur leurs zones de chevauchement.
 */
const Z_STEP = 0.03;

export const REST_POS: Vec3[] = STEPS_POSITION.map((sp, i) => [
  1.1 * sp,
  0.5 * (Math.abs(STEPS_ROTATION[i]) - 1),
  FAN_RANK[i] * Z_STEP,
]);

export const REST_ROT: Vec3[] = STEPS_ROTATION.map((sr) => [
  0,
  Math.PI / 128,
  Math.PI / (sr * 6),
]);

/**
 * Survol : la carte monte, avance vers son joueur — donc devant toutes les
 * autres, dont le Z max vaut 3 * Z_STEP — et se redresse à moitié.
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
/*  L'arc de vol                                                      */
/* ------------------------------------------------------------------ */

/**
 * Une carte en vol suit une Bézier quadratique dont le point de contrôle est
 * décalé vers le haut du monde, d'où la hauteur ci-dessous.
 */
const ARC_HEIGHT = 9;

/**
 * Poids du point de contrôle dans une Bézier quadratique : nul aux deux bouts,
 * maximal au milieu. Clampé parce que le ressort dépasse un peu 1 en fin de
 * course, ce qui ferait plonger la carte sous la table.
 */
export const arcWeight = (t: number) => Math.max(0, 2 * (1 - t) * t);
