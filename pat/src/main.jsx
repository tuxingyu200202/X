import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import content from './content';
import { Opening, Ride } from './journey';
import './style.css';
import './journey.css';
import './retro.css';
import './letterpress.css';
import './storybook.css';
import './suitcase.css';
import './ending.css';
import './christmas-final.css';
import { Music, Voice } from './audio';
import { BathBreak, Evenings, ChristmasTree } from './ending';
import { GiftFinale } from './suitcase';
import { Storybook } from './storybook';

document.title = content.title;
document.documentElement.lang = content.language;

function Cover({ onOpen }) {
  const { cover } = content;
  return <main className="stage cover-stage">
    <div className="greeting-card">
      <img className="cover-art" src={cover.image} alt="" />
      <div className="greeting-copy">
        <p className="eyebrow">{cover.dedication}</p>
        <h1 tabIndex={-1}>{cover.title}</h1>
        <p>{cover.subtitle}</p>
        <p className="headphone-note">{cover.headphoneNote}</p>
        <button className="button button-gold" onClick={onOpen}>{cover.button}</button>
      </div>
    </div>
  </main>;
}

function Call({ onNext }) {
  const { call } = content;
  const [connected, setConnected] = useState(false);
  return <main className="stage call-stage">
    <h1 tabIndex={-1}>{call.title}</h1>
    <div className="iphone">
      <div className="phone-notch" aria-hidden="true" />
      <p className="eyebrow">{call.app}</p>
      <img src={call.image} alt="" />
      <h2>{call.caller}</h2>
      {!connected && <button type="button" className="phone-answer" onClick={() => setConnected(true)}>{call.answer}</button>}
      {connected && <p>{call.connected}</p>}
    </div>
    {connected && call.audio && <Voice src={call.audio} controls aria-label={call.play} />}
    {connected && <div className="connected-call"><button className="button button-gold" onClick={onNext}>{call.next}</button></div>}
  </main>;
}

function Finish({ onNext }) {
  const { run } = content;
  const [progress, setProgress] = useState(0);
  const [running, setRunning] = useState(false);
  const crossed = progress === 100;
  const checkpoint = progress >= 76 ? 2 : progress >= 45 ? 1 : progress >= 15 ? 0 : -1;

  useEffect(() => {
    if (!running || crossed) return;
    const timer = setInterval(() => setProgress(value => Math.min(100, value + 2)), 48);
    return () => clearInterval(timer);
  }, [running, crossed]);

  useEffect(() => {
    const src = run.audio[checkpoint];
    if (!src) return;
    const clip = new Audio(src);
    clip.play().catch(() => {});
    return () => clip.pause();
  }, [checkpoint, run.audio]);

  return <main className="stage run-start">
    <p className="eyebrow">{run.label}</p>
    <h1 tabIndex={-1}>{run.title}</h1>
    <p className="stage-intro">{run.intro}</p>
    <div className="run-course">
      <div className={'track' + (crossed ? ' crossed' : '')} aria-hidden="true" style={{ '--runner': (7 + progress * .88) + '%' }}><span>♥</span></div>
      <div className="track-dates"><time dateTime="2026-07-24">{run.startDate}</time><time dateTime="2026-12-25">{run.finishDate}</time></div>
    </div>
    <p className="checkpoint" aria-live="polite">{run.checkpoints[checkpoint]}</p>
    {!crossed && <div className="running-actions">
      <button className="button button-gold hold"
        onPointerDown={event => { if (event.button === 0) { event.currentTarget.setPointerCapture(event.pointerId); setRunning(true); } }}
        onPointerUp={() => setRunning(false)} onPointerCancel={() => setRunning(false)} onLostPointerCapture={() => setRunning(false)}
        onClick={event => { if (event.detail === 0) setProgress(100); }}>{run.finish}</button>
      <button className="text-action" onClick={() => setProgress(100)}>{run.tap}</button>
    </div>}
    {crossed && <div className="crossed-message certificate" aria-live="polite">
      <h2 className="medal">{run.medal}</h2><p>{run.certificate}</p>
      <button className="button button-gold" onClick={onNext}>{run.next}</button>
      <BathBreak />
    </div>}
  </main>;
}

function FinalCall({ onNext }) {
  const { finalCall, extras, call } = content;
  const [answered, setAnswered] = useState(false);
  return <main className="stage call-stage">
    <h1 tabIndex={-1}>{answered ? finalCall.greeting : finalCall.title}</h1>
    <div className={'iphone' + (answered ? ' family-call' : '')}>
      <div className="phone-notch" aria-hidden="true" />
      <p className="eyebrow">{call.app}</p>
      <img src={finalCall.avatar} alt="Patrik" />
      {answered ? <>
        <div className="holiday-guests" aria-hidden="true"><span>🎄</span><span>👨‍👩‍👧</span><img src={extras.kimiImage} alt="" /><img src={extras.leoImage} alt="" /></div>
        <p>{finalCall.family}</p>
      </> : <button type="button" className="phone-answer" onClick={() => setAnswered(true)}>{finalCall.answer}</button>}
    </div>
    {answered && <button type="button" className="button button-gold call-continue" onClick={onNext}>{finalCall.next}</button>}
  </main>;
}

function App() {
  const [stage, setStage] = useState(0);
  const frame = useRef(null);
  const music = useRef(null);
  const advance = useCallback(() => setStage(current => current + 1), []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    frame.current.querySelector('h1')?.focus({ preventScroll: true });
  }, [stage]);

  return <div ref={frame}>
    {stage === 0 && <Cover onOpen={() => {
      if (!music.current.dataset.started && !music.current.dataset.disabled) {
        music.current.dataset.started = '1';
        music.current.play().catch(() => {});
      }
      advance();
    }} />}
    {stage === 1 && <Opening onOpen={advance} />}
    {stage === 2 && <Call onNext={advance} />}
    {stage === 3 && <Ride onNext={advance} />}
    {stage === 4 && <Finish onNext={advance} />}
    {stage === 5 && <Evenings onNext={advance} />}
    {stage === 6 && <ChristmasTree onNext={advance} />}
    <Music audio={music} />
    {stage === 7 && <Storybook onNext={advance} />}
    {stage === 8 && <FinalCall onNext={advance} />}
    {stage === 9 && <GiftFinale onRestart={() => setStage(0)} />}
  </div>;
}

createRoot(document.getElementById('root')).render(<App />);
