import{o as e}from"./rolldown-runtime.CMxvf4Kt.js";import{E as t,Qt as n,en as r}from"./vendor-react.BDv3YiQX.js";import{a as i,t as a}from"./styles.3HqXuy1I.js";import{r as o}from"./styles.BAW3KELE.js";import{c as s,s as c,t as l}from"./vendor-styled.BLG-ZaDH.js";import{u}from"./Tooltip.DlvdmaJm.js";import{t as d}from"./Text.ChaouWsf.js";import{t as f}from"./Flex.DJ6mR3Bq.js";import{n as p}from"./Fade.DoZVoUzz.js";var m=e(r());c();var h=n(),g=s.textarea`
  border: 0;
  flex: 1;
  padding: 8px 12px 8px
    ${e=>e.hasPrefix?0:e.hasIcon?`8px`:`12px`};
  outline: none;
  background: none;
  color: ${i(`text`)};

  ${e=>e.$autoSize&&`field-sizing: content;`}
  ${e=>e.$minHeight&&`min-height: ${e.$minHeight};`}
  ${e=>e.$maxHeight&&`max-height: ${e.$maxHeight};`}

  &:disabled,
  &::placeholder {
    color: ${i(`placeholder`)};
    opacity: 1;
  }
`,_=s.input`
  border: 0;
  flex: 1;
  padding: 8px 12px 8px
    ${e=>e.hasPrefix?0:e.hasIcon?`8px`:`12px`};
  outline: none;
  background: none;
  color: ${i(`text`)};
  height: 30px;
  min-width: 0;
  font-size: 15px;

  ${a()}
  ${o()}

  &[readOnly] {
    color: ${i(`textSecondary`)};
  }

  &:disabled,
  &::placeholder {
    color: ${i(`placeholder`)};
    opacity: 1;
  }

  &:-webkit-autofill,
  &:-webkit-autofill:hover,
  &:-webkit-autofill:focus {
    -webkit-box-shadow: 0 0 0px 1000px ${i(`background`)} inset;
  }

  &::-webkit-search-cancel-button {
    -webkit-appearance: none;
  }

  ${l(`mobile`,`tablet`)`
    font-size: 16px;
  `};
`,v=s.div`
  flex: ${e=>e.flex?`1`:`0`};
  width: ${e=>e.short?`49%`:`auto`};
  max-width: ${e=>e.short?`350px`:`100%`};
  min-width: ${({minWidth:e})=>e?`${e}px`:`initial`};
  min-height: ${({minHeight:e})=>e?`${e}px`:`0`};
  max-height: ${({maxHeight:e})=>e?`${e}px`:`initial`};
`,y=s.span`
  position: relative;
  inset-inline-start: 4px;
  width: 24px;
  height: 24px;
`,b=s(f)`
  position: relative;
  flex: 1;
  margin: ${e=>e.margin===void 0?`0 0 16px`:e.margin};
  color: inherit;
  border-width: 1px;
  border-style: solid;
  border-color: ${e=>e.hasError?e.theme.danger:e.$focused?e.theme.inputBorderFocused:e.theme.inputBorder};
  border-radius: ${e=>e.$round?`16px`:`4px`};
  font-weight: normal;
  align-items: center;
  overflow: hidden;
  background: ${i(`background`)};

  /* Prevents an issue where input placeholder appears in a selected style when double clicking title bar */
  user-select: none;
`,x=s.span`
  position: absolute;
  top: 0;
  inset-inline-end: 0;
  font-size: 11px;
  line-height: 1;
  padding: 2px 4px;
  border-start-start-radius: 0;
  border-start-end-radius: 0;
  border-end-end-radius: 0;
  border-end-start-radius: 2px;
  background: ${e=>e.$warning?e.theme.warning:e.theme.inputBorder};
  color: ${e=>e.$warning?e.theme.white:e.theme.textTertiary};
  pointer-events: none;
`,S=s.div`
  font-weight: 500;
  padding-bottom: 4px;
  display: inline-block;
`;function C(e,n){let r=m.useRef(),[i,a]=m.useState(!1),[o,s]=m.useState(()=>typeof e.value==`string`?e.value.length:typeof e.defaultValue==`string`?e.defaultValue.length:0);m.useEffect(()=>{typeof e.value==`string`&&s(e.value.length)},[e.value]);let c=t=>{a(!1),e.onBlur&&e.onBlur(t)},l=t=>{a(!0),e.onFocus&&e.onFocus(t)},f=t=>{s(t.target.value.length),e.onChange&&e.onChange(t)},C=t=>{if(t.key===`Enter`&&t.metaKey&&e.onRequestSubmit){e.onRequestSubmit(t);return}e.onKeyDown&&e.onKeyDown(t)};m.useEffect(()=>{e.autoSelect&&r.current&&r.current.select()},[e.autoSelect,r]);let{type:T=`text`,icon:E,label:D,margin:O,error:k,className:A,short:j,flex:M,prefix:N,round:P,labelHidden:F,maxLength:I,showCharacterCount:L,warningLimit:R,autoSize:z,minHeight:B,maxHeight:V,onFocus:H,onBlur:U,onChange:W,onRequestSubmit:G,children:K,...q}=e,J=(T===`textarea`||L)&&I!==void 0&&(o>=I*.9||R!==void 0&&o>=R),Y=R!==void 0&&o>R,X=(0,h.jsx)(S,{children:D});return(0,h.jsxs)(v,{className:A,short:j,flex:M,children:[(0,h.jsxs)(`label`,{children:[D&&(F?(0,h.jsx)(u,{children:X}):X),(0,h.jsxs)(b,{$focused:i,$round:P,margin:O,children:[N,E&&(0,h.jsx)(y,{children:E}),T===`textarea`?(0,h.jsx)(g,{ref:t([r,n]),onBlur:c,onFocus:l,hasIcon:!!E,hasPrefix:!!N,$autoSize:z,$minHeight:B,$maxHeight:V,...q,maxLength:I,onKeyDown:C,onChange:f}):(0,h.jsx)(_,{ref:t([r,n]),onBlur:c,onFocus:l,hasIcon:!!E,hasPrefix:!!N,type:T,...q,maxLength:I,onKeyDown:C,onChange:f}),J&&(0,h.jsx)(p,{children:(0,h.jsxs)(x,{$warning:Y,children:[o,`/`,I]})}),K]})]}),k&&(0,h.jsx)(w,{children:(0,h.jsx)(d,{type:`danger`,size:`xsmall`,children:k})})]})}var w=s.span`
  min-height: 16px;
  display: block;
  margin-top: -16px;
`,T=m.forwardRef(C);export{b as i,S as n,_ as r,T as t};