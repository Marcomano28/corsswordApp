// Servicio para interactuar con la API de Google para búsqueda de palabras

// Función para buscar palabras relacionadas usando la API de Google
export const searchRelatedWords = async (word, apiKey) => {
  try {
    // Asegurarse de que tenemos una clave API
    if (!apiKey) {
      throw new Error('Es necesaria una clave API para realizar la búsqueda');
    }

    // Construir la URL para la API de Google (Custom Search JSON API)
    const baseUrl = 'https://www.googleapis.com/customsearch/v1';
    const params = new URLSearchParams({
      key: apiKey,
      cx: 'SEARCH_ENGINE_ID', // Aquí se debe reemplazar con el ID de motor de búsqueda personalizado
      q: `palabras relacionadas con ${word}`,
      num: 10 // Número de resultados a devolver
    });

    // Realizar la petición a la API
    const response = await fetch(`${baseUrl}?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Error en la petición: ${response.status}`);
    }

    const data = await response.json();
    
    // Extraer palabras relevantes de los resultados
    let relatedWords = [];
    
    if (data.items && data.items.length > 0) {
      // Extraer palabras de los snippets y títulos
      data.items.forEach(item => {
        if (item.snippet) {
          // Dividir el snippet en palabras y filtrar
          const snippetWords = item.snippet
            .toLowerCase()
            .replace(/[^\wáéíóúüñ\s]/g, '')
            .split(/\s+/)
            .filter(w => w.length > 3 && w.length < 11 && w !== word.toLowerCase());
          
          relatedWords = [...relatedWords, ...snippetWords];
        }
      });
      
      // Eliminar duplicados y palabras muy cortas o largas
      relatedWords = [...new Set(relatedWords)];
    }
    
    return relatedWords.slice(0, 20); // Limitar a 20 palabras relacionadas
  } catch (error) {
    console.error('Error al buscar palabras relacionadas:', error);
    return []; // Devolver array vacío en caso de error
  }
};

// Función simplificada para demostración (cuando no se tiene API Key)
export const mockSearchRelatedWords = async (word) => {
  // Esta función simula una respuesta de la API para pruebas
  console.log(`Simulando búsqueda para: ${word}`);
  
  // Diccionario de palabras relacionadas para algunas palabras comunes
  const relatedWordsMap = {
    'apple': ['fruit', 'computer', 'iphone', 'macbook', 'orchard', 'cider', 'juice', 'healthy'],
    'banana': ['fruit', 'yellow', 'tropical', 'monkey', 'potassium', 'plantain', 'smoothie'],
    'orange': ['fruit', 'color', 'citrus', 'juice', 'vitamin', 'tangerine', 'mandarin'],
    'computer': ['laptop', 'desktop', 'keyboard', 'monitor', 'hardware', 'software', 'processor'],
    'book': ['reading', 'author', 'library', 'novel', 'chapter', 'story', 'literature', 'pages'],
    'music': ['sound', 'rhythm', 'melody', 'concert', 'guitar', 'piano', 'instrument', 'song'],
    'house': ['home', 'building', 'family', 'roof', 'kitchen', 'bedroom', 'garden', 'living'],
    'water': ['drink', 'ocean', 'river', 'liquid', 'hydrate', 'bottle', 'swimming', 'thirst'],
  };
  
  // Esperar un tiempo aleatorio para simular la latencia de la red
  await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
  
  // Devolver palabras relacionadas o un conjunto predeterminado
  return relatedWordsMap[word.toLowerCase()] || 
    ['random', 'words', 'related', 'example', 'testing', 'placeholder', 'sample'];
};
