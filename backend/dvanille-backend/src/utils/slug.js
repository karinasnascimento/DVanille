/** Converte "Bolo de Cenoura!" em "bolo-de-cenoura". */
function slugify(text) {
  return String(text || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100);
}

/**
 * Gera um slug único para um model do Prisma (ex.: prisma.product).
 * Se "bolo" já existir, tenta "bolo-2", "bolo-3"...
 */
async function generateUniqueSlug(delegate, baseText, excludeId = null) {
  const base = slugify(baseText) || 'item';
  let candidate = base;
  let suffix = 1;

  // eslint-disable-next-line no-await-in-loop
  while (true) {
    const existing = await delegate.findUnique({ where: { slug: candidate }, select: { id: true } });
    if (!existing || existing.id === excludeId) return candidate;
    suffix += 1;
    candidate = `${base}-${suffix}`;
  }
}

module.exports = { slugify, generateUniqueSlug };
