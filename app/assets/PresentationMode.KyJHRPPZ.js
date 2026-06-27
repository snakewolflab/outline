import{o as e}from"./rolldown-runtime.CMxvf4Kt.js";import{$t as t,D as n,Qt as r,en as i}from"./vendor-react.BDv3YiQX.js";import{c as a}from"./vendor-mermaid.BVPraj9B.js";import{a as o,c as s,i as c,s as l}from"./styles.3HqXuy1I.js";import{t as ee}from"./collections.C1xZeKhg.js";import{c as u,o as d,s as f}from"./vendor-styled.BLG-ZaDH.js";import{t as p}from"./lib.CIyroSo6.js";import{t as m}from"./Tooltip.DlvdmaJm.js";import{t as h}from"./Text.ChaouWsf.js";import{t as g}from"./Flex.DJ6mR3Bq.js";import{a as _}from"./index.CHF0CgVb.js";import{t as v}from"./Icon.ClgBIv_u.js";import{t as y}from"./NudeButton.tKECI9NH.js";import{i as b,t as x}from"./useKeyDown.Du2PZ2Ep.js";import{t as te}from"./ProsemirrorHelper.DXnK0H48.js";import{t as S}from"./Editor.D7UmBdoz.js";import{i as C,n as w}from"./ArrowIcon.pziaqp-X.js";var T=e(i()),E=e(t()),D=p();f();var O=r(),k=[`click`,`mousemove`,`mousedown`,`touchstart`,`touchmove`];function A(e){return e.every(e=>e.type===`paragraph`&&(!e.content||e.content.length===0))}function ne(e,t,n,r){let i=e.content??[],a=[{type:`title`,title:t,icon:n,iconColor:r}],o=[];for(let e of i){let t=e.type===`horizontal_rule`||e.type===`hr`,n=e.type===`heading`&&e.attrs&&typeof e.attrs.level==`number`&&e.attrs.level<=2;if(t){o.length>0&&(a.push({type:`content`,content:o}),o=[]);continue}n&&o.length>0&&(a.push({type:`content`,content:o}),o=[]),o.push(e)}return o.length>0&&a.push({type:`content`,content:o}),a}function j({title:e,icon:t,iconColor:r,data:i,onClose:o}){let{t:c}=n(),l=d(),[u,f]=T.useState(0),p=T.useRef(null),h=T.useRef(null),[y,j]=T.useState(!1),U=T.useMemo(()=>s(),[]),W=_(3e3,k),G=T.useMemo(()=>te.removeMarks(a(i),[`comment`]),[i]),K=T.useMemo(()=>{let n=ne(G,e,t,r),i=n.filter(e=>e.type===`content`);return i.length>0&&i.some(e=>e.type===`content`&&!A(e.content))?n:[n[0],{type:`instructions`}]},[G,e,t,r]),q=K.length,J=T.useCallback(()=>{f(e=>Math.min(e+1,q-1))},[q]),Y=T.useCallback(()=>{f(e=>Math.max(e-1,0))},[]),ae=T.useCallback(()=>{f(0)},[]),oe=T.useCallback(()=>{f(q-1)},[q]),X=T.useCallback(()=>{if(!U)return;let e=p.current;e&&(document.fullscreenElement?document.exitFullscreen().catch(()=>{}):e.requestFullscreen().catch(()=>{}))},[U]);x(`Escape`,o),x(`ArrowRight`,J),x(`ArrowDown`,J),x(`PageDown`,J),x(`ArrowLeft`,Y),x(`ArrowUp`,Y),x(`PageUp`,Y),x(`Home`,ae),x(`End`,oe),x(` `,J),x(`f`,X),T.useEffect(()=>{let e=document.body.style.overflow;return document.body.style.overflow=`hidden`,()=>{document.body.style.overflow=e}},[]),T.useEffect(()=>{if(!U)return;let e=()=>{j(!!document.fullscreenElement)};return document.addEventListener(`fullscreenchange`,e),()=>{document.removeEventListener(`fullscreenchange`,e),document.fullscreenElement&&document.exitFullscreen().catch(()=>{})}},[U]);let Z=T.useRef({width:0,height:0});T.useEffect(()=>{let e=h.current,t=p.current;if(!e||!t)return;let n=()=>{let{width:n,height:r}=Z.current;if(n===0||r===0){e.style.transform=`scale(1)`;return}let i=t.clientWidth-160,a=t.clientHeight-160,o=i/n,s=a/r,c=Math.min(o,s,1.5);e.style.transform=`scale(${Math.max(c,.5)})`};return e.style.transform=`none`,requestAnimationFrame(()=>{Z.current={width:e.scrollWidth,height:e.scrollHeight},n(),window.addEventListener(`resize`,n)}),()=>{window.removeEventListener(`resize`,n)}},[u]);let Q=K[u],$=T.useMemo(()=>Q.type===`content`?{type:`doc`,content:Q.content}:void 0,[Q]),se=T.useMemo(()=>b,[]);return(0,E.createPortal)((0,O.jsxs)(re,{ref:p,$background:l.background,$idle:W,children:[(0,O.jsxs)(I,{$idle:W,children:[(0,O.jsxs)(g,{align:`center`,gap:12,children:[(0,O.jsx)(m,{content:c(`Previous slide`),delay:500,children:(0,O.jsx)(z,{onClick:Y,disabled:u===0,children:(0,O.jsx)(w,{})})}),(0,O.jsxs)(L,{children:[u+1,` / `,q]}),(0,O.jsx)(m,{content:c(`Next slide`),delay:500,children:(0,O.jsx)(z,{onClick:J,disabled:u===q-1,children:(0,O.jsx)(C.ArrowIcon,{color:`currentColor`})})})]}),(0,O.jsxs)(R,{children:[U&&(0,O.jsx)(m,{content:c(`Toggle fullscreen`),delay:500,children:(0,O.jsx)(z,{onClick:X,children:y?(0,O.jsx)(D.ShrinkIcon,{color:`currentColor`}):(0,O.jsx)(D.GrowIcon,{color:`currentColor`})})}),(0,O.jsx)(m,{content:c(`Close`),delay:500,children:(0,O.jsx)(z,{onClick:o,children:(0,O.jsx)(D.CloseIcon,{})})})]})]}),(0,O.jsx)(ie,{onClick:e=>{e.target.closest(`a`)||J()},children:(0,O.jsx)(M,{ref:h,children:Q.type===`title`?(0,O.jsxs)(N,{children:[Q.icon&&(0,O.jsx)(P,{children:(0,O.jsx)(v,{value:Q.icon,color:Q.iconColor??ee[0],size:64,initial:Q.title[0]})}),(0,O.jsx)(F,{children:Q.title})]}):Q.type===`instructions`?(0,O.jsxs)(B,{children:[(0,O.jsx)(V,{children:c(`Create your presentation`)}),(0,O.jsxs)(H,{children:[c(`Add content to your document, then use headings or dividers to separate it into slides.`),` `,(0,O.jsx)(`a`,{href:`https://docs.getoutline.com/s/guide/doc/present-mode-yMGzaY7A9L`,target:`_blank`,children:c(`Learn more`)}),`.`]})]}):$?(0,O.jsx)(S,{defaultValue:$,extensions:se,readOnly:!0,grow:!1,placeholder:``},u):null})})]}),document.body)}var re=u.div`
  position: fixed;
  inset: 0;
  z-index: ${l.presentation};
  background: ${e=>e.$background};
  display: flex;
  flex-direction: column;
  user-select: none;
  cursor: ${e=>e.$idle?`none`:`default`};

  * {
    cursor: inherit;
  }

  a[href] {
    cursor: ${e=>e.$idle?`none`:`pointer`};
  }
`,ie=u.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: 80px;
`,M=u.div`
  max-width: 960px;
  width: 100%;
  transform-origin: center center;

  .ProseMirror {
    padding: 0;
    font-size: 1.4em;
  }

  .image-wrapper,
  .image-wrapper img,
  .mermaid-diagram-wrapper {
    pointer-events: none !important;
  }

  h1 {
    font-size: 2.4em;
  }
  h2 {
    font-size: 1.8em;
  }
  h3 {
    font-size: 1.4em;
  }
