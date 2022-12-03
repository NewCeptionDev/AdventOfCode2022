import { readInput } from "../utils/index"
import { splitToLines } from "../utils/readInput"

const prepareInput = (rawInput: string) => rawInput

const taskInput = prepareInput(readInput())

const splitIntoParts = (rucksack: string): string[] => {
  const middleOfRucksack = rucksack.length / 2

  return [
    rucksack.substring(0, middleOfRucksack),
    rucksack.substring(middleOfRucksack, rucksack.length + 1),
  ]
}

const findDuplicateInCompartments = (parts: string[]): string => {
  const itemsInSecondCompartment = parts[1].split("")

  for (let i = 0; i < itemsInSecondCompartment.length; i++) {
    if (parts[0].includes(itemsInSecondCompartment[i])) {
      return itemsInSecondCompartment[i]
    }
  }

  throw new Error(`no duplicate item found for the given parts ${parts}`)
}

const getPriority = (item: string): number =>
  item.charCodeAt(0) - (item.toUpperCase() === item ? 38 : 96)

const goA = (input) => {
  const lines = splitToLines(input)

  return lines
    .map(splitIntoParts)
    .map(findDuplicateInCompartments)
    .map(getPriority)
    .reduce((previousValue, currentValue) => previousValue + currentValue, 0)
}

const findDuplicateForGroup = (groups: string[]): string => {
  let duplicateItems: Set<string> = new Set<string>(groups[0].split(""))

  for (let i = 1; i < groups.length; i++) {
    const updatedDuplicateItems: Set<string> = new Set<string>()
    duplicateItems.forEach((item) => {
      if (groups[i].includes(item)) {
        updatedDuplicateItems.add(item)
      }
    })
    duplicateItems = updatedDuplicateItems
  }

  if (duplicateItems.size !== 1) {
    throw new Error("found unexpected amount of duplicate items")
  }

  return duplicateItems.values().next().value
}

const goB = (input) => {
  const lines = splitToLines(input)

  let sumOfPriorities = 0

  for (let i = 0; i < lines.length; i += 3) {
    sumOfPriorities += getPriority(findDuplicateForGroup([lines[i], lines[i + 1], lines[i + 2]]))
  }

  return sumOfPriorities
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
