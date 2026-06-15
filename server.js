const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());

// 🔑 Tus 10 API Keys de Google Drive
const GOOGLE_KEYS = [
    'AIzaSyDjmZGFplVdiYtYcTJuBf-eCPV3fMQtJRI',
    'API_KEY_CUENTA_2',
    'API_KEY_CUENTA_3',
    'API_KEY_CUENTA_4',
    'API_KEY_CUENTA_5',
    'API_KEY_CUENTA_6',
    'API_KEY_CUENTA_7',
    'API_KEY_CUENTA_8',
    'API_KEY_CUENTA_9',
    'API_KEY_CUENTA_10'
];

// Ruta rápida que busca el video en paralelo
app.get('/stream/:fileId', async (req, res) => {
    const { fileId } = req.params;
    const range = req.headers.range;

    try {
        // 1. Preguntar a TODAS las cuentas al mismo tiempo cuál tiene el archivo (Método ultra rápido)
        const listaPromesas = GOOGLE_KEYS.map(key => {
            const urlMetadata = `https://www.googleapis.com/drive/v3/files/${fileId}?key=${key}`;
            return axios.get(urlMetadata).then(() => key); // Si encuentra el archivo, devuelve su API Key
        });

        // Promise.any se queda con la primera cuenta que responda con éxito
        const apiKeyGanadora = await Promise.any(listaPromesas);
        
        const urlStream = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${apiKeyGanadora}`;

        // 2. Manejo del Streaming de Video en pedacitos (Range)
        if (!range) {
            const response = await axios({
                method: 'get',
                url: urlStream,
                responseType: 'stream',
                headers: { 'User-Agent': 'Mozilla/5.0' }
            });
            res.writeHead(200, { 'Content-Type': 'video/mp4' });
            return response.data.pipe(res);
        }

        const videoResponse = await axios({
            method: 'get',
            url: urlStream,
            headers: { 'Range': range, 'User-Agent': 'Mozilla/5.0' },
            responseType: 'stream',
            validateStatus: (status) => status >= 200 && status < 300 || status === 206
        });

        res.writeHead(206, {
            'Content-Range': videoResponse.headers['content-range'],
            'Accept-Ranges': 'bytes',
            'Content-Length': videoResponse.headers['content-length'],
            'Content-Type': videoResponse.headers['content-type'] || 'video/mp4',
        });

        videoResponse.data.pipe(res);

    } catch (error) {
        console.error('Error al buscar el video:', error.message);
        if (!res.headersSent) {
            res.status(404).send('Película no encontrada en ninguna de las 10 cuentas.');
        }
    }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Xuper TV veloz corriendo en http://localhost:${PORT}`));