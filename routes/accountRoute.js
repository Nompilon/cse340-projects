// Needed resources
const express = require("express")
const router = new express.Router()
const utilities = require("../utilities")
const regValidate = require('../utilities/account-validation')
const { checkJWTToken } = require("../utilities")
const accountController = require("../controllers/accountController")

// ===============================
// View Routes
// ===============================

// Login page
router.get(
  "/login",
  utilities.handleErrors(accountController.buildLogin)
)

// Registration page
router.get(
  "/register",
  utilities.handleErrors(accountController.buildRegister)
)

// Account management (requires login)
router.get(
  "/",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildManagement)
)

// Account update view
router.get(
  "/edit/:account_id",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildUpdateAccount)
)

// ===============================
// Action Routes
// ===============================

// Process registration
router.post(
  "/register",
  regValidate.registationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount)
)

// Process login
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)

// Update account info
router.post(
  "/update",
  utilities.checkLogin,
  regValidate.updateAccountRules(),
  regValidate.checkUpdateAccountData,
  utilities.handleErrors(accountController.updateAccount)
)

// Update password
router.post(
  "/update-password",
  utilities.checkLogin,
  regValidate.updatePasswordRules(),
  regValidate.checkPasswordData,
  utilities.handleErrors(accountController.updatePassword)
)

router.get(
  "/account",
  checkJWTToken,
  utilities.handleErrors(accountController.buildAccountJWT))

module.exports = router
