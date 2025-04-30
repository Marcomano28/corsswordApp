import styled from "styled-components";

export const Container = styled.div`
    /* perspective: 800px; */
    background-color: gray;
    position: relative;
    border-radius: 5px;
    display:flex;
    justify-content:center;
    flex-direction:column;
    align-items:center;
    padding:0.3rem;
    margin: 4px;
    box-shadow:inset 8px 13px 35px 2px rgba(22, 0, 6, 0.8);
`
export const Form = styled.form`
   
`
export const CrucigramaContainer = styled.div`   
    width: 800px;
    height:800px;
    overflow:auto;
    display:flex;
    align-items:center;
    justify-content:center;
`
export const CrucigramaTable = styled.div`
    /* background-color: gray; */
    perspective:2000;
    transform-origin: top;
    box-shadow: 8px 13px 35px 2px rgba(22, 0, 6, 0.8);
    padding:0.5rem;   
`
export const Input = styled.input`
    box-shadow: 8px 13px 35px 2px rgba(22, 0, 6, 0.8);
    background-color: #777455;
    padding:2px 8px;
    color: whitesmoke;
    letter-spacing:2px;
    outline: none;
   &:focus{
    border:1px solid lightsalmon;
   }    
`
export const Select = styled.select`
    box-shadow: 8px 13px 35px 2px rgba(22, 0, 6, 0.8);
    background-color: #777455;
    margin: 0.4rem;   
`
export const Button = styled.button`
    border-radius: 12px;
    border: 1px solid gray;
    border:none;
    padding: 0.2rem 0.3rem;
    margin: 0.4rem;
    box-shadow: 8px 13px 35px 2px rgba(22, 0, 6, 0.8);
    background-color: #777455;
    &:hover{
        box-shadow:inset 2px 3px 3.5px 2px rgba(22, 0, 6, 0.8);
        color:#d5cf87;
    }
`;
export const InputRange = styled.input`       
        position: absolute;
        right:10px;
        top: 10px;
        align-items: center;
        &:focus {
        outline: none;  
    }  
    &::-webkit-slider-runnable-track {
        box-shadow:inset 2px 3px 3.5px 2px rgba(22, 0, 6, 0.8);
        color:#d5cf87;
        background-color: #87856f;
        height:15px;
        border-radius:5px;     
    }
 
`