import { readInput, test } from "../utils/index"
import { readTestFile, splitToLines } from "../utils/readInput"

const prepareInput = (rawInput: string) => rawInput

const taskInput = prepareInput(readInput())

const positionBlockedByRock = (
  currentX: number,
  currentY: number,
  map: Map<number, number[]>
): boolean => {
  if (map.has(currentY)) {
    return map.get(currentY).includes(currentX)
  }

  return false
}

const moveRockSideways = (
  x: number,
  rockType: number,
  moveType: string,
  map: Map<number, number[]>,
  currentY: number
): number => {
  if (moveType === ">") {
    switch (rockType) {
      case 1:
        return x + 4 < 7 && !positionBlockedByRock(x + 4, currentY, map) ? x + 1 : x
      case 2:
        return x + 2 < 7 &&
          !positionBlockedByRock(x + 1, currentY, map) &&
          !positionBlockedByRock(x + 2, currentY - 1, map) &&
          !positionBlockedByRock(x + 1, currentY - 2, map)
          ? x + 1
          : x
      case 3:
        return x + 3 < 7 &&
          !positionBlockedByRock(x + 3, currentY, map) &&
          !positionBlockedByRock(x + 3, currentY - 1, map) &&
          !positionBlockedByRock(x + 3, currentY - 2, map)
          ? x + 1
          : x
      case 4:
        return x + 1 < 7 &&
          !positionBlockedByRock(x + 1, currentY, map) &&
          !positionBlockedByRock(x + 1, currentY - 1, map) &&
          !positionBlockedByRock(x + 1, currentY - 2, map) &&
          !positionBlockedByRock(x + 1, currentY - 3, map)
          ? x + 1
          : x
      case 5:
        return x + 2 < 7 &&
          !positionBlockedByRock(x + 2, currentY, map) &&
          !positionBlockedByRock(x + 2, currentY - 1, map)
          ? x + 1
          : x
      // no default
    }
  } else if (moveType === "<") {
    switch (rockType) {
      case 1:
        return x - 1 >= 0 && !positionBlockedByRock(x - 1, currentY, map) ? x - 1 : x
      case 2:
        return x - 2 >= 0 &&
          !positionBlockedByRock(x - 1, currentY, map) &&
          !positionBlockedByRock(x - 2, currentY - 1, map) &&
          !positionBlockedByRock(x - 1, currentY - 2, map)
          ? x - 1
          : x
      case 3:
        return x - 1 >= 0 &&
          !positionBlockedByRock(x - 1, currentY, map) &&
          !positionBlockedByRock(x + 1, currentY - 1, map) &&
          !positionBlockedByRock(x + 1, currentY - 2, map)
          ? x - 1
          : x
      case 4:
        return x - 1 >= 0 &&
          !positionBlockedByRock(x - 1, currentY, map) &&
          !positionBlockedByRock(x - 1, currentY - 1, map) &&
          !positionBlockedByRock(x - 1, currentY - 2, map) &&
          !positionBlockedByRock(x - 1, currentY - 3, map)
          ? x - 1
          : x
      case 5:
        return x - 1 >= 0 &&
          !positionBlockedByRock(x - 1, currentY, map) &&
          !positionBlockedByRock(x - 1, currentY - 1, map)
          ? x - 1
          : x
      // no default
    }
  }

  console.error(
    `Unexpected moveType ${moveType} or rockType ${rockType} while moving the rock sideways`
  )
  throw new Error("Unexpected moveType or rockType while moving the rock sideways")
}

const canMoveDown = (
  currentY: number,
  currentX: number,
  rockType: number,
  map: Map<number, number[]>
): boolean => {
  if (currentY === -1) {
    return false
  }

  switch (rockType) {
    case 1:
      return [currentX, currentX + 1, currentX + 2, currentX + 3].every(
        (xPosition) => !map.has(currentY + 1) || !map.get(currentY + 1).includes(xPosition)
      )
    case 2:
      return (
        (!map.has(currentY + 1) || !map.get(currentY + 1).includes(currentX)) &&
        [currentX - 1, currentX + 1].every(
          (xPosition) => !map.has(currentY) || !map.get(currentY).includes(xPosition)
        )
      )
    case 3:
      return [currentX, currentX + 1, currentX + 2].every(
        (xPosition) => !map.has(currentY + 1) || !map.get(currentY + 1).includes(xPosition)
      )
    case 4:
      return !map.has(currentY + 1) || !map.get(currentY + 1).includes(currentX)
    case 5:
      return [currentX, currentX + 1].every(
        (xPosition) => !map.has(currentY + 1) || !map.get(currentY + 1).includes(xPosition)
      )
    // no default
  }

  throw new Error(`Unexpected rockType ${rockType} while checking if the rock can move down`)
}

