import styled from "styled-components"

export const CellLetter = styled.div`
    color: #c4c6c2;
    text-shadow: 0px 10px 9px #060d01;
    width: 25px;
    height: 25px;
    display: flex;
    flex-wrap: nowrap;
    justify-content: center;
    align-items: center;
    background-color: transparent;
    transform-origin: center;
    transition: transform 0.8s ease; 
   &:hover{
    transform: ${props => props.$conletter ? 'scale(1.8)' : 'scale(1.0)'};
    box-shadow: ${props => props.$conletter ? 'inset 2px 1px 5px 2px rgba(22, 0, 6, 0.3);': 'transparent'} ;
    cursor: ${props => props.$conletter ? 'pointer' : 'default'};
    border-radius: ${props => props.$conletter ? '50%' : '10px'};
    text-shadow: ${props => props.$conletter ? '0px 10px 9px rgba(9, 70, 151, 0.7)' : '0px 10px 9px #060d01'} ;
   }
     
`
