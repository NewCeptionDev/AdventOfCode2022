import { readInput } from "../utils"
import { splitToLines } from "../utils/readInput"

const prepareInput = (rawInput: string) => rawInput

const taskInput = prepareInput(readInput())

enum HandShape {
  ROCK = 1,
  PAPER = 2,
  SCISSORS = 3,
}

const toHandShape = (letter: string) => {
  switch (letter) {
    case "A":
    case "X":
      return HandShape.ROCK
    case "B":
    case "Y":
      return HandShape.PAPER
    case "C":
    case "Z":
      return HandShape.SCISSORS
    // no default
  }

  throw new Error("not expected to land here")
}

const getScoreForHandShape = (shape: HandShape): number => shape.valueOf()

const getWinner = (firstHandShape: HandShape, secondHandShape: HandShape) => {
  if (firstHandShape === secondHandShape) {
    return 0
  }

  if (
    firstHandShape > secondHandShape &&
    (secondHandShape !== HandShape.ROCK || firstHandShape !== HandShape.SCISSORS)
  ) {
    return -1
  }

  if (secondHandShape === HandShape.SCISSORS && firstHandShape === HandShape.ROCK) {
    return -1
  }

  return 1
}

const calculateScore = (yourHandShape: HandShape, opponentHandShape: HandShape) => {
  const score = getScoreForHandShape(yourHandShape)
  const winner = getWinner(yourHandShape, opponentHandShape)

  switch (winner) {
    case -1:
      return score + 6
    case 0:
      return score + 3
    case 1:
      return score
    // no default
  }

  throw new Error("not expected to land here")
}

const goA = (input) => {
  const matches = splitToLines(input)

  let overallScore = 0

  matches.forEach((line) => {
    const parts = line.split(" ")

    overallScore += calculateScore(toHandShape(parts[1]), toHandShape(parts[0]))
  })

  return overallScore
}

enum RESULT {
  WIN,
  LOSE,
  DRAW,
}

const toResult = (letter: string): RESULT => {
  switch (letter) {
    case "X":
      return RESULT.LOSE
    case "Y":
      return RESULT.DRAW
    case "Z":
      return RESULT.WIN
    // no default
  }

  throw new Error("not expected to land here")
}

const getShapeForResult = (expectedResult: RESULT, opponentHandShape: HandShape): HandShape => {
  if (expectedResult === RESULT.DRAW) {
    return opponentHandShape
  }

  if (expectedResult === RESULT.WIN) {
    if (opponentHandShape === HandShape.SCISSORS) {
      return HandShape.ROCK
    }
    return opponentHandShape + 1
  }

  if (expectedResult === RESULT.LOSE) {
    if (opponentHandShape === HandShape.ROCK) {
      return HandShape.SCISSORS
    }
    return opponentHandShape - 1
  }

  throw new Error("not expected to land here")
}

const goB = (input) => {
  const matches = splitToLines(input)

  let overallScore = 0

  matches.forEach((line) => {
    const parts = line.split(" ")

    const opponentHandShape = toHandShape(parts[0])

    overallScore += calculateScore(
      getShapeForResult(toResult(parts[1]), opponentHandShape),
      opponentHandShape
    )
  })

  return overallScore
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
