import { DialogOverlay, DialogContent } from '@reach/dialog';
import React from 'react';
import { useStyle } from 'styled-hooks';
import { CUBIC_BEZIER_EASING } from '../constants';
import { useContext, ACTION_TYPES } from '../state';
import { useViewportHeight } from '../utils/hooks';
import Power from './Power';

export default function Dialog({ children, isDebug }) {
  const { state, dispatch } = useContext();
  const viewportHeight = useViewportHeight();
  const overlayClassName = useStyle`
    z-index: 10000;
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    overflow: auto;
    background: rgba(0, 18, 26, 0.8);
    animation: enterOverlay 1s ${CUBIC_BEZIER_EASING} both;

    @keyframes enterOverlay {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
  `;
  const contentClassName = useStyle`
    position: fixed;
    right: 12px;
    bottom: 68px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    box-sizing: border-box;
    overflow: hidden;
    margin: 0;
    width: calc(100vw - 24px);
    height: ${viewportHeight - 80}px;
    background: rgb(237, 241, 242);
    box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.2);
    animation: enterContent 0.75s 0.25s ${CUBIC_BEZIER_EASING} both;

    @keyframes enterContent {
      0% {
        opacity: 0;
        transform: 'translate(0, 16px)';

      }
      50% {
        opacity: 1;
      }
      100% {
        transforom: none;
      }
    }

    @keyframes enterContentPositionRelative {
      0% {
        opacity: 0;
        transform: ${state.dialogPosition === 'middle' ? 'translate(-50%, calc(-50% + 16px))' : 'translate(0, 16px)'};

      }
      50% {
        opacity: 1;
      }
      100% {
        transforom: none;
      }
    }

    @media (min-width: 480px) {
      transform: ${state.dialogPosition === 'middle' ? 'translate(-50%, -50%)' : 'none'};
      top: ${state.dialogPosition === 'middle' ? 'calc(50% - 68px)' : 'auto'};
      right: ${state.dialogPosition === 'middle' ? 'auto' : '32px'};
      bottom: ${state.dialogPosition === 'middle' ? 'auto' : '68px'};
      left: ${state.dialogPosition === 'middle' ? '50%' : 'auto'};
      max-width: 345px;
      animation-name: enterContentPositionRelative;
    }

    @media (min-width: 720px) {
      max-width: 480px;
    }

    @media (min-width: 480px) and (min-height: 720px) {
      top: ${state.dialogPosition === 'middle' ? 'calc(50% - 88px)' : 'auto'};
      bottom: ${state.dialogPosition === 'middle' ? 'auto' : '88px'};
      height: ${viewportHeight - 100}px;
      max-height: 480px;
    }

    @media (min-width: 720px) and (min-height: 960px) {
      max-height: 720px;
    }

    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 48px;
      background-image: linear-gradient(to bottom, rgba(237, 241, 242, 1), rgba(237, 241, 242, 0));
      pointer-events: none;
    }
  `;

  const debugContentClassName = useStyle`
    right: 0 !important;
    bottom: 0 !important;
    width: 100vw !important;
    height: ${viewportHeight}px !important;
    max-width: none !important;
    max-height: none !important;
    background: #ffc200 !important;
    animation: none !important;

    &::after {
      content: none;
    }
  `;

  function close() {
    dispatch({ type: ACTION_TYPES.CLOSE_DIALOG });
  }

  return (
    <DialogOverlay className={overlayClassName} onDismiss={close}>
      <Power isOn onClick={close} />
      <DialogContent className={`${contentClassName}${isDebug ? ` ${debugContentClassName}` : ''}`}>
        {React.Children.only(children)}
      </DialogContent>
    </DialogOverlay>
  );
}
