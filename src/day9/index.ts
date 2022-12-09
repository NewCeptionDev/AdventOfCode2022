import { readInput, test } from "../utils/index"
import { readInputFromSpecialFile, readTestFile, splitToLines } from "../utils/readInput"

const prepareInput = (rawInput: string) => rawInput

const taskInput = prepareInput(readInput())

enum Direction {
  Up,
  Down,
  Right,
  Left,
}

interface Pair<T> {
  first: T
  second: T
}

interface Instruction {
  direction: Direction
  moves: number
}

const parseDirection = (letter: string): Direction => {
  switch (letter) {
    case "U":
      return Direction.Up
    case "D":
      return Direction.Down
    case "L":
      return Direction.Left
    case "R":
      return Direction.Right
    // no default
  }

  throw new Error(`Couldn't parse direction from ${letter}`)
}

const parseInstruction = (line: string): Instruction => {
  const split = line.split(" ")

  return {
    direction: parseDirection(split[0]),
    moves: Number.parseInt(split[1], 10),
  }
}

const getNewTailPosition = (
  headPosition: Pair<number>,
  lastTailPosition: Pair<number>
): Pair<number> => {
  if (headPosition.first === lastTailPosition.first) {
    const difference = headPosition.second - lastTailPosition.second

    if (Math.abs(difference) < 2) {
      return lastTailPosition
    }

    return {
      first: lastTailPosition.first,
      second: lastTailPosition.second + difference + (difference > 0 ? -1 : 1),
    }
  } else if (headPosition.second === lastTailPosition.second) {
    const difference = headPosition.first - lastTailPosition.first

    if (Math.abs(difference) < 2) {
      return lastTailPosition
    }

    return {
      first: lastTailPosition.first + difference + (difference > 0 ? -1 : 1),
      second: lastTailPosition.second,
    }
  }

  const firstDifference = headPosition.first - lastTailPosition.first
  const secondDifference = headPosition.second - lastTailPosition.second

  if (Math.abs(firstDifference) < 2 && Math.abs(secondDifference) < 2) {
    return lastTailPosition
  }

  return {
    first:
      lastTailPosition.first +
      firstDifference +
      (firstDifference > 1 ? -1 : firstDifference < -1 ? 1 : 0),
    second:
      lastTailPosition.second +
      secondDifference +
      (secondDifference > 1 ? -1 : secondDifference < -1 ? 1 : 0),
  }
}

const moveHead = (headPosition: Pair<number>, instruction: Instruction) => {
  switch (instruction.direction) {
    case Direction.Up:
      return {
        first: headPosition.first,
        second: headPosition.second - 1,
      }
    case Direction.Down:
      return {
        first: headPosition.first,
        second: headPosition.second + 1,
      }
    case Direction.Left:
      return {
        first: headPosition.first - 1,
        second: headPosition.second,
      }
    case Direction.Right:
      return {
        first: headPosition.first + 1,
        second: headPosition.second,
      }
    // no default
  }

  throw new Error(`Unknown direction within instruction ${instruction}`)
}

const goA = (input) => {
  const lines = splitToLines(input)
  const instructions = lines.map(parseInstruction)

  const allTailPositions = new Map<number, number[]>()
  let headPosition = { first: 0, second: 0 }
  let tailPosition = { first: 0, second: 0 }

  allTailPositions.set(0, [0])

  instructions.forEach((instruction) => {
    for (let i = 0; i < instruction.moves; i++) {
      headPosition = moveHead(headPosition, instruction)
      tailPosition = getNewTailPosition(headPosition, tailPosition)

      if (!allTailPositions.has(tailPosition.second)) {
        allTailPositions.set(tailPosition.second, [])
      }

      if (!allTailPositions.get(tailPosition.second).includes(tailPosition.first)) {
        allTailPositions.get(tailPosition.second).push(tailPosition.first)
      }
    }
  })

  return Array.from(allTailPositions.keys())
    .map((key) => allTailPositions.get(key).length)
    .reduce((previousValue, currentValue) => previousValue + currentValue, 0)
}

const goB = (input) => {
  const lines = splitToLines(input)
  const instructions = lines.map(parseInstruction)

  const allTailPositions = new Map<number, number[]>()
  const positions: Pair<number>[] = []
  for (let i = 0; i < 10; i++) {
    positions.push({ first: 0, second: 0 })
  }

  let tailHasMoved = false

  instructions.forEach((instruction) => {
    for (let moveCount = 0; moveCount < instruction.moves; moveCount++) {
      positions[0] = moveHead(positions[0], instruction)
      for (let tailElement = 1; tailElement < positions.length; tailElement++) {
        positions[tailElement] = getNewTailPosition(
          positions[tailElement - 1],
          positions[tailElement]
        )
      }

      if (!allTailPositions.has(positions[positions.length - 1].second)) {
        allTailPositions.set(positions[positions.length - 1].second, [])
      }

      if (
        !allTailPositions
          .get(positions[positions.length - 1].second)
          .includes(positions[positions.length - 1].first)
      ) {
        if (
          !tailHasMoved &&
          (positions[positions.length - 1].first !== 0 ||
            positions[positions.length - 1].second !== 0)
        ) {
          tailHasMoved = true
          allTailPositions.get(0).push(0)
        }

        if (tailHasMoved) {
          allTailPositions
            .get(positions[positions.length - 1].second)
            .push(positions[positions.length - 1].first)
        }
      }
    }
  })

  return Array.from(allTailPositions.keys())
    .map((key) => allTailPositions.get(key).length)
    .reduce((previousValue, currentValue) => previousValue + currentValue, 0)
}

/* Tests */

test(getNewTailPosition({ first: 5, second: 3 }, { first: 7, second: 3 }), { first: 6, second: 3 })
test(getNewTailPosition({ first: 9, second: 3 }, { first: 7, second: 3 }), { first: 8, second: 3 })
test(getNewTailPosition({ first: 3, second: 5 }, { first: 3, second: 7 }), { first: 3, second: 6 })
test(getNewTailPosition({ first: 3, second: 9 }, { first: 3, second: 7 }), { first: 3, second: 8 })
test(getNewTailPosition({ first: 3, second: 3 }, { first: 1, second: 1 }), { first: 2, second: 2 })
test(getNewTailPosition({ first: 3, second: 3 }, { first: 1, second: 2 }), { first: 2, second: 3 })
test(goA(readTestFile()), 13)
test(goB(readTestFile()), 0)
test(goB(readInputFromSpecialFile("testInput2.txt")), 36)

/* Results */

console.time("Time")
const resultA = goA(taskInput)
const resultB = goB(taskInput)
console.timeEnd("Time")

console.log("Solution to part 1:", resultA)
console.log("Solution to part 2:", resultB)
