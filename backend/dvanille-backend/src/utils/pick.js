/** Copia apenas as chaves permitidas (evita mass assignment vindo do body). */
function pick(source, allowedKeys) {
  const result = {};
  allowedKeys.forEach((key) => {
    if (source && source[key] !== undefined) result[key] = source[key];
  });
  return result;
}

module.exports = { pick };
