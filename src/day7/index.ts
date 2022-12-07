import { readInput, test } from "../utils/index"
import { readTestFile, splitToLines } from "../utils/readInput"

const prepareInput = (rawInput: string) => rawInput

const taskInput = prepareInput(readInput())

interface CustomFileSystem {
  fileSize: Map<string, number>
  structure: Map<string, string[]>
}

enum Command {
  CD,
  LS,
}

interface FullCommand {
  command: Command
  directory?: string
}

const parseCommand = (line: string): FullCommand => {
  const split = line.split(" ")

  if (split[1] === "cd") {
    return {
      command: Command.CD,
      directory: split[2],
    }
  }
  return {
    command: Command.LS,
  }
}

const buildFilePath = (currentParentDirectory: string, directory: string): string => {
  let newFilePath = ""

  if (currentParentDirectory === "/") {
    newFilePath = `/${directory}`
  } else if (directory !== "/") {
    newFilePath = `${currentParentDirectory}/${directory}`
  } else {
    newFilePath = directory
  }

  return newFilePath
}

const parseTree = (lines: string[]): CustomFileSystem => {
  const fileSystem = {
    fileSize: new Map<string, number>(),
    structure: new Map<string, string[]>(),
  }

  let currentParentDirectory = ""

  lines.forEach((line) => {
    if (line.startsWith("$")) {
      const command = parseCommand(line)

      if (command.command === Command.CD) {
        if (command.directory === "..") {
          if (currentParentDirectory.indexOf("/") !== currentParentDirectory.lastIndexOf("/")) {
            currentParentDirectory = currentParentDirectory.substring(
              0,
              currentParentDirectory.lastIndexOf("/")
            )
          } else {
            currentParentDirectory = "/"
          }
        } else {
          const newFilePath = buildFilePath(currentParentDirectory, command.directory)

          if (
            command.directory !== "/" &&
            !fileSystem.structure.get(currentParentDirectory).includes(command.directory)
          ) {
            fileSystem.structure.get(currentParentDirectory).push(command.directory)
          }

          currentParentDirectory = newFilePath

          if (!fileSystem.structure.has(currentParentDirectory)) {
            fileSystem.structure.set(currentParentDirectory, [])
          }
        }
      }
    } else {
      const split = line.split(" ")
      const filePath = buildFilePath(currentParentDirectory, split[1])

      if (split[0] !== "dir") {
        const size = Number.parseInt(split[0], 10)
        fileSystem.fileSize.set(filePath, size)
      }
      fileSystem.structure.get(currentParentDirectory).push(split[1])
    }
  })

  return fileSystem
}

const calculateDirectorySum = (
  directory: string,
  fileSystem: CustomFileSystem,
  calculatedDirectorySizes: Map<string, number>
): number => {
  let size = 0

  const children = fileSystem.structure.get(directory)

  children.forEach((child) => {
    const filePath = buildFilePath(directory, child)

    if (fileSystem.fileSize.has(filePath)) {
      const childSize = fileSystem.fileSize.get(filePath)
      size += childSize
    } else if (calculatedDirectorySizes.has(filePath)) {
      size += calculatedDirectorySizes.get(filePath)
    } else {
      const childSize = calculateDirectorySum(filePath, fileSystem, calculatedDirectorySizes)
      size += childSize
    }
  })

  return size
}

const goA = (input) => {
  const lines = splitToLines(input)

  const fileSystem = parseTree(lines)
  const directorySize = new Map<string, number>()
  const directories = Array.from(fileSystem.structure.keys())

  directories.forEach((directory) => {
    directorySize.set(directory, calculateDirectorySum(directory, fileSystem, directorySize))
  })

  return Array.from(directorySize.values())
    .filter((size) => size <= 100000)
    .reduce((previousValue, currentValue) => previousValue + currentValue, 0)
}

const goB = (input) => {
  const TOTAL_DISK_SIZE = 70000000
  const REQUIRED_DISK_SIZE = 30000000

  const lines = splitToLines(input)
  const fileSystem = parseTree(lines)
  const directorySize = new Map<string, number>()
  const directories = Array.from(fileSystem.structure.keys())

  directories.forEach((directory) => {
    directorySize.set(directory, calculateDirectorySum(directory, fileSystem, directorySize))
  })

  const takenSpace = directorySize.get("/")
  const currentlyFreeSpace = TOTAL_DISK_SIZE - takenSpace
  const requiredSpace = REQUIRED_DISK_SIZE - currentlyFreeSpace

  return Array.from(directorySize.values())
    .sort((a, b) => a - b)
    .filter((size) => requiredSpace <= size)[0]
}

/* Tests */

test(goA(readTestFile()), 95437)

/* Results */

console.time("Time")
const resultA = goA(taskInput)
const resultB = goB(taskInput)
console.timeEnd("Time")

console.log("Solution to part 1:", resultA)
console.log("Solution to part 2:", resultB)
