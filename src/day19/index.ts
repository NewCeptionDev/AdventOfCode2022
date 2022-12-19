import { readInput, test } from "../utils/index"
import { readTestFile, splitToLines } from "../utils/readInput"

const prepareInput = (rawInput: string) => rawInput

const taskInput = prepareInput(readInput())

interface Blueprint {
  id: number
  oreRobotOreCost: number
  clayRobotOreCost: number
  obsidianRobotOreCost: number
  obsidianRobotClayCost: number
  geodeRobotOreCost: number
  geodeRobotObsidianCost: number
}

interface Path {
  oreCollected: number
  clayCollected: number
  obsidianCollected: number
  geodesCollected: number
  oreRobots: number
  clayRobots: number
  obsidianRobots: number
  geodeRobots: number
}

const parseBlueprint = (line: string): Blueprint => {
  const split = line.split(" ")

  return {
    id: Number.parseInt(split[1].slice(0, split[1].length - 1), 10),
    oreRobotOreCost: Number.parseInt(split[6], 10),
    clayRobotOreCost: Number.parseInt(split[12], 10),
    obsidianRobotOreCost: Number.parseInt(split[18], 10),
    obsidianRobotClayCost: Number.parseInt(split[21], 10),
    geodeRobotOreCost: Number.parseInt(split[27], 10),
    geodeRobotObsidianCost: Number.parseInt(split[30], 10),
  }
}

const canBuildGeodeRobot = (path: Path, blueprint: Blueprint): boolean =>
  path.oreCollected >= blueprint.geodeRobotOreCost &&
  path.obsidianCollected >= blueprint.geodeRobotObsidianCost

const canBuildObsidianRobot = (path: Path, blueprint: Blueprint): boolean =>
  path.oreCollected >= blueprint.obsidianRobotOreCost &&
  path.clayCollected >= blueprint.obsidianRobotClayCost

const canBuildClayRobot = (path: Path, blueprint: Blueprint): boolean =>
  path.oreCollected >= blueprint.clayRobotOreCost

const canBuildOreRobot = (path: Path, blueprint: Blueprint): boolean =>
  path.oreCollected >= blueprint.oreRobotOreCost

const containsEntry = (toAdd: Path, list: Path[]): boolean =>
  list.find(
    (elem) =>
      elem.oreCollected >= toAdd.oreCollected &&
      elem.clayCollected >= toAdd.clayCollected &&
      elem.obsidianCollected >= toAdd.obsidianCollected &&
      elem.geodesCollected >= toAdd.geodesCollected &&
      elem.oreRobots >= toAdd.oreRobots &&
      elem.clayRobots >= toAdd.clayRobots &&
      elem.obsidianRobots >= toAdd.obsidianRobots &&
      elem.geodeRobots >= toAdd.geodeRobots
  ) !== undefined

const calculateGeodeProducibleToEnd = (
  startGeodeRobots: number,
  geodesCollectedToNow: number,
  timeLeft: number
): number => {
  let robots = startGeodeRobots
  let collected = geodesCollectedToNow

  for (let i = 0; i < timeLeft; i++) {
    collected += robots
    robots++
  }

  return collected
}

const getHighestOreCost = (blueprint: Blueprint): number => {
  let max: number = blueprint.oreRobotOreCost

  if (blueprint.clayRobotOreCost > max) {
    max = blueprint.clayRobotOreCost
  }

  if (blueprint.obsidianRobotOreCost > max) {
    max = blueprint.obsidianRobotOreCost
  }

  if (blueprint.geodeRobotOreCost > max) {
    max = blueprint.geodeRobotOreCost
  }

  return max
}

