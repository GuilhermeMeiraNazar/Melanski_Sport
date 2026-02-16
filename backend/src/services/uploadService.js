const cloudinary = require('../config/cloudinary');

/**
 * Faz upload de uma imagem para o Cloudinary com redimensionamento automático.
 * @param {string} imagePath - Caminho do arquivo local ou URL da imagem.
 * @returns {Promise<string>} - Retorna a URL segura (https) da imagem.
 */
const uploadImage = async (imagePath) => {
    try {
        // Pega as dimensões definidas no .env
        const width = process.env.IMAGE_WIDTH || 400; // Valor padrão caso .env falhe
        const height = process.env.IMAGE_HEIGHT || 300;

        const result = await cloudinary.uploader.upload(imagePath, {
            folder: "loja_camisas", // Pasta organizada dentro do Cloudinary
            
            // --- AQUI ESTÁ A LÓGICA DE REDIMENSIONAMENTO ---
            transformation: [
                {
                    width: width,
                    height: height,
                    crop: "fill",    // Corta o excesso para caber no tamanho exato
                    gravity: "auto"  // IA: Tenta manter o objeto principal no centro
                },
                {
                    fetch_format: "auto", // Converte para WebP/AVIF automaticamente
                    quality: "auto"       // Otimiza o peso do arquivo
                }
            ]
        });

        return result.secure_url; // Retorna apenas o link: https://...

    } catch (error) {
        console.error("Erro no upload para o Cloudinary:", error);
        throw error; // Lança o erro para o Controller tratar
    }
};

module.exports = { uploadImage };

//Como usar essa funcao 

// const uploadService = require('../services/uploadService');

// // Dentro da sua rota de criação de produto:
// try {
//     // Supondo que você recebeu o arquivo e ele está em 'req.file.path'
//     const imageUrl = await uploadService.uploadImage(req.file.path);
    
//     console.log("Link gerado:", imageUrl);
//     // Agora salve 'imageUrl' no seu banco de dados MySQL...
    
// } catch (error) {
//     res.status(500).send("Erro ao salvar imagem");
// }