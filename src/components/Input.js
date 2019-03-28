import React, { useEffect, useRef, useState } from 'react';
import { useStyle } from 'styled-hooks';
import { useContext, ACTION_TYPES } from '../state';

export default function Input() {
  const { state, dispatch } = useContext();
  const { prompts } = state;

  const className = useStyle`
    padding: 0 8px;
    background-color: #eee;
    box-shadow: inset 0 4px 4px -2px rgba(0,0,0,0.25);

    &:not(:empty) {
      animation: inputEnter 0.25s backwards;
    }

    @keyframes inputEnter {
      from {
        transform: translate(0, 100%);
      }
      to {
        transform: none;
      }
    }
  `;

  const promptClassName = useStyle`
    display: block;
    margin: 8px 0 8px auto;
    border: 0;
    border-radius: 4px;
    padding: 8px 12px;
    background-color: #01cfff;
    color: #000;
    font-family: ABCSans;
    font-size: 16px;
    font-weight: 300;
    transition: opacity .5s, transform .5s;
    animation: promptEnter 0.75s backwards;

    @keyframes promptEnter {
      from {
        opacity: 0;
        transform: translate(12px, 0);
      }
      to {
        transform: none;
        opacity: 1;
      }
    }

    &:first-child {
      margin-top: 12px;
    }

    &[disabled]:not(:focus) {
      opacity: 0;
    }

    &[disabled]:focus {
      transform: translate(-300%, 0);
    }
  `;

  const key = prompts.map(({ id }) => id).join('_');

  return (
    <div key={key} className={className}>
      {prompts.map(({ targetNodeId, markup }, index) => (
        <button
          key={`${index}-of-${key}`}
          style={{ animationDelay: `${0.25 + index * 0.125}s` }}
          className={promptClassName}
          onClick={() => dispatch({ type: ACTION_TYPES.CHOOSE_PROMPT, data: { targetNodeId, markup, dispatch } })}
          dangerouslySetInnerHTML={{ __html: markup }}
        />
      ))}
    </div>
  );
}