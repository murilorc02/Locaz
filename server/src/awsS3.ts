import express from 'express';
import multer from 'multer';
import AWS, { S3 } from 'aws-sdk';
import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import 'dotenv';

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

const accessKeyId = process.env.AWS_ACCESS_KEY_ID
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY
const region = process.env.AWS_REGION
const bucketName = process.env.AWS_S3_BUCKET

// Configuração AWS S3
const s3 = new AWS.S3({
  accessKeyId,
  secretAccessKey,
  region
});

// Configuração PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
});

// Criar tabela de imagens (executar uma vez)
const createImageTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS images (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      filename VARCHAR(255) NOT NULL,
      original_filename VARCHAR(255) NOT NULL,
      s3_key VARCHAR(500) NOT NULL,
      s3_url VARCHAR(1000) NOT NULL,
      content_type VARCHAR(100) NOT NULL,
      file_size INTEGER NOT NULL,
      uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      uploaded_by UUID, -- FK para tabela de usuários se tiver
      UNIQUE(s3_key)
    );
  `;
  
  try {
    await pool.query(query);
    console.log('Tabela de imagens criada/verificada com sucesso');
  } catch (error) {
    console.error('Erro ao criar tabela:', error);
  }
};

// Chamar na inicialização
createImageTable();

interface UploadedImage {
  id: string;
  filename: string;
  originalFilename: string;
  s3Key: string;
  s3Url: string;
  contentType: string;
  fileSize: number;
}

// Função para fazer upload para S3
const uploadToS3 = async (
  file: Express.Multer.File, 
  key: string
): Promise<AWS.S3.ManagedUpload.SendData> => {
  const params: AWS.S3.PutObjectRequest = {
    Bucket: process.env.AWS_S3_BUCKET || '',
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: 'public-read', // ou 'private' se não quiser acesso público
    CacheControl: 'max-age=31536000', // Cache de 1 ano
  };

  return s3.upload(params).promise();
};

// Função para salvar no banco de dados
const saveImageToDatabase = async (imageData: Omit<UploadedImage, 'id'>): Promise<string> => {
  const query = `
    INSERT INTO images (filename, original_filename, s3_key, s3_url, content_type, file_size)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id;
  `;
  
  const values = [
    imageData.filename,
    imageData.originalFilename,
    imageData.s3Key,
    imageData.s3Url,
    imageData.contentType,
    imageData.fileSize
  ];

  const result = await pool.query(query, values);
  return result.rows[0].id;
};

// Rota para upload de imagem
app.post('/api/upload-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    const file = req.file;
    
    // Validações
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({ error: 'Tipo de arquivo não permitido' });
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return res.status(400).json({ error: 'Arquivo muito grande' });
    }

    // Gerar nome único para o arquivo
    const fileExtension = path.extname(file.originalname);
    const uniqueFilename = `${uuidv4()}${fileExtension}`;
    const s3Key = `images/${new Date().getFullYear()}/${new Date().getMonth() + 1}/${uniqueFilename}`;

    // Upload para S3
    const s3Result = await uploadToS3(file, s3Key);

    // Salvar no banco de dados
    const imageData: Omit<UploadedImage, 'id'> = {
      filename: uniqueFilename,
      originalFilename: file.originalname,
      s3Key: s3Key,
      s3Url: s3Result.Location,
      contentType: file.mimetype,
      fileSize: file.size
    };

    const imageId = await saveImageToDatabase(imageData);

    // Resposta de sucesso
    res.json({
      id: imageId,
      url: s3Result.Location,
      filename: uniqueFilename,
      originalFilename: file.originalname,
      size: file.size
    });

  } catch (error) {
    console.error('Erro no upload:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para listar imagens
app.get('/api/images', async (req, res) => {
  try {
    const query = `
      SELECT id, filename, original_filename, s3_url, content_type, file_size, uploaded_at
      FROM images
      ORDER BY uploaded_at DESC
      LIMIT 50;
    `;
    
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar imagens:', error);
    res.status(500).json({ error: 'Erro ao buscar imagens' });
  }
});

// Rota para deletar imagem
app.delete('/api/images/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar informações da imagem
    const selectQuery = 'SELECT s3_key FROM images WHERE id = $1';
    const selectResult = await pool.query(selectQuery, [id]);
    
    if (selectResult.rows.length === 0) {
      return res.status(404).json({ error: 'Imagem não encontrada' });
    }

    const s3Key = selectResult.rows[0].s3_key;

    // Deletar do S3
    await s3.deleteObject({
      Bucket: process.env.AWS_S3_BUCKET || '',
      Key: s3Key
    }).promise();

    // Deletar do banco
    const deleteQuery = 'DELETE FROM images WHERE id = $1';
    await pool.query(deleteQuery, [id]);

    res.json({ message: 'Imagem deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar imagem:', error);
    res.status(500).json({ error: 'Erro ao deletar imagem' });
  }
});

export default app;