const placeRockOnMap = (
  currentX: number,
  currentY: number,
  rockType: number,
  map: Map<number, number[]>
): number => {
  if (!map.has(currentY)) {
    map.set(currentY, [])
  }
  switch (rockType) {
    case 1:
      map.get(currentY).push(currentX, currentX + 1, currentX + 2, currentX + 3)
      return currentY
    case 2:
      if (!map.has(currentY - 1)) {
        map.set(currentY - 1, [])
      }
      if (!map.has(currentY - 2)) {
        map.set(currentY - 2, [])
      }
      map.get(currentY).push(currentX)
      map.get(currentY - 1).push(currentX - 1, currentX, currentX + 1)
      map.get(currentY - 2).push(currentX)
      return currentY - 2
    case 3:
      if (!map.has(currentY - 1)) {
        map.set(currentY - 1, [])
      }
      if (!map.has(currentY - 2)) {
        map.set(currentY - 2, [])
      }
      map.get(currentY).push(currentX, currentX + 1, currentX + 2)
      map.get(currentY - 1).push(currentX + 2)
      map.get(currentY - 2).push(currentX + 2)
      return currentY - 2
    case 4:
      if (!map.has(currentY - 1)) {
        map.set(currentY - 1, [])
      }
      if (!map.has(currentY - 2)) {
        map.set(currentY - 2, [])
      }
      if (!map.has(currentY - 3)) {
        map.set(currentY - 3, [])
      }
      map.get(currentY).push(currentX)
      map.get(currentY - 1).push(currentX)
      map.get(currentY - 2).push(currentX)
      map.get(currentY - 3).push(currentX)
      return currentY - 3
    case 5:
      if (!map.has(currentY - 1)) {
        map.set(currentY - 1, [])
      }
      map.get(currentY).push(currentX, currentX + 1)
      map.get(currentY - 1).push(currentX, currentX + 1)
      return currentY - 1
    // no default
  }

  throw new Error(`Unexpected rockType ${rockType} while trying to place the rock`)
}

const getSpawnPosition = (rockType: number, highestRock: number): number[] => {
  switch (rockType) {
    case 1:
      return [2, highestRock - 4]
    case 2:
      return [3, highestRock - 4]
    case 3:
      return [2, highestRock - 4]
    case 4:
      return [2, highestRock - 4]
    case 5:
      return [2, highestRock - 4]
    // no default
  }

  throw new Error(`Unexpected rockType ${rockType} while getting spawn position`)
}

const goA = (input) => {
  const airStream = splitToLines(input)[0].split("")

  const map: Map<number, number[]> = new Map<number, number[]>()

  let currentRockType = 1
  let currentAirStream = 0
  let rocksPlaced = 0
  let highestRock = 0
  let moveSideways = true

  let currentX: number
  let currentY: number
  ;[currentX, currentY] = getSpawnPosition(currentRockType, highestRock)

  while (rocksPlaced < 2022) {
    if (moveSideways) {
      currentX = moveRockSideways(
        currentX,
        currentRockType,
        airStream[currentAirStream],
        map,
        currentY
      )
      currentAirStream = currentAirStream + 1 === airStream.length ? 0 : currentAirStream + 1
      moveSideways = false
    } else {
      if (canMoveDown(currentY, currentX, currentRockType, map)) {
        currentY++
      } else {
        const newPlacedHeight = placeRockOnMap(currentX, currentY, currentRockType, map)
        if (newPlacedHeight < highestRock) {
          highestRock = newPlacedHeight
        }
        currentRockType = currentRockType === 5 ? 1 : currentRockType + 1
        rocksPlaced++
        ;[currentX, currentY] = getSpawnPosition(currentRockType, highestRock)
      }
      moveSideways = true
    }
  }

  return Math.abs(highestRock)
}
const getPeakForColumn = (column: number, map: Map<number, number[]>, y: number): number => {
  for (let height = y; height < 0; height++) {
    if (map.get(height).includes(column)) {
      return Math.abs(y - height)
    }
  }

  return y
}

