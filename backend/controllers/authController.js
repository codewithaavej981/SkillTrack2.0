const jwt = require("jsonwebtoken");
const User = require("../models/User");

const createToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
const userResponse = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  location: user.location,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res
        .status(400)
        .json({
          success: false,
          message: "Name, email, and password are required",
        });
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser)
      return res
        .status(400)
        .json({ success: false, message: "Email already registered" });
    const user = await User.create({ name, email, password });
    res
      .status(201)
      .json({
        success: true,
        token: createToken(user._id),
        user: userResponse(user),
      });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required" });
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password",
    );
    if (!user || !(await user.matchPassword(password)))
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    res.json({
      success: true,
      token: createToken(user._id),
      user: userResponse(user),
    });
  } catch (error) {
    next(error);
  }
};

exports.getMe = (req, res) =>
  res.json({ success: true, user: userResponse(req.user) });

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, email, role, location } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, email, role, location },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      user: userResponse(user),
    });
  } catch (error) {
    next(error);
  }
};
