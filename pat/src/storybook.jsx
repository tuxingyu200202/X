import { playEffect } from './audio';
import React, { useState } from 'react';
import content from './content';
import './picture-book.css';

export function Storybook({ onNext }) {
  const { storybook } = content;
  const [page, setPage] = useState(0);
  const { scenes } = storybook;
  const scene = scenes[page];
  const last = page === scenes.length - 1;

  return <main className="stage picture-book">
    <h1 tabIndex={-1}>{storybook.title}</h1>
    <figure className="picture-book-page" key={page}>
      <div className="picture-book-art">
        <img src={scene.image} alt={scene.title} width="1200" height="800" decoding="async" />
      </div>
      <figcaption>
        <div className="picture-book-prose">
          <h2>{scene.title}</h2>
          <p>{scene.text}</p>
        </div>
      </figcaption>
    </figure>
    {scenes[page + 1] && <link rel="preload" as="image" href={scenes[page + 1].image} />}
    <nav className="picture-book-controls" aria-label={storybook.title}>
      <button type="button" className="text-action" disabled={page === 0} data-sound="page" onClick={() => { playEffect('page', .42); setPage(value => value - 1); }}>{storybook.previous}</button>
      <span className="picture-book-progress" role="status">{storybook.page} {page + 1} / {scenes.length}</span>
      <button type="button" className="button button-gold" data-sound="page" onClick={() => { playEffect('page', .42); if (last) onNext(); else setPage(value => value + 1); }}>{last ? storybook.finish : storybook.next}</button>
    </nav>
  </main>;
}
