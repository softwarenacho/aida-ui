import { useEffect, useState } from 'react';
import styles from '../page.module.scss';

const Start = ({ channel }: { channel: string }) => {
  const [session, setSession] = useState<string>(channel);

  useEffect(() => {
    const localChannel = localStorage.getItem('channel') as string;
    const defaultChannel = channel || localChannel || 'general';
    setSession(defaultChannel);
  }, [channel]);

  return (
    <div className={styles.start}>
      <h1>Welcome to AIDA - Your Dream Interpreter!</h1>
      <h2>
        A new session is about to start in the <strong>{session}</strong>{' '}
        channel
      </h2>
      <p>
        Through a series of insightful questions, AIDA harnesses the power of
        artificial intelligence to create vivid representations of your dreams
        as stunning AI-generated images.
      </p>
      <p>
        Let&#39;s explore the depths of your imagination together and experience
        the power of your dreams like never before.
      </p>
    </div>
  );
};

export default Start;
