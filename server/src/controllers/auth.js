import User from "../models/User.js";

const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") {
    cookieOptions.secure = true;
  }

  res
    .status(statusCode)
    // .cookie("token", token, cookieOptions)
    .json({ success: true, id: user._id, nickname: user.nickname, token });
};

// @desc    Register a user
// @route   POST /api/v1/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { nickname, username, password } = req.body;

    // Create user
    const newUser = await User.create({
      nickname,
      username,
      password,
    });

    sendTokenResponse(newUser, 200, res);
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ success: false, message: "Username already exists" });
    }
    res.status(400).json({ success: false });
    console.log(error.stack);
  }
};

// @desc    Login a user
// @route   POST /api/v1/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Please provide a username and password",
        });
    }

    // Check for user
    const existingUser = await User.findOne({ username }).select("+password");

    if (!existingUser) {
      return res.status(401).json({ success: false, message: "Invalid username" });
    }

    // Check if password matches
    const isPasswordMatch = await existingUser.matchPassword(password);

    if (!isPasswordMatch) {
      return res.status(401).json({ success: false, message: "Invalid password" });
    }

    sendTokenResponse(existingUser, 200, res);
  } catch (error) {
    res
      .status(401)
      .json({
        success: false,
        message: "Cannot convert username or password to string",
      });
  }
};

// @desc    Get current logged-in user
// @route   POST /api/v1/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  const currentUser = await User.findById(req.user.id);
  res.status(200).json({
    success: true,
    data: currentUser,
  });
};

// @desc    Logout user
// @route   POST /api/v1/auth/logout
// @access  Private
export const logout = async (req, res, next) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
    data: {},
  });
};
