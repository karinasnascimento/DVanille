const fs = require('fs');
const path = require('path');
const env = require('../config/env');

/**
 * Camada de armazenamento de arquivos.
 *
 * Hoje usa o disco local (UPLOAD_DIR) e guarda no banco um caminho público relativo,
 * como "/uploads/products/abc.jpg". Para migrar para S3/Cloudinary/etc., basta
 * reimplementar estas funções mantendo a mesma assinatura:
 *   - toPublicPath(subdir, filename) -> string salva no banco / devolvida à API
 *   - removeStoredFile(publicPath)   -> apaga o arquivo antigo
 */

const PUBLIC_PREFIX = '/uploads';

function ensureUploadDirs() {
  ['products', 'profiles', 'categories'].forEach((subdir) => {
    fs.mkdirSync(path.join(env.uploadDir, subdir), { recursive: true });
  });
}

function toPublicPath(subdir, filename) {
  return `${PUBLIC_PREFIX}/${subdir}/${filename}`;
}

/** Remove um arquivo local previamente enviado, ignorando caminhos fora de /uploads. */
async function removeStoredFile(publicPath) {
  if (!publicPath || !publicPath.startsWith(`${PUBLIC_PREFIX}/`)) return;

  const relative = publicPath.slice(PUBLIC_PREFIX.length + 1);
  const absolute = path.resolve(env.uploadDir, relative);
  if (!absolute.startsWith(path.resolve(env.uploadDir) + path.sep)) return;

  try {
    await fs.promises.unlink(absolute);
  } catch (error) {
    if (error.code !== 'ENOENT') console.warn('[storage] Falha ao remover arquivo:', error.message);
  }
}

module.exports = { ensureUploadDirs, toPublicPath, removeStoredFile };
