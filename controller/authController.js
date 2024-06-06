//authController.js
const User = require("../model/UserModel.js");
const CryptoJS = require('crypto-js');
const jwt = require('jsonwebtoken');
const { createChangePasswordLink } = require("../service/authService.js");
//Controller for Register User
exports.registerUser = async (req, res) => {
  const user = await User.findOne({email:req.body.email});
  if (user) return res.status(400).json("User already exists");
  const newUser = new User({
    email: req.body.email,
    password: CryptoJS.AES.encrypt(
      req.body.password,
      process.env.PASS_SEC
    ).toString(), //for hashed pass
    nom: req.body.nom || "Not Added",
    prenom: req.body.prenom || "Not Added",
    num: req.body.num || "Not Added",
    image: req.body.image || "user.png",
    isAdmin: req.body.isAdmin
    
  });

  try {
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (error) {
    res.status(500).json(error);
  } 
};

//Controller for Login User
exports.loginUser = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email
     });
    !user && res.status(401).json("we dont have this user");

    const hashedPassword = CryptoJS.AES.decrypt(
      user.password,
      process.env.PASS_SEC
    );

    const originalPassword = hashedPassword.toString(CryptoJS.enc.Utf8);

    originalPassword !== req.body.password &&
      res.status(401).json("Invalid Password!");

    const accessToken = jwt.sign(
      {
        _id: user._id,
        isAdmin: user.isAdmin,
      },
      process.env.JWT_SEC,
      { expiresIn: "3d" }
    );

    const { password, ...others } = user._doc;
    return res.status(200).json({ ...others, accessToken });
  } catch (error) {
    return error;
  }
};

exports.forgetPasswordRequest = async (req, res) => {
  try {
    const user = await User.findOne({ email:req.body.email });
    if (!user) return res.status(404).json("User not found");
    await createChangePasswordLink(user._id);
    res.status(200).json("Password reset link sent to your email account");
  }
  catch (error) {
    console.log(error);
    res.status(500).json({message:"Internal Server Error"});
  }
}
exports.resetPasswordVerification = async (req, res) => {
  try {
    const { activation_Token } = req.params;
    const { newPassword } = req.body;
    const verifiedUser = jwt.verify(activation_Token, process.env.JWT_SEC)
    if (!verifiedUser) {
      return res.status(400).json({ message: "Invalid Token" });
    }
    const { userEmail } = verifiedUser;
    if (!userEmail) {
      return res.status(400).json({ message: "Activation token is fake" });
    }
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    const hashPassword = CryptoJS.AES.encrypt(
      newPassword,
      process.env.PASS_SEC
    ).toString();
    user.password = hashPassword;
    await user.save();
    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      // Handle invalid token
      return res.status(400).json({ message: "Invalid Token" });
    } else {
      // Handle other errors (e.g., token expired)
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
}
