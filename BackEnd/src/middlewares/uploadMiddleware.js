const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const env = require('../config/env');
const AppError = require('../utils/AppError');
const { ensureUploadDirs } = require('../utils/storage');

// Somente imagens. A extensão do arquivo salvo vem do MIME validado, nunca do nome enviado.
const ALLOWED_TYPES = {
  'image/jpeg': { extensions: ['.jpg', '.jpeg'], saveAs: '.jpg' },
  'image/png': { extensions: ['.png'], saveAs: '.png' },
  'image/webp': { extensions: ['.webp'], saveAs: '.webp' },
};

function hasValidSignature(mimeType, header) {
  switch (mimeType) {
    case 'image/jpeg':
      return header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff;
    case 'image/png':
      return header.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    case 'image/webp':
      return header.subarray(0, 4).toString('ascii') === 'RIFF' && header.subarray(8, 12).toString('ascii') === 'WEBP';
    default:
      return false;
  }
}

/**
 * Cria os middlewares de upload de imagem para uma subpasta (products, profiles, categories).
 * Retorna um array [multer, verificarAssinatura] pronto para usar na rota.
 * Valida: MIME, extensão, tamanho (MAX_UPLOAD_MB) e assinatura real do arquivo (magic bytes).
 */
function createImageUpload(subdir, fieldName = 'image') {
  const destination = path.join(env.uploadDir, subdir);

  const storage = multer.diskStorage({
    destination(req, file, cb) {
      ensureUploadDirs();
      cb(null, destination);
    },
    filename(req, file, cb) {
      const { saveAs } = ALLOWED_TYPES[file.mimetype];
      cb(null, `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${saveAs}`);
    },
  });

  const upload = multer({
    storage,
    limits: { fileSize: env.maxUploadSizeMb * 1024 * 1024, files: 1 },
    fileFilter(req, file, cb) {
      const rule = ALLOWED_TYPES[file.mimetype];
      const extension = path.extname(file.originalname || '').toLowerCase();

      if (!rule || !rule.extensions.includes(extension)) {
        return cb(AppError.unprocessable('Formato de imagem inválido. Envie JPG, PNG ou WEBP.'));
      }
      return cb(null, true);
    },
  }).single(fieldName);

  async function verifyUploadedImage(req, res, next) {
    if (!req.file) {
      return next(AppError.unprocessable(`Envie uma imagem no campo "${fieldName}" (multipart/form-data).`));
    }

    try {
      const handle = await fs.promises.open(req.file.path, 'r');
      const header = Buffer.alloc(12);
      await handle.read(header, 0, 12, 0);
      await handle.close();

      if (!hasValidSignature(req.file.mimetype, header)) {
        await fs.promises.unlink(req.file.path).catch(() => {});
        return next(AppError.unprocessable('O conteúdo do arquivo não corresponde a uma imagem válida.'));
      }
      return next();
    } catch (error) {
      return next(error);
    }
  }

  return [upload, verifyUploadedImage];
}

module.exports = {
  createImageUpload,
  uploadProductImage: createImageUpload('products'),
  uploadCategoryImage: createImageUpload('categories'),
  uploadProfileImage: createImageUpload('profiles'),
};
