import type { SVGProps } from "react";

// Studio icons, drawn like the Listener ones in components/icons.tsx.
type P = SVGProps<SVGSVGElement> & { size?: number };
const base = (size = 22): SVGProps<SVGSVGElement> => ({ width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true });

export const UploadIcon = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M12 15V4.5M7.5 9L12 4.5 16.5 9M5 15v3.5a1.5 1.5 0 0 0 1.5 1.5h11a1.5 1.5 0 0 0 1.5-1.5V15" /></svg>);
export const Rss = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M5 5a14 14 0 0 1 14 14M5 11a8 8 0 0 1 8 8" /><circle cx="6" cy="18" r="1.4" /></svg>);
export const Tick = ({ size = 16, ...p }: P) => (<svg {...base(size)} strokeWidth={2.2} {...p}><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>);
export const Alert = ({ size = 16, ...p }: P) => (<svg {...base(size)} strokeWidth={2} {...p}><path d="M12 8v5M12 16.5v.01" /><circle cx="12" cy="12" r="8.5" /></svg>);
export const Grid = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><rect x="4" y="4" width="6.5" height="6.5" rx="1.5" /><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5" /><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5" /><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5" /></svg>);
export const Person = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><circle cx="12" cy="8.5" r="3.8" /><path d="M4.5 20c1.2-3.6 4.2-5.5 7.5-5.5s6.3 1.9 7.5 5.5" /></svg>);
export const Headphones = ({ size, ...p }: P) => (<svg {...base(size)} {...p}><path d="M4 15v-3a8 8 0 0 1 16 0v3" /><rect x="3.5" y="14" width="4" height="6" rx="1.5" /><rect x="16.5" y="14" width="4" height="6" rx="1.5" /></svg>);
