import { readInput, test } from "../utils/index"
import {
  readInputFromSpecialFile,
  readTestFile,
  splitToAllLines,
  splitToLines,
} from "../utils/readInput"

const prepareInput = (rawInput: string) => rawInput

const taskInput = prepareInput(readInput())

enum Direction {
  RIGHT,
  DOWN,
  LEFT,
  UP,
}

interface Position {
  x: number
  y: number
  facing: Direction
}

interface Instruction {
  steps: number
  turnDirection: string
}

const parseMap = (lines: string[]): Map<number, Map<number, string>> => {
  const map = new Map<number, Map<number, string>>()

  lines.forEach((line, index) => {
    map.set(index + 1, new Map())
    const parts = line.split("")
    parts.forEach((part, partIndex) => {
      if (part !== " ") {
        map.get(index + 1).set(partIndex + 1, part)
      }
    })
  })

  return map
}

const parseInstructions = (line: String): Instruction[] => {
  const instructions: Instruction[] = []

  let steps
  let instruction
  line.split("").forEach((elem) => {
    if (elem === "R" || elem === "L") {
      instructions.push({
        steps: Number.parseInt(steps, 10),
        turnDirection: instruction,
      })
      steps = undefined
      instruction = elem
    } else if (steps === undefined) {
      steps = elem
    } else {
      steps += elem
    }
  })
  instructions.push({
    steps: Number.parseInt(steps, 10),
    turnDirection: instruction,
  })

  return instructions
}

const getStartPosition = (map: Map<number, Map<number, string>>): Position => {
  for (let y = 1; y < map.size + 1; y++) {
    for (let x = 1; x < Array.from(map.get(y).keys()).sort((a, b) => b - a)[0]; x++) {
      if (map.get(y).has(x) && map.get(y).get(x) !== "#") {
        return {
          x,
          y,
          facing: Direction.RIGHT,
        }
      }
    }
  }

  throw new Error("Couldn't find any start position")
}

const moveOnMap = (
  position: Position,
  map: Map<number, Map<number, string>>,
  steps: number
): Position => {
  let hitWall = false
  const newPosition = {
    x: position.x,
    y: position.y,
    facing: position.facing,
  }

  switch (position.facing) {
    case Direction.RIGHT:
      for (let i = 0; i < steps && !hitWall; i++) {
        if (map.get(newPosition.y).has(newPosition.x + 1)) {
          if (map.get(newPosition.y).get(newPosition.x + 1) === "#") {
            hitWall = true
          } else {
            newPosition.x = newPosition.x + 1
          }
        } else {
          const firstX = Array.from(map.get(newPosition.y).keys()).sort((a, b) => a - b)[0]
          if (map.get(newPosition.y).get(firstX) === "#") {
            hitWall = true
          } else {
            newPosition.x = firstX
          }
        }
      }
      break
    case Direction.DOWN:
      for (let i = 0; i < steps && !hitWall; i++) {
        if (map.has(newPosition.y + 1) && map.get(newPosition.y + 1).has(newPosition.x)) {
          if (map.get(newPosition.y + 1).get(newPosition.x) === "#") {
            hitWall = true
          } else {
            newPosition.y = newPosition.y + 1
          }
        } else {
          const firstYWithX = Array.from(map.keys())
            .filter((key) => map.get(key).has(newPosition.x))
            .sort((a, b) => a - b)[0]
          if (map.get(firstYWithX).get(newPosition.x) === "#") {
            hitWall = true
          } else {
            newPosition.y = firstYWithX
          }
        }
      }
      break
    case Direction.LEFT:
      for (let i = 0; i < steps && !hitWall; i++) {
        if (map.get(newPosition.y).has(newPosition.x - 1)) {
          if (map.get(newPosition.y).get(newPosition.x - 1) === "#") {
            hitWall = true
          } else {
            newPosition.x = newPosition.x - 1
          }
        } else {
          const lastX = Array.from(map.get(newPosition.y).keys()).sort((a, b) => b - a)[0]
          if (map.get(newPosition.y).get(lastX) === "#") {
            hitWall = true
          } else {
            newPosition.x = lastX
          }
        }
      }
      break
    case Direction.UP:
      for (let i = 0; i < steps && !hitWall; i++) {
        if (map.has(newPosition.y - 1) && map.get(newPosition.y - 1).has(newPosition.x)) {
          if (map.get(newPosition.y - 1).get(newPosition.x) === "#") {
            hitWall = true
          } else {
            newPosition.y = newPosition.y - 1
          }
        } else {
          const lastYWithX = Array.from(map.keys())
            .filter((key) => map.get(key).has(newPosition.x))
            .sort((a, b) => b - a)[0]
          if (map.get(lastYWithX).get(newPosition.x) === "#") {
            hitWall = true
          } else {
            newPosition.y = lastYWithX
          }
        }
      }
      break
    // no default
  }

  return newPosition
}

