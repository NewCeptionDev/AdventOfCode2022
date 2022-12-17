import { readInput, test } from "../utils/index"
import { readTestFile, splitToLines } from "../utils/readInput"

const prepareInput = (rawInput: string) => rawInput

const taskInput = prepareInput(readInput())

interface Valve {
  identifier: string
  flowRate: number
  connected: string[]
}

interface Path {
  currentPosition: string
  elephantPosition?: string
  nextMoveOwn?: number
  nextMoveElephant?: number
  currentFlowRate: number
  pressureReleased: number
  openedValves: string[]
  targetOwn?: string
  targetElephant?: string
  timeGone: number
}

const parseValve = (line: string): Valve => {
  const splitValveTunnels = line.split("; ")
  const valveSplit = splitValveTunnels[0].split(" ")
  const tunnelSplit = splitValveTunnels[1].split(" ")

  return {
    identifier: valveSplit[1],
    flowRate: Number.parseInt(valveSplit[4].split("=")[1], 10),
    connected: tunnelSplit.slice(4).map((elem) => elem.replace(",", "")),
  }
}

const distanceToValve = (
  current: string,
  target: string,
  wayMap: Map<string, Map<string, string[]>>
): number => {
  return wayMap.get(current).get(target).length
}

const buildWayMap = (valves: Valve[]): Map<string, Map<string, string[]>> => {
  const wayMap = new Map<string, Map<string, string[]>>()

  valves.forEach((valve) => {
    wayMap.set(valve.identifier, new Map<string, string[]>())
    valve.connected.forEach((connected) => wayMap.get(valve.identifier).set(connected, []))
  })

  while (Array.from(wayMap.keys()).some((key) => wayMap.get(key).size < valves.length)) {
    Array.from(wayMap.keys())
      .filter((key) => wayMap.get(key).size < valves.length)
      .forEach((key) => {
        const mostSteps = Array.from(wayMap.get(key).values())
          .map((val) => val.length)
          .sort((a, b) => a - b)
          .pop()
        const furthestKnown = Array.from(wayMap.get(key).keys()).filter(
          (lowerKey) => wayMap.get(key).get(lowerKey).length === mostSteps
        )

        furthestKnown.forEach((furthest) => {
          const relatedValve = valves.find((valve) => valve.identifier === furthest)

          relatedValve.connected.forEach((connected) => {
            if (!wayMap.get(key).has(connected)) {
              wayMap.get(key).set(connected, [...wayMap.get(key).get(furthest), furthest])
            }
          })
        })
      })
  }

  return wayMap
}

const goA = (input) => {
  const lines = splitToLines(input)
  let valves = lines.map(parseValve)

  const current = {
    currentPosition: "AA",
    currentFlowRate: 0,
    pressureReleased: 0,
    openedValves: ["AA"],
    timeGone: 0,
  }

  const wayMap = buildWayMap(valves)

  valves = valves.filter((valve) => valve.flowRate !== 0)

  let paths = [current]

  let maxPressure = 0
  while (paths.length > 0) {
    const nextPaths: Path[] = []

    paths.forEach((path) => {
      const possible = valves.filter((valve) => !path.openedValves.includes(valve.identifier))

      if (possible.length === 0) {
        if (path.timeGone < 30) {
          const timeLeft = 30 - path.timeGone
          path.pressureReleased += path.currentFlowRate * timeLeft
        }

        if (path.pressureReleased > maxPressure) {
          maxPressure = path.pressureReleased
        }
      }

      possible.forEach((possiblePath) => {
        const steps = distanceToValve(path.currentPosition, possiblePath.identifier, wayMap) + 2

        if (path.timeGone + steps > 30) {
          let endPressure = path.pressureReleased
          if (path.timeGone < 30) {
            const timeLeft = 30 - path.timeGone
            endPressure += path.currentFlowRate * timeLeft
          }

          if (endPressure > maxPressure) {
            maxPressure = endPressure
          }
        } else {
          nextPaths.push({
            timeGone: path.timeGone + steps,
            pressureReleased: path.pressureReleased + steps * path.currentFlowRate,
            currentFlowRate: path.currentFlowRate + possiblePath.flowRate,
            currentPosition: possiblePath.identifier,
            openedValves: [...path.openedValves, possiblePath.identifier],
          })
        }
      })
    })

    paths = nextPaths
  }

  return maxPressure
}

const goB = (input) => {
  return 0
}

/* Tests */

test(goA(readTestFile()), 1651)
test(goB(readTestFile()), 1707)

/* Results */

console.time("Time")
const resultA = goA(taskInput)
const resultB = goB(taskInput)
console.timeEnd("Time")

console.log("Solution to part 1:", resultA)
console.log("Solution to part 2:", resultB)