const getPeakForAllColumns = (map: Map<number, number[]>, y: number): number[] => [0, 1, 2, 3, 4, 5, 6].map((column) => getPeakForColumn(column, map, y))

const goB = (input) => {
  const airStream = splitToLines(input)[0].split("")

  const map: Map<number, number[]> = new Map<number, number[]>()

  let currentRockType = 1
  let currentAirStream = 0
  let highestRock = 0
  let rocksPlaced = 0
  let moveSideways = true

  let currentX: number
  let currentY: number
  ;[currentX, currentY] = getSpawnPosition(currentRockType, highestRock)

  const cache = new Map<number, Map<number, Map<number[], number[]>>>()

  let cycleHeightToAdd = 0

  while (rocksPlaced < 1000000000000) {
    if (moveSideways) {
      currentX = moveRockSideways(
        currentX,
        currentRockType,
        airStream[currentAirStream],
        map,
        currentY
      )
      currentAirStream = currentAirStream + 1 === airStream.length ? 0 : currentAirStream + 1
      moveSideways = false
    } else {
      if (canMoveDown(currentY, currentX, currentRockType, map)) {
        currentY++
      } else {
        const newPlacedHeight = placeRockOnMap(currentX, currentY, currentRockType, map)
        if (newPlacedHeight < highestRock) {
          highestRock = newPlacedHeight
        }
        currentRockType = currentRockType === 5 ? 1 : currentRockType + 1
        rocksPlaced++
        ;[currentX, currentY] = getSpawnPosition(currentRockType, highestRock)
        if (
          cycleHeightToAdd === 0 &&
          cache.has(currentRockType) &&
          cache.get(currentRockType).has(currentAirStream)
        ) {
          const duplicateKey = Array.from(
            cache.get(currentRockType).get(currentAirStream).keys()
            // eslint-disable-next-line @typescript-eslint/no-loop-func
          ).find((key) =>
            getPeakForAllColumns(map, highestRock).every((peak) => key.includes(peak))
          )
          if (duplicateKey) {
            const duplicate = cache.get(currentRockType).get(currentAirStream).get(duplicateKey)
            const rocksPlacedWhileDuplicate = rocksPlaced - duplicate[0]
            const heightDifference = Math.abs(highestRock - duplicate[1])

            const missingPlacedRocks = 1000000000000 - rocksPlaced
            const duplicateCycles = Math.floor(missingPlacedRocks / rocksPlacedWhileDuplicate)
            cycleHeightToAdd = heightDifference * duplicateCycles
            const missingRocks = missingPlacedRocks - duplicateCycles * rocksPlacedWhileDuplicate
            rocksPlaced = 1000000000000 - missingRocks
          }
        } else if (cycleHeightToAdd === 0) {
          if (!cache.has(currentRockType)) {
            cache.set(currentRockType, new Map<number, Map<number[], number[]>>())
          }

          if (!cache.get(currentRockType).has(currentAirStream)) {
            cache.get(currentRockType).set(currentAirStream, new Map<number[], number[]>())
          }

          cache
            .get(currentRockType)
            .get(currentAirStream)
            .set(getPeakForAllColumns(map, highestRock), [rocksPlaced, highestRock])
        }
      }
      moveSideways = true
    }
  }

  return Math.abs(highestRock) + cycleHeightToAdd
}

/* Tests */

test(goA(readTestFile()), 3068)
test(goB(readTestFile()), 1514285714288)

/* Results */

console.time("Time")
const resultA = goA(taskInput)
const resultB = goB(taskInput)
console.timeEnd("Time")

console.log("Solution to part 1:", resultA)
console.log("Solution to part 2:", resultB)
