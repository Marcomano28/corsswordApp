/**
 * Módulo para manejar las peticiones a la API de Google Gemini
 */

/**
 * Consulta a la IA de Google Gemini para obtener una sugerencia de palabra
 * @param {Array} palabrasHorizontales - Array de palabras horizontales ya colocadas
 * @returns {Promise<string>} - Promesa que resuelve a la palabra sugerida por la IA
 */
export async function consultarGeminiApi(palabrasHorizontales) {
  try {
    // Aquí irá la clave API cuando se configure
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    // Verificar que tengamos la clave API
    if (!apiKey) {
      throw new Error('API key no configurada. Asegúrate de configurar el archivo .env');
    }

    // Formar el prompt para la API
    const prompt = `Eres un asistente especializado en crucigramas. 
    Necesito una palabra que pueda colocarse verticalmente y cruce con alguna de estas palabras horizontales: 
    ${palabrasHorizontales.join(', ')}. 
    La palabra debe tener al menos 3 letras y máximo 10 letras.
    Solo dame la palabra en mayúsculas, sin explicaciones ni texto adicional.`;

    // URL de la API de Gemini
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro:generateContent?key=${apiKey}`;

    // Payload para la API de Gemini
    const payload = {
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ]
    };

    // Hacer la petición a la API de Gemini
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    // Verificar si la respuesta es válida
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Error en la petición a la API de Gemini');
    }

    const data = await response.json();

    // Procesar la respuesta
    if (data.candidates && data.candidates.length > 0) {
      const sugerencia = data.candidates[0].content.parts[0].text.trim();
      return sugerencia;
    } else {
      throw new Error('No se recibió una respuesta válida de la API');
    }
  } catch (error) {
    console.error('Error al consultar Gemini:', error);
    throw error;
  }
}
