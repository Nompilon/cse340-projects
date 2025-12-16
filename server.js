/* ******************************************
 * Primary server.js file
 *******************************************/
require("dotenv").config()

const express = require("express")
const app = express()
const path = require("path")
const cookieParser = require("cookie-parser")
const session = require("express-session")
const flash = require("connect-flash")
const expressLayouts = require("express-ejs-layouts")
const pool = require('./database/')
const utilities = require("./utilities/")
const baseController = require("./controllers/baseController")
const static = require("./routes/static")
const inventoryRoute = require("./routes/inventoryRoute")
const errorRoute = require("./routes/errorRoute")
const accountRoute = require("./routes/accountRoute")

/* ***********************
 * Middleware
 *************************/
// Parse JSON and URL-encoded data
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Cookie parser must come before session
app.use(cookieParser())

// Session middleware
app.use(session({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: false, // only save session if modified
  saveUninitialized: false, // only save when needed
  name: 'sessionId',
  cookie: {
    maxAge: 3600000, // 1 hour
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // only send over HTTPS in production
    sameSite: 'lax'
  }
}))

// Flash messages
app.use(flash())
app.use(function(req, res, next){
  res.locals.messages = require('express-messages')(req, res)
  next()
})

// JWT check (after session and cookie parser)
app.use(utilities.checkJWTToken)

/* ***********************
 * View Engine
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout")

/* ***********************
 * Static files
 *************************/
app.use(express.static("public"))
app.use(static)

/* ***********************
 * Routes
 *************************/
app.get("/", utilities.handleErrors(baseController.buildHome))
app.use("/inv", inventoryRoute)
app.use("/account", accountRoute)
app.use("/error", errorRoute)

/* ***********************
 * 404 handler
 *************************/
app.use(async (req, res, next) => {
  next({ status: 404, message: "Sorry, we appear to have lost that page." })
})

/* ***********************
 * Express error handler
 *************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav()
  console.error(`Error at: "${req.originalUrl}": ${err.message}`)
  let message =
    err.status === 404 ? err.message : "Oh no! There was a crash. Maybe try a different route?"

  res.status(err.status || 500).render("errors/error", {
    title: err.status || "Server Error",
    message,
    nav
  })
})

/* ***********************
 * Server startup
 *************************/
const port = process.env.PORT
const host = process.env.HOST
app.listen(port, () => {
  console.log(`App listening on ${host}:${port}`)
})
