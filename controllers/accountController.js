const jwt = require("jsonwebtoken")
require("dotenv").config()
const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const { body, validationResult } = require("express-validator")

/* ****************************************
*  Login & Registration Views
* *************************************** */
async function buildLogin(req, res, next) {
  const nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
  })
}

async function buildRegister(req, res, next) {
  const nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
  })
}

/* ****************************************
*  Account Management Views
* *************************************** */
async function buildAccount(req, res, next) {
  const nav = await utilities.getNav()
  const accountData = req.session.accountData
  const success = req.flash("success")
  const error = req.flash("error")
  const notice = req.flash("notice")

  res.render("account/account", {
    title: "Account Management",
    nav,
    success,
    error,
    notice,
    accountData
  })
}

async function buildAccountJWT(req, res, next) {
  const nav = await utilities.getNav()
  const accountData = res.locals.accountData
  const messages = req.flash("notice")

  res.render("account/account", {
    title: "Account Management",
    nav,
    accountData,
    messages
  })
}

async function buildUpdateAccount(req, res) {
  const nav = await utilities.getNav()
  const accountData = await accountModel.getAccountById(req.params.account_id)

  res.render("account/update-account", {
    title: "Update Account",
    nav,
    accountData,
    errors: null
  })
}

/* ****************************************
*  Account Actions
* *************************************** */
async function registerAccount(req, res) {
  const nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  const hashedPassword = await bcrypt.hash(account_password, 10)
  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    req.flash("notice", `Congratulations, you're registered ${account_firstname}. Please log in.`)
    res.status(201).render("account/login", { title: "Login", nav })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", { title: "Registration", nav })
  }
}

async function accountLogin(req, res) {
  const nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)

  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }

  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      const cookieOptions = { httpOnly: true, maxAge: 3600 * 1000 }
      if (process.env.NODE_ENV !== 'development') cookieOptions.secure = true

      res.cookie("jwt", accessToken, cookieOptions)
      req.flash("notice", "Welcome back!")
      return res.redirect("/account")
    } else {
      req.flash("notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", { title: "Login", nav, errors: null, account_email })
    }
  } catch (error) {
    throw new Error('Access Forbidden')
  }
}

async function updateAccount(req, res) {
  const { account_id, account_firstname, account_lastname, account_email } = req.body
  const updateResult = await accountModel.updateAccount(account_firstname, account_lastname, account_email, account_id)
  const nav = await utilities.getNav()

  if (updateResult) {
    req.flash("success", "Account information updated successfully.")
    res.redirect("/account/")
  } else {
    req.flash("notice", "Account update failed.")
    res.render("account/update-account", { title: "Update Account", nav, accountData: req.body, errors: null })
  }
}

async function updatePassword(req, res) {
  const { account_id, account_password } = req.body
  const hashedPassword = await bcrypt.hash(account_password, 10)
  const updateResult = await accountModel.updatePassword(account_id, hashedPassword)

  if (updateResult) {
    req.flash("success", "Password updated successfully.")
    res.redirect("/account/")
  } else {
    req.flash("notice", "Password update failed.")
    res.redirect("/account/")
  }
}

/* ****************************************
*  Validation Middleware
* *************************************** */
const updateAccountRules = () => [
  body("account_firstname").trim().notEmpty().withMessage("First name is required."),
  body("account_lastname").trim().notEmpty().withMessage("Last name is required."),
  body("account_email").trim().isEmail().withMessage("Valid email is required.")
    .custom(async (email, { req }) => {
      const existingAccount = await accountModel.getAccountByEmail(email)
      if (existingAccount && existingAccount.account_id != req.body.account_id) {
        throw new Error("Email already exists.")
      }
    })
]

const updatePasswordRules = () => [
  body("account_password")
    .isLength({ min: 12 }).withMessage("Password must be at least 12 characters.")
    .matches(/[A-Z]/).withMessage("Password must contain a capital letter.")
    .matches(/[0-9]/).withMessage("Password must contain a number.")
    .matches(/[^A-Za-z0-9]/).withMessage("Password must contain a special character.")
]

/* ****************************************
 *  Logout
 * *************************************** */
async function accountLogout(req, res) {
  try {
    
    res.clearCookie("jwt")

      if (req.session) {
      req.session.destroy(err => {
        if (err) console.error("Session destruction error:", err)
      });
    }

        req.flash("notice", "You have been logged out.")

    res.redirect("/")
  } catch (error) {
    console.error("Logout error:", error)
    res.redirect("/")
  }
}


module.exports = {
  buildLogin,
  buildRegister,
  buildAccount,
  buildAccountJWT,
  buildUpdateAccount,
  registerAccount,
  accountLogin,
  updateAccount,
  updatePassword,
  updateAccountRules,
  updatePasswordRules,
  accountLogout
}