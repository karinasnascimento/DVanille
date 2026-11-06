const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendPaginated } = require('../utils/response');
const adminService = require('../services/adminService');
const userService = require('../services/userService');

const getDashboard = asyncHandler(async (req, res) => {
  const dashboard = await adminService.getDashboard();
  return sendSuccess(res, { data: dashboard, message: 'Dashboard carregado com sucesso.' });
});

const listUsers = asyncHandler(async (req, res) => {
  const { items, pagination } = await userService.listUsers(req.query);
  return sendPaginated(res, { items, pagination });
});

const getUser = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  return sendSuccess(res, { data: user });
});

const setUserActive = asyncHandler(async (req, res) => {
  const user = await userService.setUserActive(req.user.id, req.params.id, req.body.isActive);
  const message = user.isActive ? 'Usuário ativado com sucesso.' : 'Usuário desativado com sucesso.';
  return sendSuccess(res, { data: user, message });
});

module.exports = { getDashboard, listUsers, getUser, setUserActive };
