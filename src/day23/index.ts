import { readInput, test } from "../utils/index"
import { readTestFile, splitToLines } from "../utils/readInput"

interface Position {
  x: number
  y: number
}

const prepareInput = (rawInput: string) => rawInput

const taskInput = prepareInput(readInput())

const parseMap = (input: string[]): Map<number, Map<number, string>> => {
  const map = new Map<number, Map<number, string>>()

  input.forEach((line, index) => {
    const yAxis = new Map<number, string>()

    line.split("").forEach((letter, xIndex) => {
      yAxis.set(xIndex, letter)
    })

    map.set(index, yAxis)
  })

  return map
}

const isPositionDefined = (position: Position, map: Map<number, Map<number, string>>): boolean =>
  map.has(position.y) && map.get(position.y).has(position.x)

const isPositionFree = (position: Position, map: Map<number, Map<number, string>>): boolean =>
  !isPositionDefined(position, map) || map.get(position.y).get(position.x) === "."

const isElfOnPosition = (position: Position, map: Map<number, Map<number, string>>): boolean =>
  isPositionDefined(position, map) && map.get(position.y).get(position.x) === "#"

const hasElfAround = (position: Position, map: Map<number, Map<number, string>>): boolean => {
  const surroundingPositions: Position[] = [
    {
      x: position.x,
      y: position.y - 1,
    },
    {
      x: position.x + 1,
      y: position.y - 1,
    },
    {
      x: position.x - 1,
      y: position.y - 1,
    },
    {
      x: position.x - 1,
      y: position.y,
    },
    {
      x: position.x,
      y: position.y + 1,
    },
    {
      x: position.x + 1,
      y: position.y + 1,
    },
    {
      x: position.x - 1,
      y: position.y + 1,
    },
    {
      x: position.x + 1,
      y: position.y,
    },
  ]

  return surroundingPositions.some((pos) => isElfOnPosition(pos, map))
}

const northMovePossible = (position: Position, map: Map<number, Map<number, string>>): Position => {
  const northPosition = {
    x: position.x,
    y: position.y - 1,
  }

  const northEastPosition = {
    x: position.x + 1,
    y: position.y - 1,
  }

  const northWestPosition = {
    x: position.x - 1,
    y: position.y - 1,
  }

  if (
    isPositionFree(northPosition, map) &&
    isPositionFree(northEastPosition, map) &&
    isPositionFree(northWestPosition, map)
  ) {
    return northPosition
  }

  return null
}

const southMovePossible = (position: Position, map: Map<number, Map<number, string>>): Position => {
  const southPosition = {
    x: position.x,
    y: position.y + 1,
  }

  const southEastPosition = {
    x: position.x + 1,
    y: position.y + 1,
  }

  const southWestPosition = {
    x: position.x - 1,
    y: position.y + 1,
  }

  if (
    isPositionFree(southPosition, map) &&
    isPositionFree(southEastPosition, map) &&
    isPositionFree(southWestPosition, map)
  ) {
    return southPosition
  }

  return null
}

const westMovePossible = (position: Position, map: Map<number, Map<number, string>>): Position => {
  const westPosition = {
    x: position.x - 1,
    y: position.y,
  }

  const northWestPosition = {
    x: position.x - 1,
    y: position.y - 1,
  }

  const southWestPosition = {
    x: position.x - 1,
    y: position.y + 1,
  }

  if (
    isPositionFree(westPosition, map) &&
    isPositionFree(northWestPosition, map) &&
    isPositionFree(southWestPosition, map)
  ) {
    return westPosition
  }

  return null
}

const eastMovePossible = (position: Position, map: Map<number, Map<number, string>>): Position => {
  const eastPosition = {
    x: position.x + 1,
    y: position.y,
  }

  const northEastPosition = {
    x: position.x + 1,
    y: position.y - 1,
  }

  const southEastPosition = {
    x: position.x + 1,
    y: position.y + 1,
  }

  if (
    isPositionFree(eastPosition, map) &&
    isPositionFree(northEastPosition, map) &&
    isPositionFree(southEastPosition, map)
  ) {
    return eastPosition
  }

  return null
}

const computeMove = (
  position: Position,
  map: Map<number, Map<number, string>>,
  firstConsideredDirection: number
): Position => {
  if (!hasElfAround(position, map)) {
    return null
  }

  let computedPosition: Position = null

  for (let i = 0; i < 4; i++) {
    switch ((firstConsideredDirection + i) % 4) {
      case 0:
        computedPosition = northMovePossible(position, map)
        break
      case 1:
        computedPosition = southMovePossible(position, map)
        break
      case 2:
        computedPosition = westMovePossible(position, map)
        break
      case 3:
        computedPosition = eastMovePossible(position, map)
        break

      // no default
    }

    if (computedPosition) {
      return computedPosition
    }
  }

  return null
}

