import { readInput, test } from "../utils/index"
import { splitToLines } from "../utils/readInput"

const prepareInput = (rawInput: string) => rawInput

const taskInput = prepareInput(readInput())

interface Pair<T> {
  first: T
  second: T
}

interface Sensor {
  position: Pair<number>
  nearestBeacon: Pair<number>
  distanceToBeacon: number
}

const calculateDistance = (pos1: Pair<number>, pos2: Pair<number>): number => Math.abs(pos1.first - pos2.first) + Math.abs(pos1.second - pos2.second)

const parseSensor = (line: string): Sensor => {
  const splitSensorBeacon = line.split(": ")
  const sensorSplit = splitSensorBeacon[0].split(" ")
  const beaconSplit = splitSensorBeacon[1].split(" ")

  const sensorPosition = {
    first: Number.parseInt(sensorSplit[2].split("=")[1].split(",")[0], 10),
    second: Number.parseInt(sensorSplit[3].split("=")[1], 10),
  }

  const nearestBeaconPosition = {
    first: Number.parseInt(beaconSplit[4].split("=")[1].split(",")[0], 10),
    second: Number.parseInt(beaconSplit[5].split("=")[1], 10),
  }

  return {
    position: sensorPosition,
    nearestBeacon: nearestBeaconPosition,
    distanceToBeacon: calculateDistance(sensorPosition, nearestBeaconPosition),
  }
}

const getScannedPositionWithoutBeaconAtYLevel = (yLevel: number, sensor: Sensor): number[] => {
  const foundPositions: number[] = []

  let searching = true
  for (let x = sensor.position.first; searching; x++) {
    if (
      calculateDistance(sensor.position, { first: x, second: yLevel }) <= sensor.distanceToBeacon
    ) {
      foundPositions.push(x)
    } else {
      searching = false
    }
  }

  searching = true
  for (let x = sensor.position.first - 1; searching; x--) {
    if (
      calculateDistance(sensor.position, { first: x, second: yLevel }) <= sensor.distanceToBeacon
    ) {
      foundPositions.push(x)
    } else {
      searching = false
    }
  }

  return foundPositions
}

const goA = (input: string, yLevel: number) => {
  const lines = splitToLines(input)
  const sensors = lines.map(parseSensor)

  const foundPositions: Map<number, boolean> = new Map<number, boolean>()
  sensors.forEach((sensor) => {
    const found = getScannedPositionWithoutBeaconAtYLevel(yLevel, sensor)

    found.forEach((position) => {
      if (!foundPositions.has(position)) {
        foundPositions.set(position, true)
      }
    })
  })

  sensors.forEach((sensor) => {
    if (sensor.position.second === yLevel && foundPositions.has(sensor.position.first)) {
      foundPositions.delete(sensor.position.first)
    }

    if (sensor.nearestBeacon.second === yLevel && foundPositions.has(sensor.nearestBeacon.first)) {
      foundPositions.delete(sensor.nearestBeacon.first)
    }
  })

  return foundPositions.size
}

const calculateTuningFrequency = (position: Pair<number>): number => position.first * 4000000 + position.second

const goB = (input) => {
  const lines = splitToLines(input)
  const sensors = lines.map(parseSensor)

  for (let y = 0; y <= 4000000; y++) {
    for (let x = 0; x <= 4000000; x++) {
      const relevantSensor = sensors.find(
        (sensor) =>
          calculateDistance(sensor.position, { first: x, second: y }) <= sensor.distanceToBeacon
      )

      if (!relevantSensor) {
        return calculateTuningFrequency({ first: x, second: y })
      }

      const skippedXSteps =
        relevantSensor.distanceToBeacon -
        calculateDistance(relevantSensor.position, { first: x, second: y })
      x += skippedXSteps
    }
  }

  throw new Error("No position was found")
}

/* Tests */

test(calculateDistance({ first: 10, second: 10 }, { first: 10, second: 40 }), 30)
test(calculateDistance({ first: 10, second: 10 }, { first: 11, second: 40 }), 31)
test(calculateDistance({ first: 10, second: 10 }, { first: 11, second: 39 }), 30)
test(calculateDistance({ first: 10, second: 10 }, { first: 11, second: 38 }), 29)

/* Results */

console.time("Time")
const resultA = goA(taskInput, 2000000)
const resultB = goB(taskInput)
console.timeEnd("Time")

console.log("Solution to part 1:", resultA)
console.log("Solution to part 2:", resultB)
