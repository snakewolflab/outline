import{o as e}from"./rolldown-runtime.CMxvf4Kt.js";import{D as t,Qt as n,T as r,en as i}from"./vendor-react.BDv3YiQX.js";import{a,s as o}from"./styles.3HqXuy1I.js";import{c as s,s as c}from"./vendor-styled.BLG-ZaDH.js";import{f as l}from"./dist.BnxCzfoe.js";import{K as u,tt as d}from"./index.CHF0CgVb.js";import{a as f,i as p,n as m,r as h}from"./dist.DS9RyCK8.js";import{t as g}from"./Calendar.DEiEt9yT.js";var _=e(i());c();var v=n();function y({selectedDate:e,language:n,onChange:i,children:a}){let{t:o}=t(),[s,c]=_.useState(!1),y=_.useCallback(e=>{c(!1),i(d(e))},[i]);return(0,v.jsxs)(p,{open:s,onOpenChange:c,children:[(0,v.jsx)(f,{asChild:!0,onMouseDown:e=>e.stopPropagation(),children:a}),(0,v.jsx)(h,{children:(0,v.jsx)(m,{asChild:!0,sideOffset:4,align:`start`,"aria-label":o(`Choose a date`),onOpenAutoFocus:e=>e.preventDefault(),children:(0,v.jsx)(r,{as:l,allowPinchZoom:!0,children:(0,v.jsx)(b,{children:(0,v.jsx)(g,{required:!0,mode:`single`,selected:e,defaultMonth:e,onSelect:y,locale:u(n)})})})})})]})}var b=s.div`
  z-index: ${o.modal};
  background: ${a(`menuBackground`)};
  box-shadow: ${a(`menuShadow`)};
  border-radius: 8px;
  outline: none;

  &[data-state="open"] {
    animation: fadeIn 150ms ease;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;export{y as default};