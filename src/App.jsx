
import { useState } from 'react';
import { CrossWords } from './components/crucigrama/CrossWords'
import { Main, Message } from './AppStyled'
// import ApiFetch from './wordsUtils/ApiFetch';

function App() {
  const [message, setMessage] = useState('Enter a word of no more than 10 letters and click on the crossword.');
  return (
    <Main>
      {/* <ApiFetch/> */}
      <Message><span>{message}</span></Message>
     {/* <Crucigrama Size={50} setMessage={setMessage}/> */}
     <CrossWords Size={50} setMessage={setMessage}/>
    
    </Main>
  )
}
export default App
