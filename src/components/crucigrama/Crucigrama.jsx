// import { useRef, useState} from "react"
// import { Cell } from "../cell/Cell"
// import { Button, Container, CrucigramaTable, Input, Form ,CrucigramaContainer, InputRange} from "./CrucigramaStyled";
// import { findMatchingWord,centerCloserLetter } from "../../wordsUtils/findMatchingWord";
// import { useEffect } from "react";

// export const Crucigrama = ({Size, setMessage}) => {
//     const [grid, setGrid] = useState(() => { return Array.from({length: Size }, () => Array.from({length: Size }, () => ''));});
//     const [word, setWord] = useState('');
//     const [direction, setDirection] = useState('horizontal');
//     const [scale, setScale] = useState(1);
//     const [wordsList, setWordsList] = useState([]);
//     const [userWords, setUserWords] = useState([]);
//     const [foundWords, setFoundWords] = useState([]);
//     const [isFirstWord, setIsFirstWord] = useState(true); 
//     const [isSearching, setIsSearching] = useState(false);
//     const [crossings, setCrossings] = useState([]);

//     const addWordToCrossings = (word, startRow, startCol, direction) => {
//         // console.log("Parameters for addWordToCrossings:", word, startRow, startCol, direction);
          
//         const newCrossings = [...crossings];
//         for (let i = 0; i < word.length; i++) {
//             const row = direction === 'horizontal' ? startRow : startRow + i;
//             const col = direction === 'horizontal' ? startCol + i : startCol;
//             if (!newCrossings.some(crossing => crossing.row === row && crossing.col === col)) {
//                 newCrossings.push({ row, col, letter: word[i] });
//             }
//         }
//         setCrossings(newCrossings);
//         // console.log("Updated crossings:", newCrossings);
//     };

//     // Manejar la primera palabra
//     useEffect(() => {
//         if (isFirstWord && wordsList.length === 1) {
//             const wordInfo = wordsList[0];
//             addWordToCrossings(wordInfo.word, wordInfo.row, wordInfo.col, 'horizontal');
//             // setDirection('vertical');       
//         }
//     }, [isFirstWord]); 

//     useEffect(() => {
//         if (wordsList.length > 0) {
//             handleDirectionChange();
//             const wordInfo = wordsList[wordsList.length - 1]; // Tomar la última palabra añadida
//             addWordToCrossings(wordInfo.word, wordInfo.row, wordInfo.col, direction);
//             // Alternar la dirección para la próxima palabra
//             // const nextDirection = direction === 'horizontal' ? 'vertical' : 'horizontal';
//             // setDirection(nextDirection); // Actualiza el estado de la dirección
//             console.log('Direction changed to:', direction);
//         }
//     }, [wordsList]); 

//     const handleInputChange = (e) => {
//         const newWord = e.target.value;
//         setWord(newWord);  // Actualiza el estado de la palabra para todas las entradas 
//         if (newWord.length > 10) {
//             setMessage("The word must be no more than 10 letters.");
//             setWord('');  // Limpia el input si la palabra es muy larga
//         } else if (isFirstWord) {
//             setMessage('');  
//         } else {
//             setMessage('now enter');  // Establece un mensaje después de la primera palabra
//         }
//     };
//     const handleDirectionChange = () => {  
//         setDirection(prevDirection => prevDirection === 'horizontal' ? 'vertical' : 'horizontal');
//     };
//     const handleScaleChange = (e) => {
//         setScale(e.target.value);
//     }
//     const resetGame = () => {
//       setGrid(Array.from({ length: Size }, () => Array.from({ length: Size }, () => '')));
//     };
//     const handleClick = (row, col) => {     
//         if (word && isFirstWord) {
//             handleWordInsertion(word, row, col, direction);
//             setWord('');
//             setIsFirstWord(false);
//             setMessage('Well done, now...the magic');  
//       } else{
//         setMessage("Please use Enter to confirm words after the first.");
//       }            
//     };
//     const handleWordInsertion = (word, row, col, direction) => {
//         const positions = calculatePositions(word, row, col, direction);
//         if (isFirstWord || validatePosition(positions, grid)) {
//             updateGridWithWord(word, positions);
//             setUserWords(prev => [...prev, { word, positions: { row, col }, direction, crossIndex: null}]);
//             setWordsList(prev => [...prev, { word, positions, direction, crossIndex: null }]);
//         } else {
//             setMessage("Invalid position for the word.");
//         }       
//     };
//     function updateGridWithWord(word, positions) {
//         let newGrid = [...grid];
//         positions.forEach((pos, index) => {
//             newGrid[pos.row][pos.col] = word[index];
//         });
//         setIsSearching(true);
//         setGrid(newGrid);
//     }
//     const handleKeyDown = (e) => {  
//         if (e.key === 'Enter' && word) {           
//             if (!isFirstWord ) {
//                 setUserWords(prevWords => [...prevWords, word]);
//                 setWord('');
//                 setMessage("Word accepted. Click where to place the next one.");
//             }
//             e.preventDefault();
//             setIsFirstWord(false);
           
