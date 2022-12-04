import { readInput, test } from "../utils/index"
import { readTestFile, splitToLines } from "../utils/readInput"

const prepareInput = (rawInput: string) => rawInput

const taskInput = prepareInput(readInput())

const splitParts = (line: string): string[] => line.split(",")

const parseRange = (part: string): number[] =>
  part.split("-").map((element) => Number.parseInt(element, 10))

const goA = (input) => {
  const lines = splitToLines(input)

  let fullyContainedParts = 0
  lines.forEach((line) => {
    const ranges = splitParts(line).map(parseRange)

    if (
      (ranges[0][0] <= ranges[1][0] && ranges[0][1] >= ranges[1][1]) ||
      (ranges[1][0] <= ranges[0][0] && ranges[1][1] >= ranges[0][1])
    ) {
      fullyContainedParts++
    }
  })

  return fullyContainedParts
}

const arePartsOverlapping = (parts: number[][]) => {
  const firstLowerWithin = parts[1][0] <= parts[0][0] && parts[1][1] >= parts[0][0]
  const firstUpperWithin = parts[1][0] <= parts[0][1] && parts[1][1] >= parts[0][1]
  const secondLowerWithin = parts[0][0] <= parts[1][0] && parts[0][1] >= parts[1][0]
  const secondUpperWithin = parts[0][0] <= parts[1][1] && parts[0][1] >= parts[1][1]

  return firstLowerWithin || firstUpperWithin || secondLowerWithin || secondUpperWithin
}

const goB = (input) => {
  const lines = splitToLines(input)

  let overlappingParts = 0
  lines.forEach((line) => {
    const ranges = splitParts(line).map(parseRange)

    if (arePartsOverlapping(ranges)) {
      overlappingParts++
    }
  })

  return overlappingParts
}

/* Tests */

test(goA(readTestFile()), 2)

/* Results */

console.time("Time")
const resultA = goA(taskInput)
const resultB = goB(taskInput)
console.timeEnd("Time")

console.log("Solution to part 1:", resultA)
console.log("Solution to part 2:", resultB)
