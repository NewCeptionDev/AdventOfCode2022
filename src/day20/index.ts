import { readInput, test } from "../utils/index"
import { readTestFile, splitToLines } from "../utils/readInput"

const prepareInput = (rawInput: string) => rawInput

const taskInput = prepareInput(readInput())

interface ListElement {
  value: number
  originalIndex: number
}

interface LinkedItem {
  element: ListElement
  prev: LinkedItem
  next: LinkedItem
}

const doMixOperation = (instructions: ListElement[], rounds: number): number => {
  let firstElement: LinkedItem = {
    element: instructions[0],
    prev: null,
    next: null,
  }

  let lastElement: LinkedItem = firstElement
  for (let i = 1; i < instructions.length; i++) {
    const newElement = {
      element: instructions[i],
      prev: lastElement,
      next: null,
    }

    lastElement.next = newElement
    lastElement = newElement

    if (i === instructions.length - 1) {
      newElement.next = firstElement
      firstElement.prev = newElement
    }
  }

  let currentElement = firstElement

  for (let i = 0; i < rounds; i++) {
    // eslint-disable-next-line @typescript-eslint/no-loop-func
    instructions.forEach((instruction) => {
      const reducedValue = instruction.value % (instructions.length - 1)

      if (reducedValue !== 0) {
        while (currentElement.element !== instruction) {
          currentElement = currentElement.next
        }

        currentElement.prev.next = currentElement.next
        currentElement.next.prev = currentElement.prev

        if (currentElement === firstElement) {
          firstElement = currentElement.next
        }

        if (reducedValue < 0) {
          for (let j = reducedValue; j <= 0; j++) {
            currentElement = currentElement.prev
          }
        } else {
          for (let j = 0; j < reducedValue; j++) {
            currentElement = currentElement.next
          }
        }

        const newLinkedItem = {
          element: instruction,
          prev: currentElement,
          next: currentElement.next,
        }

        currentElement.next = newLinkedItem
        newLinkedItem.next.prev = newLinkedItem
      }
    })
  }

  let zeroElement = firstElement
  while (zeroElement.element.value !== 0) {
    zeroElement = zeroElement.next
  }

  let sum = 0
  for (let i = 0; i <= 3000; i++) {
    if (i % 1000 === 0) {
      sum += zeroElement.element.value
    }
    zeroElement = zeroElement.next
  }

  return sum
}
const goA = (input) => {
  const instructions: ListElement[] = splitToLines(input).map((line, index) => ({
    value: Number.parseInt(line, 10),
    originalIndex: index,
  }))

  return doMixOperation(instructions, 1)
}

const goB = (input) => {
  const instructions: ListElement[] = splitToLines(input).map((line, index) => ({
    value: Number.parseInt(line, 10) * 811589153,
    originalIndex: index,
  }))

  return doMixOperation(instructions, 10)
}

/* Tests */

test(goA(readTestFile()), 3)

/* Results */

console.time("Time")
const resultA = goA(taskInput)
const resultB = goB(taskInput)
console.timeEnd("Time")

console.log("Solution to part 1:", resultA)
console.log("Solution to part 2:", resultB)