//         }
//     };
//     useEffect(() => {
//         if (userWords.length > 0 && !isFirstWord) { // Asegúrate de que hay al menos dos palabras para comparar
//             const newFoundWord= wordsList[wordsList.length - 1].word;
//             const newUserWord = userWords[userWords.length - 1];
//             // console.log(newFoundWord);
//             // console.log(newUserWord);
//             setIsSearching(false);
//             const info = findBestCrossing(newUserWord, newFoundWord);  
//             // console.log(info);        
//         }
//     }, [userWords, foundWords]); 

//     function findBestCrossing(userWord, myWord) {      
//         console.log("Esta es wordList:",wordsList);
//         const letters1 = centerCloserLetter(userWord);     
//         const letters2 = centerCloserLetter(myWord);       
//         for (let letterObj1 of letters1) {
//             for (let letterObj2 of letters2) {
//                 if (letterObj1.letter === letterObj2.letter) {
//                     return {
//                         letter: letterObj1.letter,
//                         userIndex: letterObj1.index,
//                         foundIndex: letterObj2.index                      
//                     };                  
//                 }
//             }
//         }
//         return null; 
//     }
//     useEffect(() => {
//         // if (wordsList.length > 0 && isSearching && wordsList.length % 2 !== 0) {
//             if(userWords.length > 0 && !isFirstWord && isSearching ){
//             const lastWordUser = userWords[userWords.length - 1];   
//             const matchingWord = findMatchingWord(lastWordUser.word);       
//             if (matchingWord && !foundWords.some(w => w.word === matchingWord.word)) {
//                 // setFoundWords(prev => [...prev, { ...matchingWord }]);
//                 const { foundWord, crossIndex, foundWordIndex } = matchingWord;
//                 setFoundWords(prevFoundWords => {
//                     const newFoundWords = [...prevFoundWords, { foundWord, crossIndex, foundWordIndex, direction:'vertical' }];
//                     // console.log('newFoundWords', newFoundWords);
//                     return newFoundWords;
//                 });          
//                 updateCrossIndex(lastWordUser.word, crossIndex);
//                 insertCrossWord(lastWordUser, foundWord, crossIndex, foundWordIndex, 'vertical');
//             } else {
//                 console.log("No matching word found.");
//             }   
//             setIsSearching(false);
//         console.log('foundWords',foundWords);   

//         } 
//     }, [userWords, isFirstWord]);

//     useEffect(() => {


//     }, [wordsList])
    
//     const updateCrossIndex = (wordText, newCrossIndex) => {
//         setWordsList(prevWordsList => prevWordsList.map(w => 
//             w.word === wordText ? {...w, crossIndex: newCrossIndex} : w
//         ));
//     };
//     function insertCrossWord(userWord, foundWord, userIndex, foundWordIndex, direction) {
//         if (wordsList.some(w => w.word === foundWord && w.direction === direction)) {
//             console.log("Word already exists with the same direction.");
//             return;
//         }
//         console.log(direction);
//         const userWordPositions = userWord.positions;   
//         let startRow = userWordPositions.row - foundWordIndex;
//         let startCol = userWordPositions.col + userIndex;  
        
