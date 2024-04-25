'use client';

import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import Initial from './components/Initial';
import styles from './page.module.scss';

export default function Home() {
  const [currentUrl, setUrl] = useState<string>('');

  useEffect(() => {
    localStorage.setItem('dreams', '[]');
    document?.addEventListener('contextmenu', (event) => {
      event.preventDefault();
    });
  }, []);

  const Loading = dynamic(() => import('./components/Loading'));
  const SocketImage = dynamic(() => import('./components/SocketImage'));
  const Actions = dynamic(() => import('./components/Actions'));
  const Captions = dynamic(() => import('./components/Captions'));
  const Start = dynamic(() => import('./components/Start'));
  const End = dynamic(() => import('./components/End'));

  const WithSearchParams = () => {
    const [caption, setCaption] = useState<string>('');
    const channelParams = useSearchParams();
    const paramChannel = channelParams.get('channel');
    const [session, setSession] = useState<string>(paramChannel as string);

    useEffect(() => {
      const localChannel = localStorage.getItem('channel') as string;
      const channel = paramChannel || localChannel || 'general';
      setSession(channel);
    }, [paramChannel]);

    useEffect(() => {
      const setCaptionEvent = (data: { message: string }) => {
        const { message } = data;
        setCaption(message);
      };

      const setUrlEvent = (data: { message: string }) => {
        const validLoads = ['start', 'talk', 'listen', 'end'];
        const { message } = data;
        if (message && message !== currentUrl) {
          setUrl(message);
          const images =
            message !== 'start'
              ? JSON.parse(localStorage.getItem('dreams') as string)
              : [];
          if (message === 'start') {
            localStorage.setItem('dreams', JSON.stringify([]));
          }
          if (!validLoads.includes(message) && !images.includes(message)) {
            localStorage.setItem(
              'dreams',
              JSON.stringify([...images, message]),
            );
          }
        }
      };

      const getPusher = async () => {
        const cluster = process.env.NEXT_PUBLIC_CLUSTER as string;
        const urlEvent =
          (process.env.NEXT_PUBLIC_URL_EVENT as string) +
          (session ? `-${session}` : '');
        const captionEvent =
          (process.env.NEXT_PUBLIC_CAPTION_EVENT as string) +
          (session ? `-${session}` : '');
        const key = process.env.NEXT_PUBLIC_KEY as string;
        const name = process.env.NEXT_PUBLIC_CHANNEL as string;
        const Pusher = (await import('pusher-js')).default;
        const pusherUrl = new Pusher(key, { cluster });
        const pusherChannel = pusherUrl.subscribe(name);
        pusherChannel.bind(urlEvent, (data: { message: string }) =>
          setUrlEvent(data),
        );
        pusherChannel.bind(captionEvent, (data: { message: string }) =>
          setCaptionEvent(data),
        );
      };

      getPusher();
    }, [session]);

    const validLoads = ['start', 'talk', 'listen', 'end'];

    return (
      <main className={styles.main}>
        <Initial currentUrl={currentUrl} />
        {currentUrl && currentUrl === 'start' && <Start channel={session} />}
        {currentUrl && currentUrl === 'end' && <End />}
        {currentUrl && ['talk', 'listen'].includes(currentUrl) && (
          <Loading
            icon={
              currentUrl === 'talk' ? '/images/volume.webp' : '/images/mic.webp'
            }
          />
        )}
        {caption && <Captions caption={caption} />}
        {currentUrl && !validLoads.includes(currentUrl) && (
          <>
            <SocketImage currentUrl={currentUrl} />
          </>
        )}
        {currentUrl && currentUrl !== 'start' && (
          <Actions url={currentUrl} setUrl={setUrl} />
        )}
      </main>
    );
  };

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <WithSearchParams />
    </Suspense>
  );
}
