import React, { useState } from 'react';
import content from './content';
import { StickerArt } from './stickers';

export function Suitcase({ cities, selected, onSelect }) {
  const { suitcase } = content;
  return <figure className="travel-case">
    <div className="case-art">
      <img src={suitcase.image} alt={suitcase.alt} />
      <div className="case-stickers">
        {cities.map((city, index) => {
          const sticker = suitcase.stickers[index];
          const label = city.name + (sticker ? ' · ' + sticker.name : '');
          const artwork = <><StickerArt icon={sticker?.icon} /><span>{city.name}</span></>;
          return onSelect
            ? <button key={city.name} type="button" className="case-sticker" aria-label={label} title={label} aria-pressed={selected === index} onClick={() => onSelect(index)}>{artwork}</button>
            : <span key={city.name} className="case-sticker" title={label}>{artwork}</span>;
        })}
      </div>
    </div>
    <figcaption>{cities.length ? suitcase.label : suitcase.empty}</figcaption>
  </figure>;
}

export function GiftFinale({ onRestart }) {
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
    {choice !== null && <figure className="home-finale" key={choice}>
      <div className="home-scene" aria-hidden="true">
        <span className="home-window">✦</span><img src={suitcase.car} alt="" />
      </div>
      <figcaption>{suitcase.goodbye}</figcaption>
    </figure>}
    {choice !== null && <button className="text-action story-next" type="button" onClick={onRestart}>{suitcase.restart}</button>}
  </main>;
}
