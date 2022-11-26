import { readInput, test } from "../utils/index"

const prepareInput = (rawInput: string) => rawInput

const taskInput = prepareInput(readInput())

const goA = (input) => {}

const goB = (input) => {}

/* Tests */

// test()

/* Results */

console.time("Time")
const resultA = goA(taskInput)
const resultB = goB(taskInput)
console.timeEnd("Time")

console.log("Solution to part 1:", resultA)
console.log("Solution to part 2:", resultB)
