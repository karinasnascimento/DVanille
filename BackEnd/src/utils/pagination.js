const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/** Lê ?page e ?limit da query string com valores seguros. */
function parsePagination(query = {}) {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const requestedLimit = parseInt(query.limit, 10) || DEFAULT_LIMIT;
  const limit = Math.min(Math.max(requestedLimit, 1), MAX_LIMIT);

  return { page, limit, skip: (page - 1) * limit, take: limit };
}

function buildPagination({ page, limit, total }) {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

module.exports = { DEFAULT_LIMIT, MAX_LIMIT, parsePagination, buildPagination };
