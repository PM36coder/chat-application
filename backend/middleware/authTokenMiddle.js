import jwt from "jsonwebtoken";

const authTokenMiddle = (req, res, next) => {
  const token = req.cookies.authToken;

  if (!token) {
    return res.status(401).json({ msg: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_TOKEN);
    req.user = decoded; // Attach user payload
    next();
  } catch (error) {
    return res.status(401).json({ msg: "Invalid token", error: error.message });
  }
};

export default authTokenMiddle;
