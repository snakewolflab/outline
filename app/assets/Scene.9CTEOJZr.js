import{o as e}from"./rolldown-runtime.CMxvf4Kt.js";import{E as t,Qt as n,b as r,en as i}from"./vendor-react.BDv3YiQX.js";import{r as a}from"./mobxreact.esm.BaBZO6aD.js";import{_ as o}from"./vendor-es-toolkit.XcNOARzK.js";import{r as s}from"./polished.esm.DNeFoW8-.js";import{a as c,s as l,y as u}from"./styles.3HqXuy1I.js";import{t as d}from"./useEventListener.C_K9fUNE.js";import{n as f,t as p}from"./styles.BAW3KELE.js";import{t as m}from"./Desktop.YvZPTfe5.js";import{t as h}from"./useStores.C2HL3oms.js";import{c as g,s as _,t as v}from"./vendor-styled.BLG-ZaDH.js";import{t as y}from"./lib.CIyroSo6.js";import{n as b,r as x}from"./Tooltip.DlvdmaJm.js";import{t as S}from"./Flex.DJ6mR3Bq.js";import{n as C}from"./Fade.DoZVoUzz.js";import{D as w,E as T,S as E}from"./index.CHF0CgVb.js";var D=y(),O=e(i());_();var k=n();function A({left:e,title:n,actions:i,hasSidebar:a,className:s},c){let{ui:l}=h(),f=x(),p=a&&f,[g,_]=r(),[v,y]=r(),S=!i&&!e&&!n,[w,T]=O.useState(!1);d(`scroll`,O.useMemo(()=>o(()=>T(window.scrollY>75),50),[]),window,u?{passive:!0}:{capture:!1});let E=O.useCallback(()=>{window.scrollTo({top:0,behavior:`smooth`})},[]),A=O.useCallback(e=>{e?.firstElementChild&&v(e.firstElementChild)},[v]),I=y.width>_.width/3,L=_.width<1e3||I;return(0,k.jsx)(b,{children:(0,k.jsxs)(N,{ref:t([c,g]),align:`center`,shrink:!1,className:s,$passThrough:S,$insetTitleAdjust:l.sidebarIsClosed&&m.hasInsetTitlebar(),children:[e||p?(0,k.jsxs)(j,{ref:A,children:[p&&(0,k.jsx)(F,{haptic:`light`,onClick:l.toggleMobileSidebar,icon:(0,k.jsx)(D.MenuIcon,{}),neutral:!0}),e]}):null,w&&!L?(0,k.jsx)(P,{onClick:E,children:(0,k.jsx)(C,{children:n})}):(0,k.jsx)(`div`,{}),(0,k.jsx)(M,{align:`center`,justify:`flex-end`,children:typeof i==`function`?i({isCompact:L}):i})]})})}var j=g(`div`)`
  flex-grow: 1;
  flex-basis: 0;
  min-width: 0;
  align-items: center;
  padding-inline: 0 8px;
  display: flex;

  ${v(`tablet`)`
    min-width: auto;
  `};
`,M=g(S)`
  flex-grow: 1;
  flex-basis: 0;
  min-width: auto;
  padding-inline: 8px 0;
  gap: 12px;
  margin-inline-start: 8px;

  ${v(`tablet`)`
    position: unset;
  `};
`,N=g(S)`
  top: 0;
  z-index: ${l.header};
  position: sticky;
  background: ${c(`background`)};

  ${e=>e.$passThrough?`
      background: transparent;
      pointer-events: none;
      `:`
      background: ${s(.2,e.theme.background)};
      backdrop-filter: blur(20px);
      `};

  padding: 12px 16px;
  transform: translate3d(0, 0, 0);
  min-height: ${64}px;
  justify-content: flex-start;
  ${p()}

  button,
  [role="button"] {
    ${f()}
  }

  @supports (backdrop-filter: blur(20px)) {
    backdrop-filter: blur(20px);
    background: ${e=>s(.2,e.theme.background)};
  }

  @media print {
    display: none;
  }

  ${v(`tablet`)`
    padding: 16px;
    ${e=>e.$insetTitleAdjust&&`padding-left: 64px;`}
    `};
`,P=g(`div`)`
  display: none;
  font-size: 16px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  cursor: var(--pointer);
  min-width: 0;

  ${v(`tablet`)`
    padding-left: 0;
    display: block;
  `};

  svg {
    vertical-align: bottom;
  }

  @media (display-mode: standalone) {
    overflow: hidden;
    flex-grow: 0 !important;
  }
`,F=g(w)`
  margin-right: 8px;
  pointer-events: auto;

  @media print {
    display: none;
  }
`,I=a(O.forwardRef(A));_();var L=({title:e,icon:t,textTitle:n,actions:r,left:i,children:a,centered:o,wide:s})=>(0,k.jsxs)(R,{children:[(0,k.jsx)(E,{title:n??(typeof e==`string`?e:``)}),(0,k.jsx)(I,{hasSidebar:!0,title:t?(0,k.jsxs)(k.Fragment,{children:[t,`\xA0`,e]}):e,actions:r,left:i}),o===!1?a:(0,k.jsx)(T,{maxWidth:s?`100vw`:void 0,withStickyHeader:!0,children:a})]}),R=g.div`
  width: 100%;
`;export{I as n,L as t};