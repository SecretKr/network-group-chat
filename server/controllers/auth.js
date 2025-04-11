import User from "../models/User.js";

const sendTokenResponse = (user, statusCode, res) => {
//create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }

  res
    .status(statusCode)
    // .cookie("token", token, options)
    .json({ success: true, _id:user._id, name: user.nickname, token });
};

// @desc    Register a user
// @route   POST /api/v1/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { nickname, username, password } = req.body;

    //create user
    const user = await User.create({
      nickname,
      username,
      password
    });

    sendTokenResponse(user, 200, res);
  } catch (err) {
    if(err.code === 11000) {
      return res.status(400).json({ success: false, msg: "Username already exists" });
    }
    res.status(400).json({ success: false });
    console.log(err.stack);
  }
};

// @desc    Login a user
// @route   POST /api/v1/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
  const { username, password } = req.body;

//validate
  if (!username || !password) {
    return res
      .status(400)
      .json({ success: false, msg: "Please provide an username and password" });
  }
//check for user
  const user = await User.findOne({ username }).select("+password");

  if (!user) {
    return res
      .status(401)
      .json({ success: false, msg: "False Username" });
  }

//check if password match
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return res
      .status(401)
      .json({ success: false, msg: "False Password" });
  }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(401).json({ success: false, msg: "Cannot convert email or password to string" });
  }
};

// @desc    Get current logged in user
// @route   POST /api/v1/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  const user = await User.findById(req.user.id);
    res.status(200).json({
        success: true,
        data: user
    });
}

export const logout  = async (req, res, next) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
    data: {},
  });
}