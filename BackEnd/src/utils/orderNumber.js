const crypto = require('crypto');

// Sem caracteres ambíguos (0/O, 1/I) para facilitar a leitura em balcão/telefone.
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/** Gera o número do pedido no formato DV-AAAAMMDD-XXXXXX. */
function generateOrderNumber(date = new Date(), randomInt = crypto.randomInt) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  let suffix = '';
  for (let i = 0; i < 6; i += 1) {
    suffix += ALPHABET[randomInt(0, ALPHABET.length)];
  }

  return `DV-${year}${month}${day}-${suffix}`;
}

module.exports = { generateOrderNumber };
