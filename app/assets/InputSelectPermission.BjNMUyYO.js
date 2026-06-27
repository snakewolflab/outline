import{o as e}from"./rolldown-runtime.CMxvf4Kt.js";import{$t as t,D as n,Qt as r,T as i,en as a}from"./vendor-react.BDv3YiQX.js";import{r as o}from"./types.CmWxpsn8.js";import{r as s}from"./polished.esm.DNeFoW8-.js";import{a as c,s as l}from"./styles.3HqXuy1I.js";import{c as u,r as d,s as f,t as p}from"./vendor-styled.BLG-ZaDH.js";import{t as m}from"./lib.CIyroSo6.js";import{_ as h,a as g,c as _,h as v,i as y,l as b,n as x,o as S,p as C,r as w,t as T,v as E}from"./dist.BnxCzfoe.js";import{a as D,i as O,n as k,r as A,t as j}from"./dist.CESalI_i.js";import{d as M,r as N,t as P,u as F}from"./Tooltip.DlvdmaJm.js";import{t as I}from"./Text.DjIJ7ekC.js";import{t as L}from"./Text.ChaouWsf.js";import{t as R}from"./Flex.DJ6mR3Bq.js";import{i as z,r as ee}from"./animations.B6M7uYBl.js";import{n as te}from"./Input.4J78Wued.js";import{D as ne,O as re,b as ie,it as ae}from"./index.CHF0CgVb.js";import{n as oe,r as se,t as ce}from"./es2015.DX7OPY8u.js";import{t as le}from"./Scrollable.DWFqONda.js";import{t as ue}from"./NudeButton.tKECI9NH.js";import{t as de}from"./dist.DvbmLW1F.js";import{a as fe,i as pe,n as me,t as he}from"./Drawer.DylWdgHO.js";import{t as ge}from"./dist.C2J943E6.js";import{t as _e}from"./dist.c1X2Br8w.js";f();var ve=m(),B=e(a(),1),ye=e(t(),1),V=r(),be=[` `,`Enter`,`ArrowUp`,`ArrowDown`],xe=[` `,`Enter`],H=`Select`,[U,W,Se]=de(H),[G,Ce]=v(H,[Se,D]),K=D(),[we,q]=G(H),[Te,Ee]=G(H),De=`SelectProvider`;function Oe(e){let{__scopeSelect:t,children:n,open:r,defaultOpen:i,onOpenChange:a,value:o,defaultValue:s,onValueChange:c,dir:l,name:u,autoComplete:d,disabled:f,required:p,form:m,internal_do_not_use_render:h}=e,g=K(t),[_,v]=B.useState(null),[b,x]=B.useState(null),[S,C]=B.useState(!1),w=ie(l),[E,D]=T({prop:r,defaultProp:i??!1,onChange:a,caller:H}),[k,A]=T({prop:o,defaultProp:s,onChange:c,caller:H}),j=B.useRef(null),M=_?!!m||!!_.closest(`form`):!0,[N,P]=B.useState(new Set),F=y(),I=Array.from(N).map(e=>e.props.value).join(`;`),L=B.useCallback(e=>{P(t=>new Set(t).add(e))},[]),R=B.useCallback(e=>{P(t=>{let n=new Set(t);return n.delete(e),n})},[]),z={required:p,trigger:_,onTriggerChange:v,valueNode:b,onValueNodeChange:x,valueNodeHasChildren:S,onValueNodeHasChildrenChange:C,contentId:F,value:k,onValueChange:A,open:E,onOpenChange:D,dir:w,triggerPointerDownPosRef:j,disabled:f,name:u,autoComplete:d,form:m,nativeOptions:N,nativeSelectKey:I,isFormControl:M};return(0,V.jsx)(O,{...g,children:(0,V.jsx)(we,{scope:t,...z,children:(0,V.jsx)(U.Provider,{scope:t,children:(0,V.jsx)(Te,{scope:t,onNativeOptionAdd:L,onNativeOptionRemove:R,children:Ct(h)?h(z):n})})})})}Oe.displayName=De;var ke=e=>{let{__scopeSelect:t,children:n,...r}=e;return(0,V.jsx)(Oe,{__scopeSelect:t,...r,internal_do_not_use_render:({isFormControl:e})=>(0,V.jsxs)(V.Fragment,{children:[n,e?(0,V.jsx)(St,{__scopeSelect:t}):null]})})};ke.displayName=H;var Ae=`SelectTrigger`,je=B.forwardRef((e,t)=>{let{__scopeSelect:n,disabled:r=!1,...i}=e,a=K(n),o=q(Ae,n),s=o.disabled||r,c=h(t,o.onTriggerChange),l=W(n),u=B.useRef(`touch`),[d,f,p]=wt(e=>{let t=l().filter(e=>!e.disabled),n=Tt(t,e,t.find(e=>e.value===o.value));n!==void 0&&o.onValueChange(n.value)}),m=e=>{s||(o.onOpenChange(!0),p()),e&&(o.triggerPointerDownPosRef.current={x:Math.round(e.pageX),y:Math.round(e.pageY)})};return(0,V.jsx)(j,{asChild:!0,...a,children:(0,V.jsx)(b.button,{type:`button`,role:`combobox`,"aria-controls":o.open?o.contentId:void 0,"aria-expanded":o.open,"aria-required":o.required,"aria-autocomplete":`none`,dir:o.dir,"data-state":o.open?`open`:`closed`,disabled:s,"data-disabled":s?``:void 0,"data-placeholder":$(o.value)?``:void 0,...i,ref:c,onClick:E(i.onClick,e=>{e.currentTarget.focus(),u.current!==`mouse`&&m(e)}),onPointerDown:E(i.onPointerDown,e=>{u.current=e.pointerType;let t=e.target;t.hasPointerCapture(e.pointerId)&&t.releasePointerCapture(e.pointerId),e.button===0&&e.ctrlKey===!1&&e.pointerType===`mouse`&&(m(e),e.preventDefault())}),onKeyDown:E(i.onKeyDown,e=>{let t=d.current!==``;!(e.ctrlKey||e.altKey||e.metaKey)&&e.key.length===1&&f(e.key),!(t&&e.key===` `)&&be.includes(e.key)&&(m(),e.preventDefault())})})})});je.displayName=Ae;var Me=`SelectValue`,Ne=B.forwardRef((e,t)=>{let{__scopeSelect:n,className:r,style:i,children:a,placeholder:o=``,...s}=e,c=q(Me,n),{onValueNodeHasChildrenChange:l}=c,u=a!==void 0,d=h(t,c.onValueNodeChange);g(()=>{l(u)},[l,u]);let f=$(c.value);return(0,V.jsx)(b.span,{...s,asChild:f?!1:s.asChild,ref:d,style:{pointerEvents:`none`},children:(0,V.jsx)(B.Fragment,{children:f?o:a},f?`placeholder`:`value`)})});Ne.displayName=Me;var Pe=`SelectIcon`,Fe=B.forwardRef((e,t)=>{let{__scopeSelect:n,children:r,...i}=e;return(0,V.jsx)(b.span,{"aria-hidden":!0,...i,ref:t,children:r||`▼`})});Fe.displayName=Pe;var Ie=`SelectPortal`,[Le,Re]=G(Ie,{forceMount:void 0}),ze=e=>{let{__scopeSelect:t,forceMount:n,...r}=e;return(0,V.jsx)(Le,{scope:e.__scopeSelect,forceMount:n,children:(0,V.jsx)(w,{asChild:!0,...r})})};ze.displayName=Ie;var J=`SelectContent`,Be=B.forwardRef((e,t)=>{let n=Re(J,e.__scopeSelect),{forceMount:r=n.forceMount,...i}=e,a=q(J,e.__scopeSelect),[o,s]=B.useState();return g(()=>{s(new DocumentFragment)},[]),(0,V.jsx)(x,{present:r||a.open,children:({present:e})=>e?(0,V.jsx)(Ge,{...i,ref:t}):(0,V.jsx)(Ve,{...i,fragment:o})})});Be.displayName=J;var Ve=B.forwardRef((e,t)=>{let{__scopeSelect:n,children:r,fragment:i}=e;return i?ye.createPortal((0,V.jsx)(He,{scope:n,children:(0,V.jsx)(U.Slot,{scope:n,children:(0,V.jsx)(`div`,{ref:t,children:r})})}),i):null});Ve.displayName=`SelectContentFragment`;var Y=10,[He,X]=G(J),Ue=`SelectContentImpl`,We=C(`SelectContent.RemoveScroll`),Ge=B.forwardRef((e,t)=>{let{__scopeSelect:n}=e,{position:r=`item-aligned`,onCloseAutoFocus:a,onEscapeKeyDown:o,onPointerDownOutside:s,side:c,sideOffset:l,align:u,alignOffset:d,arrowPadding:f,collisionBoundary:p,collisionPadding:m,sticky:g,hideWhenDetached:_,avoidCollisions:v,...y}=e,b=q(J,n),[x,C]=B.useState(null),[w,T]=B.useState(null),D=h(t,e=>C(e)),[O,k]=B.useState(null),[A,j]=B.useState(null),M=W(n),[N,P]=B.useState(!1),F=B.useRef(!1);B.useEffect(()=>{if(x)return ce(x)},[x]),oe();let I=B.useCallback(e=>{let[t,...n]=M().map(e=>e.ref.current),[r]=n.slice(-1),i=document.activeElement;for(let n of e)if(n===i||(n?.scrollIntoView({block:`nearest`}),n===t&&w&&(w.scrollTop=0),n===r&&w&&(w.scrollTop=w.scrollHeight),n?.focus(),document.activeElement!==i))return},[M,w]),L=B.useCallback(()=>I([O,x]),[I,O,x]);B.useEffect(()=>{N&&L()},[N,L]);let{onOpenChange:R,triggerPointerDownPosRef:z}=b;B.useEffect(()=>{if(x){let e={x:0,y:0},t=t=>{e={x:Math.abs(Math.round(t.pageX)-(z.current?.x??0)),y:Math.abs(Math.round(t.pageY)-(z.current?.y??0))}},n=n=>{e.x<=10&&e.y<=10?n.preventDefault():n.composedPath().includes(x)||R(!1),document.removeEventListener(`pointermove`,t),z.current=null};return z.current!==null&&(document.addEventListener(`pointermove`,t),document.addEventListener(`pointerup`,n,{capture:!0,once:!0})),()=>{document.removeEventListener(`pointermove`,t),document.removeEventListener(`pointerup`,n,{capture:!0})}}},[x,R,z]),B.useEffect(()=>{let e=()=>R(!1);return window.addEventListener(`blur`,e),window.addEventListener(`resize`,e),()=>{window.removeEventListener(`blur`,e),window.removeEventListener(`resize`,e)}},[R]);let[ee,te]=wt(e=>{let t=M().filter(e=>!e.disabled),n=Tt(t,e,t.find(e=>e.ref.current===document.activeElement));n&&setTimeout(()=>n.ref.current?.focus())}),ne=B.useCallback((e,t,n)=>{let r=!F.current&&!n;(b.value!==void 0&&b.value===t||r)&&(k(e),r&&(F.current=!0))},[b.value]),re=B.useCallback(()=>x?.focus(),[x]),ie=B.useCallback((e,t,n)=>{let r=!F.current&&!n;(b.value!==void 0&&b.value===t||r)&&j(e)},[b.value]),ae=r===`popper`?Ye:qe,le=ae===Ye?{side:c,sideOffset:l,align:u,alignOffset:d,arrowPadding:f,collisionBoundary:p,collisionPadding:m,sticky:g,hideWhenDetached:_,avoidCollisions:v}:{};return(0,V.jsx)(He,{scope:n,content:x,viewport:w,onViewportChange:T,itemRefCallback:ne,selectedItem:O,onItemLeave:re,itemTextRefCallback:ie,focusSelectedItem:L,selectedItemText:A,position:r,isPositioned:N,searchRef:ee,children:(0,V.jsx)(i,{as:We,allowPinchZoom:!0,children:(0,V.jsx)(se,{asChild:!0,trapped:b.open,onMountAutoFocus:e=>{e.preventDefault()},onUnmountAutoFocus:E(a,e=>{b.trigger?.focus({preventScroll:!0}),e.preventDefault()}),children:(0,V.jsx)(S,{asChild:!0,disableOutsidePointerEvents:!0,onEscapeKeyDown:o,onPointerDownOutside:s,onFocusOutside:e=>e.preventDefault(),onDismiss:()=>b.onOpenChange(!1),children:(0,V.jsx)(ae,{role:`listbox`,id:b.contentId,"data-state":b.open?`open`:`closed`,dir:b.dir,onContextMenu:e=>e.preventDefault(),...y,...le,onPlaced:()=>P(!0),ref:D,style:{display:`flex`,flexDirection:`column`,outline:`none`,...y.style},onKeyDown:E(y.onKeyDown,e=>{let t=e.ctrlKey||e.altKey||e.metaKey;if(e.key===`Tab`&&e.preventDefault(),!t&&e.key.length===1&&te(e.key),[`ArrowUp`,`ArrowDown`,`Home`,`End`].includes(e.key)){let t=M().filter(e=>!e.disabled).map(e=>e.ref.current);if([`ArrowUp`,`End`].includes(e.key)&&(t=t.slice().reverse()),[`ArrowUp`,`ArrowDown`].includes(e.key)){let n=e.target,r=t.indexOf(n);t=t.slice(r+1)}setTimeout(()=>I(t)),e.preventDefault()}})})})})})})});Ge.displayName=Ue;var Ke=`SelectItemAlignedPosition`,qe=B.forwardRef((e,t)=>{let{__scopeSelect:n,onPlaced:r,...i}=e,a=q(J,n),o=X(J,n),[s,c]=B.useState(null),[l,u]=B.useState(null),d=h(t,e=>u(e)),f=W(n),p=B.useRef(!1),m=B.useRef(!0),{viewport:_,selectedItem:v,selectedItemText:y,focusSelectedItem:x}=o,S=B.useCallback(()=>{if(a.trigger&&a.valueNode&&s&&l&&_&&v&&y){let e=a.trigger.getBoundingClientRect(),t=l.getBoundingClientRect(),n=a.valueNode.getBoundingClientRect(),i=y.getBoundingClientRect();if(a.dir!==`rtl`){let r=i.left-t.left,a=n.left-r,o=e.left-a,c=e.width+o,l=Math.max(c,t.width),u=window.innerWidth-Y,d=ge(a,[Y,Math.max(Y,u-l)]);s.style.minWidth=c+`px`,s.style.left=d+`px`}else{let r=t.right-i.right,a=window.innerWidth-n.right-r,o=window.innerWidth-e.right-a,c=e.width+o,l=Math.max(c,t.width),u=window.innerWidth-Y,d=ge(a,[Y,Math.max(Y,u-l)]);s.style.minWidth=c+`px`,s.style.right=d+`px`}let o=f(),c=window.innerHeight-Y*2,u=_.scrollHeight,d=window.getComputedStyle(l),m=parseInt(d.borderTopWidth,10),h=parseInt(d.paddingTop,10),g=parseInt(d.borderBottomWidth,10),b=parseInt(d.paddingBottom,10),x=m+h+u+b+g,S=Math.min(v.offsetHeight*5,x),C=window.getComputedStyle(_),w=parseInt(C.paddingTop,10),T=parseInt(C.paddingBottom,10),E=e.top+e.height/2-Y,D=c-E,O=v.offsetHeight/2,k=v.offsetTop+O,A=m+h+k,j=x-A;if(A<=E){let e=o.length>0&&v===o[o.length-1].ref.current;s.style.bottom=`0px`;let t=l.clientHeight-_.offsetTop-_.offsetHeight,n=A+Math.max(D,O+(e?T:0)+t+g);s.style.height=n+`px`}else{let e=o.length>0&&v===o[0].ref.current;s.style.top=`0px`;let t=Math.max(E,m+_.offsetTop+(e?w:0)+O)+j;s.style.height=t+`px`,_.scrollTop=A-E+_.offsetTop}s.style.margin=`${Y}px 0`,s.style.minHeight=S+`px`,s.style.maxHeight=c+`px`,r?.(),requestAnimationFrame(()=>p.current=!0)}},[f,a.trigger,a.valueNode,s,l,_,v,y,a.dir,r]);g(()=>S(),[S]);let[C,w]=B.useState();return g(()=>{l&&w(window.getComputedStyle(l).zIndex)},[l]),(0,V.jsx)(Xe,{scope:n,contentWrapper:s,shouldExpandOnScrollRef:p,onScrollButtonChange:B.useCallback(e=>{e&&m.current===!0&&(S(),x?.(),m.current=!1)},[S,x]),children:(0,V.jsx)(`div`,{ref:c,style:{display:`flex`,flexDirection:`column`,position:`fixed`,zIndex:C},children:(0,V.jsx)(b.div,{...i,ref:d,style:{boxSizing:`border-box`,maxHeight:`100%`,...i.style}})})})});qe.displayName=Ke;var Je=`SelectPopperPosition`,Ye=B.forwardRef((e,t)=>{let{__scopeSelect:n,align:r=`start`,collisionPadding:i=Y,...a}=e,o=K(n);return(0,V.jsx)(A,{...o,...a,ref:t,align:r,collisionPadding:i,style:{boxSizing:`border-box`,...a.style,"--radix-select-content-transform-origin":`var(--radix-popper-transform-origin)`,"--radix-select-content-available-width":`var(--radix-popper-available-width)`,"--radix-select-content-available-height":`var(--radix-popper-available-height)`,"--radix-select-trigger-width":`var(--radix-popper-anchor-width)`,"--radix-select-trigger-height":`var(--radix-popper-anchor-height)`}})});Ye.displayName=Je;var[Xe,Ze]=G(J,{}),Qe=`SelectViewport`,$e=B.forwardRef((e,t)=>{let{__scopeSelect:n,nonce:r,...i}=e,a=X(Qe,n),o=Ze(Qe,n),s=h(t,a.onViewportChange),c=B.useRef(0);return(0,V.jsxs)(V.Fragment,{children:[(0,V.jsx)(`style`,{dangerouslySetInnerHTML:{__html:`[data-radix-select-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-select-viewport]::-webkit-scrollbar{display:none}`},nonce:r}),(0,V.jsx)(U.Slot,{scope:n,children:(0,V.jsx)(b.div,{"data-radix-select-viewport":``,role:`presentation`,...i,ref:s,style:{position:`relative`,flex:1,overflow:`hidden auto`,...i.style},onScroll:E(i.onScroll,e=>{let t=e.currentTarget,{contentWrapper:n,shouldExpandOnScrollRef:r}=o;if(r?.current&&n){let e=Math.abs(c.current-t.scrollTop);if(e>0){let r=window.innerHeight-Y*2,i=parseFloat(n.style.minHeight),a=parseFloat(n.style.height),o=Math.max(i,a);if(o<r){let i=o+e,a=Math.min(r,i),s=i-a;n.style.height=a+`px`,n.style.bottom===`0px`&&(t.scrollTop=s>0?s:0,n.style.justifyContent=`flex-end`)}}}c.current=t.scrollTop})})})]})});$e.displayName=Qe;var et=`SelectGroup`,[tt,nt]=G(et),rt=B.forwardRef((e,t)=>{let{__scopeSelect:n,...r}=e,i=y();return(0,V.jsx)(tt,{scope:n,id:i,children:(0,V.jsx)(b.div,{role:`group`,"aria-labelledby":i,...r,ref:t})})});rt.displayName=et;var it=`SelectLabel`,at=B.forwardRef((e,t)=>{let{__scopeSelect:n,...r}=e,i=nt(it,n);return(0,V.jsx)(b.div,{id:i.id,...r,ref:t})});at.displayName=it;var Z=`SelectItem`,[ot,st]=G(Z),ct=B.forwardRef((e,t)=>{let{__scopeSelect:n,value:r,disabled:i=!1,textValue:a,...o}=e,s=q(Z,n),c=X(Z,n),l=s.value===r,[u,d]=B.useState(a??``),[f,p]=B.useState(!1),m=h(t,e=>c.itemRefCallback?.(e,r,i)),g=y(),_=B.useRef(`touch`),v=()=>{i||(s.onValueChange(r),s.onOpenChange(!1))};return(0,V.jsx)(ot,{scope:n,value:r,disabled:i,textId:g,isSelected:l,onItemTextChange:B.useCallback(e=>{d(t=>t||(e?.textContent??``).trim())},[]),children:(0,V.jsx)(U.ItemSlot,{scope:n,value:r,disabled:i,textValue:u,children:(0,V.jsx)(b.div,{role:`option`,"aria-labelledby":g,"data-highlighted":f?``:void 0,"aria-selected":l&&f,"data-state":l?`checked`:`unchecked`,"aria-disabled":i||void 0,"data-disabled":i?``:void 0,tabIndex:i?void 0:-1,...o,ref:m,onFocus:E(o.onFocus,()=>p(!0)),onBlur:E(o.onBlur,()=>p(!1)),onClick:E(o.onClick,()=>{_.current!==`mouse`&&v()}),onPointerUp:E(o.onPointerUp,()=>{_.current===`mouse`&&v()}),onPointerDown:E(o.onPointerDown,e=>{_.current=e.pointerType}),onPointerMove:E(o.onPointerMove,e=>{_.current=e.pointerType,i?c.onItemLeave?.():_.current===`mouse`&&e.currentTarget.focus({preventScroll:!0})}),onPointerLeave:E(o.onPointerLeave,e=>{e.currentTarget===document.activeElement&&c.onItemLeave?.()}),onKeyDown:E(o.onKeyDown,e=>{c.searchRef?.current!==``&&e.key===` `||(xe.includes(e.key)&&v(),e.key===` `&&e.preventDefault())})})})})});ct.displayName=Z;var Q=`SelectItemText`,lt=B.forwardRef((e,t)=>{let{__scopeSelect:n,className:r,style:i,...a}=e,o=q(Q,n),s=X(Q,n),c=st(Q,n),l=Ee(Q,n),[u,d]=B.useState(null),f=h(t,e=>d(e),c.onItemTextChange,e=>s.itemTextRefCallback?.(e,c.value,c.disabled)),p=u?.textContent,m=B.useMemo(()=>(0,V.jsx)(`option`,{value:c.value,disabled:c.disabled,children:p},c.value),[c.disabled,c.value,p]),{onNativeOptionAdd:_,onNativeOptionRemove:v}=l;return g(()=>(_(m),()=>v(m)),[_,v,m]),(0,V.jsxs)(V.Fragment,{children:[(0,V.jsx)(b.span,{id:c.textId,...a,ref:f}),c.isSelected&&o.valueNode&&!o.valueNodeHasChildren&&!$(o.value)?ye.createPortal(a.children,o.valueNode):null]})});lt.displayName=Q;var ut=`SelectItemIndicator`,dt=B.forwardRef((e,t)=>{let{__scopeSelect:n,...r}=e;return st(ut,n).isSelected?(0,V.jsx)(b.span,{"aria-hidden":!0,...r,ref:t}):null});dt.displayName=ut;var ft=`SelectScrollUpButton`,pt=B.forwardRef((e,t)=>{let n=X(ft,e.__scopeSelect),r=Ze(ft,e.__scopeSelect),[i,a]=B.useState(!1),o=h(t,r.onScrollButtonChange);return g(()=>{if(n.viewport&&n.isPositioned){let e=function(){a(t.scrollTop>0)},t=n.viewport;return e(),t.addEventListener(`scroll`,e),()=>t.removeEventListener(`scroll`,e)}},[n.viewport,n.isPositioned]),i?(0,V.jsx)(gt,{...e,ref:o,onAutoScroll:()=>{let{viewport:e,selectedItem:t}=n;e&&t&&(e.scrollTop-=t.offsetHeight)}}):null});pt.displayName=ft;var mt=`SelectScrollDownButton`,ht=B.forwardRef((e,t)=>{let n=X(mt,e.__scopeSelect),r=Ze(mt,e.__scopeSelect),[i,a]=B.useState(!1),o=h(t,r.onScrollButtonChange);return g(()=>{if(n.viewport&&n.isPositioned){let e=function(){let e=t.scrollHeight-t.clientHeight;a(Math.ceil(t.scrollTop)<e)},t=n.viewport;return e(),t.addEventListener(`scroll`,e),()=>t.removeEventListener(`scroll`,e)}},[n.viewport,n.isPositioned]),i?(0,V.jsx)(gt,{...e,ref:o,onAutoScroll:()=>{let{viewport:e,selectedItem:t}=n;e&&t&&(e.scrollTop+=t.offsetHeight)}}):null});ht.displayName=mt;var gt=B.forwardRef((e,t)=>{let{__scopeSelect:n,onAutoScroll:r,...i}=e,a=X(`SelectScrollButton`,n),o=B.useRef(null),s=W(n),c=B.useCallback(()=>{o.current!==null&&(window.clearInterval(o.current),o.current=null)},[]);return B.useEffect(()=>()=>c(),[c]),g(()=>{s().find(e=>e.ref.current===document.activeElement)?.ref.current?.scrollIntoView({block:`nearest`})},[s]),(0,V.jsx)(b.div,{"aria-hidden":!0,...i,ref:t,style:{flexShrink:0,...i.style},onPointerDown:E(i.onPointerDown,()=>{o.current===null&&(o.current=window.setInterval(r,50))}),onPointerMove:E(i.onPointerMove,()=>{a.onItemLeave?.(),o.current===null&&(o.current=window.setInterval(r,50))}),onPointerLeave:E(i.onPointerLeave,()=>{c()})})}),_t=`SelectSeparator`,vt=B.forwardRef((e,t)=>{let{__scopeSelect:n,...r}=e;return(0,V.jsx)(b.div,{"aria-hidden":!0,...r,ref:t})});vt.displayName=_t;var yt=`SelectArrow`,bt=B.forwardRef((e,t)=>{let{__scopeSelect:n,...r}=e,i=K(n);return X(yt,n).position===`popper`?(0,V.jsx)(k,{...i,...r,ref:t}):null});bt.displayName=yt;var xt=`SelectBubbleInput`,St=B.forwardRef(({__scopeSelect:e,...t},n)=>{let r=q(xt,e),{value:i,onValueChange:a,required:o,disabled:s,name:c,autoComplete:l,form:u}=r,{nativeOptions:d,nativeSelectKey:f}=r,p=B.useRef(null),m=h(n,p),g=i??``,_=_e(g),v=Array.from(d).some(e=>(e.props.value??``)===``);return B.useEffect(()=>{let e=p.current;if(!e)return;let t=window.HTMLSelectElement.prototype,n=Object.getOwnPropertyDescriptor(t,`value`).set;if(_!==g&&n){let t=new Event(`change`,{bubbles:!0});n.call(e,g),e.dispatchEvent(t)}},[_,g]),(0,V.jsxs)(b.select,{"aria-hidden":!0,required:o,tabIndex:-1,name:c,autoComplete:l,disabled:s,form:u,onChange:e=>a(e.target.value),...t,style:{...M,...t.style},ref:m,defaultValue:g,children:[$(i)&&!v?(0,V.jsx)(`option`,{value:``}):null,Array.from(d)]},f)});St.displayName=xt;function Ct(e){return typeof e==`function`}function $(e){return e===``||e===void 0}function wt(e){let t=_(e),n=B.useRef(``),r=B.useRef(0),i=B.useCallback(e=>{let i=n.current+e;t(i),(function e(t){n.current=t,window.clearTimeout(r.current),t!==``&&(r.current=window.setTimeout(()=>e(``),1e3))})(i)},[t]),a=B.useCallback(()=>{n.current=``,window.clearTimeout(r.current)},[]);return B.useEffect(()=>()=>window.clearTimeout(r.current),[]),[n,i,a]}function Tt(e,t,n){let r=t.length>1&&Array.from(t).every(e=>e===t[0])?t[0]:t,i=n?e.indexOf(n):-1,a=Et(e,Math.max(i,0));r.length===1&&(a=a.filter(e=>e!==n));let o=a.find(e=>e.textValue.toLowerCase().startsWith(r.toLowerCase()));return o===n?void 0:o}function Et(e,t){return e.map((n,r)=>e[(t+r)%e.length])}var Dt=(0,B.forwardRef)((e,t)=>{let{children:n,...r}=e;return(0,V.jsxs)(jt,{ref:t,justify:`space-between`,align:`center`,gap:8,...r,children:[n,(0,V.jsx)(kt,{})]})});Dt.displayName=`SelectItem`;var Ot=(0,B.forwardRef)((e,t)=>(0,V.jsx)(Mt,{ref:t,...e,children:(0,V.jsx)(ve.CheckmarkIcon,{})}));Ot.displayName=`SelectItemIndicator`;var kt=u.div`
  width: 24px;
  height: 24px;
  flex-shrink: 0;
`,At=u(ne)`
  display: block;
  font-weight: normal;
  text-transform: none;
  width: 100%;
  cursor: var(--pointer);

  &:hover:not(:disabled) {
    background: ${c(`buttonNeutralBackground`)};
  }

  &:focus-visible {
    outline: none;
  }

  ${e=>e.$nude&&d`
      border-color: transparent;
      box-shadow: none;
    `}

  ${re} {
    line-height: 28px;
    padding-inline-start: 12px;
    padding-inline-end: 4px;
  }

  svg {
    justify-self: flex-end;
    margin-inline-start: auto;
  }

  &[data-placeholder=""] {
    color: ${c(`placeholder`)};
  }
`,jt=u(R)`
  position: relative;
  width: 100%;
  font-size: 16px;
  cursor: var(--pointer);
  color: ${c(`textSecondary`)};
  background: none;
  margin: 0;
  padding: 12px;
  border: 0;
  border-radius: 4px;
  outline: 0;
  user-select: none;
  white-space: nowrap;

  svg {
    flex-shrink: 0;
  }

  @media (hover: hover) {
    &:hover,
    &:focus {
      color: ${c(`accentText`)};
      background: ${c(`accent`)};

      svg {
        color: ${c(`accentText`)};
        fill: ${c(`accentText`)};
      }

      ${L} {
        color: ${e=>s(.5,e.theme.accentText)};
      }
    }
  }

  &[data-state="checked"] {
    ${kt} {
      display: none;
    }
  }

  ${p(`tablet`)`
    font-size: 14px;
    padding: 4px;
    padding-inline-start: 8px;
  `}
`,Mt=u.span`
  width: 24px;
  height: 24px;
`;f();var Nt=ke,Pt=B.forwardRef((e,t)=>{let{placeholder:n,children:r,nude:i,displayValue:a,...o}=e;return(0,V.jsx)(je,{ref:t,asChild:!0,children:(0,V.jsx)(At,{neutral:!0,disclosure:!0,$nude:i,...o,children:a===void 0?(0,V.jsx)(Ne,{placeholder:n}):(0,V.jsx)(V.Fragment,{children:a})})})});Pt.displayName=je.displayName;var Ft=B.forwardRef((e,t)=>{let{children:n,...r}=e;return(0,V.jsx)(ze,{children:(0,V.jsx)(Vt,{ref:t,position:`popper`,...r,children:(0,V.jsx)($e,{style:{overscrollBehavior:`none`},children:n})})})});Ft.displayName=Be.displayName;var It=B.forwardRef((e,t)=>{let{children:n,...r}=e;return(0,V.jsx)(ct,{ref:t,...r,asChild:!0,children:(0,V.jsxs)(Dt,{children:[(0,V.jsx)(lt,{children:n}),(0,V.jsx)(dt,{asChild:!0,children:(0,V.jsx)(Ot,{})})]})})});It.displayName=ct.displayName;var Lt=B.forwardRef((e,t)=>(0,V.jsx)(vt,{ref:t,asChild:!0,children:(0,V.jsx)(Rt,{...e})}));Lt.displayName=vt.displayName;var Rt=u.hr`
  margin: 6px 0;
`,zt=B.forwardRef(({children:e},t)=>(0,V.jsx)(rt,{children:(0,V.jsx)(at,{asChild:!0,children:(0,V.jsx)(Bt,{ref:t,children:e})})}));zt.displayName=`InputSelectHeading`;var Bt=u(I).attrs({type:`tertiary`,size:`xsmall`,weight:`bold`})`
  display: block;
  padding-block: 8px 4px;
  padding-inline: 8px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
`,Vt=u(Be)`
  z-index: ${l.menu};
  min-width: var(--radix-select-trigger-width);
  max-width: 400px;
  min-height: 44px;
  max-height: 350px;

  padding: 4px;
  border-radius: 6px;
  background: ${c(`menuBackground`)};
  box-shadow: ${c(`menuShadow`)};
  transform-origin: 50% 0;

  &[data-side="bottom"] {
    animation: ${ee} 200ms ease;
  }

  &[data-side="top"] {
    animation: ${z} 200ms ease;
  }

  @media print {
    display: none;
  }
`;f();var Ht=B.forwardRef((e,t)=>{let{options:n,value:r,onChange:i,label:a,labelHidden:o,short:s,help:c,displayValue:l,...u}=e,[d,f]=B.useState(r),[p,m]=B.useState(!1),h=B.useRef(null),g=N(),_=`Select a ${a.toLowerCase()}`,v=n.some(e=>e.type===`item`&&!!e.icon),y=B.useMemo(()=>d?n.find(e=>e.type===`item`&&e.value===d):void 0,[d,n]),b=l?l(y):void 0,x=B.useCallback((e,t)=>e.type===`separator`?(0,V.jsx)(Lt,{},`separator-${t}`):e.type===`heading`?(0,V.jsx)(zt,{children:e.label},`heading-${e.label}`):(0,V.jsx)(It,{value:e.value,children:(0,V.jsx)(Gt,{option:e,optionsHaveIcon:v})},e.value),[v]),S=B.useCallback(async e=>{f(e),i(e)},[i,f]),C=B.useCallback(()=>{h.current&&(h.current.style.pointerEvents=`auto`)},[]),w=B.useCallback(()=>{h.current&&(h.current.style.pointerEvents=`none`)},[]);return B.useEffect(()=>{f(r)},[r]),g?(0,V.jsx)(Ut,{ref:t,...e,value:d,onChange:S,placeholder:_,optionsHaveIcon:v,resolvedDisplayValue:b}):(0,V.jsxs)(Kt,{short:s,children:[(0,V.jsx)(Wt,{text:a,hidden:o??!1,help:c}),(0,V.jsxs)(Nt,{open:p,onOpenChange:m,value:d??void 0,onValueChange:S,children:[(0,V.jsx)(Pt,{ref:t,placeholder:_,displayValue:b,...u}),(0,V.jsx)(Ft,{ref:h,"aria-label":a,onAnimationStart:w,onAnimationEnd:C,children:n.map(x)})]})]})});Ht.displayName=`InputSelect`;var Ut=B.forwardRef((e,t)=>{let{options:n,value:r,onChange:i,label:a,labelHidden:o,disabled:s,short:c,placeholder:l,optionsHaveIcon:u,displayValue:d,resolvedDisplayValue:f,...p}=e,[m,h]=B.useState(!1),g=B.useRef(null),_=B.useMemo(()=>r?n.find(e=>e.type===`item`&&e.value===r):void 0,[r,n]),v=B.useCallback(async e=>{h(!1),i(e)},[i]),y=B.useCallback((e,t)=>{if(e.type===`separator`)return(0,V.jsx)(Lt,{},`separator-${t}`);if(e.type===`heading`)return(0,V.jsx)(zt,{children:e.label},`heading-${e.label}`);let n=e===_;return(0,V.jsxs)(Dt,{onClick:()=>v(e.value),"data-state":n?`checked`:`unchecked`,children:[(0,V.jsx)(Gt,{option:e,optionsHaveIcon:u}),n&&(0,V.jsx)(Ot,{})]},e.value)},[v,_,u]),b=B.useCallback(()=>{g.current&&(g.current.style.pointerEvents=`auto`)},[]),x=B.useCallback(()=>{g.current&&(g.current.style.pointerEvents=`none`)},[]);return(0,V.jsxs)(Kt,{children:[(0,V.jsx)(Wt,{text:a,hidden:o??!1}),(0,V.jsxs)(he,{open:m,onOpenChange:h,children:[(0,V.jsx)(fe,{asChild:!0,children:(0,V.jsx)(At,{ref:t,...p,neutral:!0,disclosure:!0,"data-placeholder":_?!1:``,children:f===void 0?_?(0,V.jsx)(Gt,{option:_,optionsHaveIcon:u}):(0,V.jsx)(V.Fragment,{children:l}):f})}),(0,V.jsxs)(me,{ref:g,"aria-label":a,onAnimationStart:x,onAnimationEnd:b,children:[(0,V.jsx)(pe,{hidden:!a,children:a}),(0,V.jsx)(Xt,{hiddenScrollbars:!0,children:n.map(y)})]})]})]})});Ut.displayName=`InputSelect`;function Wt({text:e,hidden:t,help:n}){let r=(0,V.jsxs)(R,{align:`center`,gap:2,style:{marginBottom:`4px`},children:[(0,V.jsx)(te,{style:{paddingBottom:0},children:e}),n?(0,V.jsx)(P,{content:n,children:(0,V.jsx)(Zt,{size:18,children:(0,V.jsx)(ve.QuestionMarkIcon,{size:18})})}):null]});return t?(0,V.jsx)(F,{children:r}):r}function Gt({option:e,optionsHaveIcon:t}){return(0,V.jsxs)(qt,{align:`center`,children:[t?e.icon?(0,V.jsx)(Jt,{children:e.icon}):(0,V.jsx)(Yt,{}):null,e.label,e.description&&(0,V.jsxs)(V.Fragment,{children:[`\xA0`,(0,V.jsxs)(L,{type:`tertiary`,size:`small`,ellipsis:!0,children:[`– `,e.description]})]})]})}var Kt=u.label`
  display: block;
  max-width: ${e=>e.short?`350px`:`100%`};
`,qt=u(R)`
  min-height: 24px;
`,Jt=u.span`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 24px;
  height: 24px;
  margin-inline-start: -4px;
  margin-inline-end: 4px;
  overflow: hidden;
  flex-shrink: 0;
`,Yt=u.div`
  width: 24px;
  height: 24px;
  flex-shrink: 0;
`,Xt=u(le)`
  max-height: 75vh;
`,Zt=u(ue)`
  color: ${c(`textSecondary`)};

  &:hover,
  &[aria-expanded="true"] {
    background: none !important;
  }
`;f();var Qt=B.forwardRef((e,t)=>{let{value:r,onChange:i,shrink:a,...s}=e,{t:c}=n();return(0,V.jsx)($t,{ref:t,options:B.useMemo(()=>[{type:`item`,label:c(`View only`),value:o.Read},{type:`item`,label:c(`Can edit`),value:o.ReadWrite},{type:`separator`},{type:`item`,label:c(`No access`),value:ae}],[c]),value:r||`__empty__`,onChange:i,label:c(`Permission`),$shrink:a,...s})});Qt.displayName=`InputSelectPermission`;var $t=u(Ht)`
  color: ${c(`textSecondary`)};
  ${({$shrink:e})=>!e&&`margin-bottom: 16px;`}
`;export{Ht as n,Qt as t};