import{o as e}from"./rolldown-runtime.CMxvf4Kt.js";import{D as t,Qt as n,en as r}from"./vendor-react.BDv3YiQX.js";import{r as i}from"./mobxreact.esm.BaBZO6aD.js";import{a,s as o}from"./styles.3HqXuy1I.js";import{t as s}from"./usePrevious.DSWAD__5.js";import{t as c}from"./Desktop.YvZPTfe5.js";import{c as l,s as u,t as d}from"./vendor-styled.BLG-ZaDH.js";import{t as f}from"./lib.CIyroSo6.js";import{r as p,t as m}from"./Tooltip.DlvdmaJm.js";import{t as h}from"./Text.ChaouWsf.js";import{t as g}from"./Flex.DJ6mR3Bq.js";import{a as _,n as v}from"./animations.B6M7uYBl.js";import{j as y,x as b}from"./index.CHF0CgVb.js";import{c as x,i as S,n as C,o as w,s as T,t as E}from"./Scrollable.DWFqONda.js";import{t as D}from"./NudeButton.tKECI9NH.js";var O=f(),k=e(r());u();var A=n(),j=({children:e,isOpen:n,title:r,style:i,width:a,height:o,onRequestClose:c})=>{let l=s(n),u=p(),{t:d}=t(),f=r??d(`Untitled`),g=y(),_=k.useCallback(()=>{g.setAnimating(!1),c()},[g,c]);return!n&&!l?null:(0,A.jsx)(C,{open:n,onOpenChange:e=>!e&&_(),children:(0,A.jsxs)(T,{children:[(0,A.jsx)(M,{}),(0,A.jsx)(N,{onEscapeKeyDown:_,onPointerDownOutside:_,"aria-describedby":void 0,children:u?(0,A.jsxs)(P,{children:[(0,A.jsx)(F,{children:(0,A.jsxs)(L,{onClick:e=>e.stopPropagation(),column:!0,children:[(0,A.jsx)(x,{asChild:!0,children:(0,A.jsx)(h,{size:`xlarge`,weight:`bold`,children:f})}),(0,A.jsx)(b,{children:e})]})}),(0,A.jsx)(R,{onClick:_,children:(0,A.jsx)(O.CloseIcon,{size:32})}),(0,A.jsxs)(z,{onClick:_,children:[(0,A.jsx)(O.BackIcon,{size:32}),(0,A.jsxs)(h,{children:[d(`Back`),` `]})]})]}):(0,A.jsx)(V,{$width:a,$height:o,children:(0,A.jsxs)(L,{onClick:e=>e.stopPropagation(),style:{maxHeight:`65vh`},column:!0,reverse:!0,children:[(0,A.jsx)(I,{style:i,topShadow:!0,overflow:g.animating?`hidden`:void 0,onAnimationEnd:()=>g.setAnimating(!1),children:(0,A.jsx)(b,{component:`div`,children:e})}),(0,A.jsxs)(B,{children:[(0,A.jsx)(x,{asChild:!0,children:(0,A.jsx)(h,{size:`large`,children:f})}),(0,A.jsx)(m,{content:d(`Close`),shortcut:`Esc`,children:(0,A.jsx)(D,{onClick:_,children:(0,A.jsx)(O.CloseIcon,{})})})]})]})})})]})})},M=l(w)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${e=>e.theme.modalBackdrop} !important;
  z-index: ${o.overlay};
  animation: ${_} 200ms ease;
`,N=l(S)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: ${o.modal};
  display: flex;
  justify-content: center;
  align-items: flex-start;
  outline: none;
`,P=l.div`
  animation: ${v} 250ms ease;

  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: ${o.modal};
  display: flex;
  justify-content: center;
  align-items: flex-start;
  background: ${a(`background`)};
  outline: none;
`,F=l(E)`
  width: 100%;
  padding: 8vh 12px;

  ${d(`tablet`)`
    padding: 13vh 2rem 2rem;
  `};
`,I=l(E)`
  padding: 8px 24px 24px;
`,L=l(g)`
  width: 640px;
  max-width: 100%;
  position: relative;
  margin: 0 auto;
`,R=l(D)`
  position: absolute;
  display: block;
  top: 0;
  right: 0;
  margin: 12px;
  opacity: 0.75;
  color: ${a(`text`)};
  width: auto;
  height: auto;

  &:hover {
    opacity: 1;
  }

  ${d(`tablet`)`
    display: none;
  `};
`,z=l(D)`
  position: absolute;
  display: none;
  align-items: center;
  top: ${c.hasInsetTitlebar()?`3rem`:`2rem`};
  left: 2rem;
  opacity: 0.75;
  color: ${a(`text`)};
  font-weight: 500;
  width: auto;
  height: auto;

  &:hover {
    opacity: 1;
  }

  ${d(`tablet`)`
    display: flex;
  `};
`,B=l(g)`
  color: ${a(`textSecondary`)};
  align-items: center;
  justify-content: space-between;
  font-weight: 600;
  padding: 24px 24px 12px;
  flex-shrink: 0;
`,V=l.div`
  animation: ${v} 250ms ease;

  margin: 25vh auto auto auto;
  width: 75vw;
  min-width: 350px;
  max-width: ${e=>e.$width||`450px`};
  max-height: ${e=>e.$height||`70vh`};
  z-index: ${o.modal};
  display: flex;
  justify-content: center;
  align-items: flex-start;
  background: ${a(`modalBackground`)};
  box-shadow: ${a(`modalShadow`)};
  border-radius: 8px;
  outline: none;

  ${D} {
    &:hover,
    &[aria-expanded="true"] {
      background: ${a(`sidebarControlHoverBackground`)};
    }
    vertical-align: middle;
  }

  ${B} {
    align-items: start;
  }
`,H=i(j);export{H as default};