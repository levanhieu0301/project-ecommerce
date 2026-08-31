import nodemailer from "nodemailer";

export const sendMailer = (emailClient: string, title: string, content: string) => {
  // Create a transporter object
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure:  process.env.NODE_ENV === 'production',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASSWORD,
    }
  });

  // Configure the mailoptions object
  const mailOptions = {
    from: process.env.GMAIL_USER,
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