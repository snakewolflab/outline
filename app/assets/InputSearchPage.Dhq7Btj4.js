import{o as e}from"./rolldown-runtime.CMxvf4Kt.js";import{D as t,Nt as n,Qt as r,en as i}from"./vendor-react.BDv3YiQX.js";import{r as a}from"./mobxreact.esm.BaBZO6aD.js";import{a as o}from"./styles.3HqXuy1I.js";import{C as s}from"./routeHelpers.Dp2pk1Po.js";import{c,o as l,s as u,t as d}from"./vendor-styled.BLG-ZaDH.js";import{t as f}from"./lib.CIyroSo6.js";import{l as p,o as m,r as h,s as g}from"./Tooltip.DlvdmaJm.js";import{t as _}from"./Input.4J78Wued.js";import{t as v}from"./useKeyDown.Du2PZ2Ep.js";import{t as y}from"./useBoolean.CKHZbah2.js";var b=f(),x=e(i());u();var S=r();function C({onKeyDown:e,value:r,onChange:i,placeholder:a,label:o,collectionId:c,source:u}){let d=x.useRef(null),f=l(),_=n(),{t:C}=t(),E=h(),[D,O,k]=y(!1);v(`f`,e=>{m(e)&&document.activeElement!==d.current&&(e.preventDefault(),d.current?.focus())});let A=x.useCallback(t=>{t.nativeEvent.isComposing||(t.key===`Enter`&&(t.preventDefault(),_.push(s({query:t.currentTarget.value,collectionId:c,ref:u}))),t.key===`Escape`&&(t.preventDefault(),d.current?.blur()),e&&e(t))},[_,c,u,e]);return(0,S.jsx)(w,{ref:d,type:`search`,placeholder:a||`${C(`Search`)}…`,value:r,onChange:i,onKeyDown:A,icon:(0,S.jsx)(b.SearchIcon,{color:D?f.inputBorderFocused:f.inputBorder}),label:o,onFocus:O,onBlur:k,margin:0,labelHidden:!0,children:!E&&(0,S.jsxs)(T,{$visible:!D&&!r&&!c,children:[g,p,`K`]})})}var w=c(_).attrs({round:!0})`
  max-width: min(calc(30vw + 20px), 100%);

  /* On mobile the input grows to fill the header, so add a gap before the
   * adjacent action button (e.g. "New doc"). */
  ${d(`mobile`,`tablet`)`
    margin-inline-end: 8px;
  `}
`,T=c.span`
  flex-shrink: 0;
  font-size: 13px;
  color: ${o(`textTertiary`)};
  padding-inline: 0 10px;
  pointer-events: none;
  opacity: ${e=>+!!e.$visible};
  transition: opacity 100ms ease-in-out;
`,E=a(C);export{E as t};