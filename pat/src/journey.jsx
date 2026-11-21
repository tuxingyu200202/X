import React, { useEffect, useRef, useState } from 'react';
import { geoEqualEarth, geoMercator, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import atlas from 'world-atlas/land-110m.json';
import content from './content';
import { Suitcase } from './suitcase';

const land = feature(atlas, atlas.objects.land);
const world = geoEqualEarth().fitExtent([[10, 10], [590, 300]], { type: 'Sphere' });
const europe = geoMercator().center([5, 47]).scale(365).translate([160, 100]).clipExtent([[0, 0], [320, 200]]);

export function Opening({ onOpen }) {
  const [choice, setChoice] = useState(null);
  const [pull, setPull] = useState(null);
  const [reply, setReply] = useState('');
  const gesture = useRef(null);
  const { opening } = content;

  useEffect(() => {
    if (choice === null) return;
    const delay = matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 550;
    const cracker = opening.crackers[choice];
    const timer = setTimeout(() => {
      if (cracker.accepts) onOpen();
      else {
        setReply(cracker.reply);
        setChoice(null);
      }
    }, delay);
    return () => clearTimeout(timer);
  }, [choice, onOpen, opening]);

  function pointerDown(event, index) {
    if (choice !== null || event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    gesture.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
    setPull({ index, distance: 0 });
  }

  function pointerMove(event, index) {
    if (gesture.current?.id !== event.pointerId) return;
    const distance = Math.hypot(event.clientX - gesture.current.x, event.clientY - gesture.current.y);
    setPull({ index, distance: Math.min(distance / 2, 44) });
  }

  function pointerUp(event, index) {
    if (gesture.current?.id !== event.pointerId) return;
    const distance = Math.hypot(event.clientX - gesture.current.x, event.clientY - gesture.current.y);
    gesture.current = null;
    setPull(null);
    // A tap also opens a cracker, while a short accidental drag leaves it in place.
    if (distance < 12 || distance >= 45) setChoice(index);
  }

  return <main className="start stage">
    <p className="eyebrow">{opening.label}</p>
    <h1 tabIndex={-1}>{opening.title}</h1>
    <p className="stage-intro">{opening.instruction}</p>
    <div className="cracker-row">
      {opening.crackers.map(({ label }, index) => <button key={label} className={'cracker cracker-' + index + (choice === index ? ' popped' : '')} disabled={choice !== null}
        style={{ '--pull': (pull?.index === index ? pull.distance : 0) + 'px' }}
        onPointerDown={event => pointerDown(event, index)} onPointerMove={event => pointerMove(event, index)}
        onPointerUp={event => pointerUp(event, index)} onPointerCancel={() => { gesture.current = null; setPull(null); }}
        onClick={event => { if (event.detail === 0) setChoice(index); }}>
        <span className="cracker-end upper" aria-hidden="true" />
        <span className="cracker-bow upper-bow" aria-hidden="true">⋈</span>
        <span className="cracker-core"><i aria-hidden="true">{['✿','♥','✹'][index % 3]}</i><strong>{label}</strong><i aria-hidden="true">✦</i></span>
        <span className="cracker-bow lower-bow" aria-hidden="true">⋈</span>
        <span className="cracker-end lower" aria-hidden="true" />
      </button>)}
    </div>
    <p className="cracker-reply" aria-live="polite">{reply}</p>
  </main>;
}

function MapPanel({ cities, active, region }) {
  const projection = region ? europe : world;
  const viewBox = region ? '0 0 320 200' : '0 0 600 310';
  const title = region ? content.ride.europe : content.ride.map;
  const visible = cities.filter(city => !region || (city.location[0] >= -15 && city.location[0] <= 25));
  const coordinates = visible.map(city => projection(city.location));

  return <div className={'map-panel' + (region ? ' region' : '')}>
    <p>{title}</p>
    <svg viewBox={viewBox} aria-label={title} role="img">
      <path className="land" d={geoPath(projection)(land)} />
      {coordinates.length > 1 && <polyline className="route" points={coordinates.map(point => point.join(',')).join(' ')} />}
      {visible.map((city, index) => <g className={city === active ? 'pin latest' : 'pin'} key={city.name} transform={`translate(${coordinates[index].join(' ')})`}>
        <title>{city.name}</title>
        <circle r={region ? 4 : 3} />
      </g>)}
    </svg>
  </div>;
}

function Postcard({ city, index }) {
  const { ride } = content;
  const [choice, setChoice] = useState(null);
  const quiz = city.quiz;
  return <article className="city-postcard inline-postcard">
    {city.image ? <img src={city.image} alt={city.alt} /> : <div className="photo-placeholder"><span aria-hidden="true">✷</span>{ride.photoPlaceholder}</div>}
    <div className="postcard-caption">
      <p className="eyebrow">{ride.reveal} {index + 1}</p>
      <h2>{city.name}</h2>
      <p>{city.region}</p>
      {city.note && <p className="city-note">{city.note}</p>}
    </div>
    {quiz && <details className="optional-quiz">
      <summary>{ride.quizLabel}</summary>
      <p>{quiz.prompt}</p>
      <div className="quiz-options">
        {quiz.choices.map((label, answer) => <button type="button" key={label} aria-pressed={choice === answer} onClick={() => setChoice(answer)}>{label}</button>)}
      </div>
      <p aria-live="polite">{choice !== null && (choice === quiz.answer ? ride.correct : ride.incorrect)}</p>
    </details>}
  </article>;
}

export function Ride({ onNext }) {
  const { ride } = content;
  const [count, setCount] = useState(0);
  const [turning, setTurning] = useState(false);
  const [selected, setSelected] = useState(0);
  const cities = ride.cities.slice(0, count);
  const active = cities[selected];
  const completed = count >= ride.cities.length;

  useEffect(() => {
    if (!turning) return;
    const delay = matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 220;
    const timer = setTimeout(() => {
      setSelected(count);
      setCount(count + 1);
      setTurning(false);
    }, delay);
    return () => clearTimeout(timer);
  }, [turning, count]);

  return <main className="stage ride">
    <p className="eyebrow">{ride.label}</p><h1 tabIndex={-1}>{ride.title}</h1><p className="stage-intro">{ride.intro}</p>
    <div className="ride-layout">
      <div className="machine-column">
        <div className={'machine' + (turning ? ' turning' : '')}>
          <div className="dome" aria-hidden="true">{Array.from({ length: Math.min(9, ride.cities.length - count) }, (_, index) => <span key={index} />)}</div>
          <div className="machine-body">
            <button className="knob" type="button" aria-label={ride.turn} disabled={turning || completed} onClick={() => setTurning(true)}><span /></button>
            <div className="chute" aria-hidden="true">{count > 0 && <span key={count} className="dispensed" />}</div>
          </div>
        </div>
        {!completed && <button className="button button-gold" disabled={turning} onClick={() => setTurning(true)}>{turning ? ride.turning : ride.turn}</button>}
        {completed && <><p className="machine-status">{ride.complete}</p><button className="button button-gold" onClick={onNext}>{ride.next}</button></>}
        <p className="ride-count" aria-live="polite">{count} / {ride.cities.length} {ride.progress}</p>
      </div>
      <div className="map-grid">
        <div className="postcard-slot">
          {active ? <Postcard key={active.name} city={active} index={selected} /> : <p>{ride.empty}</p>}
        </div>
        <Suitcase cities={cities} selected={selected} onSelect={setSelected} />
        <MapPanel cities={cities} active={active} />
        <MapPanel cities={cities} active={active} region />
      </div>
    </div>
  </main>;
}
