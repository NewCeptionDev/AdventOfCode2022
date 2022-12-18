import { readInput, test } from "../utils/index"
import { readInputFromSpecialFile, readTestFile, splitToLines } from "../utils/readInput"

const prepareInput = (rawInput: string) => rawInput

const taskInput = prepareInput(readInput())

interface Cube {
  x: number
  y: number
  z: number
  openSurfaceAreas?: number
  lavaSurfaceArea?: number
}

const parseCube = (line: string): Cube => {
  const split = line.split(",")
  return {
    x: Number.parseInt(split[0], 10),
    y: Number.parseInt(split[1], 10),
    z: Number.parseInt(split[2], 10),
    openSurfaceAreas: 6,
  }
}

const nextToEachOther = (cube1: Cube, cube2: Cube): boolean => {
  let equalSides = 0
  let differByOne = false

  if (cube1.x === cube2.x) {
    equalSides++
  } else if (Math.abs(cube1.x - cube2.x) === 1) {
    differByOne = true
  }
  if (cube1.y === cube2.y) {
    equalSides++
  } else if (Math.abs(cube1.y - cube2.y) === 1) {
    differByOne = true
  }
  if (cube1.z === cube2.z) {
    equalSides++
  } else if (Math.abs(cube1.z - cube2.z) === 1) {
    differByOne = true
  }

  return equalSides === 2 && differByOne
}

const goA = (input) => {
  const lines = splitToLines(input)
  const cubes = lines.map(parseCube)

  for (let i = 0; i < cubes.length; i++) {
    for (let j = i + 1; j < cubes.length; j++) {
      if (nextToEachOther(cubes[i], cubes[j])) {
        // console.log(cubes[i], `at ${i} and`, cubes[j], `at ${j} have 2 equal sides`)
        cubes[i].openSurfaceAreas -= 1
        cubes[j].openSurfaceAreas -= 1
      }
    }
  }

  return cubes
    .map((cube) => cube.openSurfaceAreas)
    .reduce((previousValue, currentValue) => previousValue + currentValue, 0)
}

const cubeContainedInArray = (cube: Cube, array: Cube[]): boolean =>
  array.find((elem) => elem.x === cube.x && elem.y === cube.y && elem.z === cube.z) !== undefined

const getNeighbourCubes = (cube: Cube): Cube[] => {
  const neighbours: Cube[] = []

  neighbours.push(
    {
      x: cube.x - 1,
      y: cube.y,
      z: cube.z,
    },
    {
      x: cube.x + 1,
      y: cube.y,
      z: cube.z,
    }
  )

  neighbours.push(
    {
      x: cube.x,
      y: cube.y - 1,
      z: cube.z,
    },
    {
      x: cube.x,
      y: cube.y + 1,
      z: cube.z,
    }
  )

  neighbours.push(
    {
      x: cube.x,
      y: cube.y,
      z: cube.z - 1,
    },
    {
      x: cube.x,
      y: cube.y,
      z: cube.z + 1,
    }
  )

  return neighbours
}

const goB = (input) => {
  const lines = splitToLines(input)
  const cubes = lines.map(parseCube)

  const minX = cubes.map((cube) => cube.x).sort((a, b) => a - b)[0]
  const maxX = cubes
    .map((cube) => cube.x)
    .sort((a, b) => a - b)
    .pop()
  const minY = cubes.map((cube) => cube.y).sort((a, b) => a - b)[0]
  const maxY = cubes
    .map((cube) => cube.y)
    .sort((a, b) => a - b)
    .pop()
  const minZ = cubes.map((cube) => cube.z).sort((a, b) => a - b)[0]
  const maxZ = cubes
    .map((cube) => cube.z)
    .sort((a, b) => a - b)
    .pop()

  let surfaceArea = goA(input)
  let possibleAirHoles: Cube[][] = []

  for (let z = minZ; z < maxZ; z++) {
    for (let y = minY; y < maxY; y++) {
      for (let x = minX; x < maxX; x++) {
        const airCube: Cube = {
          x,
          y,
          z,
          openSurfaceAreas: 0,
          lavaSurfaceArea: 0,
        }

        if (!cubeContainedInArray(airCube, cubes)) {
          const neighbourCubes = getNeighbourCubes(airCube)

          airCube.lavaSurfaceArea = neighbourCubes.filter((neighbour) =>
            cubeContainedInArray(neighbour, cubes)
          ).length
          const fitsIn: number[] = []
          for (let i = 0; i < possibleAirHoles.length; i++) {
            if (
              possibleAirHoles[i].some((possibleAirHole) =>
                nextToEachOther(airCube, possibleAirHole)
              )
            ) {
              fitsIn.push(i)
            }
          }

          if (fitsIn.length === 1) {
            for (let j = 0; j < possibleAirHoles[fitsIn[0]].length; j++) {
              if (nextToEachOther(airCube, possibleAirHoles[fitsIn[0]][j])) {
                airCube.openSurfaceAreas += 1
                possibleAirHoles[fitsIn[0]][j].openSurfaceAreas += 1
              }
            }
            possibleAirHoles[fitsIn[0]].push(airCube)
          } else if (fitsIn.length > 0) {
            const toCombine = possibleAirHoles.filter((group, index) => fitsIn.includes(index))

            const combined: Cube[] = []
            toCombine.forEach((group) => {
              combined.push(...group)
            })
            combined.push(airCube)
            combined.forEach((elem) => {
              // eslint-disable-next-line no-param-reassign
              elem.openSurfaceAreas = 0
            })

            for (let i = 0; i < combined.length; i++) {
              for (let j = i + 1; j < combined.length; j++) {
                if (nextToEachOther(combined[i], combined[j])) {
                  // console.log(cubes[i], `at ${i} and`, cubes[j], `at ${j} have 2 equal sides`)
                  combined[i].openSurfaceAreas += 1
                  combined[j].openSurfaceAreas += 1
                }
              }
            }

            possibleAirHoles = possibleAirHoles.filter((group, index) => !fitsIn.includes(index))
            possibleAirHoles.push(combined)
          } else {
            possibleAirHoles.push([airCube])
          }
        }
      }
    }
  }

  possibleAirHoles
    .filter((group) => group.every((elem) => elem.openSurfaceAreas + elem.lavaSurfaceArea === 6))
    .forEach((group) => {
      group.forEach((airHole) => {
        surfaceArea -= airHole.lavaSurfaceArea
      })
    })

  return surfaceArea
}

/* Tests */

test(goA(readTestFile()), 64)
test(goB(readInputFromSpecialFile("customTest1.txt")), 54)
test(goB(readInputFromSpecialFile("customTest2.txt")), 80)
test(goB(readInputFromSpecialFile("customTest3.txt")), 96)
test(goB(readInputFromSpecialFile("customTest4.txt")), 110)
test(goB(readInputFromSpecialFile("customTest5.txt")), 110)

/* Results */

console.time("Time")
const resultA = goA(taskInput)
const resultB = goB(taskInput)
console.timeEnd("Time")

console.log("Solution to part 1:", resultA)
console.log("Solution to part 2:", resultB)