`,N=u.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 24px;
  min-height: 200px;
`,P=u.div`
  flex-shrink: 0;
`,F=u.h1`
  font-size: 3em;
  font-weight: 600;
  line-height: 1.25;
  margin: 0;
  color: ${o(`text`)};
`,I=u.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1;
  opacity: ${e=>+!e.$idle};
  pointer-events: ${e=>e.$idle?`none`:`auto`};
  transition: opacity 300ms ease;
`,L=u(h)`
  font-variant-numeric: tabular-nums;
  color: ${o(`textTertiary`)};
  font-size: 14px;
  min-width: 60px;
  text-align: center;
`,R=u(g).attrs({align:`center`,gap:16})`
  position: absolute;
  right: 16px;
`,z=u(y).attrs({size:32})`
  &:not(:disabled) {
    color: ${o(`textTertiary`)};

    &:${c},
    &:active {
      color: ${o(`text`)};
    }
  }

  &:disabled {
    color: ${o(`textTertiary`)};
    opacity: 0.5;
  }
`,B=u(N)`
  gap: 16px;
  max-width: 560px;
  margin: 0 auto;
`,V=u.h2`
  font-size: 2em;
  font-weight: 600;
  margin: 0;
  color: ${o(`text`)};
`,H=u.p`
  font-size: 1.2em;
  line-height: 1.6;
  margin: 0;
  color: ${o(`textSecondary`)};
`;export{j as default};