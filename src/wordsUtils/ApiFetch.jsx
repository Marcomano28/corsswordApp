import { useState } from "react";

const ApiFetchDirect = () => {
  const [userInput, setUserInput] = useState('');
  const [suggestedWords, setSuggestedWords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleUserInput = (event) => {
    setUserInput(event.target.value);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: `Suggest words related to "${userInput}"`,
          max_tokens: 50,
          n: 5, // Number of suggestions to generate
          
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch suggested words');
      }

      const data = await response.json();
      const words = data.choices.map(choice => choice.text.trim());
      setSuggestedWords(words);
    } catch (error) {
      console.error("Error fetching suggested words:", error);
      setError('Failed to fetch suggested words');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1>Game</h1>
      <input type="text" value={userInput} onChange={handleUserInput} />
      <button onClick={handleSubmit}>Submit</button>
      <h2>Suggested Words:</h2>
      <ul>
        {suggestedWords.map((word, index) => (
          <li key={index}>{word}</li>
        ))}
      </ul>
      {isLoading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
    </div>
  );
};

export default ApiFetchDirect;
