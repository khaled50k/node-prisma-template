const checkAuthentication = (req, res, next) => {
  if (req.session && req.session.authenticated) {
    return next(); // User is authenticated, proceed to the next middleware or route handler
  } else {
    return res.status(401).json({ message: "User is not authenticated" });
  }
};
const verifyAdminAuthentication = (req, res, next) => {
  if (req.session && req.session.authenticated) {
    if (req.session.user && req.session.user.role === "admin") {
      return next(); // User is authenticated and is an admin, proceed to the next middleware or route handler
    } else {
      return res.status(403).json({ message: "User is not authorized" }); // User is authenticated but not an admin
    }
  } else {
    return res.status(401).json({ message: "User is not authenticated" });
  }
};
module.exports = {
  checkAuthentication,
  verifyAdminAuthentication,
};
