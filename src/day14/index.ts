import { readInput, test } from "../utils/index"
import { readTestFile, splitToLines } from "../utils/readInput"

const prepareInput = (rawInput: string) => rawInput

const taskInput = prepareInput(readInput())

enum Tile {
  Air,
  Rock,
  Sand,
}

interface Pair<T> {
  first: T
  second: T
}

const parseMap = (lines: string[]): Map<number, Map<number, Tile>> => {
  const map = new Map<number, Map<number, Tile>>()

  lines.forEach((line) => {
    const points = line.split(" -> ")
    let lastPosition: Pair<number>

    points
      .map((point) => {
        const split = point.split(",")
        return {
          first: Number.parseInt(split[0], 10),
          second: Number.parseInt(split[1], 10),
        }
      })
      .forEach((point) => {
        if (lastPosition !== undefined) {
          if (lastPosition.first !== point.first) {
            if (!map.has(lastPosition.second)) {
              map.set(lastPosition.second, new Map<number, Tile>())
            }

            if (lastPosition.first > point.first) {
              for (let x = lastPosition.first; x >= point.first; x--) {
                map.get(lastPosition.second).set(x, Tile.Rock)
              }
            } else {
              for (let x = lastPosition.first; x <= point.first; x++) {
                map.get(lastPosition.second).set(x, Tile.Rock)
              }
            }
          } else if (lastPosition.second > point.second) {
            for (let y = lastPosition.second; y >= point.second; y--) {
              if (!map.has(y)) {
                map.set(y, new Map<number, Tile>())
              }

              map.get(y).set(lastPosition.first, Tile.Rock)
            }
          } else {
            for (let y = lastPosition.second; y <= point.second; y++) {
              if (!map.has(y)) {
                map.set(y, new Map<number, Tile>())
              }

              map.get(y).set(lastPosition.first, Tile.Rock)
            }
          }
        }
        lastPosition = point
      })
  })

  return map
}

const calculateFinalSandPosition = (
  sandPosition: Pair<number>,
  map: Map<number, Map<number, Tile>>,
  lowestRock: number,
  voidBottom: boolean
): Pair<number> => {
  let currentSandPosition = sandPosition
  let canMove = true

  while (canMove && currentSandPosition.second < (voidBottom ? lowestRock : lowestRock - 1)) {
    if (
      !map.has(currentSandPosition.second + 1) ||
      !map.get(currentSandPosition.second + 1).has(currentSandPosition.first)
    ) {
      currentSandPosition = {
        first: currentSandPosition.first,
        second: currentSandPosition.second + 1,
      }
    } else if (!map.get(currentSandPosition.second + 1).has(currentSandPosition.first - 1)) {
      currentSandPosition = {
        first: currentSandPosition.first - 1,
        second: currentSandPosition.second + 1,
      }
    } else if (!map.get(currentSandPosition.second + 1).has(currentSandPosition.first + 1)) {
      currentSandPosition = {
        first: currentSandPosition.first + 1,
        second: currentSandPosition.second + 1,
      }
    } else {
      canMove = false
    }
  }

  if (voidBottom && currentSandPosition.second >= lowestRock) {
    return undefined
  }

  return currentSandPosition
}

const goA = (input) => {
  const lines = splitToLines(input)

  const map = parseMap(lines)

  const lowestRockPosition = Array.from(map.keys()).sort((a, b) => b - a)[0]

  const newSandPosition = {
    first: 500,
    second: 0,
  }

  let nextSandPosition = calculateFinalSandPosition(newSandPosition, map, lowestRockPosition, true)

  while (nextSandPosition) {
    if (!map.has(nextSandPosition.second)) {
      map.set(nextSandPosition.second, new Map<number, Tile>())
    }
    map.get(nextSandPosition.second).set(nextSandPosition.first, Tile.Sand)

    nextSandPosition = calculateFinalSandPosition(newSandPosition, map, lowestRockPosition, true)
  }

  return Array.from(map.keys())
    .map((key) => Array.from(map.get(key).values()).filter((value) => value === Tile.Sand).length)
    .reduce((previousValue, currentValue) => previousValue + currentValue, 0)
}

const goB = (input) => {
  const lines = splitToLines(input)

  const map = parseMap(lines)

  const lowestRockPosition = Array.from(map.keys()).sort((a, b) => b - a)[0] + 2

  const newSandPosition = {
    first: 500,
    second: 0,
  }

  let nextSandPosition = calculateFinalSandPosition(newSandPosition, map, lowestRockPosition, false)

  while (nextSandPosition && (nextSandPosition.second !== 0 || nextSandPosition.first !== 500)) {
    if (!map.has(nextSandPosition.second)) {
      map.set(nextSandPosition.second, new Map<number, Tile>())
    }
    map.get(nextSandPosition.second).set(nextSandPosition.first, Tile.Sand)

    nextSandPosition = calculateFinalSandPosition(newSandPosition, map, lowestRockPosition, false)
  }

  // Add one at the end as 500,0 will not be counted as Sand
  return (
    Array.from(map.keys())
      .map((key) => Array.from(map.get(key).values()).filter((value) => value === Tile.Sand).length)
      .reduce((previousValue, currentValue) => previousValue + currentValue, 0) + 1
  )
}

/* Tests */

test(goA(readTestFile()), 24)
test(goB(readTestFile()), 93)

/* Results */

console.time("Time")
const resultA = goA(taskInput)
const resultB = goB(taskInput)
console.timeEnd("Time")

console.log("Solution to part 1:", resultA)
console.log("Solution to part 2:", resultB)
