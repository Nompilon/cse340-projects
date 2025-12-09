const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")



const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

/* ***************************
 * Build add classification view
 * ************************** */
invCont.buildAddClassification = async (req, res) => {
  const nav = await utilities.getNav()
  res.render("inventory/add-classification", {
    title: "Add Classification",
    nav,
    errors: null,
    messages: req.flash("notice"),
  })
}

/* ***************************
 * Handle adding new classification
 * ************************** */
invCont.addClassification = async (req, res) => {
  const { classification_name } = req.body
  const addResult = await invModel.addClassification(classification_name)
  const nav = await utilities.getNav()

  if (addResult) {
    req.flash("notice", "Classification successfully added!")
    return res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      messages: req.flash("notice"),
    });
  } else {
    req.flash("notice", "Failed to add classification. Try again.")
    return res.render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: null,
      messages: req.flash("notice"),
      classification_name,
    })
  }
}

/* ***************************
 * Build add inventory view
 * ************************** */
invCont.buildAddInventory = async (req, res) => {
  const nav = await utilities.getNav()
  const classifications = await utilities.getClassificationOptions()

  res.render("inventory/add-inventory", {
    title: "Add Vehicle",
    nav,
    messages: req.flash("notice"),
    errors: null,
    classifications,
    vehicle: {}, // empty object for sticky form
  })
}

/* ***************************
 * Handle adding new inventory
 * ************************** */
invCont.addInventory = async (req, res, next) => {
  try {
    // Prepare data with default images
    const vehicleData = {
      ...req.body,
      inv_image: req.body.inv_image || "/images/no-image-available.png",
      inv_thumbnail: req.body.inv_thumbnail || "/images/no-image-available-thumb.png"
    };

    // Attempt to add vehicle
    const result = await invModel.addInventory(vehicleData);

    if (result) {
      req.flash("success", `Vehicle ${vehicleData.inv_make} ${vehicleData.inv_model} added successfully!`)
      return res.redirect("/inv") // Redirect to management page
    } else {
      const classifications = await utilities.getClassificationOptions()
      req.flash("error", "Failed to add vehicle. Please try again.")
      return res.render("inventory/add-inventory", {
        title: "Add Vehicle",
        nav: await utilities.getNav(),
        messages: req.flash("error"),
        errors: null,
        classifications,
        vehicle: vehicleData
      });
    }
  } catch (error) {
    next(error);
  }
}

/* ***************************
 *  Build single vehicle detail view
 * ************************** */
invCont.buildDetailView = async function (req, res, next) {
  try {
    const invId = req.params.inv_id

    // Get vehicle data from the model
    const vehicle = await invModel.getVehicleById(invId)

    if (!vehicle) {
      return next(new Error("Vehicle not found"))
    }

    // Generate navigation
    const nav = await utilities.getNav()

    // Generate vehicle HTML
    const vehicleDetail = await utilities.buildVehicleDetail(vehicle)

    // Pass all data to EJS
    res.render("inventory/detail", {
      title: `${vehicle.inv_make} ${vehicle.inv_model}`,
      nav,
      vehicleDetail,   // <- THIS IS CRUCIAL
    })
  } catch (error) {
    next(error)
  }
}

/* ***************************
 *  Build management view
 * ************************** */
invCont.buildManagement = async function (req, res) {
  let nav = await utilities.getNav()
  const success = req.flash("success")
  const error = req.flash("error")
  const notice = req.flash("notice")

  res.render("inventory/management", {
    title: "Inventory Management",
    nav,
    success,
    error,
    notice
  })
}


module.exports = invCont