const jwt = require("jsonwebtoken");

function employeeOnly(req, res, next) {
    // Check if JWT cookie exists
    const token = req.cookies.jwt;
    if (!token) {
        req.flash("notice", "You must be logged in as an employee to access that page.");
        return res.redirect("/account/login");
    }

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // Check account type
        if (decoded.account_type === "Employee" || decoded.account_type === "Admin") {
            // Attach account data to res.locals in case needed
            res.locals.accountData = decoded;
            return next();
        } else {
            req.flash("notice", "You do not have permission to access that page.");
            return res.redirect("/account/login");
        }
    } catch (err) {
        req.flash("notice", "Session expired or invalid. Please log in.");
        return res.redirect("/account/login");
    }
}

module.exports = employeeOnly;
