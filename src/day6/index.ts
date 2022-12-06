import { readInput } from "../utils/index"
import { splitToLines } from "../utils/readInput"

const prepareInput = (rawInput: string) => rawInput

const taskInput = prepareInput(readInput())

const goA = (input) => {
  const inputStream = splitToLines(input)[0]

  let lastDifferentCharacters = []
  let indexOfFirstDifferentCharacter = 0

  for (let i = 0; i < inputStream.length && lastDifferentCharacters.length < 4; i++) {
    if (!lastDifferentCharacters.includes(inputStream[i])) {
      lastDifferentCharacters.push(inputStream[i])
    } else {
      lastDifferentCharacters = [inputStream[i]]
      indexOfFirstDifferentCharacter = i
    }
  }

  return indexOfFirstDifferentCharacter + 4
}

const goB = (input) => {
  const inputStream = splitToLines(input)[0]

  let differentCharacters = []
  let indexOfStartOf14DifferentCharacters = 0

  for (let i = 0; i < inputStream.length && differentCharacters.length < 14; i++) {
    if (!differentCharacters.includes(inputStream[i])) {
      differentCharacters.push(inputStream[i])
    } else {
      differentCharacters = [inputStream[i]]
      indexOfStartOf14DifferentCharacters = i
    }
  }

  return indexOfStartOf14DifferentCharacters + 14
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
