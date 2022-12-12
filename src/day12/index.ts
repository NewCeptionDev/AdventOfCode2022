import { readInput, test } from "../utils/index"
import { readTestFile, splitToLines } from "../utils/readInput"

const prepareInput = (rawInput: string) => rawInput

const taskInput = prepareInput(readInput())

interface Pair<T> {
  first: T
  second: T
}

interface Route {
  currentPosition: Pair<number>
  steps: number
}

const getAllNeighbourPositions = (
  position: Pair<number>,
  mapWidth: number,
  mapHeight: number
): Pair<number>[] => {
  const neighbours: Pair<number>[] = []

  if (position.first > 0) {
    neighbours.push({
      first: position.first - 1,
      second: position.second,
    })
  }

  if (position.first < mapWidth - 1) {
    neighbours.push({
      first: position.first + 1,
      second: position.second,
    })
  }

  if (position.second > 0) {
    neighbours.push({
      first: position.first,
      second: position.second - 1,
    })
  }

  if (position.second < mapHeight - 1) {
    neighbours.push({
      first: position.first,
      second: position.second + 1,
    })
  }

  return neighbours
}

const getPossibleNextPositions = (position: Pair<number>, map: string[][]): Pair<number>[] => {
  const possiblePositions = getAllNeighbourPositions(position, map[0].length, map.length)

  let currentElevation

  if (map[position.second][position.first] === "S") {
    currentElevation = "a".charCodeAt(0)
  } else {
    currentElevation = map[position.second][position.first].charCodeAt(0)
  }

  return possiblePositions.filter((possible) => {
    let possibleElevation

    if (map[possible.second][possible.first] === "E") {
      possibleElevation = "z".charCodeAt(0)
    } else {
      possibleElevation = map[possible.second][possible.first].charCodeAt(0)
    }

    return currentElevation + 1 >= possibleElevation
  })
}

const getShortestAmountOfSteps = (
  startPosition: Pair<number>,
  endPosition: Pair<number>,
  map: string[][]
): number => {
  const cache: Map<number, Map<number, number>> = new Map<number, Map<number, number>>()

  let routes: Route[] = []
  routes.push({
    currentPosition: startPosition,
    steps: 0,
  })

  while (routes.length > 0) {
    const nextRoutes: Route[] = []

    routes.forEach((route) => {
      const possibleNext = getPossibleNextPositions(route.currentPosition, map)

      possibleNext
        .filter(
          (next) =>
            !cache.has(next.second) ||
            !cache.get(next.second).has(next.first) ||
            cache.get(next.second).get(next.first) > route.steps + 1
        )
        .forEach((next) => {
          nextRoutes.push({
            currentPosition: next,
            steps: route.steps + 1,
          })

          if (!cache.has(next.second)) {
            cache.set(next.second, new Map<number, number>())
          }

          cache.get(next.second).set(next.first, route.steps + 1)
        })
    })

    routes = nextRoutes
  }

  if (!cache.has(endPosition.second) || !cache.get(endPosition.second).has(endPosition.first)) {
    return Number.MAX_SAFE_INTEGER
  }

  return cache.get(endPosition.second).get(endPosition.first)
}

const goA = (input) => {
  const lines = splitToLines(input)
  const map = lines.map((line) => line.split(""))

  let startPosition
  let endPosition

  for (let y = 0; y < map.length && (!startPosition || !endPosition); y++) {
    for (let x = 0; x < map[y].length && (!startPosition || !endPosition); x++) {
      if (map[y][x] === "S") {
        startPosition = {
          first: x,
          second: y,
        }
      }

      if (map[y][x] === "E") {
        endPosition = {
          first: x,
          second: y,
        }
      }
    }
  }

  return getShortestAmountOfSteps(startPosition, endPosition, map)
}

const goB = (input) => {
  const lines = splitToLines(input)
  const map = lines.map((line) => line.split(""))

  const startPositions: Pair<number>[] = []
  let endPosition

  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      if (map[y][x] === "S" || map[y][x] === "a") {
        startPositions.push({
          first: x,
          second: y,
        })
      }

      if (map[y][x] === "E") {
        endPosition = {
          first: x,
          second: y,
        }
      }
    }
  }

  return startPositions
    .map((start) => getShortestAmountOfSteps(start, endPosition, map))
    .sort((a, b) => a - b)[0]
}

/* Tests */

test(goA(readTestFile()), 31)
test(goB(readTestFile()), 29)

/* Results */

console.time("Time")
const resultA = goA(taskInput)
const resultB = goB(taskInput)
console.timeEnd("Time")

console.log("Solution to part 1:", resultA)
console.log("Solution to part 2:", resultB)
