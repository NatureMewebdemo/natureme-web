import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement> & { size?: number };
const base = (size = 22): SVGProps<SVGSVGElement> => ({ width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true });

export const Leaf = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M5 19c0-8 5-13 14-14 0 9-5 14-13 14" /><path d="M5 19c3-4 6-7 10-9" /></svg>);
export const Home = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M4 11l8-6 8 6v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z" /></svg>);
export const Compass = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><circle cx="12" cy="12" r="8.5" /><path d="M15.5 8.5l-2 5-5 2 2-5z" /></svg>);
export const MapPin = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z" /><circle cx="12" cy="10" r="2.3" /></svg>);
export const Calendar = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><rect x="4" y="5.5" width="16" height="14.5" rx="2" /><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4" /></svg>);
export const Close = ({ size = 20, ...p }: P) => (<svg {...base(size)} strokeWidth={2} {...p}><path d="M6 6l12 12M18 6L6 18" /></svg>);
export const Walk = ({ size = 18, ...p }: P) => (<svg {...base(size)} {...p}><circle cx="13" cy="4.5" r="1.8" /><path d="M10 21l2-6 3 3v3M12 15l-1-5 4 1 2 3M11 10l-3 2v3" /></svg>);
export const Lotus = ({ size, ...p }: P) => (<svg {...base(size)} strokeWidth={1.7} {...p}><path d="M12 18c-3-2-4-5-4-8 2 1 4 3 4 8zM12 18c3-2 4-5 4-8-2 1-4 3-4 8zM12 18c-4 0-7-2-8-5 3 0 6 1 8 5zM12 18c4 0 7-2 8-5-3 0-6 1-8 5z" /></svg>);
export const Globe = ({ size, ...p }: P) => (<svg {...base(size)} strokeWidth={1.7} {...p}><circle cx="12" cy="12" r="8.5" /><path d="M3.5 12h17M12 3.5c2.5 2.5 3.5 5.5 3.5 8.5s-1 6-3.5 8.5c-2.5-2.5-3.5-5.5-3.5-8.5s1-6 3.5-8.5z" /></svg>);
export const Star = ({ size, ...p }: P) => (<svg {...base(size)} strokeWidth={1.7} {...p}><path d="M12 3.5l2.4 5.6 6 .5-4.6 4 1.4 5.9L12 16.4l-5.2 3.1 1.4-5.9-4.6-4 6-.5z" /></svg>);
export const Play = ({ size = 16 }: { size?: number }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M8 5.5v13l11-6.5z" /></svg>);
export const Pause = ({ size = 16 }: { size?: number }) => (<svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden><rect x="6.5" y="5" width="4" height="14" rx="1" /><rect x="13.5" y="5" width="4" height="14" rx="1" /></svg>);
