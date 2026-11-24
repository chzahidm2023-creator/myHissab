const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendVerificationEmail = async (email, firstName, token) => {
  // Remove any trailing slash from FRONTEND_URL
  const frontendURL = (process.env.FRONTEND_URL || "").replace(/\/+$/, "");

  const verificationUrl = `${frontendURL}/verify-email?token=${encodeURIComponent(token)}`;

  console.log("FRONTEND_URL:", process.env.FRONTEND_URL);

  console.log("FINAL VERIFICATION URL:", verificationUrl);

  const mailOptions = {
    from: `"Your Website" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify Your Email Address",

    html: `
      <div style="
        font-family: Arial, sans-serif;
        max-width: 600px;
        margin: auto;
        padding: 30px;
        border: 1px solid #ddd;
        border-radius: 10px;
      ">

        <h2>Welcome ${firstName}!</h2>

        <p>
          Thank you for creating an account with us.
        </p>

        <p>
          Please verify your email address by clicking
          the button below:
        </p>

        <div style="margin: 30px 0;">
          <a
            href="${verificationUrl}"
            style="
              background-color: #007bff;
              color: white;
              padding: 12px 20px;
              text-decoration: none;
              border-radius: 5px;
              display: inline-block;
            "
          >
            Verify Email
          </a>
        </div>

        <p>
          This verification link will expire in 24 hours.
        </p>

        <p>
          If you did not create this account,
          you can safely ignore this email.
        </p>

      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendVerificationEmail;
