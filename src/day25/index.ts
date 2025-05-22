import { readInput, test } from "../utils/index"
import { readTestFile, splitToLines } from "../utils/readInput"

const prepareInput = (rawInput: string) => rawInput

const taskInput = prepareInput(readInput())

const digitToDecimal = (element: string): number => {
  switch (element) {
    case "=":
      return -2
    case "-":
      return -1
    default:
      return parseInt(element, 10)
  }
}

const decimalToSnafuDigit = (digit: number): string => {
  switch (digit) {
    case -2:
      return "="
    case -1:
      return "-"
    default:
      return digit.toString(10)
  }
}

const snafuToDecimal = (line: string) => {
  const elements = line.split("")

  let decimal = 0

  for (let x = elements.length - 1; x >= 0; x--) {
    decimal += Math.pow(5, elements.length - 1 - x) * digitToDecimal(elements[x])
  }

  return decimal
}

const decimalToSnafu = (decimal: number): string => {
  let result = ""
  let quotient = decimal

  while (quotient > 0) {
    const remainder = ((quotient + 2) % 5) - 2
    quotient = Math.floor((quotient + 2) / 5)
    result = decimalToSnafuDigit(remainder) + result
  }
  return result
}

const goA = (input) => {
  const lines = splitToLines(input)

  return decimalToSnafu(
    lines
      .map((line) => snafuToDecimal(line))
      .reduce((previousValue, currentValue) => previousValue + currentValue, 0)
  )
}

/* Tests */

test(snafuToDecimal("2=-01"), 976)
test(snafuToDecimal("1121-1110-1=0"), 314159265)
test(decimalToSnafu(976), "2=-01")
test(goA(readTestFile()), "2=-1=0")

/* Results */

console.time("Time")
const resultA = goA(taskInput)
console.timeEnd("Time")

console.log("Solution to part 1:", resultA)
