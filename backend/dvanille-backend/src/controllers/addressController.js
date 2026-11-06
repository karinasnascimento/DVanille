const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendCreated } = require('../utils/response');
const { pick } = require('../utils/pick');
const { ADDRESS_FIELDS } = require('../validators/addressValidator');
const addressService = require('../services/addressService');

const listAddresses = asyncHandler(async (req, res) => {
  const addresses = await addressService.listAddresses(req.user.id);
  return sendSuccess(res, { data: addresses });
});

const getAddress = asyncHandler(async (req, res) => {
  const address = await addressService.getAddress(req.user.id, req.params.id);
  return sendSuccess(res, { data: address });
});

const createAddress = asyncHandler(async (req, res) => {
  const address = await addressService.createAddress(req.user.id, pick(req.body, ADDRESS_FIELDS));
  return sendCreated(res, address, 'Endereço cadastrado com sucesso.');
});

const updateAddress = asyncHandler(async (req, res) => {
  const address = await addressService.updateAddress(req.user.id, req.params.id, pick(req.body, ADDRESS_FIELDS));
  return sendSuccess(res, { data: address, message: 'Endereço atualizado com sucesso.' });
});

const setDefaultAddress = asyncHandler(async (req, res) => {
  const address = await addressService.setDefaultAddress(req.user.id, req.params.id);
  return sendSuccess(res, { data: address, message: 'Endereço padrão definido.' });
});

const deleteAddress = asyncHandler(async (req, res) => {
  await addressService.deleteAddress(req.user.id, req.params.id);
  return sendSuccess(res, { message: 'Endereço excluído com sucesso.' });
});

module.exports = { listAddresses, getAddress, createAddress, updateAddress, setDefaultAddress, deleteAddress };
