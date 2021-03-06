import { disableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock';
import React, { useEffect, useLayoutEffect, useRef } from 'react';
import scrollIntoView from 'scroll-into-view';
import { useStyle } from 'styled-hooks';
import { useContext, ACTION_TYPES } from '../state';
import Bubble from './Bubble';
import Prompts from './Prompts';
import Status from './Status';

const IS_SMOOTH_SCROLL_SUPPORTED = 'scrollBehavior' in document.documentElement.style;
const SCROLL_INTO_VIEW_ARG = IS_SMOOTH_SCROLL_SUPPORTED
  ? { behavior: 'smooth', block: 'end', inline: 'nearest' }
  : false;
const NON_ALPHA_PATTERN = /[\W]+/g;

export default function Chat() {
  const { state, dispatch } = useContext();
  const { hasEnded, history, isHostComposing, prompts, isStatic } = state;
  const ref = useRef();
  const bottomRef = useRef();
  const className = useStyle`
    overflow-y: scroll;
    -webkit-overflow-scrolling: touch;
    scroll-behavior: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;

    &::-webkit-scrollbar {
      width: 0;
      height: 0;
    }
  `;
  const bubblesClassName = useStyle`
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: flex-start;
    margin: 0;
    padding: 0;
  `;
  const bottomClassName = useStyle`
    margin-top: 15px;
    height: 1px;
  `;

  useLayoutEffect(() => {
    if (isStatic) {
      return;
    }

    if (ref.current) {
      // Pad enough to allow the initial bubble to be scrolled to the bottom of the chat
      ref.current.style.paddingTop = `${ref.current.parentElement.offsetHeight - 75}px`;
      // Start scrolled to the bottom
      ref.current.scrollTop = ref.current.scrollHeight;
      // Stop body from scrolling
      disableBodyScroll(ref.current);
    }

    if (!history.length) {
      dispatch({ type: ACTION_TYPES.HOST_START, payload: { dispatch } });
    }

    return () => {
      // Enable body scrolling ro resume on un-mount;
      clearAllBodyScrollLocks();
    };
  }, []);

  useEffect(() => {
    if (isStatic) {
      return;
    }

    // Scroll to the bottom when content is added, but only if the
    // visitor isn't currenlty scrolling (including flick inertia)
    const initialScrollTop = ref.current.scrollTop;

    requestAnimationFrame(() => {
      if (!ref.current || initialScrollTop !== ref.current.scrollTop) {
        return;
      }

      scrollIntoView(bottomRef.current, {
        time: 500,
        validTarget: target => target === ref.current
      });
    });
  }, [history.length, prompts.length, isHostComposing, hasEnded]);

  function onPotentialExitLink(event) {
    if (isStatic) {
      return;
    }

    function traverse(node) {
      if (!node || node === ref.current) {
        return;
      }

      if (node.localName !== 'a' || node.href === undefined) {
        return traverse(node.parentNode);
      }

      return node;
    }

    const linkEl = traverse(event.target);

    if (!linkEl) {
      return;
    }

    const url = linkEl.getAttribute('href');

    if (url) {
      dispatch({ type: ACTION_TYPES.EXIT_LINK, payload: url.replace(NON_ALPHA_PATTERN, '-') });
    }
  }

  return (
    <div ref={ref} className={className} onClick={onPotentialExitLink}>
      <ul className={bubblesClassName} role="log" aria-live="polite" aria-label="Chat Log" aria-atomic="false">
        {history.map((props, index) => (
          <Bubble key={index} isLast={index + 1 === history.length && prompts.length === 0} {...props} />
        ))}
        {isHostComposing && <Bubble key={'composing'} isComposer={true} />}
        {hasEnded && <Status text="The chat has ended" />}
      </ul>
      <Prompts />
      <div ref={bottomRef} className={bottomClassName} />
    </div>
  );
}
