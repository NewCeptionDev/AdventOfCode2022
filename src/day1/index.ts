import { readInput } from "../utils"
import { splitToAllLines } from "../utils/readInput"

const prepareInput = (rawInput: string) => rawInput

const taskInput = prepareInput(readInput())

const parseCaloriesPerElf = (lines: string[]): number[] => {
  const elves: number[] = []

  let currentCalories = 0
  lines.forEach((line) => {
    if (line.length === 0) {
      elves.push(currentCalories)
      currentCalories = 0
    } else {
      currentCalories += Number.parseInt(line, 10)
    }
  })
  elves.push(currentCalories)

  return elves
}

const goA = (input) => {
  const lines = splitToAllLines(input)

  const elves: number[] = parseCaloriesPerElf(lines)

  return elves.sort((a, b) => b - a)[0]
}

const goB = (input) => {
  const lines = splitToAllLines(input)

  const elves: number[] = parseCaloriesPerElf(lines)

  const sortedByCalories = elves.sort((a, b) => b - a)

  return sortedByCalories[0] + sortedByCalories[1] + sortedByCalories[2]
}

/* Tests */

// test()

/* Results */

console.time("Time")
const resultA = goA(taskInput)
const resultB = goB(taskInput)
console.timeEnd("Time")

console.log("Solution to part 1:", resultA)
console.log("Solution to part 2:", resultB)
