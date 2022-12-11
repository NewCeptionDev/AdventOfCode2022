import { readInput, test } from "../utils/index"
import { readTestFile, splitToAllLines } from "../utils/readInput"

const prepareInput = (rawInput: string) => rawInput

const taskInput = prepareInput(readInput())

interface Monkey {
  startingItems: number[]
  updateWorryLevel: (before: number) => number
  decideTarget: (worryLevel: number) => number
  inspectedItems: number
}

const parseStartingItems = (line: string): number[] => {
  const splitTextAndItems = line.split(": ")
  const splitItems = splitTextAndItems[1].split(", ")

  return splitItems.map((item) => Number.parseInt(item, 10))
}

const parseOperation = (line: string): ((before: number) => number) => {
  const splitTextAndOperation = line.split(": ")
  const splitOperation = splitTextAndOperation[1].split(" ")

  const operationFunction = splitOperation[3]
  const secondOperand = splitOperation[4]

  if (operationFunction === "+") {
    if (secondOperand === "old") {
      return (before: number) => before + before
    }
    return (before: number) => before + Number.parseInt(secondOperand, 10)
  }

  if (secondOperand === "old") {
    return (before: number) => before * before
  }
  return (before: number) => before * Number.parseInt(secondOperand, 10)
}

const parseTargetDecision = (lines: string[]): ((worryLevel: number) => number) => {
  const dividableTest = Number.parseInt(lines[0].trim().split(" ")[3], 10)
  const targetIfDividable = Number.parseInt(lines[1].trim().split(" ")[5], 10)
  const targetIfNotDividable = Number.parseInt(lines[2].trim().split(" ")[5], 10)

  return (worryLevel: number) =>
    worryLevel % dividableTest === 0 ? targetIfDividable : targetIfNotDividable
}

const parseMonkey = (description: string[]): Monkey => {
  const items = parseStartingItems(description[1])
  const operation = parseOperation(description[2])
  const targetDecision = parseTargetDecision(description.slice(3, 6))

  return {
    startingItems: items,
    updateWorryLevel: operation,
    decideTarget: targetDecision,
    inspectedItems: 0,
  }
}

const calculateRound = (monkeys: Monkey[], withRelief: boolean): Monkey[] => {
  const monkeysAfterRound: Monkey[] = []

  monkeys.forEach((monkey, index) => {
    const updatedInspectedItems = monkey.inspectedItems + monkey.startingItems.length
    monkey.startingItems.forEach((item) => {
      const afterInspectWorryLevel = monkey.updateWorryLevel(item)
      const newWorryLevel = withRelief
        ? Math.floor(afterInspectWorryLevel / 3)
        : afterInspectWorryLevel
      const target = monkey.decideTarget(newWorryLevel)

      if (target < index) {
        monkeysAfterRound[target].startingItems.push(newWorryLevel)
      } else {
        monkeys[target].startingItems.push(newWorryLevel)
      }
    })

    monkeysAfterRound.push({
      startingItems: [],
      updateWorryLevel: monkey.updateWorryLevel,
      decideTarget: monkey.decideTarget,
      inspectedItems: updatedInspectedItems,
    })
  })

  return monkeysAfterRound
}

const goA = (input) => {
  const lines = splitToAllLines(input)

  let monkeys: Monkey[] = []

  for (let i = 0; i < lines.length; i += 7) {
    monkeys.push(parseMonkey(lines.slice(i, i + 7)))
  }

  for (let i = 0; i < 20; i++) {
    monkeys = calculateRound(monkeys, true)
  }

  return monkeys
    .map((monkey) => monkey.inspectedItems)
    .sort((a, b) => b - a)
    .slice(0, 2)
    .reduce((previousValue, currentValue) => previousValue * currentValue, 1)
}

const goB = (input) => {
  const lines = splitToAllLines(input)

  let monkeys: Monkey[] = []
  let lcmOfDividers = 1

  for (let i = 0; i < lines.length; i += 7) {
    monkeys.push(parseMonkey(lines.slice(i, i + 7)))
    lcmOfDividers *= Number.parseInt(lines[i + 3].trim().split(" ")[3], 10)
  }

  for (let i = 0; i < 10000; i++) {
    monkeys = calculateRound(monkeys, false)
    monkeys.forEach((monkey) => {
      // eslint-disable-next-line no-param-reassign
      monkey.startingItems = monkey.startingItems.map((item) => item % lcmOfDividers)
    })
  }

  return monkeys
    .map((monkey) => monkey.inspectedItems)
    .sort((a, b) => b - a)
    .slice(0, 2)
    .reduce((previousValue, currentValue) => previousValue * currentValue, 1)
}

/* Tests */

test(goA(readTestFile()), 10605)
test(goB(readTestFile()), 2713310158)

/* Results */

console.time("Time")
const resultA = goA(taskInput)
const resultB = goB(taskInput)
console.timeEnd("Time")

console.log("Solution to part 1:", resultA)
console.log("Solution to part 2:", resultB)
