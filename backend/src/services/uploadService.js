const cloudinary = require('../config/cloudinary');

/**
 * Faz upload de uma imagem para o Cloudinary com redimensionamento e otimização.
 * Recebe a string Base64 enviada pelo Front-end.
 */
const uploadImage = async (base64String) => {
    try {
        // Pega as dimensões do .env ou usa o padrão 800x1000
        const width = parseInt(process.env.IMAGE_WIDTH) || 800;
        const height = parseInt(process.env.IMAGE_HEIGHT) || 1000;

        const result = await cloudinary.uploader.upload(base64String, {
            folder: "loja_camisas",
            transformation: [
                {
                    width: width,
                    height: height,
                    crop: "fill", // Preenche o espaço mantendo proporções
                    gravity: "center", // Centraliza o corte
                    zoom: 0.85 // Leve zoom out para mostrar mais da imagem
                },
                {
                    fetch_format: "auto",
                    quality: "auto"
                }
            ]
        });

        // Retorna a URL segura e o public_id para deletar depois
        return {
            url: result.secure_url,
            public_id: result.public_id
        };
    } catch (error) {
        console.error("Erro no upload para o Cloudinary:", error);
        throw error;
    }
};

const deleteImage = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error) {
        console.error("Erro ao deletar imagem do Cloudinary:", error);
        throw error;
    }
};

module.exports = { uploadImage, deleteImage };