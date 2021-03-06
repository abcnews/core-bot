import React, { useState } from 'react';
import { useStyle } from 'styled-hooks';
import ImageEmbed from './ImageEmbed';
import VideoEmbed from './VideoEmbed';

export default function GIFEmbed({ animatedSrc, stillSrc, videoSrc, alt, attribution, aspectRatio, color }) {
  const [isPlaying, setIsPlaying] = useState(true);
  const className = useStyle`
    display: block;
    margin: 0;
    border: 0;
    border-radius: inherit;
    padding: 0;
    cursor: pointer;

    & svg {
      position: absolute;
      top: 4px;
      right: 4px;
      fill: rgba(255, 255, 255, 0.5);
      mix-blend-mode: overlay;
    }
  `;

  return (
    <button
      className={className}
      aria-label={`${isPlaying ? 'Pause' : 'Play'} GIF`}
      onClick={() => setIsPlaying(!isPlaying)}
    >
      {videoSrc ? (
        <VideoEmbed
          posterSrc={stillSrc}
          videoSrc={videoSrc}
          alt={alt}
          attribution={attribution}
          aspectRatio={aspectRatio}
          isGIF
          isPlaying={isPlaying}
        />
      ) : (
        <ImageEmbed
          src={isPlaying ? animatedSrc : stillSrc}
          alt={alt}
          attribution={attribution}
          aspectRatio={aspectRatio}
        />
      )}
      <svg role="presentation" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
        {isPlaying ? (
          <path d="M5,3 L9,3 L9,21 L5,21 L5,3 Z M15,3 L19,3 L19,21 L15,21 L15,3 Z" />
        ) : (
          <polygon points="5 4 19 12 5 20" />
        )}
      </svg>
    </button>
  );
}

const GIPHY_API_KEY = 'NPCxpHjXs66QAXHvRoPpJQ94MW8aLvms';

export const GIF_URL_PATTERNS = {
  GFYCAT: /gfycat\.com\/(\w+)/,
  GIPHY: /giphy\.com\/\w+\/(?:\w+-\w+-)?(\w+)/
};

export function resolveGIFEmbedContentProps(props) {
  let id;

  if ((id = (props.url.match(GIF_URL_PATTERNS.GFYCAT) || [])[1])) {
    fetch(`https://api.gfycat.com/v1/gfycats/${id}`)
      .then(response => response.json())
      .then(({ errorMessage, gfyItem }) => {
        if (errorMessage) {
          throw new Error(errorMessage);
        }

        props.animatedSrc = gfyItem.max1mbGif;
        props.stillSrc = gfyItem.mobilePosterUrl;
        props.videoSrc = gfyItem.mp4Url;
        props.alt = `GIF: ${gfyItem.title}`;
        props.attribution = 'Gfycat';
        props.aspectRatio = gfyItem.height / gfyItem.width;
      })
      .catch(err => console.error(err));
  } else if ((id = (props.url.match(GIF_URL_PATTERNS.GIPHY) || [])[1])) {
    fetch(`https://api.giphy.com/v1/gifs/${id}?api_key=${GIPHY_API_KEY}`)
      .then(response => response.json())
      .then(({ data, meta }) => {
        if (meta.status !== 200) {
          throw new Error(meta.msg);
        }

        props.animatedSrc = data.images.original.url;
        props.stillSrc = data.images.original_still.url;
        props.videoSrc = data.images.original.mp4;
        props.alt = `GIF: ${data.title}`;
        props.attribution = 'Giphy';
        props.aspectRatio = data.images.original.height / data.images.original.width;
      })
      .catch(err => console.error(err));
  }
}
