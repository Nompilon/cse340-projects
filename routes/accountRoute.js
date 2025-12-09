// Needed 
const regValidate = require('../utilities/account-validation')
const express = require("express")
const router = new express.Router()
const utilities = require("../utilities")
const accountController = require("../controllers/accountController")

// Route to login page (My Account link)
router.get(
  "/login",
  utilities.handleErrors(accountController.buildLogin)
)
// registration route
router.get("/register", utilities.handleErrors(accountController.buildRegister))

// Process the login request
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)

// Default account management route
router.get(
  "/",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildAccount)
);

// Export router
module.exports = router
