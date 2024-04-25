import Image from 'next/image';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import ImageGallery from 'react-image-gallery';
import 'react-image-gallery/styles/css/image-gallery.css';
import sendEmail from '../actions/sendEmail';
import styles from '../page.module.scss';

const Actions = ({
  url,
  setUrl,
}: {
  url: string;
  setUrl: Dispatch<SetStateAction<string>>;
}) => {
  const [open, setOpen] = useState<boolean>(false);
  const [email, setEmail] = useState<boolean>(false);
  const [emailAddress, setEmailAddress] = useState<string>('');
  const [emailButton, setEmailButton] = useState<'button' | 'submit'>('button');
  const [gallery, setGallery] = useState<boolean>(false);
  const [all, setAll] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const isLoad = ['start', 'load', 'listen'].includes(url);
  const images =
    typeof localStorage !== 'undefined'
      ? JSON.parse(localStorage.getItem('dreams') as string)
      : [];

  const galleryImages = images.map((img: string) => {
    return {
      original: img,
      thumbnail: img,
    };
  });

  const fetchImg = async (url: string) => {
    const image = await fetch('/api/download', {
      method: 'POST',
      body: JSON.stringify({ url }),
    });
    const { data } = await image.json();
    return data;
  };

  const getFileFromBase64 = (string64: string, fileName: string) => {
    const imageContent = atob(string64);
    const buffer = new ArrayBuffer(imageContent.length);
    const view = new Uint8Array(buffer);
    for (let n = 0; n < imageContent.length; n++) {
      view[n] = imageContent.charCodeAt(n);
    }
    const type = 'image/png';
    const blob = new Blob([buffer], { type });
    return new File([blob], fileName, {
      lastModified: new Date().getTime(),
      type,
    });
  };

  const download = async () => {
    if (!all) {
      const imgBlob = await fetchImg(images[images.length - 1]);
      const anchor = document.createElement('a');
      anchor.href = `data:image/png;base64,${imgBlob}`;
      anchor.target = '_blank';
      anchor.download = 'current-dream.png';
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
    } else {
      const imagesBlobs = await Promise.all(
        images.map(async (image: string) => {
          return await fetchImg(image);
        }),
      );
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      await Promise.all(
        imagesBlobs.map(async (blob, index) => {
          const file = getFileFromBase64(blob, `dream (${index}).png`);
          zip.file(`dream (${index}).png`, file);
        }),
      );
      const blob = await zip.generateAsync({ type: 'blob' });
      const { saveAs } = (await import('file-saver')).default;
      saveAs(blob, 'aida-dreams.zip');
    }
  };

  const reset = () => {
    setEmail(false);
    setAll(false);
    setOpen(false);
    setGallery(false);
    setUrl('');
    localStorage.setItem('dreams', '[]');
  };

  const sendEmailAction = async () => {
    setEmailButton('button');
    setLoading(true);
    const attachments = all ? images : [images[images.length - 1]];
    const emailResponse = await sendEmail(emailAddress, attachments, all);
    if (emailResponse.status === 200) {
      setEmail(false);
      setSuccess(true);
      setLoading(false);
    } else {
      alert('Email Connection Error :(');
    }
  };

  useEffect(() => {
    if (success)
      setTimeout(() => {
        setSuccess(false);
      }, 4000);
  }, [success]);

  return (
    <div className={styles.actions}>
      {(open || url === 'end') && (
        <>
          {!isLoad && images.length > 1 && (
            <button className={styles.toggle}>
              <label>
                <span>Include all images for email send and downloads?</span>
                <input
                  name='all'
                  type='checkbox'
                  checked={all}
                  onChange={(e) => setAll(e.target.checked)}
                />
              </label>
            </button>
          )}
          <div className={styles.buttons}>
            {!isLoad && images.length >= 1 && (
              <form action={sendEmailAction} className={styles.email}>
                {email && (
                  <input
                    name='email'
                    value={emailAddress}
                    onChange={(e) => {
                      setEmailAddress(e.target.value);
                      const valid = e.target.validity.valid;
                      valid && setEmailButton('submit');
                    }}
                    type='email'
                    pattern='^[^@]+@[^@]+\.[^@]+$'
                    placeholder='Email Address'
                    title='Enter a valid email address'
                  />
                )}
                <button
                  type={emailButton}
                  className={styles.imageBtn}
                  onClick={() => {
                    if (!email) {
                      setEmail(true);
                      setTimeout(() => {
                        emailAddress && emailButton && setEmailButton('submit');
                      }, 400);
                    }
                  }}
                >
                  {email ? (
                    <Image
                      src={`/images/${
                        success ? 'check' : loading ? 'loading' : 'send'
                      }.webp`}
                      alt='Send Email button'
                      width={success ? 30 : 25}
                      height={success ? 30 : 25}
                      className={`${styles.emailBtn} ${styles.sendBtn} ${
                        loading && styles.loading
                      }`}
                    />
                  ) : (
                    <Image
                      src={`/images/${
                        success ? 'check' : loading ? 'loading' : 'mail'
                      }.webp`}
                      alt='Open Email button'
                      width={success ? 30 : 25}
                      height={success ? 30 : 25}
                      className={`${styles.emailBtn} ${
                        loading && styles.loading
                      }`}
                    />
                  )}
                  {success && (
                    <span className={styles.btnLabel + ' ' + styles.sentBtn}>
                      Email sent successfully!
                    </span>
                  )}
                  {!email && !success && (
                    <span className={styles.btnLabel}>
                      Send {all ? 'all session images' : 'current image'} to
                      your email address
                    </span>
                  )}
                </button>
              </form>
            )}
            {!isLoad && images.length >= 1 && (
              <button className={styles.imageBtn} onClick={download}>
                <Image
                  src='/images/download.webp'
                  alt='Download button'
                  width={25}
                  height={25}
                  className={styles.dwnBtn}
                />
                <span className={styles.btnLabel}>
                  Save {all ? 'all session images' : 'latest generated image'}{' '}
                  to your device
                </span>
              </button>
            )}
            {!isLoad && images.length > 1 && (
              <button
                className={styles.imageBtn}
                onClick={() => setGallery(!gallery)}
              >
                {gallery ? (
                  <>
                    <Image
                      src='/images/image.webp'
                      alt='Single image button'
                      width={25}
                      height={25}
                      className={styles.galleryBtn}
                    />
                    <span className={styles.btnLabel}>Close gallery mode</span>
                  </>
                ) : (
                  <>
                    <Image
                      src='/images/gallery.webp'
                      alt='Gallery button'
                      width={25}
                      height={25}
                      className={styles.galleryBtn}
                    />
                    <span className={styles.btnLabel}>
                      Open gallery mode to display all of this session images
                    </span>
                  </>
                )}
              </button>
            )}
            <button className={styles.imageBtn} onClick={reset}>
              <Image
                src='/images/reset.webp'
                alt='Reset button'
                width={25}
                height={25}
                className={styles.resetBtn}
              />
              <span className={styles.btnLabel}>
                This will reset current session and delete saved images
              </span>
            </button>
          </div>
        </>
      )}
      {gallery && (
        <div className={styles.gallery}>
          <ImageGallery
            items={galleryImages.reverse()}
            lazyLoad
            showPlayButton={false}
            isRTL={true}
          />
        </div>
      )}

      {url !== 'end' && (
        <button
          className={`${styles.menu} ${open && styles.open}`}
          onClick={() => {
            setOpen(!open);
          }}
          type='button'
        >
          {open ? (
            <Image
              src='/images/close.webp'
              alt='Close Menu button'
              width={16}
              height={16}
            />
          ) : (
            <Image
              src='/images/menu.webp'
              alt='Menu button'
              width={20}
              height={20}
            />
          )}
        </button>
      )}
    </div>
  );
};

export default Actions;
