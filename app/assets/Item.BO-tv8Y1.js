import{o as e}from"./rolldown-runtime.CMxvf4Kt.js";import{Qt as t,en as n}from"./vendor-react.BDv3YiQX.js";import{a as r,i,t as a}from"./styles.3HqXuy1I.js";import{c as o,o as s,s as c}from"./vendor-styled.BLG-ZaDH.js";import{t as l}from"./Flex.DJ6mR3Bq.js";import{n as u,r as d}from"./index.es.Dxujvyep.js";import{t as f}from"./dist.dut-wRGd.js";import{t as p}from"./NavLink.BLIr0ZVF.js";var m=e(n());c();var h=t(),g=({image:e,title:t,subtitle:n,actions:r,small:i,border:a,to:o,keyboardNavigation:c,enableEllipsis:l,...g},C)=>{let w=s(),T=!n,E=m.useRef(null);C&&(E=C);let{focused:D,...O}=d(E,!(c||o));u(D,E);let k=m.useCallback(()=>{E.current&&f(E.current,{scrollMode:`if-needed`,behavior:`auto`,block:`center`,boundary:window.document.body})},[E]),A=a=>(0,h.jsxs)(h.Fragment,{children:[e&&(0,h.jsx)(v,{children:e}),(0,h.jsxs)(b,{justify:T?`center`:void 0,column:!T,$selected:a,children:[(0,h.jsx)(y,{$small:i,$ellipsis:l,children:t}),n&&(0,h.jsx)(x,{$small:i,$selected:a,children:n})]}),r&&(0,h.jsx)(S,{$selected:a,gap:4,children:r})]});return o?(0,h.jsx)(_,{ref:E,$border:a,$small:i,activeStyle:{background:w.sidebarActiveBackground},...g,...O,onClick:e=>{g.onClick&&g.onClick(e),O.onClick(e)},onKeyDown:e=>{g.onKeyDown&&g.onKeyDown(e),O.onKeyDown(e)},onFocus:e=>{O.onFocus(e),k()},as:p,to:o,children:A}):(0,h.jsx)(_,{ref:E,$border:a,$small:i,$hover:!!g.onClick,...g,...O,onClick:g.onClick?e=>{g.onClick?.(e),O.onClick(e)}:void 0,onKeyDown:e=>{g.onKeyDown?.(e),O.onKeyDown(e)},onFocus:e=>{O.onFocus(e),k()},children:A(!1)})},_=o.a`
  display: flex;
  padding: ${e=>e.$border===!1?0:`8px 0`};
  min-height: 32px;
  margin: ${e=>e.$border===!1?e.$small?`8px 0`:`16px 0`:0};
  border-bottom: 1px solid
    ${e=>e.$border===!1?`transparent`:e.theme.divider};

  &:last-child {
    border-bottom: 0;
  }

  &:focus-visible {
    outline: none;
  }

  &:${i},
  &:focus,
  &:focus-within {
    background: ${e=>e.$hover?e.theme.backgroundSecondary:`inherit`};
  }

  cursor: ${e=>e.to||e.onClick?`var(--pointer)`:`default`};
`,v=o(l)`
  padding-inline-end: 8px;
  max-height: 32px;
  align-items: center;
  user-select: none;
  flex-shrink: 0;
  align-self: center;
  color: ${r(`text`)};
`,y=o.p`
  font-size: ${e=>e.$small?14:16}px;
  font-weight: 500;
  ${e=>e.$ellipsis===!1?``:a()}
  line-height: ${e=>e.$small?1.3:1.2};
  margin: 0;
`,b=o(l)`
  flex-direction: column;
  flex-grow: 1;
  color: ${r(`text`)};
`,x=o.p`
  margin: 0;
  font-size: ${e=>e.$small?13:14}px;
  color: ${r(`textTertiary`)};
  margin-top: -2px;
  overflow-wrap: break-word;
`,S=o(l)`
  align-self: center;
  justify-content: center;
  flex-shrink: 0;
  color: ${r(`textSecondary`)};
`,C=m.forwardRef(g);export{C as n,S as t};