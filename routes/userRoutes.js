const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticate = require('../middleware/authenticate');

router.post('/signup', userController.signup);
router.post('/login', userController.login);
router.get('/preferences', authenticate, userController.getPreferences);
router.put('/preferences', authenticate, userController.updatePreferences);

module.exports = router;
