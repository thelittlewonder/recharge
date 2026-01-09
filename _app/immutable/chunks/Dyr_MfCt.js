import{y as x,z as u}from"./CottPdx0.js";function _(n){const t=n-1;return t*t*t+1}function S(n,{delay:t=0,duration:o=400,easing:s=x}={}){const c=+getComputedStyle(n).opacity;return{delay:t,duration:o,easing:s,css:a=>`opacity: ${a*c}`}}function U(n,{delay:t=0,duration:o=400,easing:s=_,x:c=0,y:a=0,opacity:y=0}={}){const r=getComputedStyle(n),e=+r.opacity,f=r.transform==="none"?"":r.transform,p=e*(1-y),[l,m]=u(c),[$,d]=u(a);return{delay:t,duration:o,easing:s,css:(i,g)=>`
			transform: ${f} translate(${(1-i)*l}${m}, ${(1-i)*$}${d});
			opacity: ${e-p*g}`}}export{U as a,S as f};
