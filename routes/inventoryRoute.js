// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const invValidate = require("../utilities/inventory-validation")
const utilities = require("../utilities/")

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId)
)

// Dynamic route for a single vehicle detail view
router.get("/detail/:inv_id", utilities.handleErrors(invController.buildDetailView)
)

// Route for inventory management view
router.get("/", utilities.handleErrors(invController.buildManagement)
)

// View for adding classification
router.get(
  "/add-classification",
  utilities.handleErrors(invController.buildAddClassification)
)

router.get("/add", utilities.handleErrors(invController.buildAddInventory))

// Handle POST submission
router.post(
  "/add-classification",
  invValidate.classificationRules(),
  invValidate.checkClassificationData,
  utilities.handleErrors(invController.addClassification)
)
module.exports = router;