const jwt = require("jsonwebtoken")
require("dotenv").config()
const invModel = require("../models/inventory-model")

const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function () {
  const data = await invModel.getClassifications()
  let list = '<ul>'
  list += '<li><a href="/" title="Home page">Home</a></li>'

  data.rows.forEach((row) => {
    list += `<li><a href="/inv/type/${row.classification_id}" title="See our inventory of ${row.classification_name} vehicles">${row.classification_name}</a></li>`
  })

  list += '<li><a href="/inv/add" class="btn btn-primary" title="Add a new inventory item">Add Inventory</a></li>'
  list += '</ul>'
  return list
}

/* **************************************
 * Build the classification view HTML
 ************************************** */
Util.buildClassificationGrid = async function (data) {
  if (data.length === 0) {
    return '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }

  let grid = '<ul id="inv-display">'
  data.forEach((vehicle) => {
    const price = new Intl.NumberFormat("en-US").format(vehicle.inv_price)
    grid += `
      <li>
        <a href="/inv/detail/${vehicle.inv_id}" title="View ${vehicle.inv_make} ${vehicle.inv_model} details">
          <img src="${vehicle.inv_thumbnail}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model}" />
        </a>
        <div class="namePrice">
          <hr />
          <h2>
            <a href="/inv/detail/${vehicle.inv_id}" title="View ${vehicle.inv_make} ${vehicle.inv_model} details">${vehicle.inv_make} ${vehicle.inv_model}</a>
          </h2>
          <span>$${price}</span>
        </div>
      </li>
    `
  })
  grid += '</ul>'
  return grid
}

/* **************************************
 * Build classification select list
 ************************************** */
Util.buildClassificationList = async function (classification_id = null) {
  const data = await invModel.getClassifications()
  let list = '<select name="classification_id" id="classificationList" required>'
  list += '<option value="">Choose a Classification</option>'
  data.rows.forEach((row) => {
    list += `<option value="${row.classification_id}"${classification_id == row.classification_id ? " selected" : ""}>${row.classification_name}</option>`
  })
  list += '</select>'
  return list
}

/* ******************************************
 * Build HTML for a single vehicle detail
 ****************************************** */
Util.buildVehicleDetail = function (vehicle) {
  const price = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(vehicle.inv_price)
  const mileage = new Intl.NumberFormat("en-US").format(vehicle.inv_miles)

  return `
  <div class="vehicle-detail-grid">
    <div class="vehicle-image">
      <img src="${vehicle.inv_image}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model}" />
      <div class="vehicle-actions">
        <a href="#" class="btn primary">Start My Purchase</a>
        <a href="/contact" class="btn secondary">Contact Us</a>
        <a href="/schedule-test-drive" class="btn accent">Schedule Test Drive</a>
        <a href="/refer" class="btn info">Refer a Friend</a>
      </div>
    </div>
    <div class="vehicle-info">
      <h1>${vehicle.inv_make} ${vehicle.inv_model} (${vehicle.inv_year})</h1>
      <h2>${mileage} Mileage for just ${price}</h2>
      <p><strong>Price:</strong> ${price}</p>
      <p><strong>Mileage:</strong> ${mileage} miles</p>
      <p><strong>Description:</strong> ${vehicle.inv_description}</p>
      <p><strong>Color:</strong> ${vehicle.inv_color}</p>
      <p><strong>Body Type:</strong> ${vehicle.inv_body}</p>
      <p><strong>Transmission:</strong> ${vehicle.inv_transmission}</p>
      <p><strong>Fuel:</strong> ${vehicle.inv_fuel}</p>
    </div>
  </div>
  `
}

/* ******************************************
 * Get classification options
 ****************************************** */
Util.getClassificationOptions = async function () {
  const data = await invModel.getClassifications()
  let options = '<option value="">Select a classification</option>'
  data.rows.forEach((row) => {
    options += `<option value="${row.classification_id}">${row.classification_name}</option>`
  })
  return options
}

/* ****************************************
 * Middleware for handling errors
 **************************************** */
Util.handleErrors = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

/* ****************************************
 * JWT token validation middleware
 **************************************** */
Util.checkJWTToken = function (req, res, next) {
  const token = req.cookies.jwt
  if (!token) {
    req.flash("notice", "Please log in first.")
    return res.redirect("/account/login")
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      res.clearCookie("jwt")
      req.flash("notice", "Session expired. Please log in again.")
      return res.redirect("/account/login")
    }
    res.locals.accountData = decoded
    next()
  })
}

/* ****************************************
 * Check login flag middleware
 **************************************** */
Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    return next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
}

module.exports = Util
