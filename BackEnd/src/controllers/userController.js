const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');
const { pick } = require('../utils/pick');
const userService = require('../services/userService');

const getMyProfile = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.user.id);
  return sendSuccess(res, { data: user });
});

const updateMyProfile = asyncHandler(async (req, res) => {
  const user = await userService.updateProfile(req.user.id, pick(req.body, ['name', 'phone']));
  return sendSuccess(res, { data: user, message: 'Perfil atualizado com sucesso.' });
});

const changeMyPassword = asyncHandler(async (req, res) => {
  await userService.changePassword(req.user.id, req.body);
  return sendSuccess(res, { message: 'Senha alterada com sucesso.' });
});

const uploadMyAvatar = asyncHandler(async (req, res) => {
  const user = await userService.updateProfileImage(req.user.id, req.file.filename);
  return sendSuccess(res, { data: user, message: 'Foto de perfil atualizada.' });
});

module.exports = { getMyProfile, updateMyProfile, changeMyPassword, uploadMyAvatar };
