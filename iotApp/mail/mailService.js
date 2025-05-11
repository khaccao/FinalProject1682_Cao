const nodemailer = require("nodemailer");
require("dotenv").config();

const sendMail = async ({ to, subject, text, html }) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"Hydroponic System" <${process.env.EMAIL_USERNAME}>`,
      to: to,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};

const createHydroponicTaskReminderHTML = (taskTitle, taskDescription, scheduledTimeVN) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Hydroponic Task Reminder</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f4f4f4;
          padding: 20px;
        }
        .container {
          background-color: #fff;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          border: 1px solid #ddd;
        }
        h2 {
          color: #4CAF50; /* Hydroponic green */
          margin-top: 0;
        }
        p {
          margin-bottom: 15px;
        }
        .task-title {
          font-weight: bold;
          color: #2196F3; /* Blue */
        }
        .scheduled-time {
          font-style: italic;
          color: #777;
        }
        .note {
          color: #999;
          font-size: 0.9em;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>🌱 Hydroponic Task Reminder!</h2>
        <p>Hello,</p>
        <p>You have an upcoming task in your hydroponic system:</p>
        <p class="task-title">Task: ${taskTitle}</p>
        ${taskDescription ? `<p>Description: ${taskDescription}</p>` : ''}
        <p class="scheduled-time">Scheduled Time: ${scheduledTimeVN}</p>
        <p class="note">Please check and complete this task on time to ensure the best growth for your plants.</p>
      </div>
    </body>
    </html>
  `;
};

module.exports = { sendMail, createHydroponicTaskReminderHTML };
