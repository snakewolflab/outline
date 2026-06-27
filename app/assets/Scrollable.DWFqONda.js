import{o as e}from"./rolldown-runtime.CMxvf4Kt.js";import{Qt as t,T as n,en as r}from"./vendor-react.BDv3YiQX.js";import{r as i}from"./mobxreact.esm.BaBZO6aD.js";import{r as a}from"./styles.3HqXuy1I.js";import{c as o,r as s,s as c}from"./vendor-styled.BLG-ZaDH.js";import{_ as l,h as u,i as d,l as f,n as p,o as m,p as h,r as g,s as _,t as v,v as y}from"./dist.BnxCzfoe.js";import{n as b,r as x,t as S}from"./es2015.DX7OPY8u.js";var C=e(r(),1),w=t(),T=`Dialog`,[E,ee]=u(T),[D,O]=E(T),k=e=>{let{__scopeDialog:t,children:n,open:r,defaultOpen:i,onOpenChange:a,modal:o=!0}=e,s=C.useRef(null),c=C.useRef(null),[l,u]=v({prop:r,defaultProp:i??!1,onChange:a,caller:T});return(0,w.jsx)(D,{scope:t,triggerRef:s,contentRef:c,contentId:d(),titleId:d(),descriptionId:d(),open:l,onOpenChange:u,onOpenToggle:C.useCallback(()=>u(e=>!e),[u]),modal:o,children:n})};k.displayName=T;var A=`DialogTrigger`,j=C.forwardRef((e,t)=>{let{__scopeDialog:n,...r}=e,i=O(A,n),a=l(t,i.triggerRef);return(0,w.jsx)(f.button,{type:`button`,"aria-haspopup":`dialog`,"aria-expanded":i.open,"aria-controls":i.open?i.contentId:void 0,"data-state":Z(i.open),...r,ref:a,onClick:y(e.onClick,i.onOpenToggle)})});j.displayName=A;var M=`DialogPortal`,[N,P]=E(M,{forceMount:void 0}),F=e=>{let{__scopeDialog:t,forceMount:n,children:r,container:i}=e,a=O(M,t);return(0,w.jsx)(N,{scope:t,forceMount:n,children:C.Children.map(r,e=>(0,w.jsx)(p,{present:n||a.open,children:(0,w.jsx)(g,{asChild:!0,container:i,children:e})}))})};F.displayName=M;var I=`DialogOverlay`,L=C.forwardRef((e,t)=>{let n=P(I,e.__scopeDialog),{forceMount:r=n.forceMount,...i}=e,a=O(I,e.__scopeDialog);return a.modal?(0,w.jsx)(p,{present:r||a.open,children:(0,w.jsx)(z,{...i,ref:t})}):null});L.displayName=I;var R=h(`DialogOverlay.RemoveScroll`),z=C.forwardRef((e,t)=>{let{__scopeDialog:r,...i}=e,a=O(I,r),o=l(t,_());return(0,w.jsx)(n,{as:R,allowPinchZoom:!0,shards:[a.contentRef],children:(0,w.jsx)(f.div,{"data-state":Z(a.open),...i,ref:o,style:{pointerEvents:`auto`,...i.style}})})}),B=`DialogContent`,V=C.forwardRef((e,t)=>{let n=P(B,e.__scopeDialog),{forceMount:r=n.forceMount,...i}=e,a=O(B,e.__scopeDialog);return(0,w.jsx)(p,{present:r||a.open,children:a.modal?(0,w.jsx)(H,{...i,ref:t}):(0,w.jsx)(U,{...i,ref:t})})});V.displayName=B;var H=C.forwardRef((e,t)=>{let n=O(B,e.__scopeDialog),r=C.useRef(null),i=l(t,n.contentRef,r);return C.useEffect(()=>{let e=r.current;if(e)return S(e)},[]),(0,w.jsx)(W,{...e,ref:i,trapFocus:n.open,disableOutsidePointerEvents:n.open,onCloseAutoFocus:y(e.onCloseAutoFocus,e=>{e.preventDefault(),n.triggerRef.current?.focus()}),onPointerDownOutside:y(e.onPointerDownOutside,e=>{let t=e.detail.originalEvent,n=t.button===0&&t.ctrlKey===!0;(t.button===2||n)&&e.preventDefault()}),onFocusOutside:y(e.onFocusOutside,e=>e.preventDefault())})}),U=C.forwardRef((e,t)=>{let n=O(B,e.__scopeDialog),r=C.useRef(!1),i=C.useRef(!1);return(0,w.jsx)(W,{...e,ref:t,trapFocus:!1,disableOutsidePointerEvents:!1,onCloseAutoFocus:t=>{e.onCloseAutoFocus?.(t),t.defaultPrevented||(r.current||n.triggerRef.current?.focus(),t.preventDefault()),r.current=!1,i.current=!1},onInteractOutside:t=>{e.onInteractOutside?.(t),t.defaultPrevented||(r.current=!0,t.detail.originalEvent.type===`pointerdown`&&(i.current=!0));let a=t.target;n.triggerRef.current?.contains(a)&&t.preventDefault(),t.detail.originalEvent.type===`focusin`&&i.current&&t.preventDefault()}})}),W=C.forwardRef((e,t)=>{let{__scopeDialog:n,trapFocus:r,onOpenAutoFocus:i,onCloseAutoFocus:a,...o}=e,s=O(B,n);return b(),(0,w.jsx)(w.Fragment,{children:(0,w.jsx)(x,{asChild:!0,loop:!0,trapped:r,onMountAutoFocus:i,onUnmountAutoFocus:a,children:(0,w.jsx)(m,{role:`dialog`,id:s.contentId,"aria-describedby":s.descriptionId,"aria-labelledby":s.titleId,"data-state":Z(s.open),...o,ref:t,deferPointerDownOutside:!0,onDismiss:()=>s.onOpenChange(!1)})})})}),G=`DialogTitle`,K=C.forwardRef((e,t)=>{let{__scopeDialog:n,...r}=e,i=O(G,n);return(0,w.jsx)(f.h2,{id:i.titleId,...r,ref:t})});K.displayName=G;var q=`DialogDescription`,J=C.forwardRef((e,t)=>{let{__scopeDialog:n,...r}=e,i=O(q,n);return(0,w.jsx)(f.p,{id:i.descriptionId,...r,ref:t})});J.displayName=q;var Y=`DialogClose`,X=C.forwardRef((e,t)=>{let{__scopeDialog:n,...r}=e,i=O(Y,n);return(0,w.jsx)(f.button,{type:`button`,...r,ref:t,onClick:y(e.onClick,()=>i.onOpenChange(!1))})});X.displayName=Y;function Z(e){return e?`open`:`closed`}c();function Q({shadow:e,topShadow:t,bottomShadow:n,hiddenScrollbars:r,fadeTo:i,flex:a,overflow:o,children:s,...c},l){let u=C.useRef(),[d,f]=C.useState(!1),[p,m]=C.useState(!1),h=C.useCallback(()=>{let r=(l||u).current;if(!r)return;let a=r.scrollTop;f(!!((e||t||i)&&a>0));let o=r.scrollHeight-r.clientHeight;m(!!((e||n||i)&&o-a>1))},[e,t,n,i,l]);return C.useEffect(()=>{let e=(l||u).current;if(!e)return;h();let t=new ResizeObserver(h);t.observe(e);for(let n of Array.from(e.children))t.observe(n);return()=>t.disconnect()},[l,h]),(0,w.jsxs)(te,{ref:l||u,onScroll:h,$flex:a,$hiddenScrollbars:r,$topShadowVisible:d&&!i,$bottomShadowVisible:p&&!i,$overflow:o,...c,children:[i&&(0,w.jsx)($,{to:i,visible:d,top:!0}),s,i&&(0,w.jsx)($,{to:i,visible:p,bottom:!0})]})}var $=o.div`
  --height: 1.5em;
  position: sticky;
  ${e=>e.top&&s`
      top: 0;
      background: linear-gradient(to bottom, ${e.to}, transparent);
      margin-bottom: calc(-1 * var(--height));
    `}
  ${e=>e.bottom&&s`
      bottom: 0;
      background: linear-gradient(to top, ${e.to}, transparent);
      margin-top: calc(-1 * var(--height));
    `}

  flex-shrink: 0;
  height: var(--height);
  width: calc(100% - var(--scrollbar-width, 0px));
  pointer-events: none;
  opacity: ${e=>+!!e.visible};
  transition: opacity 100ms ease-in-out;
  z-index: 1;
`,te=o.div`
  position: relative;
  display: ${e=>e.$flex?`flex`:`block`};
  flex-direction: column;
  height: 100%;
  overflow-y: ${e=>e.$overflow?e.$overflow:`auto`};
  overflow-x: ${e=>e.$overflow?e.$overflow:`hidden`};
  overscroll-behavior: none;
  -webkit-overflow-scrolling: touch;
  box-shadow: ${e=>e.$topShadowVisible&&e.$bottomShadowVisible?`0 1px inset rgba(0,0,0,.1), 0 -1px inset rgba(0,0,0,.1)`:e.$topShadowVisible?`0 1px inset rgba(0,0,0,.1)`:e.$bottomShadowVisible?`0 -1px inset rgba(0,0,0,.1)`:`none`};
  transition: box-shadow 100ms ease-in-out;

  ${e=>e.$hiddenScrollbars&&a()}
`,ne=i(C.forwardRef(Q));export{J as a,K as c,V as i,j as l,k as n,L as o,X as r,F as s,ne as t};