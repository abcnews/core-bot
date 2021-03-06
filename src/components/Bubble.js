import React, { useLayoutEffect, useRef } from 'react';
import { useStyle } from 'styled-hooks';
import Ellipsis from './Ellipsis';
import { DEFAULTS, CUBIC_BEZIER_EASING } from '../constants';
import { renderContent } from '../content';
import { useContext } from '../state';

const TRANSPARENT_BOX_SHADOW = '0 5px 20px 0  rgba(20, 79, 102, 0)';

export default function Bubble({
  contentId,
  isGuest = false,
  box,
  parentBox,
  isLast,
  isComposer,
  /*sink*/ children,
  ...props
}) {
  const { state } = useContext();
  const { author, isStatic } = state;
  const className = useStyle`
    transform-origin: top right;
    position: relative;
    align-self: ${isGuest ? 'flex-end' : 'flex-start'};
    box-sizing: content-box;
    margin: ${isGuest ? `16px 0 0 16px` : '32px 16px 0 0'};
    border-radius: ${isGuest ? '4px 0 0 12px' : ' 0 4px 12px 0'};
    padding: 0;
    max-width: calc(100% - 16px);
    background-color: ${isGuest ? '#144f66' : '#fff'};
    background-image: none;
    box-shadow: ${isGuest ? '0 5px 20px 0  rgba(20, 79, 102, 0.2)' : '0 5px 20px 0  rgba(20, 79, 102, 0.2)'};
    color: ${isGuest ? '#fff' : '#000'};
    list-style: none;

    &[data-is-host] {
      &[data-is-last] {
        animation: ${isStatic ? 'none' : `enterHost 0.75s ${CUBIC_BEZIER_EASING} forwards`};
      }

      &::before {
        content: ${`'${author || DEFAULTS.AUTHOR}'`};
        position: absolute;
        top: -20px;
        left: 16px;
        color: #144f66;
        font-family: ABCSans;
        font-size: 11px;
        font-weight: 300;
        letter-spacing: 0.25px;
        white-space: nowrap;
      }

      @keyframes enterHost {
        from {
          transform: translate(-100%, 0);
        }
        to {
          transforom: none;
        }
      }
    }

    &[data-is-host] + &[data-is-host] {
      margin-top: 10px;
    }

    &[data-is-composer] {
      margin-bottom: 60px;
    }
    
    &[data-is-composer]::before,
    &[data-is-host] + &[data-is-host]::before {
      content: ' ';
    }

    &[data-is-guest] {
      transition: margin-bottom 0.5s;

      &::after {
        content: '';
        z-index: -1;
        position: absolute;
        top: 0;
        left: 0;
        border-radius: inherit;
        width: ${box ? box.width : 0}px;
        height: 100%;
        background-color: inherit;
      }
    }

    & a {
      color: ${isGuest ? 'inherit' : '#002aff'};
      text-decoration: ${isGuest ? 'underline' : 'none'};;
    }
  `;

  const ref = useRef();

  useLayoutEffect(() => {
    if (isStatic) {
      return;
    }

    if (isGuest && isLast && box) {
      const el = ref.current;
      const from = box;
      const to = el.getBoundingClientRect();

      el.animate.apply(
        el,
        promptToBubbleAnimation({
          x: from.left - to.left,
          y: from.top - to.top
        })
      );
    }
  }, []);

  return (
    <li
      ref={ref}
      className={className}
      style={{ marginBottom: box && parentBox && isLast ? `${parentBox.height - box.height}px` : 0 }}
      data-actor={isGuest ? 'guest' : 'host'}
      data-is-composer={isComposer ? '' : null}
      data-is-guest={isGuest ? '' : null}
      data-is-host={!isGuest ? '' : null}
      data-is-last={isLast || isComposer ? '' : null}
      {...props}
    >
      {isComposer ? <Ellipsis /> : renderContent(contentId)}
    </li>
  );
}

function promptToBubbleAnimation({ x, y }) {
  return [
    [
      {
        easing: CUBIC_BEZIER_EASING,
        opacity: 1,
        transform: `translate(${x}px, ${y}px)`,
        borderRadius: '4px',
        boxShadow: TRANSPARENT_BOX_SHADOW
      },
      {
        easing: CUBIC_BEZIER_EASING,
        opacity: 1,
        transform: `translate(0, ${y}px)`,
        borderRadius: '4px 0 0 12px',
        boxShadow: TRANSPARENT_BOX_SHADOW
      },
      {
        opacity: 1,
        transform: 'none',
        borderRadius: '4px 0 0 12px',
        boxShadow: TRANSPARENT_BOX_SHADOW.replace(')', '.15)')
      }
    ],
    {
      duration: 750,
      fill: 'forwards'
    }
  ];
}
