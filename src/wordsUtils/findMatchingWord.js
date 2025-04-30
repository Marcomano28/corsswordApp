
const dictionary = [
    "apple", "banana", "cherry", "date", "elderberry", "fig", "grape", "honeydew",
    "kiwi", "lemon", "mango", "nectarine", "orange", "papaya", "quince", "raspberry",
    "strawberry", "tangerine", "ugli", "watermelon", "yam", "zucchini", "broccoli",
    "carrot", "daikon", "eggplant", "fennel", "garlic", "horseradish", "iceberg",
    "jalapeno", "kale", "lettuce", "mushroom", "nutmeg", "onion", "parsnip",
    "quinoa", "radish", "spinach", "tomato", "upland", "vanilla", "wasabi",
    "xigua", "yucca", "zebra", "acrobat", "ballet", "circus", "dance", "equinox",
    "flute", "guitar", "harmonica", "instrument", "jazz", "keyboard", "lute",
    "marimba", "note", "oboe", "piano", "quartet", "recorder", "saxophone",
    "triangle", "ukulele", "violin", "whistle", "xylophone", "yodel", "zither",
    "actor", "brush", "canvas", "draw", "easel", "frame", "gallery", "hue",
    "image", "juxtapose", "kiln", "landscape", "medium", "nylon", "oils",
    "palette", "quilt", "restore", "sketch", "texture", "uvula", "vivid",
    "watercolor", "xerox", "yellow", "zinc"
  ];

  const buildWordIndexByLetter = (dictionary) => {
    const index = {};
    for (const word of dictionary) {
      for (const letter of word) {
        if (!index[letter]) {
          index[letter] = [];
        }
        if (!index[letter].includes(word)) {
          index[letter].push(word);
        }
      }
    }
    return index;
  };
  const wordIndexByLetter = buildWordIndexByLetter(dictionary);
  
  export const findMatchingWord = (userWord) => {
   let userLetters = centerCloserLetter(userWord);
   return wordSearch(userLetters, userWord.length,wordIndexByLetter);

};

 export const centerCloserLetter = (word) => {
    let len = word.length;
    let centerIndex = Math.floor(len / 2);
    let letters = [{ letter: word[centerIndex], index: centerIndex }];
    for (let offset = 1; offset <= centerIndex; offset++) {
      if (centerIndex - offset >= 0)
        letters.push({
          letter: word[centerIndex - offset],
          index: centerIndex - offset,
        });
      if (centerIndex + offset < len) {
        letters.push({
          letter: word[centerIndex + offset],
          index: centerIndex + offset,
        });
      }
    }
    return letters;
  }

  



const wordSearch = (userLetters, userWordLength) => {
  let orderedArray = dictionary
  .slice()
  .sort((a, b) => Math.abs(a.length - userWordLength) - Math.abs(b.length - userWordLength));
let offset = 0;

while (true) {
  for (let word of orderedArray) {
    let centerIndex = Math.floor(word.length / 2);
    let startIndex = Math.max(centerIndex - offset, 0);
    let endIndex = Math.min(centerIndex + offset, word.length - 1);

    for (let i = startIndex; i <= endIndex; i++) {
      if (userLetters.some((userLetter) => userLetter.letter === word[i])) {
        return {
          foundWord: word,
          // letter: word[i],
          crossIndex: userLetters.find((userLetter) => userLetter.letter === word[i]).index,
          foundWordIndex: i,
        };
      }
    }
  }
  offset++;

  if (offset > Math.floor(orderedArray[0].length / 2)) break;
}
return undefined;
}

export const findBestCrossingAndPosition = (newUserWord, newFoundWord, avoidIndex) => {
    const letters1 = centerCloserLetter(newUserWord); // Ordered letters from center for newUserWord
    const letters2 = centerCloserLetter(newFoundWord); // Ordered letters from center for newFoundWord

    for (let letterObj1 of letters1) {
        for (let letterObj2 of letters2) {
            if (letterObj2.index === avoidIndex) {
                // Skip the avoidIndex in newFoundWord
                continue;
            }
            if (letterObj1.letter === letterObj2.letter) {
                return {
                    newUserWord,
                    crossIndex: letterObj1.index,
                    foundWordIndex: letterObj2.index
                };
            }
        }
    }
    return null;
}

export const calculateStartPosition = (newUserWord, foundWord, userCrossIndex, foundWordIndex, Size) => {
  if (!foundWord.positions || foundWord.positions.length <= foundWordIndex || foundWord.positions[foundWordIndex] === undefined) {
      console.error('Invalid or incomplete position data in foundWord:', foundWord);
      return null;
  }

  const startCol = foundWord.positions[foundWordIndex].col - userCrossIndex; // Critical to check this calculation
  if (isNaN(startCol)) {
      console.error(`Calculated start column is NaN, foundWordIndex: ${foundWordIndex}, userCrossIndex: ${userCrossIndex}`);
      return null;
  }

  const startRow = foundWord.positions[foundWordIndex].row;
  const positions = [];
  for (let i = 0; i < newUserWord.length; i++) {
      const col = startCol + i;
      if (col < 0 || col >= Size) {
          console.error(`Column out of bounds: ${col}`);
          continue;
      }
      positions.push({
          row: startRow,
          col: col,
          letter: newUserWord[i]
      });
  }

  return { positions };
};












// export const calculateWordPosition = (word, lastWord) => {
//   const shorter = word.length <= lastWord.length ? word : lastWord;
//   const longer = word.length > lastWord.length ? word : lastWord;

//   // Iterar sobre la palabra más corta
//   for (let i = 0; i < shorter.length; i++) {
//       let index = longer.indexOf(shorter[i]);
//       if (index !== -1) {
//           return {
//               letter: shorter[i],
//               index1: word.indexOf(shorter[i]),  
//               index2: lastWord.indexOf(shorter[i]) 
//           };
//       }
//   }
//   return null;
// } 

//   function wordSearch(userLetters, userWordLength, wordIndexByLetter) {  
//     let possibleWords = [];
//     if (!userLetters || !userLetters.length) {
//         console.error("userLetters is undefined or empty");
//         return undefined;
//     }

//     // Recoge todas las palabras posibles que contienen al menos una de las letras del usuario.
//     for (let { letter } of userLetters) {
//         if (letter && wordIndexByLetter[letter]) { // Asegurarse de que la comparación es insensible a mayúsculas
//             possibleWords.push(...wordIndexByLetter[letter]);
//         }
//     }
//     // Elimina duplicados
//     possibleWords = [...new Set(possibleWords)]; 
//     // Ordena por cercanía de longitud
//     possibleWords.sort((a, b) => Math.abs(a.length - userWordLength) - Math.abs(b.length - userWordLength));
  
//     for (let word of possibleWords) {
//       let centerIndex = Math.floor(word.length / 2);
//       let offset = 0;
  
//       while (true) {
//         let startIndex = Math.max(centerIndex - offset, 0);
//         let endIndex = Math.min(centerIndex + offset, word.length - 1);
  
//         for (let i = startIndex; i <= endIndex; i++) {
//           if (userLetters.some((userLetter) => userLetter.letter === word[i])) {
//             return {
//               foundWord: word,
//             //   letter: word[i],
//               userIndex: userLetters.find((userLetter) => userLetter.letter === word[i]).index,
//               foundWordIndex: i,
//             };
//           }
//         }
//         offset++;
//         if (offset > centerIndex) break; // Asegura que no sobrepasemos el centro
//       }
//     }
//     return undefined;
//   }
  
