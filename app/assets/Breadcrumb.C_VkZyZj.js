import{o as e}from"./rolldown-runtime.CMxvf4Kt.js";import{D as t,Qt as n,en as r,wt as i}from"./vendor-react.BDv3YiQX.js";import{r as a}from"./mobxreact.esm.BaBZO6aD.js";import{a as o,t as s}from"./styles.3HqXuy1I.js";import{o as c,r as l,u}from"./styles.BAW3KELE.js";import{c as d,s as f}from"./vendor-styled.BLG-ZaDH.js";import{t as p}from"./lib.CIyroSo6.js";import{t as m}from"./Flex.DJ6mR3Bq.js";import{i as h}from"./index.CHF0CgVb.js";import{n as g,r as _,t as v}from"./OverflowMenuButton.e_BZrgS_.js";var y=e(r()),b=p();f();var x=n();function S({actions:e}){let{t:n}=t();return(0,x.jsx)(_,{action:g(e),ariaLabel:n(`Show path to document`),children:(0,x.jsx)(C,{})})}var C=d(v)`
  && {
    width: 32px;
    height: 32px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    margin-inline: -4px;
    transition: background 100ms ease-in-out;
  }

  &&:hover,
  &&[data-state="open"] {
    background: ${o(`buttonNeutralHoverBackground`)};
    transition: none;
  }
`;f();function w({actions:e,highlightFirstItem:t,children:n,max:r=2},i){let a=c({isMenu:!0}),o=h(()=>e.filter(e=>typeof e.visible==`function`?e.visible(a):e.visible??!0),[e,a]),s=o.length,l=[...o];if(s>r){let e=Math.floor(r/2),t=l.splice(e,s-r);l.splice(e,0,{type:`menu`,actions:t})}let d=y.useCallback(e=>{e.currentTarget.querySelector(`[data-state="open"]`)&&e.preventDefault()},[]),f=y.useCallback((e,n)=>{if(e.type===`menu`)return(0,x.jsx)(S,{actions:e.actions},`menu`);let r=u(e,a);return(0,x.jsxs)(E,{to:r.to,onClick:d,$highlight:!!t&&n===0,children:[r.icon,(0,x.jsx)(D,{children:r.title})]})},[a,d,t]);return(0,x.jsxs)(m,{justify:`flex-start`,align:`center`,ref:i,children:[l.map((e,t)=>(0,x.jsxs)(y.Fragment,{children:[f(e,t),t!==l.length-1||n?(0,x.jsx)(T,{}):null]},e.type===`menu`?`menu`:`item-${t}`)),n]})}var T=d(b.GoToIcon)`
  flex-shrink: 0;
  fill: ${o(`divider`)};
`,E=d(i)`
  ${l()}

  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 1;
  min-width: 0;
  cursor: var(--pointer);
  color: ${o(`text`)};
  font-size: 15px;
  height: 32px;
  font-weight: ${e=>e.$highlight?`500`:`inherit`};
  padding-inline: 8px;
  border-radius: 4px;
  margin-inline: -4px;

  &:first-child {
    margin-inline-start: 0;
  }
  max-width: 460px;
  transition: background 100ms ease-in-out;

  &:hover,
  &:has([data-state="open"]) {
    background: ${o(`buttonNeutralHoverBackground`)};
    transition: none;
  }
`,D=d.span`
  ${s()}
  min-width: 0;
`,O=a(y.forwardRef(w));export{O as t};