const User = require("../model/UserModel");
const { sendEmail } = require("../utils/email-sender");
const jwt = require('jsonwebtoken');


/**
 * @author f-br-10
 * @param {string} userId - The ID of the user to reset password for
 * Creates a password reset link and emails it to the user.
 * Looks up the user by ID, generates a JWT token with the user's ID and email,
 * constructs a URL with the token, and sends an email containing the link.
 * 
 * The link directs the user to a front-end password reset page.
 * 
 * Throws errors if the user is not found or if sending the email fails.
 */
exports.createChangePasswordLink = async (userId) => {

  try {
    // Lookup user by ID
    const user = await User.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    // Generate signed JWT token with user ID and email
    const activation = activationToken(user.email, user._id);
    // Construct password reset url with token
    const url = `${process.env.FRONT_BASE_URL}set-password?token=${activation}`;

    // Configure email options
    const emailOptions = {
      service: "Gmail",
      user: process.env.EMAIL_ADDRESS,
      pass: process.env.EMAIL_PASS,
      from: process.env.EMAIL_ADDRESS,
      to: user.email,
      subject: "Change Password",
      html: `
        <html>
          <body>
            <p>Click <a href="${url}">here</a> to change your password</p>  
          </body>
        </html>`
    };

    // Send password reset email
    await sendEmail(emailOptions);

  } catch (error) {
    throw new Error(error);
  }

};
/**
 * @author f-br-10
 * Generates a JWT token for activating a user account. 
 * Signs a token with the user's email and ID, 
 * using the JWT_ACCESS_KEY secret.
 * Sets the token to expire in 24 hours.
*/

const activationToken = (userEmail, userId) => {
  const token = jwt.sign({ userId, userEmail }, process.env.JWT_SEC, { expiresIn: "24h" });
  return token;
}
