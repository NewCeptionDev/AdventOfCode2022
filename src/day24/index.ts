import { readInput, test } from "../utils/index"
import { readTestFile, splitToLines } from "../utils/readInput"

const prepareInput = (rawInput: string) => rawInput

const taskInput = prepareInput(readInput())

interface Position {
  x: number
  y: number
}

interface Blizzard {
  getPosition: (time: number) => Position
}

const parseBlizzards = (lines: string[]): Blizzard[] => {
  const blizzards: Blizzard[] = []

  for (let y = 0; y < lines.length; y++) {
    for (let x = 0; x < lines[y].length; x++) {
      const char = lines[y].charAt(x)

      if (char !== "#" && char !== ".") {
        switch (char) {
          case "^":
            blizzards.push({
              getPosition: (time: number): Position => {
                const newY = (y - time) % (lines.length - 2)
                return {
                  x,
                  y: newY <= 0 ? newY + lines.length - 2 : newY,
                }
              },
            })
            break
          case "v":
            blizzards.push({
              getPosition: (time: number): Position => {
                const newY = (y + time) % (lines.length - 2)
                return {
                  x,
                  y: newY <= 0 ? newY + lines.length - 2 : newY,
                }
              },
            })
            break
          case ">":
            blizzards.push({
              getPosition: (time: number): Position => {
                const newX = (x + time) % (lines[y].length - 2)
                return {
                  x: newX <= 0 ? newX + lines[y].length - 2 : newX,
                  y,
                }
              },
            })
            break
          case "<":
            blizzards.push({
              getPosition: (time: number): Position => {
                const newX = (x - time) % (lines[y].length - 2)
                return {
                  x: newX <= 0 ? newX + lines[y].length - 2 : newX,
                  y,
                }
              },
            })
            break

          // no default
        }
      }
    }
  }

  return blizzards
}

const getAllPossiblePositions = (
  current: Position,
  maxX: number,
  maxY: number,
  targetX: number
): Position[] => {
  const newPosition: Position[] = []

  if (current.x > 1 && current.y > 0 && current.y < maxY - 1) {
    newPosition.push({
      x: current.x - 1,
      y: current.y,
    })
  }

  if (current.x + 2 < maxX && current.y > 0 && current.y < maxY - 1) {
    newPosition.push({
      x: current.x + 1,
      y: current.y,
    })
  }

  if (current.y > 1 || current.x === targetX) {
    newPosition.push({
      x: current.x,
      y: current.y - 1,
    })
  }

  if (current.y + 2 < maxY || current.x === targetX) {
    newPosition.push({
      x: current.x,
      y: current.y + 1,
    })
  }

  newPosition.push(current)

  return newPosition
}

const getStepsToPosition = (
  blizzards: Blizzard[],
  endPosition: Position,
  startPosition: Position,
  startTime: number,
  xLength: number,
  yLength: number
): number => {
  let currentPositions: Position[] = [startPosition]
  let steps = startTime

  while (currentPositions.length > 0) {
    const nextPositions: Position[] = []

    currentPositions.forEach((position) => {
      const possible = getAllPossiblePositions(position, xLength, yLength, endPosition.x)

      possible.forEach((possiblePosition) => {
        if (
          !nextPositions.find(
            (added) => added.x === possiblePosition.x && added.y === possiblePosition.y
          )
        ) {
          nextPositions.push(possiblePosition)
        }
      })
    })

    steps++
    currentPositions = nextPositions.filter((position) =>
      blizzards.every((blizzard) => {
        const newPosition = blizzard.getPosition(steps)
        return newPosition.x !== position.x || newPosition.y !== position.y
      })
    )

    if (currentPositions.find((path) => path.x === endPosition.x && path.y === endPosition.y)) {
      return steps
    }
  }

  throw new Error("Never reached the end position")
}

const goA = (input) => {
  const lines = splitToLines(input)
  const blizzards = parseBlizzards(lines)

  const startPosition = {
    x: lines[0]
      .split("")
      .map((char, index) => ({ char, index }))
      .find((elem) => elem.char === ".").index,
    y: 0,
  }

  const endPosition = {
    x: lines[lines.length - 1]
      .split("")
      .map((char, index) => ({ char, index }))
      .find((elem) => elem.char === ".").index,
    y: lines.length - 1,
  }

  return getStepsToPosition(blizzards, endPosition, startPosition, 0, lines[0].length, lines.length)
}

const goB = (input) => {
  const lines = splitToLines(input)
  const blizzards = parseBlizzards(lines)

  const startPosition = {
    x: lines[0]
      .split("")
      .map((char, index) => ({ char, index }))
      .find((elem) => elem.char === ".").index,
    y: 0,
  }

  const endPosition = {
    x: lines[lines.length - 1]
      .split("")
      .map((char, index) => ({ char, index }))
      .find((elem) => elem.char === ".").index,
    y: lines.length - 1,
  }

  const toEnd = getStepsToPosition(
    blizzards,
    endPosition,
    startPosition,
    0,
    lines[0].length,
    lines.length
  )
  const toStart = getStepsToPosition(
    blizzards,
    startPosition,
    endPosition,
    toEnd + 1,
    lines[0].length,
    lines.length
  )
  const toEndAgain = getStepsToPosition(
    blizzards,
    endPosition,
    startPosition,
    toStart + 1,
    lines[0].length,
    lines.length
  )

  return toEndAgain
}

/* Tests */

test(goA(readTestFile()), 18)
test(goB(readTestFile()), 54)

/* Results */

console.time("Time")
const resultA = goA(taskInput)
const resultB = goB(taskInput)
console.timeEnd("Time")

console.log("Solution to part 1:", resultA)
console.log("Solution to part 2:", resultB)
