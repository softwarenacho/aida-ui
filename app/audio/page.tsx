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
            recorder.stream.getTracks().forEach((track) => track.stop());
          };

          recorderRef.current = recorder;
          recorder.start();
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
    // Simulate a fetch request
    setTimeout(() => {
      // Simulate processing and playing the audio chunk
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
              console.log('🚀 ~ setTimeout ~ source:', source);
              source.playbackRate.value = 2;
              source.buffer = buffer;
              source.connect(audioContext.destination);
              source.start(0);
            },
          );
        };
        reader.readAsArrayBuffer(blob);
      }
    }, 1000); // Simulate a delay in fetching and processing the audio chunk
  };

  useEffect(() => {
    if (recordedChunks.length > 0) {
      const fullBlob = new Blob(recordedChunks, { type: 'audio/wav' });
      const url = URL.createObjectURL(fullBlob);
      console.log('🚀 ~ useEffect ~ url:', url);
      setAudioUrl(url);
    }
  }, [recordedChunks]);

  const handleSegmentClick = (start: number) => {
    console.log('🚀 ~ handleSegmentClick ~ start:', start);
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

      // Stop the audio after its duration
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
