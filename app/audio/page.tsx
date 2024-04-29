'use client';

import React, { useEffect, useRef, useState } from 'react';
import styles from './page.module.scss';

const Audio: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [recordedSegments, setRecordedSegments] = useState<number[][]>([]);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const [duration, setDuration] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | undefined>(
    undefined,
  );

  useEffect(() => {
    if (isRunning) {
      const id = setInterval(() => {
        setDuration((prevDuration) => prevDuration + 1);
      }, 1000);
      setIntervalId(id);
    } else {
      intervalId && clearInterval(intervalId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning]);

  const startTimer = (): void => {
    setIsRunning(true);
  };

  const stopTimer = (): void => {
    setIsRunning(false);
    setDuration(0);
  };

  const handleRecord = () => {
    if (!isRecording) {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          const recorder = new MediaRecorder(stream);
          const chunks: Blob[] = [];

          recorder.ondataavailable = (e) => {
            chunks.push(e.data);
          };

          recorder.onstop = () => {
            setIsRecording(false);
            const blob = new Blob(chunks, { type: 'audio/wav' });
            setRecordedChunks((prevChunks) => [...prevChunks, blob]);

            const startTime =
              recordedChunks.length > 0
                ? recordedSegments[recordedSegments.length - 1][1]
                : 0;
            const endTime = new Date().getTime();
            const duration = (endTime - startTime) / 1000;

            setRecordedSegments((prevSegments) => [
              ...prevSegments,
              [startTime, startTime + duration],
            ]);

            fakeFetchAndPlay(blob);
            recorder.stop();
            stopTimer();
            recorder.stream.getTracks().forEach((track) => track.stop());
          };

          recorderRef.current = recorder;
          recorder.start();
          startTimer();
          setIsRecording(true);
        })
        .catch((err) => console.error('Error recording audio: ', err));
    }
  };

  const handleStopRecording = () => {
    if (recorderRef.current && isRecording) {
      recorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const fakeFetchAndPlay = (blob: Blob) => {
    setTimeout(() => {
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }

      const audioContext = audioContextRef.current;

      if (audioContext) {
        const reader = new FileReader();
        reader.onload = () => {
          audioContext.decodeAudioData(
            reader.result as ArrayBuffer,
            (buffer) => {
              const source = audioContext.createBufferSource();
              source.playbackRate.value = 2;
              source.buffer = buffer;
              source.connect(audioContext.destination);
              source.start(0);
            },
          );
        };
        reader.readAsArrayBuffer(blob);
      }
    }, 1000);
  };

  useEffect(() => {
    if (recordedChunks.length > 0) {
      const fullBlob = new Blob(recordedChunks, { type: 'audio/wav' });
      const url = URL.createObjectURL(fullBlob);
      setAudioUrl(url);
    }
  }, [recordedChunks]);

  const handleSegmentClick = (start: number) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }

    const audioContext = audioContextRef.current;

    if (audioContext) {
      const audioBuffer = new AudioBuffer({
        numberOfChannels: 1,
        length: 44100 * 5, // 5 seconds buffer length (adjust as needed)
        sampleRate: 44100,
      });

      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);

      const startTime = start / 1000;
      source.start(0, startTime);

      setTimeout(() => {
        source.stop();
      }, (recordedSegments[0][1] - start) * 1000);
    }
  };

  const handleRemoveChunk = (index: number) => {
    const updatedChunks = [...recordedChunks];
    updatedChunks.splice(index, 1);
    setRecordedChunks(updatedChunks);
    const updatedSegments = [...recordedSegments];
    updatedSegments.splice(index, 1);
    setRecordedSegments(updatedSegments);
  };

  return (
    <div className={styles.main}>
      {duration > 0 && <span>Duration: {duration}</span>}
      <button
        onClick={() => (isRecording ? handleStopRecording() : handleRecord())}
        name='record'
        className={`${styles.record} ${isRecording ? styles.isRecording : ''}`}
      >
        {isRecording ? '🟥' : '⚪️'}
      </button>
      {audioUrl && <audio controls ref={audioRef} src={audioUrl}></audio>}
      {false && (
        <div className={styles.segments}>
          {recordedSegments.map((segment, index) => (
            <div key={index}>
              Segment {index}
              <button
                onClick={() => handleSegmentClick(segment[0])}
                name={`start-${index}`}
              >
                {Math.round(segment[0] / 1000000000)}s
              </button>
              <button
                onClick={() => handleRemoveChunk(index)}
                name={`remove-${index}`}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Audio;
