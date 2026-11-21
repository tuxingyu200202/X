import React from 'react';

const art = {
  clock: <><path fill="#af693c" d="M13 29V12h-2l7-9 7 9h-2v17z"/><circle cx="18" cy="16" r="4" fill="#fff2c9"/><path d="M18 13v3l2 1" fill="none" stroke="#583928"/></>,
  arrow: <><path d="M9 5q21 12 0 24M9 5l5 12-5 12" fill="none" stroke="#574035" strokeWidth="2"/><path d="M5 17h26m-6-4 6 4-6 4" fill="none" stroke="#b54343" strokeWidth="3"/></>,
  wheel: <><path d="m11 29 7-14 7 14zM18 5v21M7 16h22M10 8l16 16M26 8 10 24" fill="none" stroke="#304d55" strokeWidth="1.6"/><circle cx="18" cy="16" r="11" fill="none" stroke="#a44843" strokeWidth="3"/></>,
  dragon: <><path fill="#3f7254" d="M5 26q5-8 13-6l-5-10 8 3 2-5 5 4 3 7-6 2q0 12-14 9l2-4z"/><circle cx="26" cy="15" r="1.4" fill="#fff0ad"/></>,
  bee: <><ellipse cx="13" cy="11" rx="6" ry="5" fill="#fcf3e1"/><ellipse cx="22" cy="10" rx="6" ry="5" fill="#fcf3e1"/><ellipse cx="18" cy="20" rx="11" ry="7" fill="#ca841a"/><path d="M14 14q-4 6 0 12m6-13q-3 7 1 14" fill="none" stroke="#41352a" strokeWidth="3"/></>,
  almond: <><path d="M8 30 27 7" stroke="#5c663a" strokeWidth="3"/><path d="M17 21q-10-1-8-8 8-1 8 8" fill="#66834b"/><path d="M24 13c-9 0-10-7-4-8 0-7 7-7 8-1 7-1 8 6 4 9-1 5-7 5-8 0" fill="#c45c74"/><circle cx="25" cy="8" r="2" fill="#fff0af"/></>,
  tram: <><path d="M10 11h16l3 5v10H7V16z" fill="#bd741c" stroke="#593924" strokeWidth="1.5"/><path d="M10 14h16v7H10z" fill="#fff4d5"/><path d="M18 14v7m0-10 6-5M4 30h28" stroke="#593924" strokeWidth="2"/><circle cx="12" cy="26" r="3" fill="#593924"/><circle cx="24" cy="26" r="3" fill="#593924"/></>,
  bridge: <><path d="M3 26h30M8 26v5m20-5v5" stroke="#356b75" strokeWidth="3"/><path d="M3 23q6-17 12-3 5-16 11-3l5-9 3 5-2 6" fill="none" stroke="#a95020" strokeWidth="4"/></>,
  cake: <><path d="m4 17 25-9 3 8-27 4z" fill="#bb7847"/><path fill="#d89b56" d="M5 19l27-4v12L5 30z"/><path d="m5 24 27-4M12 15l14-4m-10 6 8-7" stroke="#883f42" strokeWidth="2"/></>,
};

export function StickerArt({ icon }) {
  if (!art[icon]) return null;
  return <svg viewBox="0 0 36 34" aria-hidden="true">{art[icon]}</svg>;
}
