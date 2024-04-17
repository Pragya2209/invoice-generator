const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.js');

const { check } = require('express-validator');
const passport = require('passport');

const { decodeToken } = require('../middlewares/auth.js');


router.post('/signup', [
    check('firstName').notEmpty().withMessage('First name is mandatory'),
    check('email').notEmpty().isEmail().withMessage('Invalid Email'),
    check('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
],
userController.signup);


router.post(
    '/signin', [
        check('email').notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email format'),
        check('password').notEmpty().withMessage('Password is required'),
    ],
    userController.signin
);


module.exports = router;
