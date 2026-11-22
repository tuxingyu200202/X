import React, { useEffect, useRef, useState, forwardRef } from 'react';
import content from './content';

export function Music({ audio }) {
  const [enabled, setEnabled] = useState(true);
  const playingVoices = useRef(new Set());

  useEffect(() => {
    const track = audio.current;
    track.volume = .23;
    function syncVoice(event) {
      const voice = event.detail?.voice ?? event.target;
      if (!voice.dataset.voice) return;
      if (event.type === 'play') playingVoices.current.add(voice);
      else playingVoices.current.delete(voice);
      if (playingVoices.current.size) track.pause();
      else if (enabled && track.dataset.started) track.play().catch(() => {});
    }
    const events = ['play', 'pause', 'ended', 'voice-exit'];
    events.forEach(event => document.addEventListener(event, syncVoice, true));
    return () => events.forEach(event => document.removeEventListener(event, syncVoice, true));
  }, [audio, enabled]);

  return <>
    <audio src={content.music.src} ref={audio} loop preload="auto" />
    <button className="music-control" type="button" aria-label={content.music.label} aria-pressed={enabled} onClick={() => {
      const track = audio.current;
      if (enabled) {
        delete track.dataset.started;
        track.dataset.disabled = '1';
        track.pause();
      } else {
        delete track.dataset.disabled;
        track.dataset.started = '1';
        if (!playingVoices.current.size) track.play().catch(() => {});
      }
      setEnabled(!enabled);
    }}>{content.music.image}</button>
  </>;
}

export const Voice = forwardRef(function Voice(props, forwarded) {
  const local = useRef(null);
  useEffect(() => {
    const voice = local.current;
    return () => {
      voice.pause();
      document.dispatchEvent(new CustomEvent('voice-exit', { detail: { voice } }));
    };
  }, []);
  return <audio {...props} data-voice="true" ref={node => {
    local.current = node;
    if (forwarded) forwarded.current = node;
  }} />;
});

export function playEffect(name, volume = .65) {
  const clip = new Audio(content.effects[name]);
  clip.volume = volume;
  clip.play().catch(() => {});
  return clip;
}

export function useRingtone(ringing) {
  useEffect(() => {
    if (!ringing) return;
    const clip = playEffect('ring', .46);
    clip.loop = true;
    return () => clip.pause();
  }, [ringing]);
}
