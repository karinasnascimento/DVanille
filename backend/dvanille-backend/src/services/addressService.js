const prisma = require('../config/database');
const AppError = require('../utils/AppError');

const MAX_ADDRESSES_PER_USER = 10;

async function findOwnedAddress(userId, id, client = prisma) {
  const address = await client.address.findFirst({ where: { id, userId } });
  if (!address) throw AppError.notFound('Endereço não encontrado.');
  return address;
}

async function listAddresses(userId) {
  return prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
  });
}

async function getAddress(userId, id) {
  return findOwnedAddress(userId, id);
}

async function createAddress(userId, data) {
  return prisma.$transaction(async (tx) => {
    const count = await tx.address.count({ where: { userId } });
    if (count >= MAX_ADDRESSES_PER_USER) {
      throw AppError.unprocessable(`Limite de ${MAX_ADDRESSES_PER_USER} endereços atingido.`);
    }

    // O primeiro endereço sempre é o padrão.
    const isDefault = count === 0 ? true : Boolean(data.isDefault);
    if (isDefault) await tx.address.updateMany({ where: { userId, isDefault: true }, data: { isDefault: false } });

    return tx.address.create({ data: { ...data, userId, isDefault } });
  });
}

async function updateAddress(userId, id, data) {
  return prisma.$transaction(async (tx) => {
    const current = await findOwnedAddress(userId, id, tx);
    const { isDefault, ...fields } = data;

    if (isDefault === true) {
      await tx.address.updateMany({ where: { userId, isDefault: true, NOT: { id } }, data: { isDefault: false } });
      fields.isDefault = true;
    } else if (isDefault === false && current.isDefault) {
      throw AppError.unprocessable('Defina outro endereço como padrão em vez de remover o padrão atual.');
    }

    return tx.address.update({ where: { id }, data: fields });
  });
}

async function setDefaultAddress(userId, id) {
  return prisma.$transaction(async (tx) => {
    await findOwnedAddress(userId, id, tx);
    await tx.address.updateMany({ where: { userId, isDefault: true }, data: { isDefault: false } });
    return tx.address.update({ where: { id }, data: { isDefault: true } });
  });
}

async function deleteAddress(userId, id) {
  await prisma.$transaction(async (tx) => {
    const address = await findOwnedAddress(userId, id, tx);
    await tx.address.delete({ where: { id } });

    // Se apagou o padrão, promove o endereço mais recente.
    if (address.isDefault) {
      const next = await tx.address.findFirst({ where: { userId }, orderBy: { createdAt: 'desc' } });
      if (next) await tx.address.update({ where: { id: next.id }, data: { isDefault: true } });
    }
  });
}

module.exports = {
  findOwnedAddress,
  listAddresses,
  getAddress,
  createAddress,
  updateAddress,
  setDefaultAddress,
  deleteAddress,
};
