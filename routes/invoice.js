const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoice.js');

const { check } = require('express-validator');
const passport = require('passport');

const { decodeToken } = require('../middlewares/auth.js');


router.post('/createInvoice',invoiceController.createInvoice);
router.get('/getList',invoiceController.getList);
router.get('/getInvoiceList',invoiceController.getInvoiceList);


module.exports = router;
