const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendCreated } = require('../utils/response');
const authService = require('../services/authService');
const userService = require('../services/userService');

const register = asyncHandler(async (req, res) => {
  const result = await authService.registerUser(req.body);
  return sendCreated(res, result, 'Cadastro realizado com sucesso.');
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.loginUser(req.body);
  return sendSuccess(res, { data: result, message: 'Login realizado com sucesso.' });
});

const me = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.user.id);
  return sendSuccess(res, { data: user, message: 'Usuário autenticado.' });
});

const logout = asyncHandler(async (req, res) => {
  await authService.logoutUser(req.token);
  return sendSuccess(res, { message: 'Logout realizado com sucesso.' });
});

module.exports = { register, login, me, logout };
