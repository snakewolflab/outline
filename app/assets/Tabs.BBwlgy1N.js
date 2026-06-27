import{o as e}from"./rolldown-runtime.CMxvf4Kt.js";import{Qt as t,en as n}from"./vendor-react.BDv3YiQX.js";import{a as r,r as i}from"./vendor-framer-motion.CmOZgGZV.js";import{K as a}from"./vendor-es-toolkit.XcNOARzK.js";import{t as o}from"./query-string.BZ_VmwFF.js";import{r as s}from"./polished.esm.DNeFoW8-.js";import{a as c,i as l}from"./styles.3HqXuy1I.js";import{c as u,o as d,r as f,s as p,t as m}from"./vendor-styled.BLG-ZaDH.js";import{t as h}from"./useWindowSize.CYc0Z4gf.js";import{t as g}from"./NavLink.BLIr0ZVF.js";var _=e(o()),v=e(n());p();var y=t(),b=f`
  position: relative;
  display: inline-flex;
  align-items: center;
  font-weight: 500;
  font-size: 14px;
  cursor: var(--pointer);
  user-select: none;
  padding: 12px 0;

  ${m(`tablet`)`
    padding: 6px 0;
  `};
`,x=u(g)`
  ${b}
  color: ${c(`textTertiary`)};

  &: ${l} {
    color: ${c(`textSecondary`)};
  }
`,S=u.button`
  ${b}
  color: ${({$active:e})=>c(e?`textSecondary`:`textTertiary`)};
  background: none;
  border: none;

  &: ${l} {
    color: ${c(`textSecondary`)};
  }
`,C=u(r.div)`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  width: 100%;
  border-radius: 3px;
  background: ${c(`textSecondary`)};
`,w={type:`spring`,stiffness:500,damping:30},T=(e,t)=>t.replace(/translate3d\(([^,]+),\s*[^,]+,\s*([^)]+)\)/,`translate3d($1, 0px, $2)`),E=e=>{let{children:t,exact:n,exactQueryString:r}=e,i={color:d().textSecondary};if(`active`in e&&!(`to`in e))return(0,y.jsxs)(S,{$active:e.active,onClick:e.onClick,children:[t,e.active&&(0,y.jsx)(C,{layoutId:`underline`,initial:!1,transition:w,transformTemplate:T})]});let{to:o,...s}=e;return(0,y.jsx)(x,{...s,to:o,exact:n||r,activeStyle:i,children:(e,n)=>(0,y.jsxs)(y.Fragment,{children:[t,e&&(!r||a(_.parse(n.search??``),_.parse(o.search)))&&(0,y.jsx)(C,{layoutId:`underline`,initial:!1,transition:w,transformTemplate:T})]})})};p();var D=u.nav`
  border-bottom: 1px solid ${c(`divider`)};
  margin: 12px 0;
  overflow-y: auto;
  white-space: nowrap;

  -ms-overflow-style: none;
  scrollbar-width: none;

  & > * + * {
    margin-inline-start: 24px;
  }

  &::-webkit-scrollbar {
    display: none;
  }

  &:after {
    content: "";
    position: absolute;
    top: 0;
    right: 0;
    width: 50px;
    height: 100%;
    pointer-events: none;
    background: ${e=>e.$shadowVisible?`linear-gradient(
      90deg,
      ${s(1,e.theme.background)} 0%,
      ${e.theme.background} 100%
    )`:`transparent`};
  }
`,O=u.div`
  position: sticky;
  top: 54px;
  margin: 0 -8px;
  padding: 0 8px;
  background: ${c(`background`)};
  z-index: 1;
`;u.span`
  border-left: 1px solid ${c(`divider`)};
  position: relative;
  top: 2px;
  margin-top: 6px;
`;var k=({children:e})=>{let t=v.useRef(null),[n,r]=v.useState(!1),{width:a}=h(),o=v.useCallback(()=>{let e=t.current;if(!e)return;let i=e.scrollLeft,a=e.scrollWidth-e.clientWidth-i!==0;a!==n&&r(a)},[n]);return v.useEffect(()=>{o()},[a,o]),(0,y.jsx)(i,{children:(0,y.jsx)(O,{children:(0,y.jsx)(D,{ref:t,onScroll:o,$shadowVisible:n,children:e})})})};export{E as n,k as t};