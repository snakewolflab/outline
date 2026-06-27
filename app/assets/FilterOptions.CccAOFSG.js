import{o as e}from"./rolldown-runtime.CMxvf4Kt.js";import{D as t,Qt as n,en as r}from"./vendor-react.BDv3YiQX.js";import{s as i}from"./vendor-es-toolkit.XcNOARzK.js";import{a}from"./styles.3HqXuy1I.js";import{c as o,s}from"./vendor-styled.BLG-ZaDH.js";import{t as c}from"./lib.CIyroSo6.js";import{r as l}from"./Tooltip.DlvdmaJm.js";import{t as u}from"./Text.ChaouWsf.js";import{i as d,r as f,t as p}from"./Input.4J78Wued.js";import{D as m,O as h}from"./index.CHF0CgVb.js";import{t as g}from"./Scrollable.DWFqONda.js";import{a as ee,i as _,n as v,t as y}from"./Drawer.DylWdgHO.js";import{t as b}from"./PaginatedList.CQlHVOKx.js";import{_ as x,b as S,c as C,d as w,f as T,l as E,p as D,u as O,v as k}from"./OverflowMenuButton.e_BZrgS_.js";var A=c(),j=e(r());s();var M=n(),N=({options:e,selectedKeys:n,className:r,onSelect:a,showFilter:o,showIcons:s=!0,fetchQuery:c,fetchQueryOptions:u,disclosure:d=!0,...f})=>{let{t:p}=t(),m=l(),h=j.useRef(null),g=j.useRef(null),[N,B]=j.useState(!1),V=e.filter(e=>n.includes(e.key)),[H,U]=j.useState(``),W=V.length?V.map(e=>e.label).join(`, `):``,G=j.useCallback(e=>{let t=()=>{a(e.key),B(!1)},r=e.icon&&s?(0,M.jsx)(x,{"aria-hidden":!0,children:e.icon}):void 0;return m?(0,M.jsxs)(D,{onClick:t,children:[r,(0,M.jsx)(k,{children:e.label}),(0,M.jsx)(S,{"aria-hidden":!0,children:n.includes(e.key)?(0,M.jsx)(A.CheckmarkIcon,{size:18}):null})]},e.key):(0,M.jsx)(E,{icon:r,label:e.label,onClick:t,selected:n.includes(e.key)},e.key)},[a,s,n,m]),K=j.useCallback(e=>{U(e.target.value)},[]),q=j.useMemo(()=>{let t=i(H.toLowerCase());return(H?e.filter(e=>i(e.label).toLowerCase().includes(t)):e).sort((e,r)=>{let a=n.includes(e.key),o=n.includes(r.key);if(a&&!o)return-1;if(!a&&o)return 1;if(H){let n=i(e.label).toLowerCase().startsWith(t),a=i(r.label).toLowerCase().startsWith(t);if(n&&!a)return-1;if(!n&&a)return 1}return 0})},[e,H,n]),J=j.useCallback(e=>{if(!(e.nativeEvent.isComposing||e.shiftKey))switch(e.stopPropagation(),e.key){case`Escape`:B(!1);break;case`Enter`:q.length===1&&(e.preventDefault(),a(q[0].key),B(!1));break;case`ArrowDown`:e.preventDefault(),(g.current?.firstElementChild)?.focus();break;default:break}},[q,a]),Y=j.useCallback(e=>{h.current?.focus(),e.key===`Backspace`&&U(e=>e.slice(0,-1))},[]);j.useEffect(()=>{N?m||h.current?.focus():U(``)},[N,m]);let X=o||e.length>10,Z=f.defaultLabel||p(`Filter options`),Q=(0,M.jsx)(z,{className:r,icon:V[0]?.key&&V[0]?.icon,disclosure:d,neutral:!0,children:V.length?W:Z}),$=(0,M.jsx)(b,{listRef:g,options:{query:H,...u},items:q,fetch:c,renderItem:G,onEscape:Y,heading:X&&!m?(0,M.jsx)(F,{}):void 0,empty:(0,M.jsx)(P,{})});return m?(0,M.jsxs)(y,{open:N,onOpenChange:B,children:[(0,M.jsx)(ee,{asChild:!0,children:Q}),(0,M.jsxs)(v,{"aria-label":Z,"aria-describedby":void 0,children:[(0,M.jsx)(_,{children:Z}),X&&(0,M.jsx)(L,{ref:h,value:H,onChange:K,onKeyDown:J,placeholder:`${p(`Filter`)}…`,margin:0}),(0,M.jsx)(R,{hiddenScrollbars:!0,children:$})]})]}):(0,M.jsx)(T,{variant:`dropdown`,children:(0,M.jsxs)(C,{open:N,onOpenChange:B,children:[(0,M.jsx)(w,{children:Q}),(0,M.jsxs)(O,{"aria-label":Z,align:`start`,children:[$,X&&(0,M.jsx)(I,{ref:h,value:H,onChange:K,onKeyDown:J,placeholder:`${p(`Filter`)}…`,autoFocus:!0})]})]})})},P=()=>{let{t:e}=t();return(0,M.jsxs)(M.Fragment,{children:[(0,M.jsx)(F,{}),(0,M.jsx)(u,{size:`small`,type:`tertiary`,style:{marginLeft:6},children:e(`No results`)})]})},F=o.div`
  height: 30px;
`,I=o(p)`
  position: absolute;
  width: 100%;
  border: none;
  border-top-left-radius: 6px;
  border-top-right-radius: 6px;
  overflow: hidden;
  margin: 0;
  top: 0;
  left: 0;
  right: 0;

  ${d} {
    border: none;
    border-radius: 0;
    border-bottom: 1px solid ${a(`divider`)};
    background: ${a(`menuBackground`)};
    margin: 0;
  }

  ${f} {
    font-size: 14px;
  }
`,L=o(p)`
  /* "none" keeps an auto basis so the input retains its natural height; a
     flexible/0% basis would collapse it and overlap the list below. */
  flex: none;
  margin: 0 6px 6px;

  ${f} {
    /* 16px avoids iOS zooming the viewport when the input is focused. */
    font-size: 16px;
  }
`,R=o(g)`
  max-height: 75vh;
`,z=o(m)`
  box-shadow: none;
  text-transform: none;
  border-color: transparent;
  height: auto;

  &:hover {
    background: transparent;
  }

  ${h} {
    line-height: 28px;
    min-height: auto;
  }
`;export{z as n,N as t};