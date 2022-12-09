import { readInput, test } from "../utils/index"
import { readTestFile, splitToLines } from "../utils/readInput"

const prepareInput = (rawInput: string) => rawInput

const taskInput = prepareInput(readInput())

const parseMap = (lines: string[]): Map<number, Map<number, number>> => {
  const map = new Map<number, Map<number, number>>()

  for (let i = 0; i < lines.length; i++) {
    const internalMap = new Map<number, number>()
    lines[i]
      .split("")
      .map((elem) => Number.parseInt(elem, 10))
      .forEach((value, index) => internalMap.set(index, value))

    map.set(i, internalMap)
  }

  return map
}

const findVisibleTrees = (
  line: number,
  vertical: boolean,
  reverse: boolean,
  visibleTrees: Map<number, number[]>,
  map: Map<number, Map<number, number>>,
  gridLength: number
) => {
  const startValue = reverse ? gridLength - 1 : 0
  const runFor = reverse ? (i: number) => i >= 0 : (i: number) => i < gridLength
  const updateCount = reverse ? (i: number) => i - 1 : (i: number) => i + 1

  let currentHighestTree = -1
  let foundAlreadyVisibleTree = false
  for (let i = startValue; runFor(i) && !foundAlreadyVisibleTree; i = updateCount(i)) {
    const y = vertical ? i : line
    const x = vertical ? line : i

    if (visibleTrees.has(y) && visibleTrees.get(y).includes(x)) {
      foundAlreadyVisibleTree = true
      break
    }

    const treeHeight = map.get(y).get(x)
    if (currentHighestTree < treeHeight) {
      if (!visibleTrees.has(y)) {
        visibleTrees.set(y, [])
      }
      visibleTrees.get(y).push(x)

      currentHighestTree = treeHeight
    }
  }
}

const mergeMaps = (
  map1: Map<number, number[]>,
  map2: Map<number, number[]>,
  gridLength: number
): Map<number, number[]> => {
  const result = new Map<number, number[]>()

  for (let y = 0; y < gridLength; y++) {
    result.set(y, [])
    if (map1.has(y)) {
      result.get(y).push(...map1.get(y))
    }

    if (map2.has(y)) {
      map2.get(y).forEach((elem) => {
        if (!result.get(y).includes(elem)) {
          result.get(y).push(elem)
        }
      })
    }
  }

  return result
}

const goA = (input) => {
  const lines = splitToLines(input)
  const gridLength = lines.length
  const map = parseMap(lines)

  const visibleTreesHorizontal = new Map<number, number[]>()

  for (let line = 1; line < gridLength - 1; line++) {
    findVisibleTrees(line, false, false, visibleTreesHorizontal, map, gridLength)
    findVisibleTrees(line, false, true, visibleTreesHorizontal, map, gridLength)
  }

  const visibleTreesVertical = new Map<number, number[]>()
  for (let line = 1; line < gridLength - 1; line++) {
    findVisibleTrees(line, true, false, visibleTreesVertical, map, gridLength)
    findVisibleTrees(line, true, true, visibleTreesVertical, map, gridLength)
  }

  const completeVisibleTrees = mergeMaps(visibleTreesHorizontal, visibleTreesVertical, gridLength)
  completeVisibleTrees.get(0).push(0, gridLength - 1)
  completeVisibleTrees.get(gridLength - 1).push(0, gridLength - 1)

  return Array.from(completeVisibleTrees.keys())
    .map((key) => completeVisibleTrees.get(key).length)
    .reduce((previousValue, currentValue) => previousValue + currentValue, 0)
}

enum Direction {
  NORTH,
  EAST,
  SOUTH,
  WEST,
}

const updatePosition = (x: number, y: number, direction: Direction): number[] => {
  switch (direction) {
    case Direction.NORTH:
      return [x, y - 1]
    case Direction.EAST:
      return [x + 1, y]
    case Direction.SOUTH:
      return [x, y + 1]
    case Direction.WEST:
      return [x - 1, y]
    // no default
  }

  throw new Error(`Unknown direction ${direction}`)
}

const positionInBounds = (x: number, y: number, gridLength: number): boolean =>
  x >= 0 && x < gridLength && y >= 0 && y < gridLength

const getViewingDistance = (
  x: number,
  y: number,
  direction: Direction,
  map: Map<number, Map<number, number>>,
  gridLength: number
): number => {
  const ownHeight = map.get(y).get(x)

  let xPosition
  let yPosition
  ;[xPosition, yPosition] = updatePosition(x, y, direction)

  let viewingDistance = 0
  while (
    positionInBounds(xPosition, yPosition, gridLength) &&
    map.get(yPosition).get(xPosition) < ownHeight
  ) {
    viewingDistance++
    ;[xPosition, yPosition] = updatePosition(xPosition, yPosition, direction)
  }

  if (positionInBounds(xPosition, yPosition, gridLength)) {
    viewingDistance++
  }

  return viewingDistance
}

const getScenicScore = (
  x: number,
  y: number,
  map: Map<number, Map<number, number>>,
  gridLength: number
): number => {
  const allDirections = [Direction.NORTH, Direction.EAST, Direction.SOUTH, Direction.WEST]

  let viewingDistance = 1
  allDirections.forEach((direction) => {
    viewingDistance *= getViewingDistance(x, y, direction, map, gridLength)
  })

  return viewingDistance
}

const goB = (input) => {
  const lines = splitToLines(input)
  const gridLength = lines.length
  const map = parseMap(lines)

  let highestScenicScore = 0

  for (let y = 0; y < gridLength; y++) {
    for (let x = 0; x < gridLength; x++) {
      const scenicScore = getScenicScore(x, y, map, gridLength)

      if (scenicScore > highestScenicScore) {
        highestScenicScore = scenicScore
      }
    }
  }

  return highestScenicScore
}

/* Tests */

test(goA(readTestFile()), 21)
test(goB(readTestFile()), 8)

/* Results */

console.time("Time")
const resultA = goA(taskInput)
const resultB = goB(taskInput)
console.timeEnd("Time")

console.log("Solution to part 1:", resultA)
console.log("Solution to part 2:", resultB)