const updateFacing = (position: Position, turnDirection: string): Position => {
  switch (turnDirection) {
    case "R":
      return {
        x: position.x,
        y: position.y,
        facing: position.facing + 1 > 3 ? 0 : position.facing + 1,
      }
    case "L":
      return {
        x: position.x,
        y: position.y,
        facing: position.facing - 1 < 0 ? 3 : position.facing - 1,
      }
    case undefined:
      return {
        x: position.x,
        y: position.y,
        facing: position.facing,
      }
    // no default
  }

  throw new Error("Unknown turnDirection")
}

const goA = (input) => {
  const lines = splitToLines(input)

  const map = parseMap(lines.slice(0, lines.length - 1))
  const instructions = parseInstructions(lines[lines.length - 1])

  let position = getStartPosition(map)

  instructions.forEach((instruction) => {
    position = updateFacing(position, instruction.turnDirection)
    position = moveOnMap(position, map, instruction.steps)
  })

  return position.y * 1000 + position.x * 4 + position.facing
}

type State = [number, number, Direction]
type MoveFn = (pos: State, p: Problem) => State

const goB = (input) => {
  const lines = splitToAllLines(input)
  let i = 0
  let p2 = 0

  while (i < lines.length) {
    let grid = []
    while (lines[i] !== "" && i < lines.length) {
      grid.push(lines[i])
      i++
    }
    if (grid.length === 0) {
      break
    }
    i++ // empty line
    const pass = lines[i++]

    // setup map
    const maxL = grid.reduce((acc, line) => Math.max(acc, line.length), 0)
    grid = grid.map((line) => line.padEnd(maxL, " "))

    const inst = pass?.split(/([RL])/)!
    const x = 0
    let y = 0
    const d = Direction.RIGHT
    while (grid[x][y] === " ") {
      y++
    }
    const p = makeProb(grid)

    const [xf, yf, ff] = walk(x, y, d, inst, p, moveOnCube)
    const ans2 = 1000 * (xf + 1) + 4 * (yf + 1) + ff
    p2 += ans2
    i += 1 // empty line
  }

  return p2
}

// Task 2 taken from https://gist.github.com/rkirov/ed5209744c37d5541e0941f628ede0b6 and adjusted

// Rotations
enum R {
  I, // Identity
  R, // Rotate 90 CW
  H, // Rotate 180
  L, // Rotate 90 CCW
}

function rotD(f: Direction, r: R) {
  return (f + r) % 4
}

function move(x: number, y: number, f: Direction) {
  switch (f) {
    case Direction.RIGHT:
      return [x, y + 1]
    case Direction.DOWN:
      return [x + 1, y]
    case Direction.LEFT:
      return [x, y - 1]
    case Direction.UP:
      return [x - 1, y]

    // no default
  }
}

function mod(x: number, m: number) {
  x %= m
  if (x < 0) x += m
  return x
}

interface Problem {
  // `2d face name,direction` -> [new map face name, rotation]
  transitions: Map<string, [string, R]>
  // cube edge width, faces are M x M
  M: number
  // original map with dimensions
  map: string[]
  xMax: number
  yMax: number
}

/*
 * Description of a face using 3d vertices in {0,1}^3 coordinates.
 * {0,1}^3 coordinates are represented as numbers b000(0) to b111(7).
 */
interface Face {
  tl: number
  tr: number
  bl: number
  br: number
}

const COORDS: { [bits: number]: string } = { 0: "x", 2: "y", 4: "z" }
function faceName3d(face: Face): string {
  let mask = 1
  while (mask < 8) {
    const seen = new Set<number>()
    seen.add(mask & face.tl)
    seen.add(mask & face.tr)
    seen.add(mask & face.bl)
    seen.add(mask & face.br)

    // two dimensions will see both 0 and 1, the third will see only one.
    if (seen.size === 1) {
      return `${COORDS[mask]} = ${[...seen][0] ? 1 : 0}`
    }
    mask = mask << 1
  }
  throw new Error("faceName3d: no mask found")
}

