const { Router } = require('express');
const addressController = require('../controllers/addressController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { validate } = require('../middlewares/validationMiddleware');
const { idParam } = require('../validators/commonValidator');
const { createAddressRules, updateAddressRules } = require('../validators/addressValidator');

const router = Router();

router.use(authenticateToken);

router.get('/', addressController.listAddresses);
router.post('/', createAddressRules, validate, addressController.createAddress);
router.get('/:id', idParam(), validate, addressController.getAddress);
router.put('/:id', idParam(), updateAddressRules, validate, addressController.updateAddress);
router.patch('/:id/default', idParam(), validate, addressController.setDefaultAddress);
router.delete('/:id', idParam(), validate, addressController.deleteAddress);

module.exports = router;
