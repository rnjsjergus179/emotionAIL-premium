const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscription.controller');

router.post('/api/subscribe', subscriptionController.subscribeUser);
router.get('/api/check-subscription', subscriptionController.checkSubscription);

module.exports = router;