/**
 * The most magical function in the program. Given the 4 verices of a face, using numbers b000(0) to b111(7)
 * we can use bit operations to get the 4 vertices of any adjacent face in direction d.
 *
 * The general observation is that any vertex plus its three neighbors add up to b111(7) in F2^3 arithmetic.
 *
 * When moving to an adjecent face, 2 of the vertices are relabeling of the original ones,
 * and the other 2 can be computed using the above observation.
 */
function transitionFaceIn3d(face: Face, d: Direction): Face {
  switch (d) {
    case Direction.RIGHT:
      return {
        tl: face.tr,
        bl: face.br,
        tr: 7 ^ face.tr ^ face.tl ^ face.br,
        br: 7 ^ face.br ^ face.bl ^ face.tr,
      }
    case Direction.LEFT:
      // swap r and l from above.
      return {
        tr: face.tl,
        br: face.bl,
        tl: 7 ^ face.tl ^ face.tr ^ face.bl,
        bl: 7 ^ face.bl ^ face.br ^ face.tl,
      }
    case Direction.DOWN:
      return {
        tl: face.bl,
        tr: face.br,
        bl: 7 ^ face.bl ^ face.tl ^ face.br,
        br: 7 ^ face.br ^ face.tr ^ face.bl,
      }
    case Direction.UP:
      // swap u and d from above.
      return {
        bl: face.tl,
        br: face.tr,
        tl: 7 ^ face.tl ^ face.bl ^ face.tr,
        tr: 7 ^ face.tr ^ face.br ^ face.tl,
      }

    // no default
  }
}

/*
 * assuming we are passing two different orientations of the same face
 * find the rotation to get face to otherFace.
 */
function getRfromFace(face: Face, otherFace: Face): R {
  if (face.tl === otherFace.tl) return R.I
  if (face.tl === otherFace.tr) return R.R
  if (face.tl === otherFace.bl) return R.L
  if (face.tl === otherFace.br) return R.H
  throw new Error(`should not happen ${face.tl} ${otherFace}. Did you check sameFace?`)
}

function makeProb(map: string[]): Problem {
  let c = 0
  for (let i = 0; i < map.length; i++) {
    for (let j = 0; j < map[i].length; j++) {
      if (map[i][j] !== " ") c++
    }
  }
  const M = Math.sqrt(c / 6)
  /*
   * find top left corner of each cube on the map
   * use `${i},${j}` as the canonical 2d map face name.
   */
  const facesMapCoords = new Set<string>()
  for (let i = 0; i < map.length / M; i++) {
    for (let j = 0; j < map[i].length / M; j++) {
      if (map[i * M][j * M] !== " ") {
        facesMapCoords.add(`${i},${j}`)
      }
    }
  }
  // 2d face name -> 3d face vertices
  const charts: Map<string, Face> = new Map()

  // bfs accross the map to assign the six faces.
  const q: { coord: string; face: Face }[] = []
  const map3dto2dnames = new Map<string, string>()
  // pick a random face to start with and randomly assign it the 000,001,011,010 3D vertices.
  q.push({ coord: [...facesMapCoords.keys()][0], face: { tl: 0, tr: 1, br: 3, bl: 2 } })
  while (q.length > 0) {
    const { coord, face } = q.shift()!
    const [x, y] = coord.split(",").map((x) => parseInt(x))
    if (charts.has(coord)) continue
    for (const d of [Direction.RIGHT, Direction.DOWN, Direction.LEFT, Direction.UP]) {
      const [nx, ny] = move(x, y, d)
      const h = `${nx},${ny}`
      if (facesMapCoords.has(h)) {
        q.push({ coord: h, face: transitionFaceIn3d(face, d) })
      } // else we will compute this transition later, once we have all map transitions.
    }
    charts.set(coord, face)
    map3dto2dnames.set(faceName3d(face), coord)
  }

  // compute all face and direction to new face transitions
  const transitions = new Map<string, [string, R]>()
  for (const [coord, face] of charts) {
    for (const d of [Direction.RIGHT, Direction.DOWN, Direction.LEFT, Direction.UP]) {
      const newFace = transitionFaceIn3d(face, d)
      const new3dFaceName = faceName3d(newFace)
      const new2dFaceName = map3dto2dnames.get(new3dFaceName)!
      const rot = getRfromFace(newFace, charts.get(new2dFaceName)!)
      transitions.set(`${coord},${d}`, [new2dFaceName, rot])
    }
  }
  return { map, xMax: map.length, yMax: map[0].length, transitions, M }
}

