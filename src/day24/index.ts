import { readInput, test } from "../utils/index"
import {readTestFile, splitToLines} from "../utils/readInput";

const prepareInput = (rawInput: string) => rawInput

const taskInput = prepareInput(readInput())

interface Position {
    x: number,
    y: number
}

interface Path {
    position: Position,
    hitEnd: boolean,
    hitStart: boolean
}

interface Blizzard {
    getPosition: (time: number) => Position
}

const parseBlizzards = (lines: string[]): Blizzard[] => {
    const blizzards: Blizzard[] = []

    for(let y = 0; y < lines.length; y++) {
        for(let x = 0; x < lines[y].length; x++) {
            const char = lines[y].charAt(x)

            if(char !== "#" && char !== ".") {
                switch (char) {
                    case "^":
                        blizzards.push({
                            getPosition: (time: number): Position => {
                                const newY = (y - time) % (lines.length - 2)
                                return {
                                    x: x,
                                    y: newY <= 0 ? newY + lines.length - 2 : newY
                                }
                            }
                        })
                        break;
                    case "v":
                        blizzards.push({
                            getPosition: (time: number): Position => {
                                const newY = (y + time) % (lines.length - 2)
                                return {
                                    x: x,
                                    y: newY <= 0 ? newY + lines.length - 2 : newY
                                }
                            }
                        })
                        break;
                    case ">":
                        blizzards.push({
                            getPosition: (time: number): Position => {
                                const newX = ((x + time) % (lines[y].length - 2))
                                return {
                                    x: newX <= 0 ? newX + lines[y].length - 2 : newX,
                                    y: y
                                }
                            }
                        })
                        break;
                    case "<":
                        blizzards.push({
                            getPosition: (time: number): Position => {
                                const newX = ((x - time) % (lines[y].length - 2))
                                return {
                                    x: newX <= 0 ? newX + lines[y].length - 2 : newX,
                                    y: y
                                }
                            }
                        })
                        break;
                        // no default
                }
            }
        }
    }

    return blizzards
}

const getAllPossiblePositions = (current: Position, maxX: number, maxY: number, targetX: number): Position[] => {
    const newPosition: Position[] = []

    if(current.x > 1 && current.y !== 0 && current.y !== maxY) {
        newPosition.push({
            x: current.x - 1,
            y: current.y
        })
    }

    if(current.x + 2 < maxX && current.y !== 0 && current.y !== maxY) {
        newPosition.push({
            x: current.x + 1,
            y: current.y
        })
    }

    if(current.y > 1 || current.x === targetX) {
        newPosition.push({
            x: current.x,
            y: current.y - 1
        })
    }

    if(current.y + 2 < maxY || current.x === targetX) {
        newPosition.push({
            x: current.x,
            y: current.y + 1
        })
    }

    newPosition.push(current)

    return newPosition
}

const getStepsToPosition = (blizzards: Blizzard[], endPosition: Position, startPosition: Position, startTime: number, xLength: number, yLength: number, roundTrip: boolean): number => {
    let currentPositions: Path[] = [{
        position: startPosition,
        hitEnd: false,
        hitStart: false
    }]
    let steps = startTime

    while(currentPositions.length > 0) {

        console.log("steps", steps)
        const nextPositions: Path[] = []

        currentPositions.forEach(path => {
            const possible = getAllPossiblePositions(path.position, xLength, yLength, endPosition.x)

            possible.forEach(possiblePosition => {
                if(!nextPositions.find(added => added.position.x === possiblePosition.x && added.position.y === possiblePosition.y)) {
                    nextPositions.push({
                        position: possiblePosition,
                        hitEnd: path.hitEnd || (possiblePosition.x === endPosition.x && possiblePosition.y === endPosition.y),
                        hitStart: path.hitStart || (path.hitEnd && possiblePosition.x === startPosition.x && possiblePosition.y === startPosition.y)
                    })
                }

            })
        })

        steps++
        currentPositions = nextPositions.filter(path => blizzards.every(blizzard => {
            const newPosition = blizzard.getPosition(steps)
            return newPosition.x !== path.position.x || newPosition.y !== path.position.y
        }))

        if(currentPositions.find(path => path.position.x === endPosition.x && path.position.y === endPosition.y && (!roundTrip || (path.hitEnd && path.hitStart)))) {
            return steps
        }
    }

    throw new Error("Never reached the end position")
}

const goA = (input) => {
    const lines = splitToLines(input)
    const blizzards = parseBlizzards(lines)

    const startPosition = {
        x: lines[0].split("").map((char, index) => ({char: char, index: index})).find((elem) => elem.char === ".").index,
        y: 0
    }

    const endPosition = {
        x: lines[lines.length - 1].split("").map((char, index) => ({char: char, index: index})).find((elem) => elem.char === ".").index,
        y: lines.length - 1
    }

    return getStepsToPosition(blizzards, endPosition, startPosition, 0, lines[0].length, lines.length, false)
}

const goB = (input) => {
    const lines = splitToLines(input)
    const blizzards = parseBlizzards(lines)

    const startPosition = {
        x: lines[0].split("").map((char, index) => ({char: char, index: index})).find((elem) => elem.char === ".").index,
        y: 0
    }

    const endPosition = {
        x: lines[lines.length - 1].split("").map((char, index) => ({char: char, index: index})).find((elem) => elem.char === ".").index,
        y: lines.length - 1
    }

    return getStepsToPosition(blizzards, endPosition, startPosition, 0, lines[0].length, lines.length, true)
}

/* Tests */

test(goA(readTestFile()), 18)
test(goB(readTestFile()), 54)

/* Results */

console.time("Time")
const resultA = goA(taskInput)
//const resultB = goB(taskInput)
console.timeEnd("Time")

console.log("Solution to part 1:", resultA)
//console.log("Solution to part 2:", resultB)
