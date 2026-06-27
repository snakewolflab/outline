import{o as e}from"./rolldown-runtime.CMxvf4Kt.js";import{E as t,Qt as n,en as r,x as i}from"./vendor-react.BDv3YiQX.js";import{a,s as o}from"./styles.3HqXuy1I.js";import{c as s,s as c}from"./vendor-styled.BLG-ZaDH.js";import{n as l}from"./animations.B6M7uYBl.js";import{a as u,i as d,n as f,r as p,t as m}from"./dist.DS9RyCK8.js";c();var h=e(r()),g=n(),_=h.createContext(void 0),v=()=>h.useContext(_);function y(e){return(0,g.jsx)(i,{node:h.useContext(_),children:e.children})}var b=d,x=m,S=h.forwardRef((e,t)=>{let{children:n,...r}=e;return(0,g.jsx)(u,{ref:t,...r,asChild:!0,children:n})});S.displayName=u.displayName;var C=h.forwardRef((e,n)=>{let r=h.useRef(),i=h.useRef(),a=v(),{width:o,minWidth:s,minHeight:c,scrollable:l=!0,shrink:u=!1,sideOffset:d=4,children:f,...m}=e,_=o??(s?void 0:380),y=h.useCallback(()=>{i.current&&clearTimeout(i.current),r.current&&(r.current.style.pointerEvents=`auto`)},[]),b=h.useCallback(()=>{r.current&&(r.current.style.pointerEvents=`none`),i.current=setTimeout(()=>{y()},500)},[y]);return(0,g.jsx)(p,{container:a,children:(0,g.jsx)(w,{ref:t([r,n]),sideOffset:d,$width:_,$minWidth:s,$minHeight:c,$scrollable:l,$shrink:u,onAnimationStart:b,onAnimationEnd:y,...m,children:f})})});C.displayName=f.displayName;var w=s(f)`
  z-index: ${o.modal};
  max-height: min(85vh, var(--radix-popover-content-available-height));
  transform-origin: var(--radix-popover-content-transform-origin);

  background: ${a(`menuBackground`)};
  box-shadow: ${a(`menuShadow`)};
  border-radius: 6px;
  outline: none;

  padding: ${({$shrink:e})=>e?`6px 0`:`12px 24px`};

  ${({$width:e})=>e&&`width: ${e}px`};
  ${({$minWidth:e})=>e&&`min-width: ${e}px`};
  ${({$minHeight:e})=>e&&`min-height: ${e}px`};

  ${({$scrollable:e})=>e?`
      		overflow-x: hidden;
      		overflow-y: auto;
    		`:`
      		overflow: hidden;
    		`}

  &[data-state="open"] {
    animation: ${l} 150ms cubic-bezier(0.08, 0.82, 0.17, 1);
  }
`;export{y as a,S as i,x as n,_ as o,C as r,v as s,b as t};