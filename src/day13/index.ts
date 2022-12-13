import { readInput, test } from "../utils/index"
import { readTestFile, splitToAllLines, splitToLines } from "../utils/readInput"

const prepareInput = (rawInput: string) => rawInput

const taskInput = prepareInput(readInput())

interface DataPacket {
  values: (number | DataPacket)[]
}

interface ParsingResult {
  data: DataPacket
  returnIndex: number
}

const parseDataPacket = (line: string, startIndex: number): ParsingResult => {
  const list: (number | DataPacket)[] = []
  let temporaryInt = ""
  for (let i = startIndex; i < line.length; i++) {
    if (line.charAt(i) === "[") {
      const parseResult = parseDataPacket(line, i + 1)
      i = parseResult.returnIndex
      list.push(parseResult.data)
    } else if (line.charAt(i) === "]") {
      if (temporaryInt) {
        list.push(Number.parseInt(temporaryInt, 10))
      }
      return {
        data: {
          values: list,
        },
        returnIndex: i,
      }
    } else if (line.charAt(i) === ",") {
      if (temporaryInt) {
        list.push(Number.parseInt(temporaryInt, 10))
        temporaryInt = ""
      }
    } else {
      temporaryInt += line.charAt(i)
    }
  }

  throw new Error(`Should never get to this point with ${list} from ${startIndex}`)
}

const comparePairValues = (val1: number | DataPacket, val2: number | DataPacket): number => {
  if (typeof val1 === "number" && typeof val2 === "number") {
    if (val1 === val2) {
      return 0
    }

    return val1 < val2 ? -1 : 1
  }
  let dataPacketVal1: DataPacket
  let dataPacketVal2: DataPacket

  if (typeof val1 === "number") {
    dataPacketVal1 = {
      values: [val1],
    }
  } else {
    dataPacketVal1 = val1
  }

  if (typeof val2 === "number") {
    dataPacketVal2 = {
      values: [val2],
    }
  } else {
    dataPacketVal2 = val2
  }

  for (let i = 0; i < dataPacketVal1.values.length; i++) {
    if (dataPacketVal2.values.length <= i) {
      return 1
    }

    const compareResult = comparePairValues(dataPacketVal1.values[i], dataPacketVal2.values[i])

    if (compareResult !== 0) {
      return compareResult
    }
  }

  if (dataPacketVal2.values.length > dataPacketVal1.values.length) {
    return -1
  }

  return 0
}

const comparePairs = (lines: string[]): number => {
  const pairs = lines.map((line) => parseDataPacket(line, 1).data)

  return comparePairValues(pairs[0], pairs[1])
}
const goA = (input) => {
  const lines = splitToAllLines(input)

  let correctlyOrderedPacketsSum = 0
  let index = 1
  for (let i = 0; i < lines.length; i += 3) {
    const result = comparePairs(lines.slice(i, i + 2))

    if (result < 0) {
      correctlyOrderedPacketsSum += index
    }
    index++
  }

  return correctlyOrderedPacketsSum
}

const goB = (input) => {
  const lines = splitToLines(input)
  lines.push("[[2]]")
  lines.push("[[6]]")

  const sorted: DataPacket[] = []

  for (let i = 0; i < lines.length; i++) {
    const dataPacket = parseDataPacket(lines[i], 1).data
    let inserted = false

    for (let j = 0; j < sorted.length && !inserted; j++) {
      if (comparePairValues(dataPacket, sorted[j]) < 0) {
        sorted.splice(j, 0, dataPacket)
        inserted = true
      }
    }

    if (!inserted) {
      sorted.push(dataPacket)
    }
  }

  const searchedDataPacket1 = parseDataPacket("[[2]]", 1).data
  const searchedDataPacket2 = parseDataPacket("[[6]]", 1).data

  let result = 1
  let found = 0

  for (let i = 0; i < sorted.length && found < 2; i++) {
    if (
      comparePairValues(searchedDataPacket1, sorted[i]) === 0 ||
      comparePairValues(searchedDataPacket2, sorted[i]) === 0
    ) {
      found++
      result *= i + 1
    }
  }

  return result
}

/* Tests */

test(goA(readTestFile()), 13)
test(goB(readTestFile()), 140)

/* Results */

console.time("Time")
const resultA = goA(taskInput)
const resultB = goB(taskInput)
console.timeEnd("Time")

console.log("Solution to part 1:", resultA)
console.log("Solution to part 2:", resultB)
