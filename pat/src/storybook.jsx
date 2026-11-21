import React, { useState } from 'react';
import content from './content';
import './picture-book.css';

export function Storybook({ onNext }) {
  const { storybook } = content;
  const [page, setPage] = useState(0);
  const scene = storybook.scenes[page];
  const last = page === storybook.scenes.length - 1;

  return <main className="stage picture-book">
    <h1 tabIndex={-1}>{storybook.title}</h1>
    <figure className="picture-book-page" key={page}>
      <img src={scene.image} alt={scene.title} width="1536" height="1024" />
      <figcaption aria-live="polite">
        <p className="eyebrow">{storybook.page} {page + 1} / {storybook.scenes.length}</p>
        <h2>{scene.title}</h2>
        <p>{scene.text}</p>
      </figcaption>
    </figure>
    <div className="picture-book-controls">
      <button type="button" className="text-action" disabled={page === 0} onClick={() => setPage(value => value - 1)}>{storybook.previous}</button>
      <button type="button" className="button button-gold" onClick={() => last ? onNext() : setPage(value => value + 1)}>{last ? storybook.finish : storybook.next}</button>
    </div>
  </main>;
}
