import React, { useRef, useState } from 'react';
import content from './content';
import { Voice } from './audio';

function Cat({ tuxedo = false, eyes = false }) {
  if (!eyes) return <img className="cat-sticker" src={tuxedo ? content.extras.leoImage : content.extras.kimiImage} alt="" />;
  return <span className={'paper-cat' + (tuxedo ? ' tuxedo' : '') + (eyes ? ' eyes-only' : '')} aria-hidden="true"><i /><i /></span>;
}

export function BathBreak() {
  const { extras } = content;
  const [open, setOpen] = useState(false);
  const [popped, setPopped] = useState(false);
  return <>
    <button className="bath-toggle" type="button" aria-label={extras.bath} aria-expanded={open} onClick={() => setOpen(value => !value)}>🛁</button>
    {open && <div className="bath-break">
      <div className="bath-picture" role="img" aria-label={extras.bathArt}>
        <Cat /><span className="bathing-capy" /><span className="paper-bath" /><Cat tuxedo />
      </div>
      <div className="bubbles"><span aria-hidden="true" /><span aria-hidden="true" />{!popped && <button type="button" onClick={() => setPopped(true)} aria-label={extras.bubble} />}</div>
      <p aria-live="polite">{popped && extras.message}</p>
    </div>}
  </>;
}

function Globe({ item }) {
  return <span className="snow-globe" aria-hidden="true"><span className={'globe-icon globe-' + item.kind}><i /><i /></span></span>;
}

export function Evenings({ onNext }) {
  const { evenings } = content;
  const [lit, setLit] = useState(false);
  const [kimi, setKimi] = useState(false);

  function lightWindow() {
    setLit(true);

  }

  return <main className="stage evening-stage">
    <h1 tabIndex={-1}>{evenings.title}</h1>
    <div className="night-windows">
      <div><button type="button" className={'cutout-window' + (lit ? ' lit' : '')} aria-label={evenings.aria} aria-pressed={lit} onClick={lightWindow}><span aria-hidden="true">♥</span></button><p>{evenings.cities[0]}</p></div>
      <div><div className="cutout-window lit" role={lit ? undefined : 'img'} aria-label={evenings.patrik}>{lit
        ? <button className={'kimi-reveal' + (kimi ? ' kimi-open' : '')} type="button" aria-label={content.extras.kimi} aria-expanded={kimi} onClick={() => setKimi(true)}><Cat eyes={!kimi} /><span className="curtain curtain-left" aria-hidden="true" /><span className="curtain curtain-right" aria-hidden="true" /></button>
        : <span aria-hidden="true">✦</span>}</div><p>{evenings.cities[1]}</p></div>
    </div>
    {lit && evenings.audio && <Voice src={evenings.audio} controls aria-label={evenings.play} />}
    {lit && <div className="evening-note">
      {kimi && <p role="status">{content.extras.goodnight}</p>}
      <h2>{evenings.greeting}</h2><p>{evenings.note}</p>{!kimi && <p className="kimi-hint">{content.extras.kimi}</p>}
      <button className="button button-gold" onClick={onNext}>{evenings.next}</button>
    </div>}
  </main>;
}

export function ChristmasTree({ onNext }) {
  const { tree } = content;
  const [hung, setHung] = useState([]);
  const [selected, setSelected] = useState(null);
  const [letter, setLetter] = useState(false);
  const [star, setStar] = useState(false);
  const [delivery, setDelivery] = useState(0);
  const dialog = useRef(null);
  const dragging = useRef(null);
  const branches = useRef(null);
  const ornament = tree.ornaments[selected];

  function inspect(index) {
    setSelected(index);
    if (!dialog.current.open) dialog.current.showModal();
  }

  function hang(index) {
    setHung(items => items.includes(index) ? items : [...items, index]);
    setSelected(index);
  }

  function beginDrag(event, index) {
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragging.current = { index, x: event.clientX, y: event.clientY };
  }

  function endDrag(event) {
    const drag = dragging.current;
    dragging.current = null;
    if (!drag) return;
    const bounds = branches.current.getBoundingClientRect();
    const arrived = event.clientX >= bounds.left && event.clientX <= bounds.right
      && event.clientY >= bounds.top && event.clientY <= bounds.bottom;
    if (arrived) hang(drag.index);
    else if (Math.hypot(event.clientX - drag.x, event.clientY - drag.y) < 12) inspect(drag.index);
  }

  return <main className="stage tree-stage">
    <h1 tabIndex={-1}>{tree.title}</h1>
    {delivery === 2 && <p className="stage-intro">{tree.instruction}</p>}
    <div className={"tree-room delivery-" + delivery}>
      <span className="cargo-tree tree-branches" aria-hidden="true" />
      <img src={tree.image} alt="" className="car-arrival" />
      <div ref={branches} hidden={delivery !== 2} className={'paper-tree' + (hung.length ? ' tree-lit' : '')}>
        <button className={'tree-star' + (star ? ' star-lit' : '')} type="button" aria-label={tree.star} aria-pressed={star} disabled={!hung.length} onClick={() => setStar(true)}>✦</button>
        <div className="tree-branches" aria-hidden="true" />
        <span className="tree-trunk" aria-hidden="true" />
        {hung.map(index => <button key={index} type="button" className={'hung-item hung-' + index} aria-label={tree.ornaments[index].label} onClick={() => inspect(index)}><Globe item={tree.ornaments[index]} /></button>)}
      </div>
    </div>
    {delivery < 2 && <button className="button button-gold delivery-action" onClick={() => setDelivery(value => value + 1)}>{delivery === 0 ? tree.unload : tree.stand}</button>}
    {delivery === 2 && <div className="ornament-tray">
      {tree.ornaments.map((item, index) => <button key={item.label} type="button" aria-pressed={selected === index} onPointerDown={event => beginDrag(event, index)} onPointerUp={endDrag} onPointerCancel={() => { dragging.current = null; }} onClick={event => { if (event.detail === 0) inspect(index); }}><Globe item={item} />{item.label}</button>)}
    </div>}
    {hung.length > 0 && !star && <p className="star-hint" role="status">{tree.starHint}</p>}
    <dialog className="ornament-dialog" ref={dialog} aria-label={ornament?.label}>
      {ornament && <article className="ornament-memory" key={selected}>
        <h2>{ornament.label}</h2>
        <Globe item={ornament} />
        {ornament.image && <img src={ornament.image} alt="" />}
        <p>{ornament.text}</p>
        {ornament.audio && <Voice src={ornament.audio} controls aria-label={ornament.label} />}
        {!hung.includes(selected) && <button className="button button-gold" onClick={() => { hang(selected); dialog.current.close(); }}>{tree.hang}</button>}
        <button className="text-action" onClick={() => dialog.current.close()}>{tree.close}</button>
      </article>}
    </dialog>
    {star && <div className="leo-envelope">
      {!letter && <span className="leo-guard" title={content.extras.leo}><Cat tuxedo /></span>}
      <button type="button" className="letter-envelope" aria-label={content.extras.openLetter} aria-expanded={letter} onClick={() => setLetter(true)}>
        {letter ? <><span className="paw-print" aria-hidden="true">🐾</span>{tree.letterLabel}</> : <span aria-hidden="true">♥</span>}
      </button>
    </div>}
    {letter && <article className="christmas-letter">
      <h2>{tree.letterLabel}</h2>
      {tree.letter.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
      <button className="button button-gold" onClick={onNext}>{tree.next}</button>
    </article>}
  </main>;
}
