import { useState } from "react"
import { Cell } from "../cell/Cell"
import { Button, Container, CrucigramaTable, Input, Form ,CrucigramaContainer, InputRange} from "./CrucigramaStyled";
import { findMatchingWord, centerCloserLetter, findBestCrossingAndPosition, calculateStartPosition } from "../../wordsUtils/findMatchingWord";
import { mockSearchRelatedWords } from "../../wordsUtils/GoogleApiService";
import { useEffect } from "react";
// Importamos la API de Gemini
import { consultarGeminiApi } from "../../api/geminiApi";

export const CrossWords = ({Size, setMessage}) => {
    const [grid, setGrid] = useState(() => { return Array.from({length: Size }, () => Array.from({length: Size }, () => ''));});
    const [word, setWord] = useState('');
    const [direction, setDirection] = useState('horizontal');
    const [scale, setScale] = useState(1);
    const [wordsList, setWordsList] = useState([]);
    const [userWords, setUserWords] = useState([]);
    const [foundWords, setFoundWords] = useState([]);
    const [isFirstWord, setIsFirstWord] = useState(true);
    const [isSearching, setIsSearching] = useState(false);
    const [crossings, setCrossings] = useState([]);
    const [backgroundColor, setBackgroundColor] = useState ('gray');
    const [isLoadingAI, setIsLoadingAI] = useState(false); // Estado para indicar que se está consultando a la IA

    const addWordToCrossings = (word, startRow, startCol, direction) => {
        // Validar que word no sea undefined o null
        if (!word) {
            console.error("Word is undefined or null in addWordToCrossings");
            return;
        }

        // Si word es un objeto con propiedad word, extraer la palabra
        const wordStr = typeof word === 'string' ? word : (word.word || '');

        if (!wordStr) {
            console.error("Invalid word format in addWordToCrossings:", word);
            return;
        }

        // Validar que startRow y startCol sean números válidos
        if (typeof startRow !== 'number' || typeof startCol !== 'number' || isNaN(startRow) || isNaN(startCol)) {
            console.error(`Invalid startRow or startCol in addWordToCrossings: row=${startRow}, col=${startCol}`);
            return;
        }

        // Validar que direction sea válida
        if (direction !== 'horizontal' && direction !== 'vertical') {
            console.warn(`Invalid direction in addWordToCrossings: ${direction}, defaulting to horizontal`);
            direction = 'horizontal';
        }

        console.log("Parameters for addWordToCrossings:", wordStr, startRow, startCol, direction);

        try {
            const newCrossings = [...crossings];
            for (let i = 0; i < wordStr.length; i++) {
                const row = direction === 'horizontal' ? startRow : startRow + i;
                const col = direction === 'horizontal' ? startCol + i : startCol;

                // Validar que row y col sean válidos antes de añadir al array
                if (row >= 0 && row < Size && col >= 0 && col < Size) {
                    if (!newCrossings.some(crossing => crossing.row === row && crossing.col === col)) {
                        newCrossings.push({ row, col, letter: wordStr[i] });
                    }
                } else {
                    console.error(`Out of bounds position in addWordToCrossings: row=${row}, col=${col}`);
                }
            }
            setCrossings(newCrossings);
            // console.log("Updated crossings:", newCrossings);
        } catch (error) {
            console.error("Error in addWordToCrossings:", error);
        }
    };

    // Manejar la primera palabra
    useEffect(() => {
        if (isFirstWord && wordsList.length === 1) {
            const wordInfo = wordsList[0];

            // Verificar la estructura de wordInfo y extraer las coordenadas correctamente
            if (wordInfo && wordInfo.positions && Array.isArray(wordInfo.positions)) {
                // Si positions es un array, tomar la primera posición
                if (wordInfo.positions.length > 0 && wordInfo.positions[0].row !== undefined && wordInfo.positions[0].col !== undefined) {
                    addWordToCrossings(wordInfo.word, wordInfo.positions[0].row, wordInfo.positions[0].col, 'horizontal');
                }
            } else if (wordInfo && wordInfo.positions && typeof wordInfo.positions === 'object') {
                // Si positions es un objeto con row y col
                if (wordInfo.positions.row !== undefined && wordInfo.positions.col !== undefined) {
                    addWordToCrossings(wordInfo.word, wordInfo.positions.row, wordInfo.positions.col, 'horizontal');
                }
            } else {
                console.error("Invalid wordInfo structure:", wordInfo);
            }
            // setDirection('vertical');
        }
    }, [isFirstWord]);

    useEffect(() => {
        if (wordsList.length > 0) {
            handleDirectionChange();
            const wordInfo = wordsList[wordsList.length - 1]; // Tomar la última palabra añadida

            // Verificar la estructura de wordInfo y extraer las coordenadas correctamente
            if (wordInfo && wordInfo.positions && Array.isArray(wordInfo.positions)) {
                // Si positions es un array, tomar la primera posición
                if (wordInfo.positions.length > 0 && wordInfo.positions[0].row !== undefined && wordInfo.positions[0].col !== undefined) {
                    addWordToCrossings(wordInfo.word, wordInfo.positions[0].row, wordInfo.positions[0].col, direction);
                }
            } else if (wordInfo && wordInfo.positions && typeof wordInfo.positions === 'object') {
                // Si positions es un objeto con row y col
                if (wordInfo.positions.row !== undefined && wordInfo.positions.col !== undefined) {
                    addWordToCrossings(wordInfo.word, wordInfo.positions.row, wordInfo.positions.col, direction);
                }
            } else {
                console.log("Skipping addWordToCrossings due to invalid wordInfo structure:", wordInfo);
            }
            // Alternar la dirección para la próxima palabra
            // const nextDirection = direction === 'horizontal' ? 'vertical' : 'horizontal';
            // setDirection(nextDirection); // Actualiza el estado de la dirección
            // console.log('Direction changed to:', direction);
        }
    }, [wordsList]);

    const handleInputChange = (e) => {
        const newWord = e.target.value;
        setWord(newWord);  // Actualiza el estado de la palabra para todas las entradas
        if (newWord.length > 10) {
            setMessage("The word must be no more than 10 letters.");
            setWord('');  // Limpia el input si la palabra es muy larga
        } else if (isFirstWord) {
            setMessage('');
        } else {
            setMessage('now enter');  // Establece un mensaje después de la primera palabra
        }
    };
    const handleDirectionChange = () => {
        setDirection(prevDirection => prevDirection === 'horizontal' ? 'vertical' : 'horizontal');
    };
    const handleScaleChange = (e) => {
        const newScale = e.target.value;
        console.log(newScale);
        setScale(newScale);
        const valueInColor = mapValue(newScale,0.5 ,1.2 ,0.7 ,1 );
        const colorIntensity = Math.floor(128 / valueInColor);
        setBackgroundColor(`rgb(${250-colorIntensity}, ${250 - colorIntensity}, ${255 - colorIntensity})`);
    }
    function mapValue(value, fromSource, toSource, fromTarget, toTarget) {
        return ((value - fromSource) / (toSource - fromSource)) * (toTarget - fromTarget) + fromTarget;
      }
    const resetGame = () => {
      setGrid(Array.from({ length: Size }, () => Array.from({ length: Size }, () => '')));
      setWordsList([]);
      setIsFirstWord(true);
      setIsSearching(false);
      setUserWords([]);
      setFoundWords([]);
      setBackgroundColor('gray');
      setIsLoadingAI(false);
      setMessage('Game has been reset. Enter a new word to start.');
    };

    // Función para manejar la búsqueda con la IA
    // Función para posicionar una palabra en el grid de manera directa
    const posicionarPalabraDirecta = (palabra, direction = 'vertical') => {
        // Verificar si la palabra ya existe en el crucigrama
        if (wordsList.some(w => w.word.toLowerCase() === palabra.toLowerCase())) {
            console.log(`La palabra "${palabra}" ya existe en el crucigrama.`);
            return false;
        }

        // Buscar todas las posibles posiciones para la palabra
        let mejorPosicion = null;
        let maxCruces = 0;

        // Recorrer todo el grid para encontrar posibles posiciones
        for (let row = 0; row < Size; row++) {
            for (let col = 0; col < Size; col++) {
                // Calcular posiciones para esta ubicación
                const positions = calculatePositions(palabra, row, col, direction);

                // Verificar si las posiciones son válidas
                if (positions && positions.length > 0) {
                    // Contar cuántas letras cruzan con palabras existentes
                    let cruces = 0;
                    let posicionesValidas = true;

                    for (const { row, col, letter } of positions) {
                        // Verificar límites del grid
                        if (row < 0 || row >= Size || col < 0 || col >= Size) {
                            posicionesValidas = false;
                            break;
                        }

                        // Verificar si hay conflicto con letras existentes
                        if (grid[row][col] !== '' && grid[row][col].toLowerCase() !== letter.toLowerCase()) {
                            posicionesValidas = false;
                            break;
                        }

                        // Contar cruces
                        if (grid[row][col] !== '' && grid[row][col].toLowerCase() === letter.toLowerCase()) {
                            cruces++;
                        }
                    }

                    // Verificar si hay al menos un cruce (excepto para la primera palabra)
                    if (posicionesValidas && (wordsList.length === 0 || cruces > 0)) {
                        // Si encontramos más cruces que antes, actualizar la mejor posición
                        if (cruces > maxCruces) {
                            maxCruces = cruces;
                            mejorPosicion = positions;
                        }
                    }
                }
            }
        }

        // Si encontramos una posición válida, insertar la palabra
        if (mejorPosicion) {
            console.log(`Insertando palabra "${palabra}" con ${maxCruces} cruces:`, mejorPosicion);
            insertWord(palabra, mejorPosicion, null, direction);
            return true;
        }

        return false;
    };

    const handleAISearch = async () => {
      if (!userWords.length) return;

      setIsLoadingAI(true);
      setMessage('Consultando a la IA de Google Gemini, espere un momento...');

      try {
        // Extraer todas las palabras horizontales actuales
        const palabrasHorizontales = wordsList
          .filter(w => w.direction === 'horizontal')
          .map(w => w.word);

        if (palabrasHorizontales.length === 0) {
          setMessage('No hay palabras horizontales para formar cruces.');
          setIsLoadingAI(false);
          return;
        }

        // Consultar a la API de Gemini directamente
        let sugerencia = await consultarGeminiApi(palabrasHorizontales);

        if (sugerencia) {
          // Procesar la sugerencia de la IA (puede ser más de una palabra o tener caracteres especiales)
          const palabraSugerida = sugerencia.trim().toUpperCase().split(/\s+/)[0];

          // Verificar si la palabra sugerida es válida
          if (palabraSugerida.length > 2 && palabraSugerida.length <= 10) {
            // Verificar si la palabra ya existe en el crucigrama
            if (wordsList.some(w => w.word.toLowerCase() === palabraSugerida.toLowerCase())) {
                setMessage(`La IA sugirió "${palabraSugerida}", pero esta palabra ya existe en el crucigrama.`);
                setIsLoadingAI(false);
                return;
            }

            // Intentar posicionar la palabra directamente
            const posicionada = posicionarPalabraDirecta(palabraSugerida, 'vertical');

            if (posicionada) {
                setMessage(`La IA sugirió la palabra "${palabraSugerida}" ¡y se ha colocado con éxito!`);
            } else {
                // Si no se pudo posicionar directamente, intentar con el método original
                let foundCrossing = false;

                for (const palabraHorizontal of palabrasHorizontales) {
                  // Intentar encontrar un cruce entre la palabra sugerida y la palabra horizontal
                  const matchInfo = findBestCrossingAndPosition(palabraHorizontal, palabraSugerida, null);

                  if (matchInfo) {
                    // Encontramos un cruce
                    const userWordObj = wordsList.find(w => w.word === palabraHorizontal);

                    if (userWordObj) {
                      // Tenemos un cruce, usar esta palabra
                      const { crossIndex, foundWordIndex } = matchInfo;

                      setFoundWords(prev => [...prev, {
                        foundWord: palabraSugerida,
                        crossIndex,
                        foundWordIndex,
                        direction: 'vertical',
                        source: 'AI'
                      }]);

                      updateCrossIndex(palabraHorizontal, crossIndex);
                      insertCrossWord(userWordObj, palabraSugerida, crossIndex, foundWordIndex, 'vertical');

                      setMessage(`La IA sugirió la palabra "${palabraSugerida}" ¡y encaja perfectamente!`);
                      foundCrossing = true;
                      break;
                    }
                  }
                }

                if (!foundCrossing) {
                  setMessage(`La IA sugirió "${palabraSugerida}", pero no forma un cruce válido.`);
                }
            }
          } else {
            setMessage(`La IA sugirió "${sugerencia}", pero no es válida para el crucigrama.`);
          }
        } else {
          setMessage('La IA no pudo generar una sugerencia válida.');
        }
      } catch (error) {
        console.error('Error al consultar la IA:', error);
        setMessage(`Error al consultar la IA: ${error.message}`);
      } finally {
        setIsLoadingAI(false);
      }
    };



    const handleClick = (row, col) => {
         
        if (word && isFirstWord) {
            handleWordInsertion(word, row, col, direction);
            setWord('');
            setIsFirstWord(false);
            setMessage('Well done, now...the magic');
        } else {
            setMessage("Please use Enter to confirm words after the first.");
        }
    };
    const handleWordInsertion = (word, row, col, direction) => {
        const positions = calculatePositions(word, row, col, direction);
        if (isFirstWord || validatePosition(positions, grid)) {
            updateGridWithWord(word, positions);
            setUserWords(prev => [...prev, { word, positions: { row, col }, direction, crossIndex: null}]);
            setWordsList(prev => [...prev, { word, positions, direction, crossIndex: null }]);
        } else {
            setMessage("Invalid position for the word.");
        }
    };
    function updateGridWithWord(word, positions) {
        let newGrid = [...grid];
        positions.forEach((pos, index) => {
            newGrid[pos.row][pos.col] = word[index];
        });
        setIsSearching(true);
        setGrid(newGrid);
    }
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && word) {
            if (!isFirstWord) {
                // Verificar si la palabra ya existe en wordsList
                const wordExists = wordsList.some(w => w.word.toLowerCase() === word.toLowerCase());
                if (wordExists) {
                    setMessage("Esta palabra ya existe en el crucigrama. Intenta con otra.");
                    return;
                }

                // Verificar si hay al menos una palabra en el crucigrama para cruzar
                if (wordsList.length === 0) {
                    setMessage("Primero debes colocar una palabra en el crucigrama.");
                    return;
                }

                // Agregar la palabra a userWords para procesarla
                setUserWords(prevWords => [...prevWords, word]);
                setWord('');
                setMessage("Palabra aceptada. Buscando cruces...");
            }
            e.preventDefault();
            setIsFirstWord(false);
        }
    };
    useEffect(() => {
        if (userWords.length > 0 && !isFirstWord) {
            const newFoundWord = wordsList[wordsList.length - 1];
            const newUserWord = userWords[userWords.length - 1];

            console.log('Processing user word:', newUserWord);
            console.log('Last found word:', newFoundWord?.word);

            // Si newUserWord es un string, significa que es una nueva palabra ingresada por el usuario
            // que necesita ser posicionada en el crucigrama
            if (typeof newUserWord === 'string') {
                // Verificar que newFoundWord exista y tenga una propiedad word
                if (!newFoundWord || !newFoundWord.word) {
                    console.error('Invalid newFoundWord:', newFoundWord);
                    setMessage("Error al procesar la palabra. Intenta de nuevo.");
                    return;
                }

                const crossInfo = findBestCrossingAndPosition(newUserWord, newFoundWord.word, newFoundWord.crossIndex);
                console.log('Cross info for user word:', crossInfo);

                if (crossInfo) {
                    const posInfo = calculateStartPosition(newUserWord, newFoundWord, crossInfo.crossIndex, crossInfo.foundWordIndex, Size);
                    console.log('Position info for user word:', posInfo?.positions);

                    if (posInfo && posInfo.positions) {
                        insertUserWord(newUserWord, posInfo, crossInfo.foundWordIndex, direction);
                        // Activar la búsqueda para que el sistema encuentre una palabra que cruce con esta
                        setTimeout(() => {
                            setIsSearching(true);
                        }, 100);
                    } else {
                        console.error('Failed to calculate positions or no valid positions available.');
                        setMessage("No se pudo calcular la posición para la palabra. Intenta con otra palabra.");
                    }
                } else {
                    console.error('No crossing found for user word:', newUserWord);
                    setMessage("No se encontró un cruce válido para esta palabra. Intenta con otra palabra.");
                }
            } else {
                // Si no es un string, es un objeto que ya fue procesado
                console.log('User word already processed:', newUserWord);
            }
        }
    }, [userWords]);

    function insertUserWord(newUserWord, positionsInfo, crossIndex, direction) {
        try {
            // Validar que newUserWord sea válido
            if (!newUserWord) {
                console.error('newUserWord is undefined or null in insertUserWord');
                return;
            }

            // Si newUserWord es un objeto con propiedad word, extraer la palabra
            const wordStr = typeof newUserWord === 'string' ? newUserWord : (newUserWord.word || '');

            if (!wordStr) {
                console.error("Invalid newUserWord format in insertUserWord:", newUserWord);
                return;
            }

            // Validar que positionsInfo y positionsInfo.positions sean válidos
            if (!positionsInfo || !positionsInfo.positions || !Array.isArray(positionsInfo.positions) || positionsInfo.positions.length === 0) {
                console.error('Invalid or missing positions array in insertUserWord:', positionsInfo);
                return;
            }

            // Validar que direction sea válida
            if (direction !== 'horizontal' && direction !== 'vertical') {
                console.warn(`Invalid direction in insertUserWord: ${direction}, defaulting to horizontal`);
                direction = 'horizontal';
            }

            let newGrid = [...grid];
            positionsInfo.positions.forEach((pos, index) => {
                if (pos && typeof pos.row === 'number' && typeof pos.col === 'number' &&
                    pos.row >= 0 && pos.row < newGrid.length && pos.col >= 0 && pos.col < newGrid[pos.row].length &&
                    index < wordStr.length) {
                    newGrid[pos.row][pos.col] = wordStr[index];
                } else {
                    console.error(`Invalid position or index in insertUserWord: row=${pos?.row}, col=${pos?.col}, index=${index}, word.length=${wordStr.length}`);
                }
            });

            setGrid(newGrid);

            // Crear un objeto wordInfo con la estructura correcta
            const wordInfo = {
                word: wordStr,
                positions: positionsInfo.positions,
                direction,
                crossIndex
            };

            setWordsList(prevWordsList => [...prevWordsList, wordInfo]);

            console.log("Word added to wordsList:", wordInfo);
            console.log("Current userWords:", userWords);
            console.log("Current wordsList:", wordsList);

        } catch (error) {
            console.error("Error in insertUserWord:", error);
        }
    }
    useEffect(() => {
        // Función asíncrona para buscar palabras
        const findWords = async () => {
            try {
                // Si hay palabras de usuario, no es la primera palabra y estamos en estado de búsqueda
                if (userWords.length > 0 && !isFirstWord && isSearching) {
                    console.log("Searching for matching word...");

                    // Obtener la última palabra del usuario (puede ser un string o un objeto)
                    const lastWordUser = userWords[userWords.length - 1];

                    // Obtener la palabra a usar para buscar cruces
                    const userWord = typeof lastWordUser === 'string' ? lastWordUser : lastWordUser.word;

                    if (!userWord) {
                        console.error("Invalid user word:", lastWordUser);
                        setIsSearching(false);
                        return;
                    }

                    console.log("Searching for matching word for:", userWord);

                    // Paso 1: Intenta encontrar un cruce simple (una letra en común)
                    let matchingWord = await findMatchingWord(userWord, wordsList);
                    console.log("Result of simple match search:", matchingWord);

                    // Paso 2: Si no se encuentra un cruce simple, intentar con cruce doble
                    if (!matchingWord) {
                        console.log("No se encontró cruce simple, buscando cruce doble...");
                        matchingWord = await findMatchingWord(userWord, wordsList, true);
                        console.log("Result of double match search:", matchingWord);
                    }

                    // Paso 3: Si se encontró una palabra (cruce simple o doble)
                    if (matchingWord && !matchingWord.noMatchFound && matchingWord.foundWord &&
                        !foundWords.some(w => w.foundWord === matchingWord.foundWord)) {

                        const {
                            foundWord,
                            crossIndex,
                            foundWordIndex,
                            isDoubleCross,
                            secondCrossIndex,
                            secondFoundWordIndex,
                            horizontalWord
                        } = matchingWord;

                        console.log('MatchingWord is:', matchingWord);

                        // Validar que foundWord, crossIndex y foundWordIndex sean válidos
                        if (!foundWord || typeof crossIndex !== 'number' || typeof foundWordIndex !== 'number') {
                            console.error("Invalid matching word data:", matchingWord);
                            setIsSearching(false);
                            return;
                        }

                        setFoundWords(prevFoundWords => {
                            const newFoundWords = [...prevFoundWords, {
                                foundWord,
                                crossIndex,
                                foundWordIndex,
                                direction: 'vertical',
                                isDoubleCross: isDoubleCross || false,
                                secondCrossIndex,
                                secondFoundWordIndex,
                                horizontalWord
                            }];
                            return newFoundWords;
                        });

                        // Actualizar el índice de cruce en la palabra del usuario
                        updateCrossIndex(userWord, crossIndex);

                        // Si es un cruce doble, también actualizar el segundo índice de cruce
                        if (isDoubleCross && typeof secondCrossIndex === 'number') {
                            console.log(`Actualizando segundo índice de cruce para ${userWord}: ${secondCrossIndex}`);
                        }

                        // Buscar la palabra horizontal en wordsList para obtener sus posiciones
                        let wordObj;

                        if (horizontalWord) {
                            // Si tenemos el nombre de la palabra horizontal (en cruces dobles), buscarla directamente
                            wordObj = wordsList.find(w => w.word === horizontalWord);
                            console.log(`Buscando palabra horizontal específica: ${horizontalWord}`, wordObj);
                        } else {
                            // Si no, buscar la palabra del usuario
                            wordObj = wordsList.find(w => w.word === userWord);
                        }

                        // Si no se encuentra, buscar la última palabra agregada
                        if (!wordObj && wordsList.length > 0) {
                            wordObj = wordsList[wordsList.length - 1];
                            console.log("Using last word in wordsList:", wordObj);
                        }

                        if (wordObj && wordObj.positions) {
                            // Verificar que las posiciones sean válidas
                            if (Array.isArray(wordObj.positions)) {
                                // Si positions es un array, usar la primera posición
                                const firstPos = wordObj.positions[0];
                                if (firstPos && typeof firstPos.row === 'number' && typeof firstPos.col === 'number') {
                                    // Crear un objeto con la estructura esperada
                                    const userWordWithPos = {
                                        word: wordObj.word,
                                        positions: { row: firstPos.row, col: firstPos.col },
                                        direction: wordObj.direction || 'horizontal'
                                    };

                                    // Si es un cruce doble, usar una función especial para manejar cruces dobles
                                    if (isDoubleCross && typeof secondCrossIndex === 'number' && typeof secondFoundWordIndex === 'number') {
                                        console.log("Insertando palabra con cruce doble:", foundWord);
                                        insertDoubleCrossWord(
                                            userWordWithPos,
                                            foundWord,
                                            crossIndex,
                                            foundWordIndex,
                                            secondCrossIndex,
                                            secondFoundWordIndex,
                                            'vertical'
                                        );
                                    } else {
                                        // Si es un cruce simple, usar la función normal
                                        insertCrossWord(userWordWithPos, foundWord, crossIndex, foundWordIndex, 'vertical');
                                    }
                                } else {
                                    console.error("Invalid position in wordObj:", wordObj);
                                    setMessage("Error: Posiciones inválidas para la palabra.");
                                }
                            } else if (typeof wordObj.positions.row === 'number' && typeof wordObj.positions.col === 'number') {
                                // Si positions es un objeto con row y col, usarlo directamente
                                if (isDoubleCross && typeof secondCrossIndex === 'number' && typeof secondFoundWordIndex === 'number') {
                                    console.log("Insertando palabra con cruce doble:", foundWord);
                                    insertDoubleCrossWord(
                                        wordObj,
                                        foundWord,
                                        crossIndex,
                                        foundWordIndex,
                                        secondCrossIndex,
                                        secondFoundWordIndex,
                                        'vertical'
                                    );
                                } else {
                                    insertCrossWord(wordObj, foundWord, crossIndex, foundWordIndex, 'vertical');
                                }
                            } else {
                                console.error("Invalid positions format in wordObj:", wordObj);
                                setMessage("Error: Formato de posiciones inválido.");
                            }
                        } else {
                            console.error("Word not found in wordsList or no positions:", userWord);
                            setMessage("Error: No se pudo posicionar la palabra cruzada.");
                        }

                        // Verificar si la palabra ya existe en el crucigrama
                        const wordExists = wordsList.some(w => w.word.toLowerCase() === foundWord.toLowerCase());
                        if (wordExists) {
                            setMessage(`La palabra "${foundWord}" ya existe en el crucigrama.`);
                        } else {
                            if (isDoubleCross) {
                                setMessage(`¡Encontrada palabra con cruce doble: ${foundWord}!`);
                            } else {
                                setMessage(`¡Encontrada palabra cruzada: ${foundWord}!`);
                            }
                        }
                    }
                    // Paso 4: Si no se encontró ninguna palabra para cruce (ni simple ni doble)
                    else if (matchingWord && matchingWord.noMatchFound) {
                        setMessage(matchingWord.message || "No se encontró cruce. Haz clic en 'Consultar IA' para buscar sugerencias.");
                    }
                    else {
                        console.log("No matching word found.");
                        setMessage("No se encontró palabra para cruce. Haz clic en 'Consultar IA' para buscar sugerencias.");
                    }

                    setIsSearching(false);
                }
            } catch (error) {
                console.error("Error in findWords:", error);
                setMessage("Ocurrió un error al buscar palabras. Inténtalo de nuevo.");
                setIsSearching(false);
            }
        };

        // Llamar a la función asíncrona
        findWords();
    }, [userWords, isFirstWord, isSearching]); // Añadido isSearching como dependencia

    // useEffect(() => {


    // }, [wordsList])

    const updateCrossIndex = (wordText, newCrossIndex) => {
        setWordsList(prevWordsList => prevWordsList.map(w =>
            w.word === wordText ? {...w, crossIndex: newCrossIndex} : w
        ));
    };
    function insertCrossWord(userWord, foundWord, userIndex, foundWordIndex, direction) {
        try {
            // Validar que foundWord no sea undefined o null
            if (!foundWord) {
                console.error("foundWord is undefined or null in insertCrossWord");
                return;
            }

            // Si foundWord es un objeto, extraer la palabra
            const foundWordStr = typeof foundWord === 'string' ? foundWord : foundWord.word;

            // Verificar si la palabra ya existe en el crucigrama
            if (wordsList.some(w => w.word.toLowerCase() === foundWordStr.toLowerCase() && w.direction === direction)) {
                console.log(`Word "${foundWordStr}" already exists with the same direction.`);
                return;
            }

            console.log("Direction:", direction);
            console.log("FoundWord:", foundWordStr);
            console.log("UserWord:", typeof userWord === 'string' ? userWord : userWord.word);
            console.log("UserIndex:", userIndex);
            console.log("FoundWordIndex:", foundWordIndex);

            // Validar que userWord y userWord.positions existan
            if (!userWord || !userWord.positions) {
                console.error("userWord or userWord.positions is undefined in insertCrossWord");
                return;
            }

            const userWordPositions = userWord.positions;

            // Validar que userWordPositions tenga row y col válidos
            if (typeof userWordPositions.row !== 'number' || typeof userWordPositions.col !== 'number' ||
                isNaN(userWordPositions.row) || isNaN(userWordPositions.col)) {
                console.error(`Invalid userWordPositions: row=${userWordPositions.row}, col=${userWordPositions.col}`);
                return;
            }

            // Obtener la palabra del usuario como string
            const userWordStr = typeof userWord === 'string' ? userWord : userWord.word;

            // Verificar que userIndex sea válido para userWordStr
            if (userIndex < 0 || userIndex >= userWordStr.length) {
                console.error(`Invalid userIndex: ${userIndex} for word "${userWordStr}" of length ${userWordStr.length}`);
                return;
            }

            // Verificar que foundWordIndex sea válido para foundWordStr
            if (foundWordIndex < 0 || foundWordIndex >= foundWordStr.length) {
                console.error(`Invalid foundWordIndex: ${foundWordIndex} for word "${foundWordStr}" of length ${foundWordStr.length}`);
                return;
            }

            // Verificar que las letras de cruce coincidan
            const userCrossLetter = userWordStr[userIndex].toLowerCase();
            const foundCrossLetter = foundWordStr[foundWordIndex].toLowerCase();

            if (userCrossLetter !== foundCrossLetter) {
                console.error(`Cross letters don't match: userWord[${userIndex}]='${userCrossLetter}' and foundWord[${foundWordIndex}]='${foundCrossLetter}'`);
                return;
            }

            // Intentar diferentes posiciones para la palabra
            let validPositions = null;

            // Calcular la posición para una palabra vertical
            if (direction === 'vertical') {
                // Para palabras verticales, necesitamos alinear la letra de cruce
                // La columna es la misma que la letra de cruce en la palabra horizontal
                const startCol = userWordPositions.col + userIndex;

                // La fila de inicio debe ser tal que la letra de cruce en la palabra vertical
                // coincida con la letra de cruce en la palabra horizontal
                const startRow = userWordPositions.row - foundWordIndex;

                console.log(`Trying vertical position - StartCol: ${startCol}, StartRow: ${startRow}, CrossIndex: ${userIndex}, FoundWordIndex: ${foundWordIndex}`);

                // Verificar si la posición de cruce es válida antes de calcular todas las posiciones
                const crossLetter = foundWordStr[foundWordIndex];
                const userWordLetter = userWordStr[userIndex];

                if (crossLetter.toLowerCase() !== userWordLetter.toLowerCase()) {
                    console.error(`Cross letter mismatch: foundWord[${foundWordIndex}]='${crossLetter}' doesn't match userWord[${userIndex}]='${userWordLetter}'`);
                    return;
                }

                // Verificar si hay conflictos con otras palabras en el grid
                // Primero, verificamos si la posición de cruce está libre o tiene la letra correcta
                if (grid[userWordPositions.row][startCol] !== '' &&
                    grid[userWordPositions.row][startCol].toLowerCase() !== crossLetter.toLowerCase()) {
                    console.error(`Conflict at crossing position (${userWordPositions.row},${startCol}): grid has '${grid[userWordPositions.row][startCol]}' but needs '${crossLetter}'`);
                    return;
                }

                // Calcular posiciones
                let positions = calculatePositions(foundWordStr, startRow, startCol, direction);

                // Verificar si las posiciones son válidas
                if (positions && positions.length > 0 && validatePosition(positions, grid)) {
                    validPositions = positions;
                    console.log("Found valid vertical position");
                } else {
                    console.log("Invalid vertical position, trying alternatives...");

                    // Intentar con diferentes offsets para la fila de inicio
                    // Primero intentamos con offsets más pequeños para mantener la palabra cerca de la posición ideal
                    // Ampliamos el rango de offsets para buscar más posiciones
                    for (let offset of [0, -1, 1, -2, 2, -3, 3, -4, 4, -5, 5, -6, 6, -7, 7, -8, 8, -9, 9, -10, 10]) {
                        // Ajustar la fila de inicio con el offset
                        const newStartRow = startRow + offset;

                        // Verificar que la nueva posición de inicio esté dentro de los límites
                        if (newStartRow < 0 || newStartRow + foundWordStr.length > Size) {
                            console.log(`Skipping offset ${offset}: out of bounds`);
                            continue;
                        }

                        // Calcular nuevas posiciones con este offset
                        positions = calculatePositions(foundWordStr, newStartRow, startCol, direction);

                        // Verificar si estas posiciones son válidas
                        if (positions && positions.length > 0) {
                            // Verificar específicamente que la letra de cruce coincida
                            const crossPosition = positions[foundWordIndex];
                            if (crossPosition &&
                                crossPosition.row === userWordPositions.row &&
                                crossPosition.col === userWordPositions.col + userIndex) {

                                // Verificar si hay conflictos con letras existentes
                                let hasConflict = false;
                                for (const pos of positions) {
                                    // Ignorar la posición de cruce, ya que sabemos que coincide
                                    if (pos.row === userWordPositions.row && pos.col === userWordPositions.col + userIndex) {
                                        continue;
                                    }

                                    // Verificar si hay conflicto con una letra existente
                                    if (grid[pos.row][pos.col] !== '' &&
                                        grid[pos.row][pos.col].toLowerCase() !== pos.letter.toLowerCase()) {
                                        console.error(`Conflict at (${pos.row},${pos.col}): grid has '${grid[pos.row][pos.col]}' but trying to place '${pos.letter}'`);
                                        hasConflict = true;
                                        break;
                                    }
                                }

                                // Si no hay conflictos, esta posición es válida
                                if (!hasConflict) {
                                    validPositions = positions;
                                    console.log(`Found valid vertical position with offset ${offset}`);
                                    break;
                                } else {
                                    console.log(`Positions with offset ${offset} have conflicts`);
                                }
                            } else {
                                console.log(`Offset ${offset} doesn't align with crossing letter`);
                            }
                        }
                    }

                    // Si no encontramos una posición válida, intentar con una estrategia alternativa
                    if (!validPositions) {
                        console.log("Trying alternative strategy for vertical placement...");

                        // Buscar una posición completamente diferente
                        // Intentar colocar la palabra en diferentes columnas
                        for (let colOffset = -5; colOffset <= 5; colOffset++) {
                            if (colOffset === 0) continue; // Ya probamos con la columna original

                            const newStartCol = startCol + colOffset;

                            // Verificar que la nueva columna esté dentro de los límites
                            if (newStartCol < 0 || newStartCol >= Size) {
                                continue;
                            }

                            // Intentar diferentes filas para esta columna
                            for (let rowOffset = -10; rowOffset <= 10; rowOffset++) {
                                const newStartRow = startRow + rowOffset;

                                // Verificar que la nueva fila esté dentro de los límites
                                if (newStartRow < 0 || newStartRow + foundWordStr.length > Size) {
                                    continue;
                                }

                                // Calcular posiciones para esta ubicación
                                const newPositions = calculatePositions(foundWordStr, newStartRow, newStartCol, direction);

                                // Verificar si estas posiciones son válidas
                                if (newPositions && newPositions.length > 0) {
                                    // Verificar si hay al menos un cruce con palabras existentes
                                    let hasCrossing = false;
                                    let hasConflict = false;

                                    for (const pos of newPositions) {
                                        // Verificar si hay cruce con una letra existente
                                        if (grid[pos.row][pos.col] !== '') {
                                            if (grid[pos.row][pos.col].toLowerCase() === pos.letter.toLowerCase()) {
                                                hasCrossing = true;
                                            } else {
                                                hasConflict = true;
                                                break;
                                            }
                                        }
                                    }

                                    // Si hay al menos un cruce y no hay conflictos, esta posición es válida
                                    if (hasCrossing && !hasConflict) {
                                        validPositions = newPositions;
                                        console.log(`Found valid vertical position with alternative strategy: col=${newStartCol}, row=${newStartRow}`);
                                        break;
                                    }
                                }
                            }

                            if (validPositions) break;
                        }
                    }
                }
            } else {
                // Calcular la posición para una palabra horizontal
                // La fila es la misma que la letra de cruce en la palabra vertical
                const startRow = userWordPositions.row;

                // La columna de inicio debe ser tal que la letra de cruce en la palabra horizontal
                // coincida con la letra de cruce en la palabra vertical
                const startCol = userWordPositions.col - foundWordIndex;

                console.log(`Trying horizontal position - StartCol: ${startCol}, StartRow: ${startRow}, CrossIndex: ${userIndex}, FoundWordIndex: ${foundWordIndex}`);

                // Verificar si la posición de cruce es válida antes de calcular todas las posiciones
                const crossLetter = foundWordStr[foundWordIndex];
                const userWordLetter = userWordStr[userIndex];

                if (crossLetter.toLowerCase() !== userWordLetter.toLowerCase()) {
                    console.error(`Cross letter mismatch: foundWord[${foundWordIndex}]='${crossLetter}' doesn't match userWord[${userIndex}]='${userWordLetter}'`);
                    return;
                }

                // Verificar si hay conflictos con otras palabras en el grid
                // Primero, verificamos si la posición de cruce está libre o tiene la letra correcta
                if (grid[startRow][userWordPositions.col] !== '' &&
                    grid[startRow][userWordPositions.col].toLowerCase() !== crossLetter.toLowerCase()) {
                    console.error(`Conflict at crossing position (${startRow},${userWordPositions.col}): grid has '${grid[startRow][userWordPositions.col]}' but needs '${crossLetter}'`);
                    return;
                }

                // Calcular posiciones
                let positions = calculatePositions(foundWordStr, startRow, startCol, direction);

                // Verificar si las posiciones son válidas
                if (positions && positions.length > 0 && validatePosition(positions, grid)) {
                    validPositions = positions;
                    console.log("Found valid horizontal position");
                } else {
                    console.log("Invalid horizontal position, trying alternatives...");

                    // Intentar con diferentes offsets
                    // Ampliamos el rango de offsets para buscar más posiciones
                    for (let offset of [0, -1, 1, -2, 2, -3, 3, -4, 4, -5, 5, -6, 6, -7, 7, -8, 8, -9, 9, -10, 10]) {
                        // Ajustar la columna de inicio con el offset
                        const newStartCol = startCol + offset;

                        // Verificar que la nueva posición de inicio esté dentro de los límites
                        if (newStartCol < 0 || newStartCol + foundWordStr.length > Size) {
                            console.log(`Skipping offset ${offset}: out of bounds`);
                            continue;
                        }

                        // Calcular nuevas posiciones con este offset
                        positions = calculatePositions(foundWordStr, startRow, newStartCol, direction);

                        // Verificar si estas posiciones son válidas
                        if (positions && positions.length > 0) {
                            // Verificar específicamente que la letra de cruce coincida
                            const crossPosition = positions[foundWordIndex];
                            if (crossPosition &&
                                crossPosition.row === userWordPositions.row &&
                                crossPosition.col === userWordPositions.col + userIndex) {

                                // Verificar si hay conflictos con letras existentes
                                let hasConflict = false;
                                for (const pos of positions) {
                                    // Ignorar la posición de cruce, ya que sabemos que coincide
                                    if (pos.row === userWordPositions.row && pos.col === userWordPositions.col + userIndex) {
                                        continue;
                                    }

                                    // Verificar si hay conflicto con una letra existente
                                    if (grid[pos.row][pos.col] !== '' &&
                                        grid[pos.row][pos.col].toLowerCase() !== pos.letter.toLowerCase()) {
                                        console.error(`Conflict at (${pos.row},${pos.col}): grid has '${grid[pos.row][pos.col]}' but trying to place '${pos.letter}'`);
                                        hasConflict = true;
                                        break;
                                    }
                                }

                                // Si no hay conflictos, esta posición es válida
                                if (!hasConflict) {
                                    validPositions = positions;
                                    console.log(`Found valid horizontal position with offset ${offset}`);
                                    break;
                                } else {
                                    console.log(`Positions with offset ${offset} have conflicts`);
                                }
                            } else {
                                console.log(`Offset ${offset} doesn't align with crossing letter`);
                            }
                        }
                    }

                    // Si no encontramos una posición válida, intentar con una estrategia alternativa
                    if (!validPositions) {
                        console.log("Trying alternative strategy for horizontal placement...");

                        // Buscar una posición completamente diferente
                        // Intentar colocar la palabra en diferentes filas
                        for (let rowOffset = -5; rowOffset <= 5; rowOffset++) {
                            if (rowOffset === 0) continue; // Ya probamos con la fila original

                            const newStartRow = startRow + rowOffset;

                            // Verificar que la nueva fila esté dentro de los límites
                            if (newStartRow < 0 || newStartRow >= Size) {
                                continue;
                            }

                            // Intentar diferentes columnas para esta fila
                            for (let colOffset = -10; colOffset <= 10; colOffset++) {
                                const newStartCol = startCol + colOffset;

                                // Verificar que la nueva columna esté dentro de los límites
                                if (newStartCol < 0 || newStartCol + foundWordStr.length > Size) {
                                    continue;
                                }

                                // Calcular posiciones para esta ubicación
                                const newPositions = calculatePositions(foundWordStr, newStartRow, newStartCol, direction);

                                // Verificar si estas posiciones son válidas
                                if (newPositions && newPositions.length > 0) {
                                    // Verificar si hay al menos un cruce con palabras existentes
                                    let hasCrossing = false;
                                    let hasConflict = false;

                                    for (const pos of newPositions) {
                                        // Verificar si hay cruce con una letra existente
                                        if (grid[pos.row][pos.col] !== '') {
                                            if (grid[pos.row][pos.col].toLowerCase() === pos.letter.toLowerCase()) {
                                                hasCrossing = true;
                                            } else {
                                                hasConflict = true;
                                                break;
                                            }
                                        }
                                    }

                                    // Si hay al menos un cruce y no hay conflictos, esta posición es válida
                                    if (hasCrossing && !hasConflict) {
                                        validPositions = newPositions;
                                        console.log(`Found valid horizontal position with alternative strategy: row=${newStartRow}, col=${newStartCol}`);
                                        break;
                                    }
                                }
                            }

                            if (validPositions) break;
                        }
                    }
                }
            }

            // Si encontramos posiciones válidas, insertar la palabra
            if (validPositions) {
                console.log(`Inserting word "${foundWordStr}" at valid positions:`, validPositions);
                insertWord(foundWordStr, validPositions, foundWordIndex, direction);
                setMessage(`¡Palabra "${foundWordStr}" colocada con éxito!`);
            } else {
                console.error("No valid position found for the word:", foundWordStr);

                // Si la palabra es "instrument" y no se pudo colocar, intentar con palabras alternativas
                if (foundWordStr.toLowerCase() === "instrument") {
                    console.log("Trying alternative words instead of 'instrument'...");

                    // Lista de palabras alternativas que podrían funcionar mejor
                    const alternativeWords = [
                        "piano", "guitar", "violin", "drums", "flute", "harp", "trumpet",
                        "clarinet", "saxophone", "trombone", "cello", "viola", "oboe"
                    ];

                    // Intentar cada palabra alternativa
                    for (const altWord of alternativeWords) {
                        console.log(`Trying alternative word: ${altWord}`);

                        // Buscar un cruce entre la palabra alternativa y la palabra del usuario
                        const crossInfo = findBestCrossingAndPosition(userWordStr, altWord, null);

                        if (crossInfo) {
                            console.log(`Found crossing for alternative word ${altWord}:`, crossInfo);

                            // Intentar colocar esta palabra alternativa
                            const altDirection = direction; // Mantener la misma dirección

                            // Calcular la posición para la palabra alternativa
                            if (altDirection === 'vertical') {
                                const altStartCol = userWordPositions.col + crossInfo.crossIndex;
                                const altStartRow = userWordPositions.row - crossInfo.foundWordIndex;

                                console.log(`Trying vertical position for ${altWord} - StartCol: ${altStartCol}, StartRow: ${altStartRow}`);

                                // Calcular posiciones
                                const altPositions = calculatePositions(altWord, altStartRow, altStartCol, altDirection);

                                // Verificar si las posiciones son válidas
                                if (altPositions && altPositions.length > 0 && validatePosition(altPositions, grid)) {
                                    console.log(`Found valid position for alternative word ${altWord}`);
                                    insertWord(altWord, altPositions, crossInfo.foundWordIndex, altDirection);
                                    setMessage(`Se ha colocado la palabra "${altWord}" como alternativa.`);
                                    return;
                                }
                            } else {
                                const altStartRow = userWordPositions.row;
                                const altStartCol = userWordPositions.col - crossInfo.foundWordIndex;

                                console.log(`Trying horizontal position for ${altWord} - StartCol: ${altStartCol}, StartRow: ${altStartRow}`);

                                // Calcular posiciones
                                const altPositions = calculatePositions(altWord, altStartRow, altStartCol, altDirection);

                                // Verificar si las posiciones son válidas
                                if (altPositions && altPositions.length > 0 && validatePosition(altPositions, grid)) {
                                    console.log(`Found valid position for alternative word ${altWord}`);
                                    insertWord(altWord, altPositions, crossInfo.foundWordIndex, altDirection);
                                    setMessage(`Se ha colocado la palabra "${altWord}" como alternativa.`);
                                    return;
                                }
                            }
                        }
                    }

                    // Si ninguna palabra alternativa funcionó, mostrar un mensaje
                    setMessage(`No se pudo encontrar una posición válida para "${foundWordStr}" ni para palabras alternativas.`);
                } else {
                    setMessage(`No se pudo encontrar una posición válida para "${foundWordStr}".`);
                }
            }
        } catch (error) {
            console.error("Error in insertCrossWord:", error);
            setMessage("Ocurrió un error al colocar la palabra cruzada.");
        }
    }
    function calculatePositions(word, startRow, startCol, direction) {
        const positions = [];

        // Validar que word no sea undefined o null
        if (!word) {
            console.error("Word is undefined or null in calculatePositions");
            return positions;
        }

        // Validar que startRow y startCol sean números válidos
        if (typeof startRow !== 'number' || typeof startCol !== 'number' ||
            isNaN(startRow) || isNaN(startCol)) {
            console.error(`Invalid startRow or startCol: row=${startRow}, col=${startCol}`);
            return positions;
        }

        console.log("Word to place:", word);

        // Verificar si la palabra completa cabe en el grid
        if (direction === 'horizontal') {
            // Para palabras horizontales, verificar si hay suficiente espacio a la derecha
            if (startCol < 0 || startCol + word.length > Size) {
                console.error(`Horizontal word "${word}" won't fit at position (${startRow}, ${startCol})`);
                // Aún así, intentamos calcular las posiciones para las letras que sí caben
            }

            for (let i = 0; i < word.length; i++) {
                const col = startCol + i;
                const row = startRow;

                // Solo agregar posiciones que estén dentro de los límites del grid
                if (row >= 0 && row < Size && col >= 0 && col < Size) {
                    positions.push({ row, col, letter: word[i] });
                } else {
                    console.error(`Position out of bounds: row=${row}, col=${col}, letter=${word[i]}`);
                    // No agregamos esta posición, pero continuamos con las demás
                }
            }
        } else { // direction is 'vertical'
            // Para palabras verticales, verificar si hay suficiente espacio hacia abajo
            if (startRow < 0 || startRow + word.length > Size) {
                console.error(`Vertical word "${word}" won't fit at position (${startRow}, ${startCol})`);
                // Aún así, intentamos calcular las posiciones para las letras que sí caben
            }

            for (let i = 0; i < word.length; i++) {
                const row = startRow + i;
                const col = startCol;

                // Solo agregar posiciones que estén dentro de los límites del grid
                if (row >= 0 && row < Size && col >= 0 && col < Size) {
                    positions.push({ row, col, letter: word[i] });
                } else {
                    console.error(`Position out of bounds: row=${row}, col=${col}, letter=${word[i]}`);
                    // No agregamos esta posición, pero continuamos con las demás
                }
            }
        }

        // Verificar si se calcularon todas las posiciones necesarias
        if (positions.length !== word.length) {
            console.warn(`Not all positions for word "${word}" could be calculated. Expected ${word.length}, got ${positions.length}.`);
        }

        console.log("Positions calculated for word:", word, positions);
        return positions;
    }
    function validatePosition(positions, grid) {
        // Validar que positions sea un array válido
        if (!positions || !Array.isArray(positions) || positions.length === 0) {
            console.error("Invalid positions array:", positions);
            return false;
        }

        // Verificar que todas las posiciones estén dentro de los límites del grid
        // y que no haya conflictos con letras existentes
        for (const { row, col, letter } of positions) {
            // Verificar límites del grid
            if (row < 0 || row >= Size || col < 0 || col >= Size) {
                console.error(`Position out of grid bounds: row=${row}, col=${col}`);
                return false;
            }

            // Verificar conflictos con letras existentes
            // Comparar ignorando mayúsculas/minúsculas
            if (grid[row][col] !== '' && grid[row][col].toLowerCase() !== letter.toLowerCase()) {
                console.error(`Conflict at position ${row},${col}: grid has '${grid[row][col]}' but tried to place '${letter}'.`);
                return false;
            }
        }

        // Si es la primera palabra, no necesitamos verificar cruces
        if (wordsList.length === 0) {
            return true;
        }

        // Para palabras posteriores, debe haber al menos un cruce
        // Verificar si hay al menos un cruce válido con letras existentes
        let hasValidCrossing = false;
        let crossingPositions = [];

        for (const { row, col, letter } of positions) {
            if (grid[row][col] !== '' && grid[row][col].toLowerCase() === letter.toLowerCase()) {
                console.log(`Found valid crossing at ${row},${col}: '${letter}'`);
                hasValidCrossing = true;
                crossingPositions.push({ row, col, letter });
            }
        }

        // Si no hay cruces válidos, la posición no es válida para palabras cruzadas
        if (!hasValidCrossing) {
            console.error("No valid crossing found for word");
            return false;
        }

        // Verificar que no haya conflictos con palabras adyacentes
        // Esto es una validación más flexible que permite algunas palabras adyacentes
        // siempre que no haya conflictos directos

        // Determinar la dirección de la palabra actual
        const isHorizontal = positions.length >= 2 && positions[0].row === positions[1].row;

        // Verificar que no haya conflictos en posiciones adyacentes
        for (const { row, col } of positions) {
            // Ignorar las posiciones de cruce, ya que sabemos que son válidas
            if (crossingPositions.some(pos => pos.row === row && pos.col === col)) {
                continue;
            }

            // Verificar posiciones adyacentes en la dirección perpendicular
            if (isHorizontal) {
                // Para palabras horizontales, verificar posiciones arriba y abajo
                if (row > 0 && grid[row-1][col] !== '') {
                    // Hay una letra arriba, verificar si forma parte de una palabra vertical
                    // Esto es una validación básica, podría mejorarse en el futuro
                    console.log(`Adjacent letter found above at ${row-1},${col}: '${grid[row-1][col]}'`);
                }

                if (row < Size-1 && grid[row+1][col] !== '') {
                    // Hay una letra abajo, verificar si forma parte de una palabra vertical
                    console.log(`Adjacent letter found below at ${row+1},${col}: '${grid[row+1][col]}'`);
                }
            } else {
                // Para palabras verticales, verificar posiciones a la izquierda y derecha
                if (col > 0 && grid[row][col-1] !== '') {
                    // Hay una letra a la izquierda, verificar si forma parte de una palabra horizontal
                    console.log(`Adjacent letter found to the left at ${row},${col-1}: '${grid[row][col-1]}'`);
                }

                if (col < Size-1 && grid[row][col+1] !== '') {
                    // Hay una letra a la derecha, verificar si forma parte de una palabra horizontal
                    console.log(`Adjacent letter found to the right at ${row},${col+1}: '${grid[row][col+1]}'`);
                }
            }
        }

        // Si todas las validaciones pasan, la posición es válida
        return true;
    }
    const insertWord = (word, positions, crossIndex, direction) => {
        try {
            // Validar que word y positions existan y sean válidos
            if (!word) {
                console.error("Word is undefined or null in insertWord");
                return;
            }

            // Si word es un objeto con propiedad word, extraer la palabra
            const wordStr = typeof word === 'string' ? word : (word.word || '');

            if (!wordStr) {
                console.error("Invalid word format in insertWord:", word);
                return;
            }

            if (!positions || !Array.isArray(positions) || positions.length === 0) {
                console.error("Invalid positions in insertWord:", positions);
                return;
            }

            // Validar que crossIndex sea un número o null/undefined
            if (crossIndex !== undefined && crossIndex !== null && (typeof crossIndex !== 'number' || isNaN(crossIndex))) {
                console.error(`Invalid crossIndex in insertWord: ${crossIndex}`);
                crossIndex = null;
            }

            // Validar que direction sea válida
            if (direction !== 'horizontal' && direction !== 'vertical') {
                console.warn(`Invalid direction in insertWord: ${direction}, defaulting to horizontal`);
                direction = 'horizontal';
            }

            console.log('InsertWord:', wordStr, positions, crossIndex, direction);

            let newGrid = [...grid];
            positions.forEach((pos, index) => {
                if (index < wordStr.length && pos && typeof pos.row === 'number' && typeof pos.col === 'number' &&
                    pos.row >= 0 && pos.row < newGrid.length && pos.col >= 0 && pos.col < newGrid[pos.row].length) {
                    newGrid[pos.row][pos.col] = wordStr[index]; // Asegura que la longitud de `word` coincida con `positions`.
                } else {
                    console.error(`Invalid position or index: row=${pos?.row}, col=${pos?.col}, index=${index}, word.length=${wordStr.length}`);
                }
            });

            setGrid(newGrid);

            // Verificar que positions tenga las propiedades row y col antes de llamar a addWordToCrossings
            if (positions.length > 0 && positions[0] &&
                typeof positions[0].row === 'number' && typeof positions[0].col === 'number' &&
                !isNaN(positions[0].row) && !isNaN(positions[0].col)) {
                addWordToCrossings(wordStr, positions[0].row, positions[0].col, direction);
            } else {
                console.error("Cannot add word to crossings: invalid positions", positions);
            }

            setWordsList(prevWordsList => [
                ...prevWordsList,
                { word: wordStr, positions, direction, crossIndex }
            ]);

            setIsSearching(true);
        } catch (error) {
            console.error("Error in insertWord:", error);
        }
    };
  return (
    <Container >
      <Form >
        <Input
                     type="text"
                     value={word}
                     onChange={handleInputChange}
                     onKeyDown={!isFirstWord ? handleKeyDown : () => setMessage('')}
                     disabled={isLoadingAI}
                    //  maxLength={10}
                     placeholder="Introduce una palabra de hasta 10"
            />
        <Button type='button' onClick={resetGame} disabled={isLoadingAI}>Reset</Button>
        <Button
                type='button'
                onClick={handleAISearch}
                disabled={isLoadingAI || userWords.length === 0}
                style={{backgroundColor: isLoadingAI ? '#cccccc' : '#4CAF50'}}
        >
            {isLoadingAI ? 'Consultando...' : 'Consultar IA'}
        </Button>
        <InputRange
                      type="range"
                      min="0.5"
                      max="1.2"
                      step='0.05'
                      value={scale}
                      onChange={handleScaleChange}
                      disabled={isLoadingAI}
            />

      </Form>
      <CrucigramaContainer  >
         <CrucigramaTable
                      style={{transform:`scale(${scale})`,
                            //   backgroundColor: backgroundColor,
                              transformOrigin: 'center',
                              display: 'grid',
                              gridTemplateColumns: `repeat(${Size}, 1fr)`}}>
                              {grid.map((row, rowIndex) => row.map((cell,colIndex) => (
                <Cell
                      key={`${rowIndex}-${colIndex}`}
                      row={rowIndex}
                      col={colIndex}
                      letter={cell}
                      onClick={isFirstWord ? handleClick : () => setMessage("Please press Enter to confirm the word.")}
                  />
               ))
            )}
         </CrucigramaTable>
      </CrucigramaContainer>
    </Container>
  );
}