// rotate coordinates within a square M x M cube face
function rotate([x, y]: [number, number], rot: R, M: number) {
  switch (rot) {
    case R.I:
      return [x, y]
    case R.R:
      return [y, M - 1 - x]
    case R.L:
      return [M - 1 - y, x]
    case R.H:
      return [M - 1 - x, M - 1 - y]

    // no default
  }
}

/*
 * large coordinates are the coordinates of the M x M cube faces.
 * small coordinates are the coordinates within the M x M cube face.
 */
function splitToLargeAndSmallCoords(x: number, y: number, M: number) {
  const lx = Math.floor(x / M)
  const ly = Math.floor(y / M)
  const sx = mod(x, M)
  const sy = mod(y, M)
  return [lx, ly, sx, sy]
}

function combineLargeAndSmallCoords(
  lx: number,
  ly: number,
  sx: number,
  sy: number,
  M: number
): [number, number] {
  return [lx * M + sx, ly * M + sy]
}

// part 2
function moveOnCube([x, y, d]: State, p: Problem): State {
  const [lx, ly, sx, sy] = splitToLargeAndSmallCoords(x, y, p.M)
  // naive move in small coords to see where we land.
  const [rx, ry] = move(sx, sy, d)
  // if within the same cube face, return raw coordinates
  if (rx >= 0 && ry >= 0 && rx < p.M && ry < p.M) {
    return [lx * p.M + rx, ly * p.M + ry, d]
  }
  // a face transition has occured
  const startCube2dFaceName = `${lx},${ly}`
  const [newCube, rot] = p.transitions.get(`${startCube2dFaceName},${d}`)!
  // new large coords
  const [nlx, nly] = newCube.split(",").map((x) => parseInt(x, 10))
  // mod new small coords to be within a cube face
  let nsx = mod(rx, p.M)
  let nsy = mod(ry, p.M)
  // update small coords with rotation
  ;[nsx, nsy] = rotate([nsx, nsy], rot, p.M)
  // compute new direction
  const newDir = rotD(d, rot)
  return [...combineLargeAndSmallCoords(nlx, nly, nsx, nsy, p.M), newDir]
}

function walk(x: number, y: number, d: Direction, inst: string[], p: Problem, moveF: MoveFn) {
  for (const i of inst!) {
    if (i === "L" || i === "R") {
      d = rotD(d, i === "L" ? R.L : R.R)
    } else {
      const n = parseInt(i, 10)
      for (let j = 0; j < n; j++) {
        const res = moveF([x, y, d], p)
        if (p.map[res[0]][res[1]] === "#") break
        ;[x, y, d] = res
      }
    }
  }
  return [x, y, d]
}

/* Tests */

test(goA(readTestFile()), 6032)
test(updateFacing({ x: 1, y: 1, facing: Direction.RIGHT }, "R"), {
  x: 1,
  y: 1,
  facing: Direction.DOWN,
})
test(updateFacing({ x: 1, y: 1, facing: Direction.DOWN }, "R"), {
  x: 1,
  y: 1,
  facing: Direction.LEFT,
})
test(updateFacing({ x: 1, y: 1, facing: Direction.LEFT }, "R"), {
  x: 1,
  y: 1,
  facing: Direction.UP,
})
test(updateFacing({ x: 1, y: 1, facing: Direction.UP }, "R"), {
  x: 1,
  y: 1,
  facing: Direction.RIGHT,
})
test(updateFacing({ x: 1, y: 1, facing: Direction.RIGHT }, "L"), {
  x: 1,
  y: 1,
  facing: Direction.UP,
})
test(updateFacing({ x: 1, y: 1, facing: Direction.UP }, "L"), {
  x: 1,
  y: 1,
  facing: Direction.LEFT,
})
test(updateFacing({ x: 1, y: 1, facing: Direction.LEFT }, "L"), {
  x: 1,
  y: 1,
  facing: Direction.DOWN,
})
test(updateFacing({ x: 1, y: 1, facing: Direction.DOWN }, "L"), {
  x: 1,
  y: 1,
  facing: Direction.RIGHT,
})
test(goB(readTestFile()), 5031)

/* Results */

console.time("Time")
const resultA = goA(taskInput)
const resultB = goB(taskInput)
console.timeEnd("Time")

console.log("Solution to part 1:", resultA)
console.log("Solution to part 2:", resultB)
