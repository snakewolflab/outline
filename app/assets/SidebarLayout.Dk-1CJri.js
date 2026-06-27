import{o as e}from"./rolldown-runtime.CMxvf4Kt.js";import{D as t,Qt as n,en as r}from"./vendor-react.BDv3YiQX.js";import{a as i}from"./vendor-framer-motion.CmOZgGZV.js";import{r as a}from"./mobxreact.esm.BaBZO6aD.js";import{a as o,s,t as c}from"./styles.3HqXuy1I.js";import{t as l}from"./styles.BAW3KELE.js";import{t as u}from"./useStores.C2HL3oms.js";import{c as d,o as f,s as p,t as m}from"./vendor-styled.BLG-ZaDH.js";import{t as h}from"./lib.CIyroSo6.js";import{r as g,t as _}from"./Tooltip.DlvdmaJm.js";import{t as v}from"./Flex.DJ6mR3Bq.js";import"./animations.B6M7uYBl.js";import{D as y,b,x}from"./index.CHF0CgVb.js";import{t as S}from"./Scrollable.DWFqONda.js";import{o as C}from"./Popover.CIIe-PnX.js";import{i as w,n as T,t as E}from"./Drawer.DylWdgHO.js";import{j as D,x as O}from"./CommandBarResults.Yuyu2tXK.js";p();var k=h(),A=e(r());function j(){let[e,t]=(0,A.useState)(null);return(0,A.useEffect)(()=>{let e=document.documentElement,n=()=>{t(e.scrollWidth-e.clientWidth)},r=setTimeout(n),i=new ResizeObserver(n);return i.observe(e),()=>{clearTimeout(r),i.disconnect()}},[]),e}var M=n();function N({children:e,border:t,className:n,skipInitialAnimation:r}){let i=f(),{ui:a}=u(),[o,s]=A.useState(!1),c=i.sidebarMaxWidth,l=i.sidebarMinWidth+16,d=j(),p=b(),m=A.useCallback(e=>{e.preventDefault();let t=p===`rtl`?e.pageX:window.innerWidth-e.pageX,n=Math.max(Math.min(t,c),l);a.set({sidebarRightWidth:n})},[l,c,p,a]),h=A.useCallback(()=>{a.set({sidebarRightWidth:i.sidebarRightWidth})},[a,i.sidebarRightWidth]),g=A.useCallback(()=>{s(!1),document.activeElement&&document.activeElement.blur()},[]),_=A.useCallback(e=>{e.preventDefault(),s(!0)},[]);A.useEffect(()=>(o&&(document.addEventListener(`mousemove`,m),document.addEventListener(`mouseup`,g)),()=>{document.removeEventListener(`mousemove`,m),document.removeEventListener(`mouseup`,g)}),[o,m,g]);let v=A.useMemo(()=>({width:d?`${a.sidebarRightWidth-d}px`:`${a.sidebarRightWidth}px`}),[a.sidebarRightWidth,d]);return(0,M.jsx)(F,{initial:r?!1:{width:0,opacity:.9},animate:{transition:o?{duration:0}:{type:`spring`,bounce:.2,duration:600/1e3},width:a.sidebarRightWidth,opacity:1},exit:{width:0,opacity:0},$border:t,className:n,role:`complementary`,"aria-label":`Aside`,children:(0,M.jsxs)(P,{style:v,column:!0,children:[(0,M.jsx)(x,{children:e}),(0,M.jsx)(D,{onMouseDown:_,onDoubleClick:h,dir:`right`})]})})}var P=d(v)`
  position: fixed;
  top: 0;
  bottom: 0;
  max-width: 80%;
`,F=d(i.div)`
  display: block;
  flex-shrink: 0;
  background: ${o(`background`)};
  max-width: 80%;
  border-inline-start: 1px solid ${o(`divider`)};
  transition: border-inline-start 100ms ease-in-out;
  z-index: ${s.sidebar};

  ${m(`mobile`,`tablet`)`
    display: flex;
    position: absolute;
    top: 0;
    inset-inline-end: 0;
    bottom: 0;
    z-index: ${s.mobileSidebar};
  `}

  ${m(`tablet`)`
    position: relative;
  `}
`,I=a(N);p();function L({title:e,onClose:n,children:r,scrollable:i=!0}){let{t:a}=t(),o=g(),s=A.useContext(O),[c,l]=A.useState(null),u=i?(0,M.jsx)(S,{hiddenScrollbars:!0,topShadow:!0,children:r}):r;if(o)return(0,M.jsx)(E,{onClose:n,defaultOpen:!0,children:(0,M.jsxs)(T,{ref:l,children:[(0,M.jsx)(w,{children:e}),(0,M.jsx)(C.Provider,{value:c,children:u})]})});let d=(0,M.jsxs)(M.Fragment,{children:[(0,M.jsxs)(B,{children:[(0,M.jsx)(z,{children:e}),(0,M.jsx)(_,{content:a(`Close`),shortcut:`Esc`,children:(0,M.jsx)(y,{icon:(0,M.jsx)(R,{}),onClick:n,borderOnHover:!0,neutral:!0})})]}),u]});return s?d:(0,M.jsx)(I,{children:d})}var R=d(k.BackIcon)`
  transform: rotate(180deg);
  flex-shrink: 0;

  [dir="rtl"] & {
    transform: rotate(0deg);
  }
`,z=d(v)`
  ${c()}
  font-size: 16px;
  font-weight: 600;
  text-align: center;
  align-items: center;
  justify-content: flex-start;
  user-select: none;
  width: 0;
  flex-grow: 1;
`,B=d(v)`
  ${l()}
  align-items: center;
  position: relative;
  padding: 16px 12px 16px 16px;
  color: ${o(`text`)};
  flex-shrink: 0;
`,V=a(L);export{I as n,V as t};