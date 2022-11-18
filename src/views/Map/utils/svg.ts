import Color from 'color'
import { uniqueId } from 'lodash'

export const drawCameraBg = (start) => {
  const startColor = Color(start)
  const endColor = startColor.darken(0.3).saturate(0.5)
  const end = endColor.string()
  const id = uniqueId()
  return `<svg width="39px" height="67px" viewBox="0 0 39 67" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <defs>
        <ellipse id="path-1" cx="19" cy="58" rx="7" ry="4"></ellipse>
        <filter x="-32.1%" y="-56.2%" width="164.3%" height="212.5%" filterUnits="objectBoundingBox" id="filter-2">
            <feMorphology radius="1" operator="dilate" in="SourceAlpha" result="shadowSpreadOuter1"></feMorphology>
            <feOffset dx="0" dy="0" in="shadowSpreadOuter1" result="shadowOffsetOuter1"></feOffset>
            <feGaussianBlur stdDeviation="0.5" in="shadowOffsetOuter1" result="shadowBlurOuter1"></feGaussianBlur>
            <feColorMatrix values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.12 0" type="matrix" in="shadowBlurOuter1"></feColorMatrix>
        </filter>
        <ellipse id="path-3" cx="19" cy="58" rx="4" ry="2.28571429"></ellipse>
        <filter x="-112.5%" y="-196.9%" width="325.0%" height="493.8%" filterUnits="objectBoundingBox" id="filter-4">
            <feOffset dx="0" dy="0" in="SourceAlpha" result="shadowOffsetOuter1"></feOffset>
            <feGaussianBlur stdDeviation="3" in="shadowOffsetOuter1" result="shadowBlurOuter1"></feGaussianBlur>
            <feComposite in="shadowBlurOuter1" in2="SourceAlpha" operator="out" result="shadowBlurOuter1"></feComposite>
            <feColorMatrix values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.5 0" type="matrix" in="shadowBlurOuter1"></feColorMatrix>
        </filter>
        <linearGradient x1="50%" y1="0%" x2="50%" y2="100%" id="linearGradient-${id}">
            <stop stop-color="${start}" offset="0%"></stop>
            <stop stop-color="${end}" offset="100%"></stop>
        </linearGradient>
    </defs>
    <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g transform="translate(-800.000000, -443.000000)">
            <g id="Group-4" transform="translate(800.000000, 443.000000)">
                <g fill="black" fill-opacity="1">
                    <use filter="url(#filter-2)" xlink:href="#path-1"></use>
                </g>
                <g>
                    <use fill="black" fill-opacity="1" filter="url(#filter-4)" xlink:href="#path-3"></use>
                    <ellipse stroke="#999999" stroke-width="1" stroke-linejoin="square" fill-opacity="0.546000874" fill="#FFFFFF" fill-rule="evenodd" cx="19" cy="58" rx="3.5" ry="1.78571429"></ellipse>
                </g>
                <path d="M19.3333333,0 C9.18977778,0 0,8.22633333 0,18.3731111 C0,33.4595556 15.4118889,35.0545556 19.3333333,58 C23.2547778,35.0545556 38.6666667,33.4595556 38.6666667,18.3731111 C38.6666667,8.22633333 29.4801111,0 19.3333333,0 Z" id="Path-Copy-2" fill="url(#linearGradient-${id})" fill-rule="nonzero"></path>
            </g>
        </g>
    </g>
    </svg>
  `
}
