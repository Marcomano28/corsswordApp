
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

  export const findMatchingWord = async (userWord, wordsList = [], tryDoubleMatch = false) => {
   // Lista de palabras problemáticas que queremos evitar
   const problematicWords = ["instrument"];

   let userLetters = centerCloserLetter(userWord);
   let result = wordSearch(userLetters, userWord.length, wordsList, tryDoubleMatch);

   // Si el resultado es una palabra problemática, intentar encontrar otra
   if (result && problematicWords.includes(result.foundWord.toLowerCase())) {
     console.log(`Found problematic word "${result.foundWord}", trying to find an alternative...`);

     // Excluir la palabra problemática y buscar otra
     const filteredWordsList = wordsList.filter(w => {
       const wordStr = typeof w === 'string' ? w : w.word;
       return !problematicWords.includes(wordStr.toLowerCase());
     });

     // Intentar encontrar otra palabra
     const alternativeResult = wordSearch(userLetters, userWord.length, filteredWordsList, tryDoubleMatch, problematicWords);

     if (alternativeResult) {
       console.log(`Found alternative word: ${alternativeResult.foundWord}`);
       result = alternativeResult;
     } else {
       console.log(`Could not find alternative for problematic word "${result.foundWord}"`);
     }
   }

   // Si no se encontró palabra, devolver un mensaje indicando que se debe consultar a la IA
   if (!result && tryDoubleMatch) {
     try {
       // Importar la función para consultar a la API de Gemini de forma dinámica
       // para evitar problemas de importación circular
       const { consultarGeminiApi } = await import('../api/geminiApi');

       // Extraer solo las palabras de wordsList para enviar a la API
       const palabrasHorizontales = wordsList.map(item => {
         return typeof item === 'string' ? item : item.word;
       });

       // Llamar a la API de Gemini
       const sugerencia = await consultarGeminiApi(palabrasHorizontales);

       // Si se obtuvo una sugerencia válida, verificar que no sea una palabra problemática
       if (sugerencia && typeof sugerencia === 'string') {
         const sugerenciaLimpia = sugerencia.trim().toUpperCase().split(/\s+/)[0];

         // Verificar que la sugerencia no sea una palabra problemática
         if (problematicWords.includes(sugerenciaLimpia.toLowerCase())) {
           console.log(`AI suggested problematic word "${sugerenciaLimpia}", requesting another suggestion...`);

           // Intentar obtener otra sugerencia
           const nuevaSugerencia = await consultarGeminiApi([...palabrasHorizontales, `NOT ${sugerenciaLimpia}`]);

           if (nuevaSugerencia && typeof nuevaSugerencia === 'string') {
             return {
               aiSuggestion: true,
               suggestionWord: nuevaSugerencia.trim().toUpperCase().split(/\s+/)[0],
               message: "Sugerencia alternativa de la IA"
             };
           }
         } else {
           return {
             aiSuggestion: true,
             suggestionWord: sugerenciaLimpia,
             message: "Sugerencia de la IA"
           };
         }
       }
     } catch (error) {
       console.error('Error al consultar la IA:', error);
     }

     // Si hay algún error o no se obtiene sugerencia, devolver el mensaje original
     return { noMatchFound: true, message: "Consultemos a la IA" };
   }

   return result;
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





const wordSearch = (userLetters, userWordLength, allWords = [], findDoubleCross = false, problematicWords = []) => {
  // Filtrar palabras que ya existen en el crucigrama para evitar duplicados
  const existingWords = allWords.map(w => typeof w === 'string' ? w.toLowerCase() : w.word.toLowerCase());

  // Ordenar el diccionario por cercanía de longitud a la palabra del usuario
  let orderedArray = dictionary
    .slice()
    .filter(word => {
      // Filtrar palabras ya usadas
      if (existingWords.includes(word.toLowerCase())) {
        return false;
      }

      // Filtrar palabras problemáticas
      if (problematicWords && problematicWords.includes(word.toLowerCase())) {
        console.log(`Filtering out problematic word: ${word}`);
        return false;
      }

      return true;
    })
    .sort((a, b) => Math.abs(a.length - userWordLength) - Math.abs(b.length - userWordLength));

  // Si no hay palabras disponibles después de filtrar, devolver undefined
  if (orderedArray.length === 0) {
    console.log("No hay palabras disponibles en el diccionario después de filtrar las existentes y problemáticas");
    return undefined;
  }

  let offset = 0;
  let possibleMatches = [];

  // Primero intentamos con cruce simple (una letra común)
  while (true) {
    for (let word of orderedArray) {
      let centerIndex = Math.floor(word.length / 2);
      let startIndex = Math.max(centerIndex - offset, 0);
      let endIndex = Math.min(centerIndex + offset, word.length - 1);

      for (let i = startIndex; i <= endIndex; i++) {
        for (let userLetter of userLetters) {
          if (userLetter.letter.toLowerCase() === word[i].toLowerCase()) {
            // En lugar de devolver inmediatamente, guardamos todas las posibles coincidencias
            possibleMatches.push({
              foundWord: word,
              crossIndex: userLetter.index,
              foundWordIndex: i,
              // Calcular un puntaje de calidad para esta coincidencia
              // Preferimos palabras de longitud similar y cruces cerca del centro
              qualityScore: (10 - Math.abs(word.length - userWordLength)) +
                           (5 - Math.abs(centerIndex - i))
            });
          }
        }
      }
    }

    offset++;

    // Si hemos encontrado al menos 3 posibles coincidencias o hemos alcanzado el límite de offset, salimos del bucle
    if (possibleMatches.length >= 3 || offset > Math.floor(orderedArray[0].length / 2)) {
      break;
    }
  }

  // Si encontramos coincidencias, devolver la mejor según el puntaje de calidad
  if (possibleMatches.length > 0) {
    // Ordenar por puntaje de calidad (mayor primero)
    possibleMatches.sort((a, b) => b.qualityScore - a.qualityScore);
    console.log("Posibles coincidencias encontradas:", possibleMatches);

    // Verificar si la mejor coincidencia es una palabra problemática
    if (problematicWords && problematicWords.includes(possibleMatches[0].foundWord.toLowerCase())) {
      console.log(`Best match is problematic word "${possibleMatches[0].foundWord}", trying next best match...`);

      // Filtrar las coincidencias problemáticas
      const nonProblematicMatches = possibleMatches.filter(match =>
        !problematicWords.includes(match.foundWord.toLowerCase())
      );

      // Si hay coincidencias no problemáticas, usar la mejor de ellas
      if (nonProblematicMatches.length > 0) {
        console.log(`Using alternative match: ${nonProblematicMatches[0].foundWord}`);
        return {
          foundWord: nonProblematicMatches[0].foundWord,
          crossIndex: nonProblematicMatches[0].crossIndex,
          foundWordIndex: nonProblematicMatches[0].foundWordIndex
        };
      }
    }

    // Devolver la mejor coincidencia
    return {
      foundWord: possibleMatches[0].foundWord,
      crossIndex: possibleMatches[0].crossIndex,
      foundWordIndex: possibleMatches[0].foundWordIndex
    };
  }

  // Si no se encontró un cruce simple y se solicitó buscar cruces dobles
  if (findDoubleCross && allWords.length >= 2) {
    return findDoubleLetterCross(orderedArray, allWords, problematicWords);
  }

  return undefined;
}

// Función para buscar cruces dobles (dos letras en común con palabras anteriores)
const findDoubleLetterCross = (wordArray, existingWords, problematicWords = []) => {
  console.log("Buscando cruces dobles...");
  console.log("Palabras existentes:", existingWords.map(w => typeof w === 'string' ? w : w.word));

  // Array para almacenar todas las posibles coincidencias de cruce doble
  let possibleDoubleMatches = [];

  // Convertir existingWords a un formato más manejable
  const processedExistingWords = existingWords.map(w => {
    if (typeof w === 'string') {
      return { word: w, direction: 'horizontal' };
    } else if (w && w.word) {
      return {
        word: w.word,
        direction: w.direction || 'horizontal',
        positions: w.positions
      };
    }
    return null;
  }).filter(w => w !== null);

  // Filtrar para obtener solo palabras horizontales
  const horizontalWords = processedExistingWords.filter(w => w.direction === 'horizontal');

  console.log("Palabras horizontales para cruces dobles:", horizontalWords.map(w => w.word));

  // Si no hay al menos una palabra horizontal, no podemos hacer cruces dobles
  if (horizontalWords.length === 0) {
    console.log("No hay palabras horizontales para formar cruces dobles");
    return undefined;
  }

  for (let word of wordArray) {
    // Saltar palabras problemáticas
    if (problematicWords && problematicWords.includes(word.toLowerCase())) {
      console.log(`Skipping problematic word in double cross search: ${word}`);
      continue;
    }

    // Para cada palabra horizontal, buscar letras comunes
    for (let horizontalWord of horizontalWords) {
      const horizontalWordStr = horizontalWord.word;

      if (!horizontalWordStr) {
        console.error("Invalid horizontalWord format:", horizontalWord);
        continue;
      }

      // Mapa para almacenar las letras comunes por letra
      const letterMap = {};

      // Buscar letras comunes entre la palabra horizontal y la palabra candidata
      for (let i = 0; i < horizontalWordStr.length; i++) {
        const letter = horizontalWordStr[i].toLowerCase();

        // Buscar todas las ocurrencias de esta letra en la palabra candidata
        for (let j = 0; j < word.length; j++) {
          if (word[j].toLowerCase() === letter) {
            if (!letterMap[letter]) {
              letterMap[letter] = [];
            }

            letterMap[letter].push({
              horizontalIndex: i,
              candidateIndex: j
            });
          }
        }
      }

      // Verificar si hay al menos dos letras diferentes con coincidencias
      const lettersWithMatches = Object.keys(letterMap);

      if (lettersWithMatches.length >= 2) {
        // Tenemos al menos dos letras diferentes con coincidencias
        console.log(`Encontradas ${lettersWithMatches.length} letras diferentes con coincidencias entre "${horizontalWordStr}" y "${word}"`);

        // Para cada par de letras diferentes, crear un cruce doble
        for (let i = 0; i < lettersWithMatches.length - 1; i++) {
          for (let j = i + 1; j < lettersWithMatches.length; j++) {
            const letter1 = lettersWithMatches[i];
            const letter2 = lettersWithMatches[j];

            // Para cada combinación de índices de la primera letra
            for (const match1 of letterMap[letter1]) {
              // Para cada combinación de índices de la segunda letra
              for (const match2 of letterMap[letter2]) {
                // Verificar que los índices en la palabra candidata sean diferentes
                if (match1.candidateIndex !== match2.candidateIndex) {
                  // Calcular la distancia entre los cruces
                  const distance = Math.abs(match1.candidateIndex - match2.candidateIndex);

                  // Calcular un puntaje de calidad para esta coincidencia
                  // Preferimos cruces que estén más separados entre sí y palabras más largas
                  const qualityScore = distance * 2 + (word.length >= 5 ? 5 : 0);

                  // Verificar que la distancia entre los cruces sea suficiente
                  if (distance >= 2) {
                    possibleDoubleMatches.push({
                      foundWord: word,
                      crossIndex: match1.horizontalIndex,
                      foundWordIndex: match1.candidateIndex,
                      secondCrossIndex: match2.horizontalIndex,
                      secondFoundWordIndex: match2.candidateIndex,
                      horizontalWord: horizontalWordStr,
                      isDoubleCross: true,
                      qualityScore: qualityScore,
                      letter1: letter1,
                      letter2: letter2
                    });

                    console.log(`Cruce doble encontrado: "${word}" cruza con "${horizontalWordStr}" en las letras "${letter1}" y "${letter2}"`);
                  }
                }
              }
            }
          }
        }
      } else if (lettersWithMatches.length === 1) {
        // Si solo hay una letra con múltiples coincidencias, también podemos formar un cruce doble
        const letter = lettersWithMatches[0];
        const matches = letterMap[letter];

        if (matches.length >= 2) {
          console.log(`Encontradas ${matches.length} coincidencias de la letra "${letter}" entre "${horizontalWordStr}" y "${word}"`);

          // Para cada par de coincidencias de la misma letra
          for (let i = 0; i < matches.length - 1; i++) {
            for (let j = i + 1; j < matches.length; j++) {
              const match1 = matches[i];
              const match2 = matches[j];

              // Verificar que los índices en ambas palabras sean diferentes
              if (match1.horizontalIndex !== match2.horizontalIndex &&
                  match1.candidateIndex !== match2.candidateIndex) {

                // Calcular la distancia entre los cruces
                const distance = Math.abs(match1.candidateIndex - match2.candidateIndex);

                // Calcular un puntaje de calidad para esta coincidencia
                const qualityScore = distance * 2 + (word.length >= 5 ? 5 : 0);

                // Verificar que la distancia entre los cruces sea suficiente
                if (distance >= 2) {
                  possibleDoubleMatches.push({
                    foundWord: word,
                    crossIndex: match1.horizontalIndex,
                    foundWordIndex: match1.candidateIndex,
                    secondCrossIndex: match2.horizontalIndex,
                    secondFoundWordIndex: match2.candidateIndex,
                    horizontalWord: horizontalWordStr,
                    isDoubleCross: true,
                    qualityScore: qualityScore,
                    letter1: letter,
                    letter2: letter
                  });

                  console.log(`Cruce doble encontrado con la misma letra: "${word}" cruza con "${horizontalWordStr}" en la letra "${letter}" dos veces`);
                }
              }
            }
          }
        }
      }
    }
  }

  // Si encontramos coincidencias de cruce doble, devolver la mejor según el puntaje de calidad
  if (possibleDoubleMatches.length > 0) {
    // Ordenar por puntaje de calidad (mayor primero)
    possibleDoubleMatches.sort((a, b) => b.qualityScore - a.qualityScore);
    console.log("Posibles cruces dobles encontrados:", possibleDoubleMatches);

    // Verificar si la mejor coincidencia es una palabra problemática
    if (problematicWords && problematicWords.includes(possibleDoubleMatches[0].foundWord.toLowerCase())) {
      console.log(`Best double cross match is problematic word "${possibleDoubleMatches[0].foundWord}", trying next best match...`);

      // Filtrar las coincidencias problemáticas
      const nonProblematicMatches = possibleDoubleMatches.filter(match =>
        !problematicWords.includes(match.foundWord.toLowerCase())
      );

      // Si hay coincidencias no problemáticas, usar la mejor de ellas
      if (nonProblematicMatches.length > 0) {
        console.log(`Using alternative double cross match: ${nonProblematicMatches[0].foundWord}`);
        return nonProblematicMatches[0];
      }
    }

    // Devolver la mejor coincidencia
    return possibleDoubleMatches[0];
  }

  console.log("No se encontraron cruces dobles válidos");
  return undefined;
}

export const findBestCrossingAndPosition = (newUserWord, newFoundWord, avoidIndex) => {
    // Validar que newUserWord y newFoundWord sean strings válidos
    if (!newUserWord || !newFoundWord) {
        console.error("Invalid input in findBestCrossingAndPosition:", { newUserWord, newFoundWord });
        return null;
    }

    // Convertir a strings si son objetos
    const userWordStr = typeof newUserWord === 'string' ? newUserWord : newUserWord.word;
    const foundWordStr = typeof newFoundWord === 'string' ? newFoundWord : newFoundWord.word;

    if (!userWordStr || !foundWordStr) {
        console.error("Could not extract word strings in findBestCrossingAndPosition");
        return null;
    }

    console.log(`Finding best crossing between "${userWordStr}" and "${foundWordStr}"`);

    // Obtener letras ordenadas desde el centro para ambas palabras
    const letters1 = centerCloserLetter(userWordStr);
    const letters2 = centerCloserLetter(foundWordStr);

    // Array para almacenar todas las posibles coincidencias
    let possibleCrossings = [];

    // Buscar todas las posibles coincidencias
    for (let letterObj1 of letters1) {
        for (let letterObj2 of letters2) {
            // Evitar el índice que queremos evitar (si se especifica)
            if (avoidIndex !== null && avoidIndex !== undefined && letterObj2.index === avoidIndex) {
                continue;
            }

            // Comparar letras ignorando mayúsculas/minúsculas
            if (letterObj1.letter.toLowerCase() === letterObj2.letter.toLowerCase()) {
                // Calcular un puntaje de calidad para esta coincidencia
                // Preferimos cruces cerca del centro de ambas palabras
                const centerScore1 = 5 - Math.abs(letterObj1.index - Math.floor(userWordStr.length / 2));
                const centerScore2 = 5 - Math.abs(letterObj2.index - Math.floor(foundWordStr.length / 2));
                const qualityScore = centerScore1 + centerScore2;

                possibleCrossings.push({
                    newUserWord: userWordStr,
                    crossIndex: letterObj1.index,
                    foundWordIndex: letterObj2.index,
                    letter: letterObj1.letter,
                    qualityScore: qualityScore
                });
            }
        }
    }

    // Si encontramos coincidencias, devolver la mejor según el puntaje de calidad
    if (possibleCrossings.length > 0) {
        // Ordenar por puntaje de calidad (mayor primero)
        possibleCrossings.sort((a, b) => b.qualityScore - a.qualityScore);
        console.log("Posibles cruces encontrados:", possibleCrossings);

        // Devolver la mejor coincidencia
        return {
            newUserWord: userWordStr,
            crossIndex: possibleCrossings[0].crossIndex,
            foundWordIndex: possibleCrossings[0].foundWordIndex,
            letter: possibleCrossings[0].letter
        };
    }

    console.log(`No crossing found between "${userWordStr}" and "${foundWordStr}"`);
    return null;
}

export const calculateStartPosition = (newUserWord, foundWord, userCrossIndex, foundWordIndex, Size) => {
  // Validar que newUserWord sea un string válido
  if (!newUserWord) {
    console.error('Invalid newUserWord:', newUserWord);
    return null;
  }

  // Convertir a string si es un objeto
  const userWordStr = typeof newUserWord === 'string' ? newUserWord : newUserWord.word;

  if (!userWordStr) {
    console.error('Could not extract word string from newUserWord:', newUserWord);
    return null;
  }

  // Validar que foundWord tenga la estructura esperada
  if (!foundWord || !foundWord.positions) {
    console.error('Invalid foundWord or missing positions:', foundWord);
    return null;
  }

  // Validar que userCrossIndex y foundWordIndex sean números válidos
  if (typeof userCrossIndex !== 'number' || typeof foundWordIndex !== 'number' ||
      isNaN(userCrossIndex) || isNaN(foundWordIndex)) {
    console.error(`Invalid indices: userCrossIndex=${userCrossIndex}, foundWordIndex=${foundWordIndex}`);
    return null;
  }

  // Validar que userCrossIndex esté dentro de los límites de la palabra del usuario
  if (userCrossIndex < 0 || userCrossIndex >= userWordStr.length) {
    console.error(`userCrossIndex out of bounds: ${userCrossIndex} for word "${userWordStr}" of length ${userWordStr.length}`);
    return null;
  }

  // Manejar diferentes formatos de positions en foundWord
  let foundWordPosition;

  if (Array.isArray(foundWord.positions)) {
    // Si positions es un array, verificar que foundWordIndex sea válido
    if (foundWordIndex < 0 || foundWordIndex >= foundWord.positions.length) {
      console.error(`foundWordIndex out of bounds: ${foundWordIndex} for positions array of length ${foundWord.positions.length}`);
      return null;
    }
    foundWordPosition = foundWord.positions[foundWordIndex];
  } else {
    // Si positions es un objeto con row y col, usarlo directamente
    foundWordPosition = foundWord.positions;
  }

  // Validar que foundWordPosition tenga row y col válidos
  if (!foundWordPosition || typeof foundWordPosition.row !== 'number' || typeof foundWordPosition.col !== 'number' ||
      isNaN(foundWordPosition.row) || isNaN(foundWordPosition.col)) {
    console.error(`Invalid foundWordPosition: row=${foundWordPosition?.row}, col=${foundWordPosition?.col}`);
    return null;
  }

  console.log(`Calculating start position for "${userWordStr}" crossing with "${foundWord.word}" at indices ${userCrossIndex}/${foundWordIndex}`);

  // Calcular la posición de inicio
  // Para palabras horizontales, la columna de inicio debe ser tal que la letra de cruce
  // en la palabra horizontal coincida con la letra de cruce en la palabra vertical
  const startCol = foundWordPosition.col - userCrossIndex;

  if (isNaN(startCol)) {
    console.error(`Calculated start column is NaN, foundWordPosition.col=${foundWordPosition.col}, userCrossIndex=${userCrossIndex}`);
    return null;
  }

  // La fila es la misma que la de la palabra vertical en la posición de cruce
  const startRow = foundWordPosition.row;

  console.log(`Start position: row=${startRow}, col=${startCol}`);

  // Calcular todas las posiciones para la palabra
  const positions = [];
  for (let i = 0; i < userWordStr.length; i++) {
    const col = startCol + i;

    // Verificar que la posición esté dentro de los límites del grid
    if (col < 0 || col >= Size || startRow < 0 || startRow >= Size) {
      console.error(`Position out of bounds: row=${startRow}, col=${col}`);
      continue;
    }

    positions.push({
      row: startRow,
      col: col,
      letter: userWordStr[i]
    });
  }

  // Verificar que se hayan calculado todas las posiciones necesarias
  if (positions.length !== userWordStr.length) {
    console.warn(`Not all positions for word "${userWordStr}" could be calculated. Expected ${userWordStr.length}, got ${positions.length}.`);
  }

  console.log(`Calculated positions for "${userWordStr}":`, positions);

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

