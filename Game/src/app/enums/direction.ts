export enum Direction{
  UP,
  DOWN,
  LEFT,
  RIGHT,

  NORTH,
  SOUTH,
  EAST,
  WEST
}

export const KEY_TO_DIRECTION: Record<string, Direction> = {
  'w': Direction.UP,
  's': Direction.DOWN,
  'a': Direction.LEFT,
  'd': Direction.RIGHT
};

export const KEY_TO_DIRECTION2: Record<string, Direction> = {
  'arrowup': Direction.UP,
  'arrowdown': Direction.DOWN,
  'arrowleft': Direction.LEFT,
  'arrowright': Direction.RIGHT
};

export const OPPOSITE_DIRECTION: Record<Direction, Direction> = {
  [Direction.UP]: Direction.DOWN,
  [Direction.DOWN]: Direction.UP,
  [Direction.LEFT]: Direction.RIGHT,
  [Direction.RIGHT]: Direction.LEFT,

  [Direction.NORTH]: Direction.SOUTH,
  [Direction.SOUTH]: Direction.NORTH,
  [Direction.WEST]: Direction.EAST,
  [Direction.EAST]: Direction.WEST
};

export const COLLISION_BLOCKS_MOVEMENT: Record<Direction, Direction> = {
  [Direction.NORTH]: Direction.DOWN,
  [Direction.SOUTH]: Direction.UP,
  [Direction.WEST]: Direction.RIGHT,
  [Direction.EAST]: Direction.LEFT,

  [Direction.UP]: Direction.UP,
  [Direction.DOWN]: Direction.DOWN,
  [Direction.LEFT]: Direction.LEFT,
  [Direction.RIGHT]: Direction.RIGHT
};