const move = (
  map: Map<number, Map<number, string>>,
  round: number
): { map: Map<number, Map<number, string>>; moved: boolean } => {
  const yLevels = Array.from(map.keys()).sort((a, b) => a - b)

  const plannedMoves: Map<number, Map<number, Position[]>> = new Map<
    number,
    Map<number, Position[]>
  >()

  for (let y = yLevels[0]; y <= yLevels[yLevels.length - 1]; y++) {
    if (map.has(y)) {
      const xLevels = Array.from(map.get(y).keys()).sort((a, b) => a - b)
      for (let x = xLevels[0]; x <= xLevels[xLevels.length - 1]; x++) {
        if (isElfOnPosition({ x, y }, map)) {
          let plannedNewPosition = computeMove({ x, y }, map, round % 4)

          if (!plannedNewPosition) {
            plannedNewPosition = { x, y }
          }

          if (!plannedMoves.has(plannedNewPosition.y)) {
            plannedMoves.set(plannedNewPosition.y, new Map<number, Position[]>())
          }

          if (!plannedMoves.get(plannedNewPosition.y).has(plannedNewPosition.x)) {
            plannedMoves.get(plannedNewPosition.y).set(plannedNewPosition.x, [])
          }

          plannedMoves.get(plannedNewPosition.y).get(plannedNewPosition.x).push({ x, y })
        }
      }
    }
  }

  const afterMove: Map<number, Map<number, string>> = new Map<number, Map<number, string>>()
  let moved: boolean = false

  Array.from(plannedMoves.keys()).forEach((y) => {
    if (!afterMove.has(y)) {
      afterMove.set(y, new Map<number, string>())
    }

    Array.from(plannedMoves.get(y).keys()).forEach((x) => {
      const positions = plannedMoves.get(y).get(x)
      if (positions.length === 1) {
        afterMove.get(y).set(x, "#")
        if (positions[0].y !== y || positions[0].x !== x) {
          moved = true
        }
      } else if (positions.length > 1) {
        positions.forEach((oldPosition) => {
          if (!afterMove.has(oldPosition.y)) {
            afterMove.set(oldPosition.y, new Map<number, string>())
          }

          afterMove.get(oldPosition.y).set(oldPosition.x, "#")
        })
      }
    })
  })

  return { map: afterMove, moved }
}

const calculateGroundTilesInElfRectangle = (map: Map<number, Map<number, string>>): number => {
  const lowestXValue = Array.from(map.values())
    .map((innerMap) => Array.from(innerMap.keys()))
    .map((list) => list.sort((a, b) => a - b))
    .map((list) => list[0])
    .sort((a, b) => a - b)[0]
  const highestXValue = Array.from(map.values())
    .map((innerMap) => Array.from(innerMap.keys()))
    .map((list) => list.sort((a, b) => b - a))
    .map((list) => list[0])
    .sort((a, b) => b - a)[0]
  const lowestYValue = Array.from(map.keys()).sort((a, b) => a - b)[0]
  const highestYValue = Array.from(map.keys()).sort((a, b) => b - a)[0]

  let numberOfGroundTiles = 0
  const tilesPerRow = highestXValue - lowestXValue + 1

  for (let y = lowestYValue; y <= highestYValue; y++) {
    if (map.has(y)) {
      numberOfGroundTiles +=
        tilesPerRow - Array.from(map.get(y).entries()).filter((entry) => entry[1] === "#").length
    } else {
      numberOfGroundTiles += tilesPerRow
    }
  }

  return numberOfGroundTiles
}

const goA = (input) => {
  const lines = splitToLines(input)
  let map = parseMap(lines)

  for (let i = 0; i < 10; i++) {
    map = move(map, i).map
  }

  return calculateGroundTilesInElfRectangle(map)
}

const goB = (input) => {
  const lines = splitToLines(input)
  let map = parseMap(lines)

  let moved = true
  let index = 0

  while (moved) {
    const result = move(map, index)
    map = result.map
    moved = result.moved
    index++
  }

  return index
}

/* Tests */

test(goA(readTestFile()), 110)
test(goB(readTestFile()), 20)

/* Results */

console.time("Time")
const resultA = goA(taskInput)
const resultB = goB(taskInput)
console.timeEnd("Time")

console.log("Solution to part 1:", resultA)
console.log("Solution to part 2:", resultB)
