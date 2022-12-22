import { readInput, test } from "../utils/index"
import { readTestFile, splitToLines } from "../utils/readInput"

const prepareInput = (rawInput: string) => rawInput

const taskInput = prepareInput(readInput())

enum Direction {
  RIGHT,
  DOWN,
  LEFT,
  UP
}

interface Position {
  x: number,
  y: number,
  facing: Direction
}

interface Instruction {
  steps: number,
  turnDirection: string
}

const parseMap = (lines: string[]): Map<number, Map<number, string>> => {
  const map = new Map<number, Map<number, string>>()

  lines.forEach((line, index) => {
    map.set(index + 1, new Map)
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
  line.split("").forEach(elem => {
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

const moveOnMap = (position: Position, map: Map<number, Map<number, string>>, steps: number): Position => {
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
          const firstYWithX = Array.from(map.keys()).filter(key => map.get(key).has(newPosition.x)).sort((a, b) => a - b)[0]
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
          const lastYWithX = Array.from(map.keys()).filter(key => map.get(key).has(newPosition.x)).sort((a, b) => b - a)[0]
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

  // console.log(instructions)

  let position = getStartPosition(map)

  instructions.forEach(instruction => {
    position = updateFacing(position, instruction.turnDirection)
    position = moveOnMap(position, map, instruction.steps)
  })

  // console.log(position)

  return position.y * 1000 + position.x * 4 + position.facing
}

const getSliceOfMap = (map: Map<number, Map<number, string>>, startX: number, startY: number, faceSize: number): Map<number, Map<number, string>> => {
  const faceMap = new Map<number, Map<number, string>>()
  for (let i = startY; i < (startY + faceSize); i++) {
    faceMap.set(i, new Map<number, string>())
    for (let j = startX; j < (startX + faceSize); j++) {
      faceMap.get(i).set(j, map.get(i).get(j))
    }
  }

  return faceMap
}

const goB = (input) => {}


/* Tests */

test(goA(readTestFile()), 6032)
test(updateFacing({ x: 1, y: 1, facing: Direction.RIGHT }, "R"), { x: 1, y: 1, facing: Direction.DOWN })
test(updateFacing({ x: 1, y: 1, facing: Direction.DOWN }, "R"), { x: 1, y: 1, facing: Direction.LEFT })
test(updateFacing({ x: 1, y: 1, facing: Direction.LEFT }, "R"), { x: 1, y: 1, facing: Direction.UP })
test(updateFacing({ x: 1, y: 1, facing: Direction.UP }, "R"), { x: 1, y: 1, facing: Direction.RIGHT })
test(updateFacing({ x: 1, y: 1, facing: Direction.RIGHT }, "L"), { x: 1, y: 1, facing: Direction.UP })
test(updateFacing({ x: 1, y: 1, facing: Direction.UP }, "L"), { x: 1, y: 1, facing: Direction.LEFT })
test(updateFacing({ x: 1, y: 1, facing: Direction.LEFT }, "L"), { x: 1, y: 1, facing: Direction.DOWN })
test(updateFacing({ x: 1, y: 1, facing: Direction.DOWN }, "L"), { x: 1, y: 1, facing: Direction.RIGHT })


/* Results */

console.time("Time")
const resultA = goA(taskInput)
const resultB = goB(taskInput)
console.timeEnd("Time")

console.log("Solution to part 1:", resultA)
console.log("Solution to part 2:", resultB)
