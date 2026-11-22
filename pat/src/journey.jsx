import React, { useEffect, useRef, useState } from 'react';
import { geoEqualEarth, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import atlas from 'world-atlas/countries-110m.json';
import content from './content';
import { playEffect } from './audio';
import { Suitcase } from './suitcase';

const land = feature(atlas, atlas.objects.land);
const countries = feature(atlas, atlas.objects.countries).features;
const visitedCountryIds = { England: '826', Österreich: '040', Spanien: '724', Portugal: '620', Vietnam: '704' };
const world = geoEqualEarth().fitExtent([[10, 10], [590, 300]], { type: 'Sphere' });

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

  function openCracker(index) {
    playEffect('cracker');
    setChoice(index);
  }

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
    if (distance < 12 || distance >= 45) openCracker(index);
  }

  return <main className="start stage">
    <p className="eyebrow">{opening.label}</p>
    <h1 tabIndex={-1}>{opening.title}</h1>
    <p className="stage-intro">{opening.instruction}</p>
    <div className="cracker-row">
      {opening.crackers.map(({ label }, index) => <button key={label} data-sound="cracker" className={'cracker cracker-' + index + (choice === index ? ' popped' : '')} disabled={choice !== null}
        style={{ '--pull': (pull?.index === index ? pull.distance : 0) + 'px' }}
        onPointerDown={event => pointerDown(event, index)} onPointerMove={event => pointerMove(event, index)}
        onPointerUp={event => pointerUp(event, index)} onPointerCancel={() => { gesture.current = null; setPull(null); }}
        onClick={event => { if (event.detail === 0) openCracker(index); }}>
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

const flightStart = .85;
const flightLeg = .52;
const arrival = index => flightStart + (index + 1) * flightLeg;

function MapPanel({ cities }) {
  const title = content.ride.map;
  const path = geoPath(world);
  const coordinates = cities.map(city => world(city.location));
  const stops = [[300, 8], ...coordinates];
  const distances = [0];
  for (let i = 1; i < stops.length; i++) {
    distances.push(distances[i - 1] + Math.hypot(stops[i][0] - stops[i - 1][0], stops[i][1] - stops[i - 1][1]));
  }
  const motionPath = 'M' + stops.map(point => point.join(',')).join(' L');
  const countryIds = [...new Set(cities.map(city => visitedCountryIds[city.region]).filter(Boolean))];

  return <div className="map-panel">
    <p>{title}</p>
    <svg viewBox="0 0 600 310" aria-label={title} role="img">
      <path className="land" d={path(land)} />
      {countryIds.map(id => {
        const country = countries.find(item => item.id === id);
        const firstStop = cities.findIndex(city => visitedCountryIds[city.region] === id);
        return country && <path key={id} className="visited-country" style={{ '--arrival': arrival(firstStop) + 's' }} d={path(country)} />;
      })}
      {coordinates.map((point, index) => <line key={cities[index].name} className="flight-leg" pathLength="1"
        x1={stops[index][0]} y1={stops[index][1]} x2={point[0]} y2={point[1]}
        style={{ '--departure': (flightStart + index * flightLeg) + 's', '--flight-leg': flightLeg + 's' }} />)}
      {cities.map((city, index) => <g className="pin" key={city.name} style={{ '--arrival': arrival(index) + 's' }} transform={`translate(${coordinates[index].join(' ')})`}>
        <title>{content.passports.stopLabels[city.name] ?? city.name}</title>
        <circle r="3" />
      </g>)}
      <g className="map-plane" aria-hidden="true" style={{ '--takeoff': flightStart + 's', '--flight-time': (cities.length * flightLeg) + 's' }}>
        <animateMotion path={motionPath} begin={flightStart + 's'} dur={(cities.length * flightLeg) + 's'} rotate="auto"
          calcMode="linear" keyTimes={stops.map((_, index) => index / cities.length).join(';')}
          keyPoints={distances.map(distance => distance / distances.at(-1)).join(';')} fill="freeze" />
        <path d="M9 0 3 -2 -2 -10 -5 -10 -3 -2 -7 -2 -10 -5 -12 -5 -10 0 -12 5 -10 5 -7 2 -3 2 -5 10 -2 10 3 2Z" />
      </g>
    </svg>
  </div>;
}

function Postcard({ city, choice, onAnswer }) {
  const { ride } = content;
  const quiz = city.quiz;
  if (quiz && choice === undefined) return <article className="quiz-card">
    <p className="eyebrow">{ride.quizLabel}</p>
    <h2>{quiz.prompt}</h2>
    <div className="quiz-options">
      {quiz.choices.map((label, answer) => <button type="button" key={label} onClick={() => onAnswer(answer)}>{label}</button>)}
    </div>
  </article>;
  return <article className="city-postcard inline-postcard">
    {city.image ? <img src={city.image} alt={city.alt} /> : <div className="photo-placeholder"><span aria-hidden="true">✷</span>{ride.photoPlaceholder}</div>}
    <div className="postcard-caption">
      <h2>{city.name}</h2>
      <p>{city.region}</p>
      {city.note && <p className="city-note">{city.note}</p>}
      {quiz && choice !== quiz.answer && <p aria-live="polite">{ride.incorrect}</p>}
    </div>
  </article>;
}

function SuitcaseDeparture({ onNext, children }) {
  const [leaving, setLeaving] = useState(false);
  const [offset, setOffset] = useState(0);
  const start = useRef(null);

  useEffect(() => {
    if (!leaving) return;
    const duration = matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 720;
    const timer = setTimeout(onNext, duration);
    return () => clearTimeout(timer);
  }, [leaving, onNext]);

  return <div className="suitcase-departure">
    <p>{content.ride.suitcaseHint}</p>
    <div className={leaving ? 'suitcase-walk is-leaving' : 'suitcase-walk'} style={{ '--drag-x': offset + 'px' }}
      onPointerDown={event => {
        if (event.button !== 0 || leaving || event.target.closest('button')) return;
        start.current = event.clientX;
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={event => { if (start.current !== null) setOffset(Math.max(0, event.clientX - start.current)); }}
      onPointerUp={event => {
        if (start.current === null) return;
        if (event.clientX - start.current > 45) setLeaving(true);
        else setOffset(0);
        start.current = null;
      }}
      onPointerCancel={() => { start.current = null; setOffset(0); }}>
      {children}
    </div>
    <button type="button" className="button button-gold" disabled={leaving} onClick={() => setLeaving(true)}>{content.ride.next}</button>
  </div>;
}

export function Ride({ onNext }) {
  const { ride } = content;
  const [count, setCount] = useState(0);
  const [turning, setTurning] = useState(false);
  const machineClip = useRef(null);
  const [selected, setSelected] = useState(null);
  const [collected, setCollected] = useState(0);
  const [packing, setPacking] = useState(false);
  const caseArea = useRef(null);
  const [answers, setAnswers] = useState({});
  const cities = ride.cities.slice(0, count);
  const active = cities[selected];
  const pending = collected < count ? cities[collected] : null;
  const photoReady = pending && (!pending.quiz || answers[pending.name] !== undefined);
  const waiting = Boolean(pending);
  const completed = count >= ride.cities.length;

  useEffect(() => {
    if (!photoReady) return;
    const timer = setTimeout(() => setPacking(true), 2700);
    return () => clearTimeout(timer);
  }, [photoReady]);

  useEffect(() => {
    if (!packing) return;
    const area = caseArea.current;
    const photo = area.querySelector('.inline-postcard img, .photo-placeholder');
    const target = area.querySelector('[data-sticker-target]');
    function land() {
      setCollected(count);
      setSelected(null);
      setPacking(false);
    }
    if (!photo || !target || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      land();
      return;
    }

    const from = photo.getBoundingClientRect();
    const to = target.getBoundingClientRect();
    const flying = photo.cloneNode(true);
    flying.setAttribute('aria-hidden', 'true');
    flying.classList.add('flying-memory');
    Object.assign(flying.style, {
      left: from.left + 'px', top: from.top + 'px',
      width: from.width + 'px', height: from.height + 'px',
    });
    document.body.append(flying);
    const x = to.left + (to.width - from.width) / 2 - from.left;
    const y = to.top + (to.height - from.height) / 2 - from.top;
    const scale = Math.min(to.width / from.width, to.height / from.height);
    const animation = flying.animate([
      { transform: 'translate(0, 0) scale(1)', opacity: 1 },
      { transform: `translate(${x}px, ${y}px) rotate(-9deg) scale(${scale})`, opacity: 0 },
    ], { duration: 570, easing: 'cubic-bezier(.22,.72,.22,1)', fill: 'both' });
    animation.onfinish = land;
    return () => { animation.cancel(); flying.remove(); };
  }, [packing, count]);

  function turn() {
    machineClip.current?.pause();
    machineClip.current = playEffect('machine');
    setTurning(true);
  }

  useEffect(() => () => machineClip.current?.pause(), []);

  useEffect(() => {
    if (!turning) return;
    const delay = matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 640;
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
            <button className="knob" type="button" aria-label={ride.turn} disabled={turning || completed || waiting} data-sound="machine" onClick={turn}><span /></button>
            <div className="chute" aria-hidden="true">{count > 0 && <span key={count} className="dispensed" />}</div>
          </div>
        </div>
        {!completed && <button className="button button-gold" disabled={turning || waiting} data-sound="machine" onClick={turn}>{turning ? ride.turning : ride.turn}</button>}
        <p className="ride-count" aria-live="polite" aria-atomic="true">{count}/{ride.cities.length} {ride.progress}</p>
        {completed && !waiting && <p className="machine-status">{ride.complete}</p>}
      </div>
      <div className="map-grid memory-case" ref={caseArea}>
        {completed && !waiting ? <SuitcaseDeparture onNext={onNext}>
          <Suitcase cities={cities} selected={selected} onSelect={index => setSelected(current => current === index ? null : index)} />
        </SuitcaseDeparture> : <Suitcase cities={cities} pending={pending} selected={selected}
          onSelect={index => { if (!waiting) setSelected(current => current === index ? null : index); }} />}
        {active && <div className={'postcard-slot memory-pop' + (packing ? ' memory-packing' : '')}>
          <Postcard key={active.name} city={active} choice={answers[active.name]} onAnswer={answer => setAnswers(previous => ({ ...previous, [active.name]: answer }))} />
          {(!pending || photoReady) && <button type="button" className="text-action memory-dismiss"
            onClick={() => pending ? setPacking(true) : setSelected(null)}>{pending ? ride.packPhoto : ride.closePhoto}</button>}
        </div>}
      </div>
    </div>
  </main>;
}


export function Passports({ onNext }) {
  const { passports, ride } = content;
  const [opened, setOpened] = useState(false);
  const openedRef = useRef(false);
  const touchY = useRef(null);
  const stops = ride.cities;

  function open() {
    if (openedRef.current) return;
    openedRef.current = true;
    playEffect('page', .42);
    setOpened(true);
  }

  return <main className="stage passports-stage"
    onWheel={event => { if (event.deltaY > 0) open(); }}
    onTouchStart={event => { touchY.current = event.touches[0].clientY; }}
    onTouchMove={event => { if (touchY.current !== null && touchY.current - event.touches[0].clientY > 28) open(); }}
    onTouchEnd={() => { touchY.current = null; }}
    onTouchCancel={() => { touchY.current = null; }}>
    <h1 tabIndex={-1}>{passports.title}</h1>
    <button type="button" className="passport-pair" aria-label={passports.open} aria-expanded={opened}
      aria-controls="passport-map" data-sound="page" onClick={open}>
      <span className="passport-glow" aria-hidden="true" />
      {passports.owners.map((owner, index) => <span key={owner.name} className={'passport passport-' + index}>
        <span className="passport-paper" aria-hidden="true"><b>{owner.name}</b><span>{owner.country}</span></span>
        <span className="passport-cover"><img src={owner.cover} alt={owner.inscription} /></span>
      </span>)}
    </button>
    {!opened && <p className="passport-hint">{passports.hint}</p>}
    {opened && <div id="passport-map" className="passport-map">
      <MapPanel cities={stops} />
      <ul className="passport-stops">{stops.map((city, index) => <li key={city.name} style={{ '--arrival': arrival(index) + 's' }}>{passports.stopLabels[city.name] ?? city.name}</li>)}</ul>
      <button type="button" className="button button-gold" onClick={onNext}>{passports.next}</button>
    </div>}
  </main>;
}
