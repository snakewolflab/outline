import"./rolldown-runtime.CMxvf4Kt.js";import{Qt as e,en as t}from"./vendor-react.BDv3YiQX.js";import{a as n,s as r}from"./styles.3HqXuy1I.js";import{c as i,s as a}from"./vendor-styled.BLG-ZaDH.js";import{a as o,c as s,o as c,s as l}from"./animations.B6M7uYBl.js";import{c as u,i as d,n as f,o as p,s as m,t as h}from"./Scrollable.DWFqONda.js";t(),a();var g=e(),_=({children:e,isOpen:t,title:n=`Untitled`,onRequestClose:r,...i})=>(0,g.jsx)(f,{open:t,onOpenChange:e=>!e&&r(),children:(0,g.jsx)(m,{children:(0,g.jsx)(y,{children:(0,g.jsx)(b,{onEscapeKeyDown:r,onPointerDownOutside:r,"aria-describedby":void 0,...i,children:(0,g.jsxs)(x,{children:[n&&(0,g.jsx)(v,{children:n}),e]})})})})}),v=i(u)`
  font-size: 18px;
  margin-top: 0;
  margin-bottom: 1em;
`,y=i(p)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${n(`backdrop`)} !important;
  z-index: ${r.overlay};

  &[data-state="open"] {
    animation: ${o} 200ms ease;
  }

  &[data-state="closed"] {
    animation: ${l} 200ms ease;
  }
`,b=i(d)`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  margin: 12px;
  display: flex;
  z-index: ${r.modal};
  justify-content: center;
  align-items: flex-start;
  width: 350px;
  background: ${n(`background`)};
  border-radius: 8px;
  outline: none;

  &[data-state="open"] {
    animation: ${c} 200ms ease;
  }

  &[data-state="closed"] {
    animation: ${s} 200ms ease;
  }
`,x=i(h)`
  width: 100%;
  padding: 16px;
`;export{_ as default};