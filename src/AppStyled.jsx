import styled from "styled-components";

export const Main = styled.div`
    display:flex;
    align-items:center;
    justify-content:center;
    flex-direction: column;
    width:100vw;
    height:100vh;
    /* background-color: #a397a6; */
    background: radial-gradient(#e6d764, #adb4fc);
`;

export const Message = styled.div`
    padding: 10px;
    margin-bottom: 10px; 
    color: whitesmoke;
    text-shadow: 2px -2px #1b4018;
    font-size:1.1rem;
    background-color: #989292; 
    border-radius: 8px;
    width: 900px; 
    height:30px;
    text-align: center;
    overflow:hidden;
    text-overflow: ellipsis; 
    white-space: nowrap; 
    box-shadow: 1px 4px 20px 7px rgba(64,57,57,0.89) inset;
    -webkit-box-shadow: 1px -2px 20px 7px rgba(64,57,57,0.89) inset;
    -moz-box-shadow: 1px -2px 20px 7px rgba(64,57,57,0.89) inset;
    font-style: italic;
    span{
        /* animation: blink 1s linear infinite; */
    }
`