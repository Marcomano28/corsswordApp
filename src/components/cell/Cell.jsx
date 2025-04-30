
import { CellLetter } from "./CellStyled";
export const Cell = ({ row, col, letter, onClick }) => {

  return (
    <CellLetter 
      onClick={() => onClick(row, col)} 
      $conletter ={!!letter}
    >
      {letter ? letter.toUpperCase() : ''}
    </CellLetter>
  );
}
