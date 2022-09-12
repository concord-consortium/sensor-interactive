import React from "react"

export const SliderIcon = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 38 38">
        <defs>
            <filter id="jk8sb59w0a" width="140%" height="140%" x="-20%" y="-20%" filterUnits="objectBoundingBox">
                <feOffset in="SourceAlpha" result="shadowOffsetOuter1"/>
                <feGaussianBlur in="shadowOffsetOuter1" result="shadowBlurOuter1" stdDeviation="2"/>
                <feColorMatrix in="shadowBlurOuter1" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.35 0"/>
            </filter>
            <path id="beoz3mm3zb" d="M15 0C6.717 0 0 6.717 0 15c0 8.283 6.717 15 15 15 8.283 0 15-6.717 15-15 0-8.283-6.717-15-15-15"/>
        </defs>
        <g fill="none" fill-rule="evenodd">
            <g>
                <g transform="translate(-744 -1061) translate(744 1061)">
                    <g>
                        <g transform="rotate(90 15 19)">
                            <use fill="#000" filter="url(#jk8sb59w0a)"/>
                            <use fill="#333"/>
                        </g>
                        <path fill="#FFF" d="M15 1c7.72 0 14 6.28 14 14s-6.28 14-14 14S1 22.72 1 15 7.28 1 15 1" transform="rotate(90 15 19)"/>
                        <path fill="#CCC" d="M25.5 15L17.25 7.5 17.25 22.5zM4.5 15L12.75 22.5 12.75 7.5z" transform="rotate(90 15 19)"/>
                    </g>
                </g>
            </g>
        </g>
    </svg>
  )
  }