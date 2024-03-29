import VisuallyHidden from '@reach/visually-hidden';
import React, { useEffect, useRef } from 'react';
import { useStyle } from 'styled-hooks';
import { DEFAULTS, IS_DEBUG } from '../constants';
import { useContext, ACTION_TYPES } from '../state';
import { widont } from '../utils/index';
import Power from './Power';

export default function Card({ text, icon, action }) {
  const { state, dispatch } = useContext();
  const { isVisitorBeyondCard, embedAlignment } = state;
  const ref = useRef();
  const className = useStyle`
    position: relative;
    box-sizing: border-box;
    border-radius: 2px;
    padding: ${embedAlignment === 'full' ? '8px 0 0' : '8px 0 0 5px'};
  `;
  const innerClassName = useStyle`
    padding: ${embedAlignment === 'full' ? '10px' : '26px'} 10px 12px;
    background-color: #DDE7EB;

    @media (min-width: 360px) {
      padding: ${embedAlignment === 'full' ? '10px' : '26px'} 16px 18px;
    }

    h3 {
      margin: ${embedAlignment === 'full' ? '2px 30px 10px 0' : '0 0 10px'} !important;
      color: #144f66;
      font-family: ABCSans;
      font-size: ${embedAlignment === 'full' ? '18px' : '16px'} !important;
      font-weight: 600;
      line-height: 1.4;
      letter-spacing: 0.5px;

      &:first-line {
        text-align: left;
      }
    }

    button {
      display: block;
      margin: 0;
      border: 0;
      border-radius: 4px;
      padding: 8px 10px;
      width: 100%;
      background-color: #144f66;
      background-image: linear-gradient(30deg, #1e7799, #144f66);
      box-shadow: 0 4px 10px 0  rgba(20, 79, 102, 0.3);
      color: #fff;
      font-family: ABCSans;
      font-size: ${embedAlignment === 'full' ? '14px' : '12px'};
      font-weight: 400;
      line-height: 1.4;
      text-align: ${embedAlignment === 'full' ? 'center' : 'left'};
      text-transform: uppercase;
      letter-spacing: 1px;
      cursor: pointer;

      @media (min-width: 360px) {
        padding: 10px 16px;
      }
    }
  `;
  const iconClassName = useStyle`
    position: absolute;
    top: 0;
    right: ${embedAlignment === 'full' ? '8px' : 'auto'};
    left: ${embedAlignment === 'full' ? 'auto' : '0'};
  `;

  useEffect(() => {
    function checkVisitorProgress() {
      if (isVisitorBeyondCard) {
        return;
      }

      if (ref.current.getBoundingClientRect().bottom < 0) {
        window.removeEventListener('scroll', checkVisitorProgress);
        dispatch({ type: ACTION_TYPES.SHOW_POWER_CTA });
      }
    }

    window.addEventListener('scroll', checkVisitorProgress);
    checkVisitorProgress();

    return () => {
      window.removeEventListener('scroll', checkVisitorProgress);
    };
  }, [isVisitorBeyondCard]);

  return (
    <div ref={ref} className={className}>
      <div className={innerClassName}>
        <h3>{widont(state.title)}</h3>
        <button onClick={() => dispatch({ type: ACTION_TYPES.OPEN_DIALOG })}>
          {widont(state.cta || DEFAULTS.START_CTA)}
          <VisuallyHidden>{`: ${state.title}`}</VisuallyHidden>
        </button>
      </div>
      <svg
        className={iconClassName}
        xmlns="http://www.w3.org/2000/svg"
        width="30"
        height="29"
        aria-hidden
        onClick={IS_DEBUG ? () => dispatch({ type: ACTION_TYPES.OPEN_DEBUG_DIALOG }) : null}
      >
        <path d="M30 18v11l-9-9H5a5 5 0 0 1-5-5V2a2 2 0 0 1 2-2h26a2 2 0 0 1 2 2v16z" />
      </svg>
    </div>
  );
}
