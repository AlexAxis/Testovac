const fs = require("fs")

// reads input file
let inputFile = fs.readFileSync("test.in").toString("utf-8")

// split every paragraph into an array
let textByLine = inputFile.split("\n")

// reads output file
let logger = fs.createWriteStream("test.out", {
  flags: "a",
})

let currentCaseLine = 1
let numberPairs = 0
let numberQueries = 0
let synonymWords = []
let found = false
let synonymPair = []
let wordsToCompare = []
let firstGroup = -1
let secondGroup = -1
let same = false
let theyAreSynonyms = false

function groupSynonyms() {
  // loop through each pair of synonyms
  for (
    let currentPairLine = currentCaseLine + 1;
    currentPairLine < currentCaseLine + 1 + numberPairs;
    currentPairLine++
  ) {
    // the pair of synonyms we are going to include in a group
    synonymPair = textByLine[currentPairLine].toLowerCase().split(" ")

    // we only care to know synonyms of words that are different from each other
    if (synonymPair[0] !== synonymPair[1]) {
      // if there is currently no group of synonyms, then create one
      if (synonymWords.length === 0) {
        synonymWords.push(synonymPair)
      } else {
        // loop through each group of synonyms
        for (let a = 0; a < synonymWords.length; a++) {
          // check if 2 words already exists in groups
          if (
            synonymWords.flat().includes(synonymPair[0]) &&
            synonymWords.flat().includes(synonymPair[1])
          ) {
            found = true
            if (synonymWords[a].includes(synonymPair[0])) {
              firstGroup = a
            }
            if (synonymWords[a].includes(synonymPair[1])) {
              secondGroup = a
            }
            // check if they are in the same group
            if (
              synonymWords[a].includes(synonymPair[0]) &&
              synonymWords[a].includes(synonymPair[1])
            ) {
              same = true
            }
          } else {
            // if 1 of the words is not in any group, then add it to the correct group
            if (
              synonymWords[a].includes(synonymPair[0]) &&
              !synonymWords[a].includes(synonymPair[1])
            ) {
              synonymWords[a].push(synonymPair[1])
              found = true
            } else if (
              synonymWords[a].includes(synonymPair[1]) &&
              !synonymWords[a].includes(synonymPair[0])
            ) {
              synonymWords[a].push(synonymPair[0])
              found = true
            }
          }
        }
        // joins 2 groups that have matching synonyms in 1
        if (firstGroup !== -1 && secondGroup !== -1 && !same) {
          synonymWords[firstGroup] = synonymWords[firstGroup].concat(
            synonymWords[secondGroup]
          )
          synonymWords.splice(secondGroup, 1)
        }
        // if both words are not in the "dictionary" (any group), then create a group with those 2 words in it
        if (found === false) {
          synonymWords.push(synonymPair)
        }
      }
      // reset helper variables
      firstGroup = -1
      secondGroup = -1
      same = false
      found = false
    }
  }
}

// this function compares if the 2 values are synonyms according the the combination of synonyms available, and then writes the result in a file
function writeResult() {
  // loop through each querie
  for (let k = 0; k < numberQueries; k++) {
    // the current two words that we are going to compare if they are synonyms
    wordsToCompare = textByLine[currentCaseLine + numberPairs + 2 + k]
      .toLowerCase()
      .split(" ")

    // if they are the same, then they are synonyms
    if (wordsToCompare[0] === wordsToCompare[1]) {
      theyAreSynonyms = true
    } else {
      // check if both words appear in the "dictionary"
      if (
        synonymWords.flat().includes(wordsToCompare[0]) &&
        synonymWords.flat().includes(wordsToCompare[1])
      ) {
        for (let a = 0; a < synonymWords.length; a++) {
          // check if they belong to the same group
          if (
            synonymWords[a].includes(wordsToCompare[0]) &&
            synonymWords[a].includes(wordsToCompare[1])
          ) {
            theyAreSynonyms = true
          }
        }
      }
    }

    // write the result in the file
    if (theyAreSynonyms) {
      logger.write("synonyms\n")
    } else {
      logger.write("different\n")
    }

    // reset for the next querie
    theyAreSynonyms = false
  }
}
// loop through the number of cases (T)
for (let i = 0; i < textByLine[0]; i++) {
  numberPairs = Number(textByLine[currentCaseLine]) // number of pairs of the current case (N)
  numberQueries = Number(textByLine[currentCaseLine + numberPairs + 1]) // number of queries of the current case (Q)

  groupSynonyms()

  writeResult()

  synonymWords = [] // reset group of synonyms
  currentCaseLine = currentCaseLine + numberPairs + numberQueries + 2 //advance to the next case
}
