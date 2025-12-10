const { body, validationResult } = require("express-validator")
const utilities = require("./")

const classificationRules = () => {
  return [
    body("classification_name")
  .trim()
  .matches(/^[a-zA-Z0-9 ]+$/)
  .withMessage("Classification name can only contain letters and numbers.")
  .isLength({ min: 1 })
  .withMessage("Classification name is required.")
  ]
}


const checkClassificationData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    return res.render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: errors.array(),
      messages: req.flash("notice"),
      classification_name: req.body.classification_name
    })
  }
  next()
}

// Inventory validation rules for adding or updating a vehicle
const inventoryRules = () => {
  return [
    body("inv_make")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Vehicle make is required."),
    body("inv_model")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Vehicle model is required."),
    body("inv_year")
      .trim()
      .isInt({ min: 1886 }) // first car year
      .withMessage("Year must be a valid number."),
    body("inv_price")
      .trim()
      .isFloat({ min: 0 })
      .withMessage("Price must be a valid number."),
    body("inv_miles")
      .trim()
      .isFloat({ min: 0 })
      .withMessage("Miles must be a valid number."),
    body("inv_color")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Color is required."),
    body("classification_id")
      .trim()
      .isInt({ min: 1 })
      .withMessage("Classification is required.")
  ]
}

// Middleware to check inventory data for errors
const checkInventoryData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    const classifications = await utilities.getClassificationOptions()
    return res.render("inventory/edit-inventory", {
      title: "Edit Vehicle",
      nav,
      errors: errors.array(),
      messages: req.flash("notice"),
      classifications,
      vehicle: req.body
    })
  }
  next()
}

// ***************************
// Middleware to check update inventory data
// Redirects back to the edit view if errors exist
// ***************************
const checkUpdateData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    const classifications = await utilities.getClassificationOptions()
    const inv_id = req.body.inv_id // include the inventory ID

    return res.render("inventory/edit-inventory", {
      title: "Edit Vehicle",
      nav,
      errors: errors.array(),
      messages: req.flash("notice"),
      classifications,
      vehicle: req.body,
      inv_id
    })
  }
  next()
}


module.exports = {
  classificationRules,
  checkClassificationData,
  inventoryRules,
  checkInventoryData,
  checkUpdateData
}
