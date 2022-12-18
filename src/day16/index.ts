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
  pressureReleasedAtEnd: number
  openedValves: string[]
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
): number => wayMap.get(current).get(target).length

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

const calculateMaxPressureValveMap = (valves: Valve[], wayMap: Map<string, Map<string, string[]>>, maxTime: number): Map<string[], number> => {
  const maxPressureForValves = new Map<string[], number>()

  const startValve = {
    currentPosition: "AA",
    pressureReleasedAtEnd: 0,
    openedValves: [],
    timeGone: 0,
  }

  let paths = [startValve]

  while(paths.length > 0) {
    const nextPaths: Path[] = []

    paths.forEach(path => {
      const possible = valves.filter(valve => !path.openedValves.includes(valve.identifier) && distanceToValve(path.currentPosition, valve.identifier, wayMap) + 2 < (maxTime - path.timeGone - 1))

      possible.forEach(possiblePath => {
        const distance = distanceToValve(path.currentPosition, possiblePath.identifier, wayMap)
        const updatedTime = path.timeGone + distance + 2
        const newEntry = {
          currentPosition: possiblePath.identifier,
          openedValves: [...path.openedValves, possiblePath.identifier],
          timeGone: updatedTime,
          pressureReleasedAtEnd: path.pressureReleasedAtEnd + (maxTime - updatedTime) * possiblePath.flowRate
        }
        nextPaths.push(newEntry)

        const maxPressureEntryForValves = Array.from(maxPressureForValves.keys()).find(set => set.length === newEntry.openedValves.length && newEntry.openedValves.every(valve => set.includes(valve)))
        if(!maxPressureEntryForValves) {
          maxPressureForValves.set(newEntry.openedValves, newEntry.pressureReleasedAtEnd)
        } else if(maxPressureForValves.get(maxPressureEntryForValves) < newEntry.pressureReleasedAtEnd) {
          maxPressureForValves.set(maxPressureEntryForValves, newEntry.pressureReleasedAtEnd)
        }
      })
    })
    paths = nextPaths
  }

  return maxPressureForValves
}

const goA = (input) => {
  const lines = splitToLines(input)
  let valves = lines.map(parseValve)

  const wayMap = buildWayMap(valves)
  valves = valves.filter((valve) => valve.flowRate !== 0)
  const maxPressureForValves = calculateMaxPressureValveMap(valves, wayMap, 30)

  return Array.from(maxPressureForValves.values()).sort((a, b) => a - b).pop()
}

const goB = (input) => {
  const lines = splitToLines(input)
  let valves = lines.map(parseValve)

  const wayMap = buildWayMap(valves)
  valves = valves.filter((valve) => valve.flowRate !== 0)
  const maxPressureForValves = calculateMaxPressureValveMap(valves, wayMap, 26)
  const keys = Array.from(maxPressureForValves.keys())

  let maxReleasablePressure = 0

  for(let i = 0; i < keys.length; i++) {
    for(let j = i + 1; j < keys.length; j++) {
      if(keys[i].every(valve => !keys[j].includes(valve))) {
        const releasablePressure = maxPressureForValves.get(keys[i]) + maxPressureForValves.get(keys[j])
        if(maxReleasablePressure < releasablePressure) {
          maxReleasablePressure = releasablePressure
        }
      }
    }
  }

  return maxReleasablePressure
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
