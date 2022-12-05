import { readInput, test } from "../utils"
import { splitToAllLines } from "../utils/readInput"

interface Instruction {
  amount: number
  from: number
  to: number
}

const prepareInput = (rawInput: string) => rawInput

const taskInput = prepareInput(readInput())

const parseStackDescription = (lines: string[]) => {
  const stacks: string[][] = []

  const maxLineLength = lines.map((line) => line.length).sort((a, b) => b - a)[0]

  const amountOfStacks = Math.floor(maxLineLength / 4) + 1
  for (let i = 0; i < amountOfStacks; i++) {
    stacks.push([])
  }

  lines.forEach((line) => {
    const characters = line.split("")

    for (let i = 0; i < characters.length; i++) {
      if (characters[i] !== " " && characters[i] !== "[" && characters[i] !== "]") {
        const correctStack = Math.floor(i / 4)
        stacks[correctStack].push(characters[i])
      }
    }
  })

  return stacks.map((stack) => stack.reverse().join(""))
}

const parseInstruction = (line: string): Instruction => {
  const split = line.split(" ")

  return {
    amount: Number.parseInt(split[1], 10),
    from: Number.parseInt(split[3], 10) - 1,
    to: Number.parseInt(split[5], 10) - 1,
  }
}

const applyInstructionToStacks = (
  instruction: Instruction,
  stacks: string[],
  moveAllAtOnce: boolean
): string[] => {
  const stacksAfterInstruction = [...stacks]
  const movedItems = stacks[instruction.from].slice(
    stacks[instruction.from].length - instruction.amount
  )

  stacksAfterInstruction[instruction.from] = stacks[instruction.from].slice(
    0,
    stacks[instruction.from].length - instruction.amount
  )
  stacksAfterInstruction[instruction.to] =
    stacks[instruction.to] + (moveAllAtOnce ? movedItems : movedItems.split("").reverse().join(""))

  return stacksAfterInstruction
}

const goA = (input) => {
  const allLines = splitToAllLines(input)

  let stackDescription = 0

  while (allLines[stackDescription] !== "") {
    stackDescription++
  }

  let stacks = parseStackDescription(allLines.slice(0, stackDescription - 1))
  const instructions = allLines.slice(stackDescription + 1).map(parseInstruction)

  instructions.forEach((instruction) => {
    stacks = applyInstructionToStacks(instruction, stacks, false)
  })

  return stacks
    .map((stack) => stack.split("").pop())
    .flatMap((elem) => elem)
    .join("")
}

const goB = (input) => {
  const allLines = splitToAllLines(input)

  let stackDescription = 0

  while (allLines[stackDescription] !== "") {
    stackDescription++
  }

  let stacks = parseStackDescription(allLines.slice(0, stackDescription - 1))
  const instructions = allLines.slice(stackDescription + 1).map(parseInstruction)

  instructions.forEach((instruction) => {
    stacks = applyInstructionToStacks(instruction, stacks, true)
  })

  return stacks
    .map((stack) => stack.split("").pop())
    .flatMap((elem) => elem)
    .join("")
}

/* Tests */

test(
  applyInstructionToStacks(
    {
      amount: 3,
      from: 0,
      to: 1,
    },
    ["ABCD", "ZXY"],
    false
  ),
  ["A", "ZXYDCB"]
)

test(
  applyInstructionToStacks(
    {
      amount: 3,
      from: 0,
      to: 1,
    },
    ["ABCD", "ZXY"],
    true
  ),
  ["A", "ZXYBCD"]
)

/* Results */

console.time("Time")
const resultA = goA(taskInput)
const resultB = goB(taskInput)
console.timeEnd("Time")

console.log("Solution to part 1:", resultA)
console.log("Solution to part 2:", resultB)
