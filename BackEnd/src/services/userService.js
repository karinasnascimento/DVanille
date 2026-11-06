const prisma = require('../config/database');
const AppError = require('../utils/AppError');
const { hashPassword, comparePassword } = require('../utils/password');
const { parsePagination, buildPagination } = require('../utils/pagination');
const { toPublicPath, removeStoredFile } = require('../utils/storage');

/** Campos do usuário que podem sair da API (nunca inclui passwordHash). */
const userPublicSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  role: true,
  profileImage: true,
  isActive: true,
  loyaltyPoints: true,
  createdAt: true,
  updatedAt: true,
};

async function getUserById(id) {
  const user = await prisma.user.findUnique({ where: { id }, select: userPublicSelect });
  if (!user) throw AppError.notFound('Usuário não encontrado.');
  return user;
}

async function updateProfile(userId, { name, phone }) {
  const data = {};
  if (name !== undefined) data.name = name;
  if (phone !== undefined) data.phone = phone === '' ? null : phone;

  return prisma.user.update({ where: { id: userId }, data, select: userPublicSelect });
}

async function changePassword(userId, { currentPassword, newPassword }) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { passwordHash: true } });
  if (!user) throw AppError.notFound('Usuário não encontrado.');

  const matches = await comparePassword(currentPassword, user.passwordHash);
  if (!matches) throw AppError.unprocessable('Senha atual incorreta.', [{ field: 'currentPassword', message: 'Senha atual incorreta.' }]);

  if (currentPassword === newPassword) {
    throw AppError.unprocessable('A nova senha deve ser diferente da atual.', [
      { field: 'newPassword', message: 'A nova senha deve ser diferente da atual.' },
    ]);
  }

  await prisma.user.update({ where: { id: userId }, data: { passwordHash: await hashPassword(newPassword) } });
}

async function updateProfileImage(userId, filename) {
  const current = await prisma.user.findUnique({ where: { id: userId }, select: { profileImage: true } });
  const profileImage = toPublicPath('profiles', filename);

  const user = await prisma.user.update({ where: { id: userId }, data: { profileImage }, select: userPublicSelect });
  await removeStoredFile(current?.profileImage);
  return user;
}

// ---------- Administração ----------

async function listUsers({ search, role, isActive, ...query }) {
  const { page, limit, skip, take } = parsePagination(query);

  const where = {};
  if (role) where.role = role;
  if (isActive !== undefined) where.isActive = isActive === true || isActive === 'true';
  if (search) {
    where.OR = [{ name: { contains: search } }, { email: { contains: search } }, { phone: { contains: search } }];
  }

  const [items, total] = await Promise.all([
    prisma.user.findMany({ where, select: userPublicSelect, orderBy: { createdAt: 'desc' }, skip, take }),
    prisma.user.count({ where }),
  ]);

  return { items, pagination: buildPagination({ page, limit, total }) };
}

async function setUserActive(adminId, userId, isActive) {
  if (adminId === userId && !isActive) {
    throw AppError.unprocessable('Você não pode desativar a própria conta de administrador.');
  }

  const exists = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (!exists) throw AppError.notFound('Usuário não encontrado.');

  return prisma.user.update({ where: { id: userId }, data: { isActive }, select: userPublicSelect });
}

module.exports = {
  userPublicSelect,
  getUserById,
  updateProfile,
  changePassword,
  updateProfileImage,
  listUsers,
  setUserActive,
};
