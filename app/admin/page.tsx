'use client';

import { ChangeEvent, useState } from 'react';
import styles from './page.module.scss';

export default function Home() {
  const [load, setLoad] = useState<string>('start');
  const [image, setImage] = useState<string>('');
  const [caption, setCaption] = useState<string>('');
  const [channel, setChannel] = useState<string>('');

  const changeLoad = (e: ChangeEvent<HTMLSelectElement>) => {
    setLoad(e.target.value);
  };

  const sendLoad = () => {
    fetch('/api/load', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        load,
        channel,
      }),
    });
  };

  const changeImage = (e: ChangeEvent<HTMLInputElement>) => {
    setImage(e.target.value);
  };

  const sendImage = () => {
    fetch('/api/image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: image,
        channel,
      }),
    });
  };

  const changeCaption = (e: ChangeEvent<HTMLInputElement>) => {
    setCaption(e.target.value);
  };

  const sendCaption = () => {
    fetch('/api/caption', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: caption,
        channel,
      }),
    });
  };

  const changeChannel = (e: ChangeEvent<HTMLInputElement>) => {
    setChannel(e.target.value);
  };

  const sendChannel = () => {
    localStorage.setItem('channel', channel);
  };

  return (
    <main className={styles.main}>
      <h1>Admin</h1>
      <div className={styles.controls}>
        <label htmlFor=''>
          <select onChange={changeLoad} value={load}>
            <option value='start'>Start</option>
            <option value='talk'>Talk</option>
            <option value='listen'>Listen</option>
            <option value='end'>End</option>
          </select>
          <button onClick={sendLoad}>Send Signal</button>
        </label>
        <label htmlFor=''>
          <input
            type='text'
            name=''
            id=''
            value={image}
            onChange={(e) => changeImage(e)}
          />
          <button onClick={sendImage}>Send Image</button>
        </label>
        <label htmlFor=''>
          <input
            type='text'
            name=''
            id=''
            value={caption}
            onChange={(e) => changeCaption(e)}
          />
          <button onClick={sendCaption}>Send Caption</button>
        </label>
        <label htmlFor=''>
          <input
            type='text'
            name=''
            id=''
            value={channel}
            onChange={(e) => changeChannel(e)}
          />
          <button onClick={sendChannel}>Set Channel</button>
        </label>
      </div>
    </main>
  );
}
