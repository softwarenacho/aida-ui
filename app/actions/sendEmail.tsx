'use server';

import { CONTENT, SUBJECT } from './constants';
import {
  attachGenerator,
  attatchmentType,
  createTransport,
  generateHTMLContent,
  getBuffer,
  getMultipleBuffers,
} from './helper';

const sendEmail = async (email: string, images: string[], all: boolean) => {
  const emailUsers = process.env.NEXT_PUBLIC_CC_EMAIL_USERS;
  const gmailUser = process.env.NEXT_PUBLIC_GMAIL_USER;
  const ccAddresses = emailUsers ? emailUsers.split(', ') : '';
  const fromAddress = gmailUser
    ? process.env.NEXT_PUBLIC_GMAIL_USER
    : 'aida.dreams@gmail.com';

  const buffer: Buffer | Buffer[] =
    images.length > 1
      ? await Promise.all(await getMultipleBuffers(images))
      : await getBuffer(images[0]);

  const transporter = createTransport();

  const attachments: attatchmentType[] = [];
  if (Array.isArray(buffer)) {
    buffer.map((img, index) => {
      attachments.push(attachGenerator(img, index));
    });
  } else {
    attachments.push(attachGenerator(buffer, 1));
  }

  const mailOptions = {
    from: fromAddress,
    to: email,
    cc: ccAddresses,
    subject: SUBJECT,
    text: CONTENT,
    html: generateHTMLContent(CONTENT, attachments, all),
    attachments: attachments,
  };

  try {
    await transporter.sendMail(mailOptions);
    return {
      status: 200,
      response: `Dream Images sent successfully`,
    };
  } catch (error) {
    return {
      status: 500,
      response: (error as Error)?.message,
    };
  }
};

export default sendEmail;
