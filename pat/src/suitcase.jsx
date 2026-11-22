import React, { useEffect, useRef, useState } from 'react';
import content from './content';
import { playEffect } from './audio';
import { StickerArt } from './stickers';

export function Suitcase({ cities, selected, onSelect, pending }) {
  const { suitcase } = content;
  return <figure className="travel-case">
    <div className="case-art">
      <img src={suitcase.image} alt={suitcase.alt} />
      <div className="case-stickers">
        {cities.map((city, index) => {
          const sticker = suitcase.stickers[index];
          const label = city.name + (sticker ? ' · ' + sticker.name : '');
          const artwork = <><StickerArt icon={sticker?.icon} /><span>{city.name}</span></>;
          return city === pending
            ? <span key={city.name} className="case-sticker sticker-pending" aria-hidden="true" data-sticker-target>{artwork}</span>
            : onSelect
            ? <button key={city.name} type="button" className="case-sticker" aria-label={label} title={label} aria-pressed={selected === index} onClick={() => onSelect(index)}>{artwork}</button>
            : <span key={city.name} className="case-sticker" title={label}>{artwork}</span>;
        })}
      </div>
    </div>
    <figcaption>{cities.length ? suitcase.label : suitcase.empty}</figcaption>
  </figure>;
}

function HomeEnding() {
  const { suitcase } = content;
  const [lit, setLit] = useState(false);
  const glass = useRef(null);
  const previous = useRef(null);

  useEffect(() => {
    const motion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let clip;
    const knock = setTimeout(() => { clip = playEffect('knock', .42); }, motion ? 10 : 2800);
    const light = setTimeout(() => setLit(true), motion ? 440 : 3230);
    return () => {
      clearTimeout(knock);
      clearTimeout(light);
      clip?.pause();
    };
  }, []);

  function draw(event, begin = false) {
    if (!begin && !previous.current) return;
    const canvas = glass.current;
    const bounds = canvas.getBoundingClientRect();
    const point = [(event.clientX - bounds.left) / bounds.width * canvas.width, (event.clientY - bounds.top) / bounds.height * canvas.height];
    const context = canvas.getContext('2d');
    if (begin) event.currentTarget.setPointerCapture(event.pointerId);
    context.strokeStyle = '#fff3b9';
    context.lineWidth = 5;
    context.lineCap = 'round';
    context.beginPath();
    context.moveTo(...(previous.current ?? [point[0] - .1, point[1]]));
    context.lineTo(...point);
    context.stroke();
    previous.current = point;
  }

  return <figure className="home-finale">
    <div className="home-scene">
      <div className={'home-window' + (lit ? ' window-lit' : '')}>
        {lit && <canvas ref={glass} width="100" height="120" aria-label={suitcase.windowLabel}
          onPointerDown={event => draw(event, true)} onPointerMove={event => draw(event)}
          onPointerUp={() => { previous.current = null; }} onLostPointerCapture={() => { previous.current = null; }} />}
      </div>
      <img src={suitcase.car} alt="" />
    </div>
    {lit && <figcaption aria-live="polite">{suitcase.goodbye}</figcaption>}
  </figure>;
}

export function GiftFinale({ onNext }) {
  const { suitcase } = content;
  const [choice, setChoice] = useState(null);
  return <main className="stage suitcase-finale">
    <h1 tabIndex={-1}>{suitcase.title}</h1>
    <p className="stage-intro">{suitcase.giftHint}</p>
    <div className="gift-choices" role="group" aria-label={suitcase.ticket}>
      {suitcase.choices.map((label, index) => <button key={label} type="button" className={'gift-choice gift-' + index} aria-pressed={choice === index} onClick={() => setChoice(index)}>
        <span className="gift-box" aria-hidden="true" />{suitcase.giftLabel} {index + 1}
      </button>)}
    </div>
    {choice !== null && <article className="date-ticket" key={choice} aria-live="polite">
      <p className="eyebrow">{suitcase.ticket}</p><h2>{suitcase.choices[choice]}</h2>{choice === 1 && <p>{suitcase.horrorNote}</p>}<p>{suitcase.shareHint}</p>
    </article>}
    {choice !== null && <HomeEnding key={choice} />}
    {choice !== null && <button className="text-action story-next" type="button" onClick={onNext}>{suitcase.finalButton}</button>}
  </main>;
}

export function LoveEnding({ onRestart }) {
  const { suitcase } = content;
  return <main className="stage love-finale">
    <div className="love-card">
      <span className="love-heart" aria-hidden="true">♥</span>
      <h1 tabIndex={-1}>{suitcase.finalTitle}</h1>
      <p>{suitcase.finalSignature}</p>
      <button type="button" className="text-action" onClick={onRestart}>{suitcase.restart}</button>
    </div>
  </main>;
}