//         const positions = calculatePositions(foundWord, startRow, startCol, direction);
//         // setFoundWords([...foundWords, { foundWord, positions: { row: startRow, col: startCol }, direction, crossIndex: foundWordIndex}]);
//     //    console.log(setFoundWords);
//         if (validatePosition(positions, grid)) {
//             insertWord(foundWord, positions, foundWordIndex, direction);
//             // setWordsList(prev => [...prev, { word: foundWord, positions, direction:'vertical', crossIndex: foundWordIndex}]);
//         } else {
//             console.error("Invalid position for the word.");
//         }       
//     }    
//     function calculatePositions(word, startRow, startCol, direction) {
//         const positions = [];
//         // console.log("Word to place:", word);
//         if (direction === 'horizontal') {
//             for (let i = 0; i < word.length; i++) {
//                 const col = startCol + i;
//                 if (col < 0 || col >= Size) continue; // Asegúrate de que esté dentro de los límites del grid
//                 positions.push({ row: startRow, col: col, letter: word[i] });
//             }
//         } else { // direction is 'vertical'
//             for (let i = 0; i < word.length; i++) {
//                 const row = startRow + i;
//                 if (row >= 0 && row < Size && startCol >= 0 && startCol < Size) {
//                     positions.push({ row, col: startCol, letter: word[i] });
//                 } else {
//                     console.error(`Out of bounds: row=${row}, col=${startCol}`);
//                 }
//             }
//         }
//         console.log("Positions calculated for word:", word, positions);       
//         return positions;
//     } 
//     function validatePosition(positions, grid) {
//         for (const { row, col, letter } of positions) {
//             if (row < 0 || row >= Size || col < 0 || col >= Size) {
//                 console.error("Word out of grid bounds.");
//                 return false;
//             }
//             if (grid[row][col] !== '' && grid[row][col].toUpperCase() !== letter.toUpperCase()) {
//                 console.error(`Conflict at position ${row},${col}: grid has '${grid[row][col]}' but tried to place '${letter}'.`);
//                 return false;
//             }
//         }
//         return true;
//     }
//     const insertWord = (word, positions, crossIndex, direction) => {
//         let newGrid = [...grid];
//         positions.forEach((pos, index) => {
//             if (pos.row >= 0 && pos.row < newGrid.length && pos.col >= 0 && pos.col < newGrid[pos.row].length) {
//                 newGrid[pos.row][pos.col] = word[index]; // Asegura que la longitud de `word` coincida con `positions`.
//             } else {
//                 console.error(`Invalid position: row=${pos.row}, col=${pos.col}`);
//             }
//         });
//         setGrid(newGrid); 
//         addWordToCrossings(word, positions.row, positions.col);
//         console.log('QUe Pasa ', direction);
//         console.log("ArrayOfCrossing",crossings);
//         setWordsList(prevWordsList => [
//             ...prevWordsList,
//             { word, positions, direction, crossIndex }
//         ]);
//         // console.log('wordsList',wordsList);
//         // console.log('userWOrds',userWords);
        
//         setIsSearching(true);  
//     };
//   return (
//     <Container >
//       <Form >
//         <Input 
//                      type="text" 
//                      value={word} 
//                      onChange={handleInputChange} 
//                      onKeyDown={!isFirstWord ? handleKeyDown : () => setMessage('')}
//                     //  maxLength={10} 
//                     // placeholder="Introduce una palabra de hasta 10" 
//             />   
//         <Button type='button'onClick={resetGame}>Reset</Button>
//         <InputRange
//                       type="range"
//                       min="0.5"
//                       max="1"
//                       step='0.05'
//                       value={scale}
//                       onChange={handleScaleChange}
//             />
//       </Form>
//       <CrucigramaContainer >
//          <CrucigramaTable 
//                       style={{transform:`scale(${scale})`,                     
//                       transformOrigin: 'center', 
//                       display: 'grid', 
//                       gridTemplateColumns: `repeat(${Size}, 1fr)`}}>
//             {grid.map((row, rowIndex) => row.map((cell,colIndex) => (
//                 <Cell
//                       key={`${rowIndex}-${colIndex}`}
//                       row={rowIndex}
//                       col={colIndex}
//                       letter={cell}
//                       onClick={isFirstWord ? handleClick : () => setMessage("Please press Enter to confirm the word.")}         
//                   />
//                ))
//             )}
//          </CrucigramaTable>
//       </CrucigramaContainer>
//     </Container>
//   );
// }
