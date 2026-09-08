import nodemailer from "nodemailer";
import { getApiAppPassword } from "./setting.config";

export const sendMailer = async (emailClient: string, title: string, content: string) => {
   const apiAppPassword = await getApiAppPassword();
  // Create a transporter object
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure:  process.env.NODE_ENV === 'production',
    auth: {
      user: apiAppPassword.gmailUser,
      pass: apiAppPassword.gmailPassword,

    }
  });

  // Configure the mailoptions object
  const mailOptions = {
    from:  apiAppPassword.gmailUser,
    to: emailClient,
    subject: title,
    text: content,
  };

  // Send the email
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log('Error:', error);
    } else {
      console.log('Email sent: ', info.response);
    }
  });
  }