const findMaximumAmountOfGeodesProducible = (blueprint: Blueprint, time: number): number => {
  const startPath: Path = {
    oreCollected: 0,
    clayCollected: 0,
    obsidianCollected: 0,
    geodesCollected: 0,
    oreRobots: 1,
    clayRobots: 0,
    obsidianRobots: 0,
    geodeRobots: 0,
  }

  let paths = [startPath]
  for (let i = 0; i < time; i++) {
    const newPaths: Path[] = []
    const timeLeft = time - i - 1

    const bestPathToNow = paths.sort((a, b) => b.geodesCollected - a.geodesCollected)[0]
    if (timeLeft > 1 && bestPathToNow) {
      paths = paths.filter(
        (path) =>
          calculateGeodeProducibleToEnd(path.geodeRobots, path.geodesCollected, timeLeft) >
          bestPathToNow.geodesCollected + bestPathToNow.geodeRobots * timeLeft
      )
    }

    paths.forEach((path) => {
      if (canBuildGeodeRobot(path, blueprint)) {
        const newEntry = {
          oreCollected: path.oreCollected + path.oreRobots - blueprint.geodeRobotOreCost,
          clayCollected: path.clayCollected + path.clayRobots,
          obsidianCollected:
            path.obsidianCollected + path.obsidianRobots - blueprint.geodeRobotObsidianCost,
          geodesCollected: path.geodesCollected + path.geodeRobots,
          oreRobots: path.oreRobots,
          clayRobots: path.clayRobots,
          obsidianRobots: path.obsidianRobots,
          geodeRobots: path.geodeRobots + 1,
        }

        if (!containsEntry(newEntry, newPaths)) {
          newPaths.push(newEntry)
        }
      }

      if (
        canBuildObsidianRobot(path, blueprint) &&
        blueprint.geodeRobotObsidianCost > path.obsidianRobots &&
        !canBuildGeodeRobot(path, blueprint)
      ) {
        const newEntry = {
          oreCollected: path.oreCollected + path.oreRobots - blueprint.obsidianRobotOreCost,
          clayCollected: path.clayCollected + path.clayRobots - blueprint.obsidianRobotClayCost,
          obsidianCollected: path.obsidianCollected + path.obsidianRobots,
          geodesCollected: path.geodesCollected + path.geodeRobots,
          oreRobots: path.oreRobots,
          clayRobots: path.clayRobots,
          obsidianRobots: path.obsidianRobots + 1,
          geodeRobots: path.geodeRobots,
        }

        if (!containsEntry(newEntry, newPaths)) {
          newPaths.push(newEntry)
        }
      }

      if (
        canBuildClayRobot(path, blueprint) &&
        blueprint.obsidianRobotClayCost > path.clayRobots &&
        !canBuildGeodeRobot(path, blueprint)
      ) {
        const newEntry = {
          oreCollected: path.oreCollected + path.oreRobots - blueprint.clayRobotOreCost,
          clayCollected: path.clayCollected + path.clayRobots,
          obsidianCollected: path.obsidianCollected + path.obsidianRobots,
          geodesCollected: path.geodesCollected + path.geodeRobots,
          oreRobots: path.oreRobots,
          clayRobots: path.clayRobots + 1,
          obsidianRobots: path.obsidianRobots,
          geodeRobots: path.geodeRobots,
        }

        if (!containsEntry(newEntry, newPaths)) {
          newPaths.push(newEntry)
        }
      }

      if (
        canBuildOreRobot(path, blueprint) &&
        getHighestOreCost(blueprint) > path.oreRobots &&
        !canBuildGeodeRobot(path, blueprint)
      ) {
        const newEntry = {
          oreCollected: path.oreCollected + path.oreRobots - blueprint.oreRobotOreCost,
          clayCollected: path.clayCollected + path.clayRobots,
          obsidianCollected: path.obsidianCollected + path.obsidianRobots,
          geodesCollected: path.geodesCollected + path.geodeRobots,
          oreRobots: path.oreRobots + 1,
          clayRobots: path.clayRobots,
          obsidianRobots: path.obsidianRobots,
          geodeRobots: path.geodeRobots,
        }

        if (!containsEntry(newEntry, newPaths)) {
          newPaths.push(newEntry)
        }
      }

      const newEntry = {
        oreCollected: path.oreCollected + path.oreRobots,
        clayCollected: path.clayCollected + path.clayRobots,
        obsidianCollected: path.obsidianCollected + path.obsidianRobots,
        geodesCollected: path.geodesCollected + path.geodeRobots,
        oreRobots: path.oreRobots,
        clayRobots: path.clayRobots,
        obsidianRobots: path.obsidianRobots,
        geodeRobots: path.geodeRobots,
      }

      if (!containsEntry(newEntry, newPaths)) {
        newPaths.push(newEntry)
      }
    })
    paths = newPaths
  }

  return paths
    .map((path) => path.geodesCollected)
    .sort((a, b) => a - b)
    .pop()
}

const goA = (input) => {
  const lines = splitToLines(input)
  const blueprints = lines.map(parseBlueprint)

  let sumOfQualityLevel = 0

  blueprints.forEach((blueprint) => {
    const maxGeodes = findMaximumAmountOfGeodesProducible(blueprint, 24)
    sumOfQualityLevel += maxGeodes * blueprint.id
  })

  return sumOfQualityLevel
}

const goB = (input) => {
  const lines = splitToLines(input)
  const blueprints = lines.map(parseBlueprint).slice(0, 3)

  let result = 1

  blueprints.forEach((blueprint) => {
    const maxGeodes = findMaximumAmountOfGeodesProducible(blueprint, 32)
    result *= maxGeodes
  })

  return result
}

/* Tests */

test(calculateGeodeProducibleToEnd(1, 0, 9), 45)
test(findMaximumAmountOfGeodesProducible(parseBlueprint(splitToLines(readTestFile())[0]), 24), 9)
test(findMaximumAmountOfGeodesProducible(parseBlueprint(splitToLines(readTestFile())[1]), 24), 12)
test(goA(readTestFile()), 33)

/* Results */

console.time("Time")
const resultA = goA(taskInput)
const resultB = goB(taskInput)
console.timeEnd("Time")

console.log("Solution to part 1:", resultA)
console.log("Solution to part 2:", resultB)
