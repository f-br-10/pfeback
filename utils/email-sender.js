const nodemailer = require("nodemailer");

// general MUST reuse function for sending emails purpuse
const sendEmail = async (config) => {
  const { service, user, pass, from, to, subject, html, attachments } = config;
  const transporter = nodemailer.createTransport({ service, auth: { user, pass } });
  await transporter.sendMail({ from, to, subject, html, attachments });
};

module.exports = { sendEmail };
