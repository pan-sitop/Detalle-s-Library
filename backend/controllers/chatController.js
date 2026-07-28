const { GoogleGenerativeAI } = require('@google/generative-ai');

exports.chat = async (req, res) => {
    try {
        const { message } = req.body;
        
        // Obtenemos la llave de las variables de entorno
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey || apiKey === 'AQUI_TU_API_KEY') {
            // Modo SIMULADO si no hay API key configurada
            let mockResponse = "Soy un bibliotecario virtual. No tienes configurada la API KEY de Gemini en el backend (.env), así que te doy una respuesta simulada: ";
            const msgLow = message.toLowerCase();
            
            if (msgLow.includes('hola') || msgLow.includes('buenos')) {
                mockResponse = "¡Hola! Bienvenido a la biblioteca. ¿Qué género de libro tienes ganas de leer hoy?";
            } else if (msgLow.includes('terror') || msgLow.includes('miedo')) {
                mockResponse = "Si te gusta el terror, te recomiendo encarecidamente 'El Resplandor' de Stephen King o 'Drácula' de Bram Stoker.";
            } else if (msgLow.includes('ciencia')) {
                mockResponse = "Para los amantes de la ciencia ficción, 'Dune' de Frank Herbert es una lectura obligatoria.";
            } else if (msgLow.includes('amor') || msgLow.includes('romance')) {
                mockResponse = "En romance, 'Orgullo y Prejuicio' de Jane Austen es un clásico inolvidable.";
            } else {
                mockResponse += "Esa es una pregunta muy interesante sobre libros. Te recomiendo buscar en nuestro catálogo por título o autor.";
            }
            
            // Simulamos un pequeño retraso para que parezca que está "escribiendo"
            await new Promise(resolve => setTimeout(resolve, 1500));
            return res.json({ success: true, reply: mockResponse });
        }

        // Modo IA REAL con Gemini
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const prompt = `Eres un asistente experto de una biblioteca pública. 
Tu única función es ayudar a los usuarios con recomendaciones de lectura, dudas sobre autores, géneros literarios y libros en general.
Si el usuario te pregunta sobre temas que NO tienen que ver con libros (como recetas de cocina, matemáticas, política, programación, etc.), 
debes negarte amablemente a responder y recordarles que solo estás aquí para hablar de literatura.
Sé amable, breve y muy útil.

El usuario dice: "${message}"`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        
        res.json({ success: true, reply: text });

    } catch (error) {
        console.error("Error en Chatbot:", error);
        res.status(500).json({ success: false, message: error.message || 'El bot se quedó sin palabras.' });
    }
};
