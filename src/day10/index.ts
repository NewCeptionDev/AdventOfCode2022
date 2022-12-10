import { readInput, test } from "../utils/index"
import { readTestFile, splitToLines } from "../utils/readInput"

const prepareInput = (rawInput: string) => rawInput

const taskInput = prepareInput(readInput())

enum Command {
  AddX,
  Noop,
}

interface Instruction {
  command: Command
  value?: number
}

const parseInstruction = (line: string): Instruction => {
  const split = line.split(" ")

  if (split[0] === "noop") {
    return {
      command: Command.Noop,
    }
  }
  return {
    command: Command.AddX,
    value: Number.parseInt(split[1], 10),
  }
}

const isRelevantCycle = (cycle: number): boolean => [20, 60, 100, 140, 180, 220].includes(cycle)

const goA = (input) => {
  const lines = splitToLines(input)
  const instructions = lines.map(parseInstruction)

  let signalStrengthSum = 0
  let register = 1
  let cycle = 0
  instructions.forEach((instruction) => {
    if (instruction.command === Command.Noop) {
      cycle++

      if (isRelevantCycle(cycle)) {
        signalStrengthSum += register * cycle
      }
    } else if (instruction.command === Command.AddX) {
      if (isRelevantCycle(cycle + 1)) {
        signalStrengthSum += register * (cycle + 1)
      } else if (isRelevantCycle(cycle + 2)) {
        signalStrengthSum += register * (cycle + 2)
      }

      cycle += 2
      register += instruction.value
    }
  })

  return signalStrengthSum
}

const updateCurrentOutput = (currentOutput: string, register: number, cycle: number): string => {
  if (register - 1 <= cycle % 40 && register + 1 >= cycle % 40) {
    return `${currentOutput}#`
  }
  return `${currentOutput}.`
}

const goB = (input) => {
  const lines = splitToLines(input)
  const instructions = lines.map(parseInstruction)

  let output = ""
  let register = 1
  let cycle = 0
  instructions.forEach((instruction) => {
    if (instruction.command === Command.Noop) {
      output = updateCurrentOutput(output, register, cycle)
      cycle++
    } else if (instruction.command === Command.AddX) {
      output = updateCurrentOutput(output, register, cycle)
      cycle++

      output = updateCurrentOutput(output, register, cycle)
      cycle++

      register += instruction.value
    }
  })

  for (let y = 0; y < 6; y++) {
    console.log(output.substring(y * 40, (y + 1) * 40 - 1))
  }
}

/* Tests */

test(goA(readTestFile()), 13140)

/* Results */

console.time("Time")
const resultA = goA(taskInput)
const resultB = goB(taskInput)
console.timeEnd("Time")

console.log("Solution to part 1:", resultA)
console.log("Solution to part 2:", resultB)
