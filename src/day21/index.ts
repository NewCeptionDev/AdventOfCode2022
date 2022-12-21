import { readInput } from "../utils/index"
import { splitToLines } from "../utils/readInput"

const prepareInput = (rawInput: string) => rawInput

const taskInput = prepareInput(readInput())

enum Operation {
  ADD,
  MINUS,
  MULTIPLY,
  DIVIDE,
}

interface Monkey {
  yells: string
  operation?: Operation
  operand1?: string
  operand2?: string
  value?: number
  influencedByHuman?: boolean
}

const parseOperation = (operation: string): Operation => {
  switch (operation) {
    case "+":
      return Operation.ADD
    case "-":
      return Operation.MINUS
    case "*":
      return Operation.MULTIPLY
    case "/":
      return Operation.DIVIDE
    // no default
  }

  throw new Error("Unknown Operation")
}

const parseMonkey = (line: string): Monkey => {
  const splitYellsAndRequirements = line.split(": ")
  const requirementsSplit = splitYellsAndRequirements[1].split(" ")

  if (requirementsSplit.length === 1) {
    return {
      yells: splitYellsAndRequirements[0],
      value: Number.parseInt(requirementsSplit[0], 10),
    }
  }

  return {
    yells: splitYellsAndRequirements[0],
    operand1: requirementsSplit[0],
    operand2: requirementsSplit[2],
    operation: parseOperation(requirementsSplit[1]),
  }
}

const getRequiredValueForExpectedResult = (
  expected: number,
  operation: Operation,
  otherOperand: number,
  op1Searched: boolean
): number => {
  switch (operation) {
    case Operation.ADD:
      return expected - otherOperand
    case Operation.MINUS:
      if (op1Searched) {
        return expected + otherOperand
      }
      return otherOperand - expected
    case Operation.MULTIPLY:
      return expected / otherOperand
    case Operation.DIVIDE:
      if (op1Searched) {
        return expected * otherOperand
      }
      return otherOperand / expected
    // no default
  }

  throw new Error("Unknown operation when getting required value for expected result")
}

const findCorrectValueForExpectedResult = (
  yelled: string,
  yellsMap: Map<string, Monkey>,
  expected: number
): number => {
  if (yelled === "humn") {
    return expected
  }

  const monkey = yellsMap.get(yelled)

  const operand1Monkey = yellsMap.get(monkey.operand1)
  const operand2Monkey = yellsMap.get(monkey.operand2)

  if (operand1Monkey.influencedByHuman) {
    const requiredResult = getRequiredValueForExpectedResult(
      expected,
      monkey.operation,
      getNumberYelledByMonkey(monkey.operand2, yellsMap, false),
      true
    )
    return findCorrectValueForExpectedResult(monkey.operand1, yellsMap, requiredResult)
  } else if (operand2Monkey.influencedByHuman) {
    const requiredResult = getRequiredValueForExpectedResult(
      expected,
      monkey.operation,
      getNumberYelledByMonkey(monkey.operand1, yellsMap, false),
      false
    )
    return findCorrectValueForExpectedResult(monkey.operand2, yellsMap, requiredResult)
  }

  throw new Error("No operand monkey was influenced by human")
}

const getNumberYelledByMonkey = (
  yelled: string,
  yellsMap: Map<string, Monkey>,
  rootEqualCheck: boolean
): number => {
  const monkey = yellsMap.get(yelled)

  if (monkey.value !== undefined) {
    return monkey.value
  }

  const operand1 = getNumberYelledByMonkey(monkey.operand1, yellsMap, rootEqualCheck)
  const operand2 = getNumberYelledByMonkey(monkey.operand2, yellsMap, rootEqualCheck)

  if (rootEqualCheck && yelled === "root") {
    if (operand1 !== operand2) {
      const operand1Monkey = yellsMap.get(monkey.operand1)
      return operand1Monkey.influencedByHuman
        ? findCorrectValueForExpectedResult(monkey.operand1, yellsMap, operand2)
        : findCorrectValueForExpectedResult(monkey.operand2, yellsMap, operand1)
    }
  }

  let result
  switch (monkey.operation) {
    case Operation.ADD:
      result = operand1 + operand2
      break
    case Operation.MINUS:
      result = operand1 - operand2
      break
    case Operation.MULTIPLY:
      result = operand1 * operand2
      break
    case Operation.DIVIDE:
      result = Math.floor(operand1 / operand2)
      break
    // no default
  }

  monkey.influencedByHuman =
    yellsMap.get(monkey.operand1).influencedByHuman ||
    yellsMap.get(monkey.operand2).influencedByHuman
  monkey.value = result
  return result
}

const goA = (input) => {
  const lines = splitToLines(input)
  const monkeys = lines.map(parseMonkey)

  const yellsMap = new Map<string, Monkey>()

  monkeys.forEach((monkey) => {
    yellsMap.set(monkey.yells, monkey)
  })

  return getNumberYelledByMonkey("root", yellsMap, false)
}

const goB = (input) => {
  const lines = splitToLines(input)
  const monkeys = lines.map(parseMonkey)

  const yellsMap = new Map<string, Monkey>()

  monkeys.forEach((monkey) => {
    yellsMap.set(monkey.yells, monkey)
  })
  yellsMap.get("humn").influencedByHuman = true

  return getNumberYelledByMonkey("root", yellsMap, true)
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
