const axios = require('axios');
const nodemailer = require('nodemailer');

export interface attatchmentType {
  content: Buffer;
  cid: string;
  filename: string;
}

export const getBuffer = async (url: string) => {
  const response = await axios.get(url, { responseType: 'arraybuffer' });
  return Buffer.from(response.data, 'binary');
};

export const getMultipleBuffers = async (images: string[]) => {
  return images.map(async (url) => {
    return await getBuffer(url);
  });
};

export const generateHTMLContent = (
  text: string,
  attachments: attatchmentType[],
  all: boolean,
) => `
    <div>
      <p style="font-size: 20px;">
        This ${all ? 'are' : 'is'} the dream${all ? 's' : ''} 
        generated on the this session. ${text}
      </p>
      <div
        style="max-width: 100%"
      >
        ${attachments.map((file) => {
          return `<img
              alt='AI generated image'
              src="${'cid:' + file.cid}"
              style="max-width: 100%;"
            />`;
        })}
      </div>
    </div>`;

export const attachGenerator = (content: Buffer, index: number) => {
  const cid = `dream-${index}`;
  return {
    content,
    cid,
    filename: `${cid}.png`,
  } as attatchmentType;
};

export const createTransport = () =>
  nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.NEXT_PUBLIC_GMAIL_USER,
      pass: process.env.NEXT_PUBLIC_GMAIL_PWD,
    },
  });
