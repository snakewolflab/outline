import{o as e}from"./rolldown-runtime.CMxvf4Kt.js";import{Qt as t,en as n}from"./vendor-react.BDv3YiQX.js";import{r}from"./polished.esm.DNeFoW8-.js";import{a as i,b as a,f as o,s}from"./styles.3HqXuy1I.js";import{a as c,c as l,s as u}from"./vendor-styled.BLG-ZaDH.js";import{_ as d,h as f,i as p,l as m,m as h,n as g,o as _,r as v,t as y,v as b}from"./dist.BnxCzfoe.js";import{a as x,i as S,n as C,r as w,t as T}from"./dist.CESalI_i.js";var E=e(n(),1),D=t(),O=Object.freeze({position:`absolute`,border:0,width:1,height:1,padding:0,margin:-1,overflow:`hidden`,clip:`rect(0, 0, 0, 0)`,whiteSpace:`nowrap`,wordWrap:`normal`}),k=`VisuallyHidden`,A=E.forwardRef((e,t)=>(0,D.jsx)(m.span,{...e,ref:t,style:{...O,...e.style}}));A.displayName=k;var j=A,[M,ee]=f(`Tooltip`,[x]),N=x(),P=`TooltipProvider`,te=700,F=`tooltip.open`,[ne,I]=M(P),L=e=>{let{__scopeTooltip:t,delayDuration:n=te,skipDelayDuration:r=300,disableHoverableContent:i=!1,children:a}=e,o=E.useRef(!0),s=E.useRef(!1),c=E.useRef(0);return E.useEffect(()=>{let e=c.current;return()=>window.clearTimeout(e)},[]),(0,D.jsx)(ne,{scope:t,isOpenDelayedRef:o,delayDuration:n,onOpen:E.useCallback(()=>{r<=0||(window.clearTimeout(c.current),o.current=!1)},[r]),onClose:E.useCallback(()=>{r<=0||(window.clearTimeout(c.current),c.current=window.setTimeout(()=>o.current=!0,r))},[r]),isPointerInTransitRef:s,onPointerInTransitChange:E.useCallback(e=>{s.current=e},[]),disableHoverableContent:i,children:a})};L.displayName=P;var R=`Tooltip`,[re,z]=M(R),B=e=>{let{__scopeTooltip:t,children:n,open:r,defaultOpen:i,onOpenChange:a,disableHoverableContent:o,delayDuration:s}=e,c=I(R,e.__scopeTooltip),l=N(t),[u,d]=E.useState(null),f=p(),m=E.useRef(0),h=o??c.disableHoverableContent,g=s??c.delayDuration,_=E.useRef(!1),[v,b]=y({prop:r,defaultProp:i??!1,onChange:e=>{e?(c.onOpen(),document.dispatchEvent(new CustomEvent(F))):c.onClose(),a?.(e)},caller:R}),x=E.useMemo(()=>v?_.current?`delayed-open`:`instant-open`:`closed`,[v]),C=E.useCallback(()=>{window.clearTimeout(m.current),m.current=0,_.current=!1,b(!0)},[b]),w=E.useCallback(()=>{window.clearTimeout(m.current),m.current=0,b(!1)},[b]),T=E.useCallback(()=>{window.clearTimeout(m.current),m.current=window.setTimeout(()=>{_.current=!0,b(!0),m.current=0},g)},[g,b]);return E.useEffect(()=>()=>{m.current&&=(window.clearTimeout(m.current),0)},[]),(0,D.jsx)(S,{...l,children:(0,D.jsx)(re,{scope:t,contentId:f,open:v,stateAttribute:x,trigger:u,onTriggerChange:d,onTriggerEnter:E.useCallback(()=>{c.isOpenDelayedRef.current?T():C()},[c.isOpenDelayedRef,T,C]),onTriggerLeave:E.useCallback(()=>{h?w():(window.clearTimeout(m.current),m.current=0)},[w,h]),onOpen:C,onClose:w,disableHoverableContent:h,children:n})})};B.displayName=R;var V=`TooltipTrigger`,H=E.forwardRef((e,t)=>{let{__scopeTooltip:n,...r}=e,i=z(V,n),a=I(V,n),o=N(n),s=d(t,E.useRef(null),i.onTriggerChange),c=E.useRef(!1),l=E.useRef(!1),u=E.useCallback(()=>c.current=!1,[]);return E.useEffect(()=>()=>document.removeEventListener(`pointerup`,u),[u]),(0,D.jsx)(T,{asChild:!0,...o,children:(0,D.jsx)(m.button,{"aria-describedby":i.open?i.contentId:void 0,"data-state":i.stateAttribute,...r,ref:s,onPointerMove:b(e.onPointerMove,e=>{e.pointerType!==`touch`&&!l.current&&!a.isPointerInTransitRef.current&&(i.onTriggerEnter(),l.current=!0)}),onPointerLeave:b(e.onPointerLeave,()=>{i.onTriggerLeave(),l.current=!1}),onPointerDown:b(e.onPointerDown,()=>{i.open&&i.onClose(),c.current=!0,document.addEventListener(`pointerup`,u,{once:!0})}),onFocus:b(e.onFocus,()=>{c.current||i.onOpen()}),onBlur:b(e.onBlur,i.onClose),onClick:b(e.onClick,i.onClose)})})});H.displayName=V;var U=`TooltipPortal`,[ie,ae]=M(U,{forceMount:void 0}),W=e=>{let{__scopeTooltip:t,forceMount:n,children:r,container:i}=e,a=z(U,t);return(0,D.jsx)(ie,{scope:t,forceMount:n,children:(0,D.jsx)(g,{present:n||a.open,children:(0,D.jsx)(v,{asChild:!0,container:i,children:r})})})};W.displayName=U;var G=`TooltipContent`,K=E.forwardRef((e,t)=>{let n=ae(G,e.__scopeTooltip),{forceMount:r=n.forceMount,side:i=`top`,...a}=e,o=z(G,e.__scopeTooltip);return(0,D.jsx)(g,{present:r||o.open,children:o.disableHoverableContent?(0,D.jsx)(q,{side:i,...a,ref:t}):(0,D.jsx)(oe,{side:i,...a,ref:t})})}),oe=E.forwardRef((e,t)=>{let n=z(G,e.__scopeTooltip),r=I(G,e.__scopeTooltip),i=E.useRef(null),a=d(t,i),[o,s]=E.useState(null),{trigger:c,onClose:l}=n,u=i.current,{onPointerInTransitChange:f}=r,p=E.useCallback(()=>{s(null),f(!1)},[f]),m=E.useCallback((e,t)=>{let n=e.currentTarget,r={x:e.clientX,y:e.clientY},i=fe(r,de(r,n.getBoundingClientRect())),a=pe(t.getBoundingClientRect());s(he([...i,...a])),f(!0)},[f]);return E.useEffect(()=>()=>p(),[p]),E.useEffect(()=>{if(c&&u){let e=e=>m(e,u),t=e=>m(e,c);return c.addEventListener(`pointerleave`,e),u.addEventListener(`pointerleave`,t),()=>{c.removeEventListener(`pointerleave`,e),u.removeEventListener(`pointerleave`,t)}}},[c,u,m,p]),E.useEffect(()=>{if(o){let e=e=>{let t=e.target,n={x:e.clientX,y:e.clientY},r=c?.contains(t)||u?.contains(t),i=!me(n,o);r?p():i&&(p(),l())};return document.addEventListener(`pointermove`,e),()=>document.removeEventListener(`pointermove`,e)}},[c,u,o,l,p]),(0,D.jsx)(q,{...e,ref:a})}),[se,ce]=M(R,{isInside:!1}),le=h(`TooltipContent`),q=E.forwardRef((e,t)=>{let{__scopeTooltip:n,children:r,"aria-label":i,onEscapeKeyDown:a,onPointerDownOutside:o,...s}=e,c=z(G,n),l=N(n),{onClose:u}=c;return E.useEffect(()=>(document.addEventListener(F,u),()=>document.removeEventListener(F,u)),[u]),E.useEffect(()=>{if(c.trigger){let e=e=>{e.target instanceof Node&&e.target.contains(c.trigger)&&u()};return window.addEventListener(`scroll`,e,{capture:!0}),()=>window.removeEventListener(`scroll`,e,{capture:!0})}},[c.trigger,u]),(0,D.jsx)(_,{asChild:!0,disableOutsidePointerEvents:!1,onEscapeKeyDown:a,onPointerDownOutside:o,onFocusOutside:e=>e.preventDefault(),onDismiss:u,children:(0,D.jsxs)(w,{"data-state":c.stateAttribute,...l,...s,ref:t,style:{...s.style,"--radix-tooltip-content-transform-origin":`var(--radix-popper-transform-origin)`,"--radix-tooltip-content-available-width":`var(--radix-popper-available-width)`,"--radix-tooltip-content-available-height":`var(--radix-popper-available-height)`,"--radix-tooltip-trigger-width":`var(--radix-popper-anchor-width)`,"--radix-tooltip-trigger-height":`var(--radix-popper-anchor-height)`},children:[(0,D.jsx)(le,{children:r}),(0,D.jsx)(se,{scope:n,isInside:!0,children:(0,D.jsx)(j,{id:c.contentId,role:`tooltip`,children:i||r})})]})})});K.displayName=G;var J=`TooltipArrow`,ue=E.forwardRef((e,t)=>{let{__scopeTooltip:n,...r}=e,i=N(n);return ce(J,n).isInside?null:(0,D.jsx)(C,{...i,...r,ref:t})});ue.displayName=J;function de(e,t){let n=Math.abs(t.top-e.y),r=Math.abs(t.bottom-e.y),i=Math.abs(t.right-e.x),a=Math.abs(t.left-e.x);switch(Math.min(n,r,i,a)){case a:return`left`;case i:return`right`;case n:return`top`;case r:return`bottom`;default:throw Error(`unreachable`)}}function fe(e,t,n=5){let r=[];switch(t){case`top`:r.push({x:e.x-n,y:e.y+n},{x:e.x+n,y:e.y+n});break;case`bottom`:r.push({x:e.x-n,y:e.y-n},{x:e.x+n,y:e.y-n});break;case`left`:r.push({x:e.x+n,y:e.y-n},{x:e.x+n,y:e.y+n});break;case`right`:r.push({x:e.x-n,y:e.y-n},{x:e.x-n,y:e.y+n});break}return r}function pe(e){let{top:t,right:n,bottom:r,left:i}=e;return[{x:i,y:t},{x:n,y:t},{x:n,y:r},{x:i,y:r}]}function me(e,t){let{x:n,y:r}=e,i=!1;for(let e=0,a=t.length-1;e<t.length;a=e++){let o=t[e],s=t[a],c=o.x,l=o.y,u=s.x,d=s.y;l>r!=d>r&&n<(u-c)*(r-l)/(d-l)+c&&(i=!i)}return i}function he(e){let t=e.slice();return t.sort((e,t)=>e.x<t.x?-1:e.x>t.x?1:e.y<t.y?-1:+(e.y>t.y)),ge(t)}function ge(e){if(e.length<=1)return e.slice();let t=[];for(let n=0;n<e.length;n++){let r=e[n];for(;t.length>=2;){let e=t[t.length-1],n=t[t.length-2];if((e.x-n.x)*(r.y-n.y)>=(e.y-n.y)*(r.x-n.x))t.pop();else break}t.push(r)}t.pop();let n=[];for(let t=e.length-1;t>=0;t--){let r=e[t];for(;n.length>=2;){let e=n[n.length-1],t=n[n.length-2];if((e.x-t.x)*(r.y-t.y)>=(e.y-t.y)*(r.x-t.x))n.pop();else break}n.push(r)}return n.pop(),t.length===1&&n.length===1&&t[0].x===n[0].x&&t[0].y===n[0].y?t:t.concat(n)}var Y=L,_e=B,ve=H,ye=W,be=K;u();var X=o?`⌥`:`Alt`,Z=o?`⌘`:`Ctrl`,xe=o?`^`:`Ctrl`,Q=o?``:`+`;function Se(e){return o?e.metaKey:e.ctrlKey}function Ce(e,t){return e.length===1&&t?e.toUpperCase():e.replace(/^Key([A-Z])$/i,(e,n)=>t?n.toUpperCase():n).replace(/Meta/i,Z).replace(/Cmd/i,Z).replace(/Alt/i,X).replace(/Control/i,xe).replace(/Shift/i,`⇧`)}function $(e){let[t,n]=(0,E.useState)(!1);return(0,E.useEffect)(()=>{if(window.matchMedia){let r=window.matchMedia(e);r.matches!==t&&n(r.matches);let i=()=>{n(r.matches)};return r.addListener(i),()=>r.removeListener(i)}},[t,e]),t}function we(){return $(`(max-width: ${a.tablet-1}px)`)}var Te=E.createContext(!1);function Ee(){return E.useContext(Te)}function De({children:e,delayDuration:t=500,skipDelayDuration:n=300,disableHoverableContent:r=!1,tippyProps:i}){let a=i?.delay??t;return(0,D.jsx)(Y,{delayDuration:a,skipDelayDuration:n,disableHoverableContent:r,children:(0,D.jsx)(Te.Provider,{value:!0,children:e})})}function Oe({shortcut:e,shortcutOnNewline:t,content:n,side:r=`top`,sideOffset:i=8,align:a=`center`,alignOffset:o=0,avoidCollisions:s=!0,collisionBoundary:c,collisionPadding:l=8,defaultOpen:u,open:d,onOpenChange:f,delayDuration:p=500,skipDelayDuration:m=300,disableHoverableContent:h=!1,children:g,disabled:_=!1,offset:v,placement:y,delay:b,...x}){let S=we(),C=Ee(),w=r,T=a,E=p,O=i;if(y){let[e,t]=y.split(`-`);w=e,t&&(T=t)}b!==void 0&&(typeof b==`number`?E=b:Array.isArray(b)&&(E=b[0])),v&&(O=v[1]||i);let k=(0,D.jsx)(D.Fragment,{children:n});if(!n||S||_)return g??null;e&&(k=(0,D.jsxs)(D.Fragment,{children:[n,t?(0,D.jsx)(`br`,{}):` `,typeof e==`string`?e.split(`+`).flatMap((e,t,n)=>{let r=(0,D.jsx)(Ne,{children:e.length===1?e.toUpperCase():e},`${e}${t}`);return t<n.length-1&&Q?[r,Q]:[r]}):(0,D.jsx)(Ne,{children:e})]}));let A=(0,D.jsxs)(_e,{defaultOpen:u,open:d,onOpenChange:f,delayDuration:C?void 0:E,disableHoverableContent:h,children:[(0,D.jsx)(ve,{asChild:!0,children:g}),(0,D.jsx)(ye,{children:(0,D.jsx)(Pe,{side:w,sideOffset:O,align:T,alignOffset:o,avoidCollisions:s,collisionBoundary:c,collisionPadding:l,...x,children:k})})]});return C?A:(0,D.jsx)(Y,{delayDuration:E,skipDelayDuration:m,children:A})}var ke=c`
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`,Ae=c`
  from {
    opacity: 0;
    transform: translateX(-8px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`,je=c`
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`,Me=c`
  from {
    opacity: 0;
    transform: translateX(8px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`,Ne=l.kbd`
  position: relative;
  top: -1px;

  margin-left: 2px;
  display: inline-block;
  padding: 2px 4px;
  font-size: 12px;
  font-family: ${i(`fontFamilyMono`)};
  line-height: 10px;
  color: ${i(`tooltipText`)};
  border: 1px solid ${e=>r(.75,e.theme.tooltipText)};
  vertical-align: middle;
  border-radius: 3px;
`,Pe=l(be)`
  position: relative;
  background-color: ${i(`tooltipBackground`)};
  color: ${i(`tooltipText`)};
  border-radius: 4px;
  font-size: 13px;
  line-height: 1.4;
  white-space: normal;
  outline: 0;
  padding: 5px 9px;
  z-index: ${s.tooltip};
  max-width: calc(100vw - 10px);

  /* Animation */
  &[data-state="delayed-open"][data-side="top"] {
    animation: ${ke} 200ms cubic-bezier(0.16, 1, 0.3, 1);
  }
  &[data-state="delayed-open"][data-side="right"] {
    animation: ${Me} 200ms cubic-bezier(0.16, 1, 0.3, 1);
  }
  &[data-state="delayed-open"][data-side="bottom"] {
    animation: ${je} 200ms cubic-bezier(0.16, 1, 0.3, 1);
  }
  &[data-state="delayed-open"][data-side="left"] {
    animation: ${Ae} 200ms cubic-bezier(0.16, 1, 0.3, 1);
  }
`;export{X as a,Ce as c,O as d,A as f,$ as i,Q as l,De as n,Se as o,we as r,Z as s,Oe as t,j as u};