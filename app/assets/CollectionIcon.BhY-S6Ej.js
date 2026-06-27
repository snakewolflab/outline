import{o as e}from"./rolldown-runtime.CMxvf4Kt.js";import{Qt as t,en as n}from"./vendor-react.BDv3YiQX.js";import{r}from"./mobxreact.esm.BaBZO6aD.js";import{a as i,t as a}from"./polished.esm.DNeFoW8-.js";import{a as o}from"./styles.3HqXuy1I.js";import{r as s}from"./styles.BAW3KELE.js";import{t as c}from"./collections.C1xZeKhg.js";import{t as l}from"./useStores.C2HL3oms.js";import{c as u,s as d}from"./vendor-styled.BLG-ZaDH.js";import{t as f}from"./lib.CIyroSo6.js";import{_ as p,h as m,l as h,t as g,v as _}from"./dist.BnxCzfoe.js";import{o as v}from"./dist.CESalI_i.js";import{t as y}from"./Text.ChaouWsf.js";import{n as b}from"./Input.4J78Wued.js";import{t as x}from"./Icon.ClgBIv_u.js";import{t as S}from"./dist.c1X2Br8w.js";var C=e(n(),1),w=t(),T=`Switch`,[E,D]=m(T),[O,k]=E(T);function A(e){let{__scopeSwitch:t,checked:n,children:r,defaultChecked:i,disabled:a,form:o,name:s,onCheckedChange:c,required:l,value:u=`on`,internal_do_not_use_render:d}=e,[f,p]=g({prop:n,defaultProp:i??!1,onChange:c,caller:T}),[m,h]=C.useState(null),[_,v]=C.useState(null),y={checked:f,setChecked:p,disabled:a,control:m,setControl:h,name:s,form:o,value:u,hasConsumerStoppedPropagationRef:C.useRef(!1),required:l,defaultChecked:i,isFormControl:m?!!o||!!m.closest(`form`):!0,bubbleInput:_,setBubbleInput:v};return(0,w.jsx)(O,{scope:t,...y,children:R(d)?d(y):r})}var j=`SwitchTrigger`,M=C.forwardRef(({__scopeSwitch:e,onClick:t,...n},r)=>{let{value:i,disabled:a,checked:o,required:s,setControl:c,setChecked:l,hasConsumerStoppedPropagationRef:u,isFormControl:d,bubbleInput:f}=k(j,e),m=p(r,c);return(0,w.jsx)(h.button,{type:`button`,role:`switch`,"aria-checked":o,"aria-required":s,"data-state":z(o),"data-disabled":a?``:void 0,disabled:a,value:i,...n,ref:m,onClick:_(t,e=>{l(e=>!e),f&&d&&(u.current=e.isPropagationStopped(),u.current||e.stopPropagation())})})});M.displayName=j;var N=C.forwardRef((e,t)=>{let{__scopeSwitch:n,name:r,checked:i,defaultChecked:a,required:o,disabled:s,value:c,onCheckedChange:l,form:u,...d}=e;return(0,w.jsx)(A,{__scopeSwitch:n,checked:i,defaultChecked:a,disabled:s,required:o,onCheckedChange:l,name:r,form:u,value:c,internal_do_not_use_render:({isFormControl:e})=>(0,w.jsxs)(w.Fragment,{children:[(0,w.jsx)(M,{...d,ref:t,__scopeSwitch:n}),e&&(0,w.jsx)(L,{__scopeSwitch:n})]})})});N.displayName=T;var P=`SwitchThumb`,F=C.forwardRef((e,t)=>{let{__scopeSwitch:n,...r}=e,i=k(P,n);return(0,w.jsx)(h.span,{"data-state":z(i.checked),"data-disabled":i.disabled?``:void 0,...r,ref:t})});F.displayName=P;var I=`SwitchBubbleInput`,L=C.forwardRef(({__scopeSwitch:e,...t},n)=>{let{control:r,hasConsumerStoppedPropagationRef:i,checked:a,defaultChecked:o,required:s,disabled:c,name:l,value:u,form:d,bubbleInput:f,setBubbleInput:m}=k(I,e),g=p(n,m),_=S(a),y=v(r);C.useEffect(()=>{let e=f;if(!e)return;let t=window.HTMLInputElement.prototype,n=Object.getOwnPropertyDescriptor(t,`checked`).set,r=!i.current;if(_!==a&&n){let t=new Event(`click`,{bubbles:r});n.call(e,a),e.dispatchEvent(t)}},[f,_,a,i]);let b=C.useRef(a);return(0,w.jsx)(h.input,{type:`checkbox`,"aria-hidden":!0,defaultChecked:o??b.current,required:s,disabled:c,name:l,value:u,form:d,...t,tabIndex:-1,ref:g,style:{...t.style,...y,position:`absolute`,pointerEvents:`none`,opacity:0,margin:0,transform:`translateX(-100%)`}})});L.displayName=I;function R(e){return typeof e==`function`}function z(e){return e?`checked`:`unchecked`}d();function B({width:e=32,height:t=18,labelPosition:n=`left`,inForm:r=!0,label:i,disabled:a,className:o,note:s,checked:c,onChange:l,...u},d){let f=(0,w.jsx)(K,{ref:d,checked:c,onCheckedChange:C.useCallback(e=>{l&&l(e)},[l]),disabled:a,width:e,height:t,className:i?void 0:o,...u,children:(0,w.jsx)(G,{width:e,height:t})});return i?(0,w.jsxs)(V,{$inForm:r,children:[(0,w.jsxs)(U,{disabled:a,htmlFor:u.id,className:o,$labelPosition:n,children:[f,(0,w.jsx)(H,{children:i})]}),s&&(0,w.jsx)(y,{type:`secondary`,size:`small`,style:{paddingRight:n===`left`?e:0,paddingLeft:n===`right`?e:0},children:s})]}):f}var V=u.div`
  padding-bottom: ${e=>e.$inForm?8:0}px;
  ${s()}
`,H=u(b)`
  padding-bottom: 0;
  width: 100%;
`,U=u.label`
  display: flex;
  align-items: center;
  user-select: none;
  gap: 8px;

  ${e=>e.$labelPosition===`left`?`flex-direction: row-reverse;`:``}
  ${e=>e.disabled?`opacity: 0.75;`:``}
`,W=3,G=u(F)`
  display: block;
  width: ${e=>e.height-8}px;
  height: ${e=>e.height-8}px;
  background-color: white;
  border-radius: ${e=>(e.height-8)/2}px;
  transition:
    transform 0.2s,
    width 0.2s;
  transform: translateX(0);
  will-change: transform, width;

  &[data-state="checked"] {
    transform: translateX(${e=>e.width-e.height}px);
  }

  [dir="rtl"] &[data-state="checked"] {
    transform: translateX(${e=>-(e.width-e.height)}px);
  }
`,K=u(N)`
  position: relative;
  width: ${e=>e.width}px;
  height: ${e=>e.height}px;
  background-color: ${e=>e.theme.slate};
  border-radius: ${e=>e.height}px;
  border: none;
  cursor: var(--pointer);
  transition: background-color 0.2s;
  padding: 0 4px;
  flex-shrink: 0;

  &:focus {
    box-shadow: 0 0 1px ${o(`accent`)};
    outline: none;
  }

  &[data-state="checked"] {
    background-color: ${o(`accent`)};
  }

  &:active:not(:disabled) {
    background-color: ${e=>a(.1,e.theme.slate)};
  }

  &:active:not(:disabled)[data-state="checked"] {
    background-color: ${e=>a(.1,e.theme.accent)};
  }

  &:disabled {
    opacity: 0.75;
    cursor: default;
  }

  &:hover:not(:disabled) ${G} {
    width: ${e=>e.height-8+W}px;
  }

  &:hover:not(:disabled)[data-state="checked"] ${G} {
    transform: translateX(
      ${e=>e.width-e.height-W}px
    );
  }

  [dir="rtl"]
    &:hover:not(:disabled)[data-state="checked"]
    ${G} {
    transform: translateX(
      ${e=>-(e.width-e.height-W)}px
    );
  }
`,q=C.forwardRef(B),J=f();function Y({collection:e,color:t,expanded:n,size:r,className:a}){let{ui:o}=l();if(!e.icon||e.icon===`collection`){let s=e.color??c[0],l=t||(o.resolvedTheme===`dark`&&s!==`currentColor`?i(s)>.09?s:`currentColor`:s);return(0,w.jsx)(e.isPrivate?J.PrivateCollectionIcon:J.CollectionIcon,{color:l,expanded:n,size:r,className:a})}return(0,w.jsx)(x,{value:e.icon,color:t??e.color??void 0,size:r,initial:e.initial,className:a,forceColor:!!t})}var X=r(Y);export{q as n,X as t};