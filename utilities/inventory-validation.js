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

module.exports = {
  classificationRules,
  checkClassificationData
}
