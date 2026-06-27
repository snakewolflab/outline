import{o as e}from"./rolldown-runtime.CMxvf4Kt.js";import{$t as t,D as n,E as r,Qt as i,d as a,en as o,f as s,u as c}from"./vendor-react.BDv3YiQX.js";import{l,r as u,y as d}from"./mobx.module.gU7FYxy2.js";import{i as f,r as p}from"./mobxreact.esm.BaBZO6aD.js";import{K as m,P as h,b as g,j as _,u as v}from"./vendor-es-toolkit.XcNOARzK.js";import{H as y}from"./vendor-mermaid.BVPraj9B.js";import{t as b}from"./Logger.6jrPKWwS.js";import{n as x,t as S}from"./decorate.Doz1ketW.js";import{r as C,t as w}from"./polished.esm.DNeFoW8-.js";import{a as T,n as E,s as D}from"./styles.3HqXuy1I.js";import{n as O}from"./usePersistedState.GsSAxQcG.js";import{t as ee}from"./Desktop.YvZPTfe5.js";import{s as te}from"./urls.BOMhQ3f1.js";import{i as ne}from"./useIsMounted.p6I_9muu.js";import{t as k}from"./useStores.C2HL3oms.js";import{a as A,c as j,o as re,r as M,s as N}from"./vendor-styled.BLG-ZaDH.js";import{t as P}from"./lib.CIyroSo6.js";import{t as F,u as ie}from"./Tooltip.DlvdmaJm.js";import{t as I}from"./Flex.DJ6mR3Bq.js";import{n as L}from"./Fade.DoZVoUzz.js";import{D as R,a as ae,s as oe,u as se}from"./index.CHF0CgVb.js";import{t as ce}from"./useCurrentUser.yDT7QBRq.js";import{t as z}from"./LoadingIndicator.ByiNnFx6.js";import{a as le,c as ue,i as de,n as fe,o as pe,r as me,s as he,t as ge}from"./Scrollable.DWFqONda.js";import{i as _e,n as B}from"./DocumentContext.QKzyz-MH.js";import{t as ve}from"./NudeButton.tKECI9NH.js";import{o as V}from"./Popover.CIIe-PnX.js";import{t as ye}from"./HStack.CJJZAD6g.js";import{t as be}from"./usePolicy.CPwNtdBL.js";import{$ as xe,N as Se,Z as Ce,lt as we,r as Te,rt as H}from"./useKeyDown.Du2PZ2Ep.js";import{At as U,J as Ee,L as De,_t as Oe,a as ke,at as Ae,bt as je,ft as W,gt as Me,it as Ne,jt as Pe,mt as Fe,ot as Ie,pt as Le,r as Re,ut as ze,vt as Be,xt as Ve,yt as He}from"./vendor-prosemirror.DMyhawZr.js";import{i as Ue,r as We,t as G}from"./ProsemirrorHelper.DXnK0H48.js";import{t as Ge}from"./CopyToClipboard.BJGqvUA0.js";import{r as Ke}from"./Editor.D7UmBdoz.js";import{n as qe,t as Je}from"./EditorContext.Dhq-5v0H.js";import{n as Ye}from"./Actions.B8zShC8m.js";import{n as Xe,t as Ze}from"./CommentThread.BgmzdSkr.js";var K=e(o());N();var Qe=class{constructor(){this.listeners={},this.on=(e,t)=>this.addListener(e,t),this.off=(e,t)=>this.removeListener(e,t)}addListener(e,t){this.listeners[e]||(this.listeners[e]=[]),this.listeners[e].push(t)}removeListener(e,t){this.listeners[e]=this.listeners[e]?.filter(e=>e!==t)}emit(e,t){this.listeners[e]?.forEach(e=>{e(t)})}},$e=e(t()),q=i(),J=class{constructor(e,t,n){this.element=e,this.Component=t,this.props=n}get content(){return(0,$e.createPortal)((0,q.jsx)(this.Component,{...this.props}),this.element)}updateProps(e){m(e,this.props)||(this.props=e)}setProp(e,t){this.props[e]=t}};S([d,x(`design:type`,Object)],J.prototype,`props`,void 0),S([l,x(`design:type`,Object),x(`design:paramtypes`,[])],J.prototype,`content`,null),S([u,x(`design:type`,Function),x(`design:paramtypes`,[Object]),x(`design:returntype`,void 0)],J.prototype,`updateProps`,null),S([u,x(`design:type`,Function),x(`design:paramtypes`,[Object,Object]),x(`design:returntype`,void 0)],J.prototype,`setProp`,null);var et=class{constructor(e,{editor:t,extension:n,node:r,view:i,getPos:a,decorations:o}){this.isSelected=!1,this.component=e,this.editor=t,this.extension=n,this.getPos=a,this.decorations=o,this.node=r,this.view=i,this.dom=r.type.spec.inline?document.createElement(`span`):document.createElement(`div`),this.className=`component-${r.type.name}`,this.dom.classList.add(this.className),this.renderer=new J(this.dom,this.component,this.props),this.editor.renderers.add(this.renderer),this.applyDecorationClasses()}update(e,t){return e.type!==this.node.type||this.node.attrs.id!==void 0&&e.attrs.id!==this.node.attrs.id?!1:(this.node=e,this.decorations=t,this.applyDecorationClasses(),this.renderer.updateProps(this.props),!0)}applyDecorationClasses(){this.dom&&(this.dom.classList.forEach(e=>{e!==this.className&&this.dom?.classList.remove(e)}),this.decorations.forEach(e=>{let t=e.type?.attrs;t?.class&&t.class.split(` `).forEach(e=>{e&&this.dom&&this.dom.classList.add(e)})}))}selectNode(){this.view.editable&&(this.isSelected=!0,this.renderer.updateProps(this.props))}deselectNode(){this.view.editable&&(this.isSelected=!1,this.renderer.updateProps(this.props))}stopEvent(e){return e.type!==`mousedown`&&!e.type.startsWith(`drag`)&&!e.type.startsWith(`drop`)}destroy(){this.editor.renderers.delete(this.renderer),this.dom=null}ignoreMutation(){return!0}get props(){return{node:this.node,view:this.view,isSelected:this.isSelected,isEditable:this.view.editable,getPos:this.getPos,decorations:this.decorations}}};function tt({children:e}){return e(re())}var Y=P();function nt({onSwipeRight:e,onSwipeLeft:t,onSwipeUp:n,onSwipeDown:r}){let i=(0,K.useRef)(),a=(0,K.useRef)(),o=(0,K.useRef)(),s=(0,K.useRef)(),c=()=>{i.current=void 0,a.current=void 0,o.current=void 0,s.current=void 0};return{onTouchStartCapture:e=>{e.touches.length===1&&(e.stopPropagation(),i.current=e.changedTouches[0].screenX,o.current=e.changedTouches[0].screenY)},onTouchMoveCapture:l=>{if(g(i.current)&&g(o.current)&&l.touches.length===1){a.current=l.changedTouches[0].screenX,s.current=l.changedTouches[0].screenY;let u=a.current-i.current,d=s.current-o.current;if(u>0&&Math.abs(d)<Math.abs(u))return c(),e();if(u<0&&Math.abs(d)<Math.abs(u))return c(),t();if(d>0&&Math.abs(d)>Math.abs(u))return c(),r();if(d<0&&Math.abs(d)>Math.abs(u))return c(),n()}},onTouchCancelCapture:()=>{c()}}}N();function rt({document:e,pos:t}){let{comments:r}=k(),{editor:i,focusedCommentId:a,setFocusedCommentId:o}=B(),s=ce(),{t:c}=n(),l=be(e),[u,d]=O(`draft-${e.id}-image-${t}`,void 0),f=i?.view?.state?.doc?G.getCommentIdsAtPos(i.view.state.doc,t):[],p=r.threadsInDocument(e.id).filter(e=>f.includes(e.id)&&!e.isResolved),m=(0,K.useRef)(null),h=(0,K.useCallback)(e=>{if(!i)return;let{state:n,dispatch:r}=i.view,a=n.doc.nodeAt(t);if(!a)return;let o=a.attrs.marks??[],c={type:`comment`,attrs:{id:e,userId:s.id,draft:!0}},l={...a.attrs,marks:[...o,c]};r(n.tr.setNodeMarkup(t,void 0,l)),m.current=e},[i,t,s.id]),g=(0,K.useCallback)(()=>{o(null);let e=m.current;e&&(i?.updateComment(e,{draft:!1}),m.current=null)},[i,o]),_=a&&f.includes(a)?r.get(a):void 0,v=p.length>0,y=l.comment;return(0,q.jsxs)(it,{column:!0,children:[(0,q.jsx)(at,{children:c(`Comments`)}),(0,q.jsx)(ot,{bottomShadow:!_,hiddenScrollbars:!0,topShadow:!0,children:(0,q.jsx)(st,{$hasComments:v,children:v?p.map(t=>(0,q.jsx)(Ze,{comment:t,document:e,recessed:!!_&&_.id!==t.id,focused:_?.id===t.id},t.id)):(0,q.jsx)(ct,{align:`center`,justify:`center`,auto:!0,children:(0,q.jsx)(se,{children:c(`No comments yet`)})})})}),y&&!_&&(0,q.jsx)(lt,{draft:u,onSaveDraft:d,documentId:e.id,placeholder:`${c(`Add a comment`)}…`,autoFocus:!1,standalone:!0,onBeforeCreate:h,onSubmit:g})]})}var it=j(I)`
  width: 360px;
  max-width: 100%;
  height: 100%;
  background: ${T(`background`)};
  border-inline-start: 1px solid ${T(`divider`)};
`,at=j.div`
  flex-shrink: 0;
  padding: 20px 16px 16px;
  font-size: 16px;
  font-weight: 600;
  color: ${T(`text`)};
  user-select: none;
`,ot=j(ge)`
  flex: 1 1 auto;
  min-height: 0;
`,st=j.div`
  height: ${e=>e.$hasComments?`auto`:`100%`};
  padding-bottom: 12px;
`,ct=j(I)`
  height: 100%;
  padding: 24px;
`,lt=j(Xe)`
  flex-shrink: 0;
  padding: 12px;
  padding-inline-end: 18px;
  padding-inline-start: 12px;
  border-top: 1px solid ${T(`divider`)};
`,ut=p(rt);function dt(e,t){(0,K.useLayoutEffect)(()=>{if(!t||!(e instanceof HTMLElement)&&!(e instanceof SVGElement))return;let n=e.style.visibility;return e.style.visibility=`hidden`,()=>{e.style.visibility=n}},[e,t])}N();var X=.3*oe.ms,Z=e=>{e.stopPropagation()},ft=(0,K.createContext)({isImagePanning:!1}),pt=(0,K.forwardRef)(({children:e,panningDisabled:t,disabled:n,onClose:i},o)=>{let{isPanning:s,...l}=mt(),u=(0,K.useRef)(null),d=u.current?.instance.transformState.scale??1,f=(0,K.useMemo)(()=>({onClick:e=>{d>1||e.defaultPrevented||[`IMG`,`INPUT`,`BUTTON`,`A`].includes(e.target.tagName)||i?.()}}),[i,d]);return(0,q.jsx)(ft.Provider,{value:{isImagePanning:s},children:(0,q.jsx)(a,{ref:r([o,u]),disabled:n,doubleClick:{disabled:!0},minScale:1,maxScale:8,panning:{disabled:t},...l,children:(0,q.jsx)(c,{wrapperStyle:{width:`100%`,height:`100%`,cursor:s?`grabbing`:d>1?`grab`:`zoom-out`},contentStyle:{width:`100%`,height:`100%`,padding:`56px`,justifyContent:`center`,alignItems:`center`},wrapperProps:f,children:e})})})});function mt(){let[e,t]=(0,K.useState)(!1),n=(0,K.useRef)(!1);return{isPanning:e,onPanningStart:e=>{e.state.scale>1&&t(e.instance.isPanning)},onPanning:()=>{n.current=!0},onPanningStop:(e,r)=>{t(e.instance.isPanning),n.current?n.current=!1:r.target instanceof HTMLImageElement&&(Math.abs(e.state.scale-1)<.001?e.zoomIn():e.resetTransform())}}}function ht({images:e,activeImage:t,onUpdate:r,onClose:i,readOnly:a}){let o=ae(3*oe.ms),{t:s}=n(),c=(0,K.useRef)(null),l=(0,K.useRef)(null),u=(0,K.useRef)(null),[d,f]=(0,K.useState)({lightbox:null,image:null}),[p,m]=(0,K.useState)(!1),[g,_]=(0,K.useState)(!1),[v,y]=(0,K.useState)(!1),[b,x]=(0,K.useState)(null),S=(0,K.useRef)(null),C=(0,K.useRef)(null),w=(0,K.useRef)(null),T=qe(),{document:E}=B(),D=T?.view?.state?.doc?.nodeAt(t.pos),O=!!E&&D?.type.name===`image`,k=h(e,e=>e.pos===t.pos);(0,K.useEffect)(()=>()=>{d.lightbox===5&&i()},[d.lightbox]),(0,K.useEffect)(()=>{f({lightbox:0,image:d.image})},[]),(0,K.useEffect)(()=>{d.image===2&&j()},[d.image]),(0,K.useEffect)(()=>{(d.image===1||d.image===2)&&d.lightbox===0&&(M(),re(),f({lightbox:1,image:d.image}))},[d.image,d.lightbox]),(0,K.useEffect)(()=>{d.lightbox===2&&d.image===2&&f({lightbox:2,image:3})},[d.lightbox,d.image]),(0,K.useEffect)(()=>{d.lightbox===3&&(N(),P(),f({lightbox:4,image:d.image}))},[d.lightbox]),(0,K.useEffect)(()=>{d.lightbox===5&&r(null)},[d.lightbox]),(0,K.useEffect)(()=>{if(p){_(!0);let e=window.requestAnimationFrame(()=>y(!0));return()=>window.cancelAnimationFrame(e)}y(!1);let e=window.setTimeout(()=>_(!1),200);return()=>window.clearTimeout(e)},[p]),(0,K.useEffect)(()=>{d.image===3&&u.current?.focus()},[d.image]),dt(t.getElement(),d.lightbox!==null&&d.lightbox!==0&&d.lightbox!==5);let j=()=>{if(c.current){let{top:e,left:t,width:n,height:r}=c.current.getBoundingClientRect();C.current={center:{x:t+n/2,y:e+r/2},width:n,height:r}}},re=()=>{if(c.current){let e=t.getElement();if(!e)return;let{top:n,left:r,width:i,height:a}=e.getBoundingClientRect(),o={center:{x:r+i/2,y:n+a/2},width:i,height:a},{top:s,left:l,width:u,height:d}=c.current.getBoundingClientRect(),f={center:{x:l+u/2,y:s+d/2},width:u,height:d},p=()=>A`
            from {
              translate: ${o.center.x-f.center.x}px ${o.center.y-f.center.y}px;
              scale: ${o.width/f.width};
            }
            to {
              translate: 0;
              scale: 1;
            }
        `;S.current={...S.current??{},zoomOut:void 0,zoomIn:{apply:p,duration:X}}}},M=()=>{let e=()=>A`
                    from { opacity: 0; }
                    to { opacity: 1; }
                    `;S.current={...S.current??{},fadeIn:{apply:e,duration:X},fadeOut:void 0}},N=()=>{let e=()=>A`
              from { opacity: ${l.current?window.getComputedStyle(l.current).opacity:1}; }
              to { opacity: 0; }
              `;S.current={...S.current??{},fadeIn:void 0,fadeOut:{apply:e,duration:S.current?.startTime?Date.now()-S.current.startTime:X}}},P=()=>{if(c.current&&!(d.image===5||d.image===4)){j();let{top:e,left:n,width:r,height:i}=c.current.getBoundingClientRect(),a={center:{x:n+r/2,y:e+i/2},width:r,height:i},o=t.getElement(),s;if(o?.isConnected){let{top:e,left:t,width:n,height:r}=o.getBoundingClientRect();s={center:{x:t+n/2,y:e+r/2>window.innerHeight+r/2?window.innerHeight+r/2:e+r/2<-r/2?-r/2:e+r/2},width:n,height:r}}else s={center:{x:a.center.x,y:window.innerHeight+i/2},width:r,height:i};let l=()=>{let e=C.current;if(!e)return A``;let t=a.center.x-e.center.x,n=a.center.y-e.center.y,r=s.center.x-e.center.x,i=s.center.y-e.center.y;return A`
            from {
              translate: ${t}px ${n}px;
              scale: ${a.width/e.width};
            }
            to {
              translate: ${r}px ${i}px;
              scale: ${s.width/e.width};
            }
        `};S.current={...S.current??{},zoomIn:void 0,zoomOut:{apply:l,duration:S.current?.startTime?Date.now()-S.current.startTime:X}}}},I=()=>{if(d.lightbox===2&&(d.image===3||d.image===1)){let t=k-1;if(t<0)return;r(e[t])}},L=()=>{if(d.lightbox===2&&(d.image===3||d.image===1)){let t=k+1;if(t>=e.length)return;r(e[t])}},R=()=>{(d.lightbox===1||d.lightbox===2)&&f({lightbox:3,image:d.image})},se=e=>{let t=e.match(/^data:image\/svg\+xml(?:;charset=utf-8)?,(.*)$/i);if(!t)return;let n=t[1],r=decodeURIComponent(n),i=new Uint8Array(r.length);for(let e=0;e<r.length;++e)i[e]=r.charCodeAt(e);return new Blob([i],{type:`image/svg+xml`})},ce=async(e,t)=>{let n;if(n=te(e)?await(await fetch(e)).blob():se(e),!n){ne.error(s(`Unable to download image`));return}let r=URL.createObjectURL(n),i=t||`image`,a=n.type.split(/\/|\+/g)[1],o=document.createElement(`a`);o.href=r,o.download=`${i}.${a}`,document.body.appendChild(o),o.click(),document.body.removeChild(o),URL.revokeObjectURL(r)},z=(0,K.useCallback)(()=>{t&&d.lightbox===2&&ce(t.src,t.alt)},[t,d.lightbox]);return(0,q.jsx)(fe,{open:!0,children:(0,q.jsxs)(he,{children:[(0,q.jsx)(yt,{ref:l,animation:S.current,onAnimationStart:()=>{S.current?.fadeIn&&(S.current={...S.current??{},startTime:Date.now()})},onAnimationEnd:()=>{S.current?.fadeIn?(S.current={...S.current??{},zoomIn:void 0,fadeIn:void 0,startTime:void 0},f({lightbox:2,image:d.image})):S.current?.fadeOut&&f({lightbox:5,image:null})}}),(0,q.jsxs)(xt,{onKeyDown:e=>{let t=e.target;if(!(t&&t!==e.currentTarget&&(t.tagName===`INPUT`||t.tagName===`TEXTAREA`||t.isContentEditable)))switch(e.key){case`ArrowLeft`:e.preventDefault(),I();break;case`ArrowRight`:e.preventDefault(),L();break;case`Escape`:e.preventDefault(),R();break}},ref:u,$commentsOpen:O&&p,children:[(0,q.jsxs)(ie,{children:[(0,q.jsx)(ue,{children:s(`Lightbox`)}),(0,q.jsx)(le,{children:s(`View, navigate, or download images in the document`)})]}),(0,q.jsxs)(St,{animation:S.current,$commentsOpen:O&&p,children:[(0,q.jsx)(F,{content:s(`Zoom in`),placement:`bottom`,children:(0,q.jsx)(Q,{tabIndex:-1,disabled:d.image===4||d.image===1,onClick:()=>{w.current&&w.current.zoomIn()},"aria-label":s(`Zoom in`),size:32,icon:(0,q.jsx)(Y.ZoomInIcon,{}),borderOnHover:!0,neutral:!0})}),(0,q.jsx)(F,{content:s(`Zoom out`),placement:`bottom`,children:(0,q.jsx)(Q,{tabIndex:-1,disabled:!(d.image===5||d.image===4),onClick:()=>{w.current&&w.current.zoomOut()},"aria-label":s(`Zoom out`),size:32,icon:(0,q.jsx)(Y.ZoomOutIcon,{}),borderOnHover:!0,neutral:!0})}),(0,q.jsx)(Ye,{}),(0,q.jsx)(F,{content:s(`Copy link`),placement:`bottom`,children:(0,q.jsx)(Ge,{text:c.current?.src??``,children:(0,q.jsx)(Q,{tabIndex:-1,disabled:d.image===1,"aria-label":s(`Copy link`),size:32,icon:(0,q.jsx)(Y.LinkIcon,{}),borderOnHover:!0,neutral:!0})})}),(0,q.jsx)(F,{content:s(`Download`),placement:`bottom`,children:(0,q.jsx)(Q,{tabIndex:-1,disabled:d.image===1,onClick:z,"aria-label":s(`Download`),size:32,icon:(0,q.jsx)(Y.DownloadIcon,{}),borderOnHover:!0,neutral:!0})}),t.source===xe.DiagramsNet&&!ee.isElectron()&&!a&&(0,q.jsx)(F,{content:s(`Edit diagram`),placement:`bottom`,children:(0,q.jsx)(Q,{tabIndex:-1,disabled:d.image===1,onClick:()=>{let{state:e,dispatch:n}=T.view;n(e.tr.setSelection(Le.create(e.doc,t.pos))),T.commands.editDiagram()},"aria-label":s(`Edit diagram`),size:32,icon:(0,q.jsx)(Y.EditIcon,{}),borderOnHover:!0,neutral:!0})}),O&&(0,q.jsx)(F,{content:s(`Comments`),placement:`bottom`,children:(0,q.jsx)(Q,{tabIndex:-1,onClick:()=>m(e=>!e),"aria-label":s(`Comments`),"aria-pressed":p,size:32,icon:(0,q.jsx)(Y.CommentIcon,{}),borderOnHover:!0,neutral:!0})})]}),(0,q.jsx)(Ct,{animation:S.current,children:(0,q.jsx)(me,{asChild:!0,children:(0,q.jsx)(F,{content:s(`Close`),shortcut:`Esc`,placement:`bottom`,children:(0,q.jsx)(Q,{tabIndex:-1,onClick:R,"aria-label":s(`Close`),size:32,icon:(0,q.jsx)(Y.CloseIcon,{}),borderOnHover:!0,neutral:!0})})})}),k>0&&!(d.image===5||d.image===4)&&(0,q.jsx)(wt,{dir:`left`,$hidden:o,animation:S.current,children:(0,q.jsx)(Dt,{onClick:I,size:32,"aria-label":s(`Previous`),children:(0,q.jsx)(Y.BackIcon,{size:32})})}),(0,q.jsx)(pt,{panningDisabled:!(d.image===5||d.image===4),disabled:d.image===1,ref:w,onClose:R,children:(0,q.jsx)(gt,{ref:c,src:t.src,alt:t.alt,onLoading:()=>f({lightbox:d.lightbox,image:0}),onLoad:()=>f({lightbox:d.lightbox,image:2}),onError:()=>f({lightbox:d.lightbox,image:1}),onSwipeRight:I,onSwipeLeft:L,onSwipeUp:R,onSwipeDown:R,status:d,animation:S.current,onMinZoom:()=>{f({lightbox:d.lightbox,image:3})},onZoom:()=>f({lightbox:d.lightbox,image:5}),onMaxZoom:()=>f({lightbox:d.lightbox,image:4})})}),k<e.length-1&&!(d.image===5||d.image===4)&&(0,q.jsx)(wt,{dir:`right`,$hidden:o,animation:S.current,$commentsOpen:O&&p,children:(0,q.jsx)(Dt,{onClick:L,size:32,"aria-label":s(`Next`),children:(0,q.jsx)(Y.NextIcon,{size:32})})}),O&&g&&E&&(0,q.jsx)(Et,{ref:x,animation:S.current,$open:v,onPointerDown:Z,onPointerUp:Z,onMouseDown:Z,onMouseUp:Z,onClick:Z,children:(0,q.jsx)(V.Provider,{value:b,children:(0,q.jsx)(ut,{document:E,pos:t.pos})})})]})]})})}var gt=(0,K.forwardRef)(function({src:e,alt:t,onLoading:r,onLoad:i,onError:a,onSwipeRight:o,onSwipeLeft:c,onSwipeUp:l,onSwipeDown:u,status:d,animation:f,onMinZoom:p,onZoom:m,onMaxZoom:h},g){let{t:_}=n(),v=nt({onSwipeRight:o,onSwipeLeft:c,onSwipeUp:l,onSwipeDown:u}),{isImagePanning:y}=(0,K.useContext)(ft);s(({state:e,instance:t})=>{let n=t.props.minScale??1,r=t.props.maxScale??8,{scale:i}=e;i===n&&d.image===5?p():i===r&&d.image===5?h():i>n&&i<r&&d.image!==5&&m()});let[b,x]=(0,K.useState)(d.image===null||d.image===0);return(0,K.useEffect)(()=>{r()},[e]),(0,K.useEffect)(()=>{d.image===null||d.image===0?x(!0):d.image===2&&x(!1)},[d.image]),d.image===1?(0,q.jsxs)(Tt,{animation:f,...v,children:[(0,q.jsx)(Y.CrossIcon,{size:16}),` `,_(`Image failed to load`)]}):(0,q.jsxs)(q.Fragment,{children:[d.image===0&&(0,q.jsx)(z,{}),(0,q.jsxs)(_t,{children:[(0,q.jsx)(bt,{ref:g,src:e,alt:t,animation:f,onAnimationStart:()=>x(!1),...v,onError:a,onLoad:i,$hidden:b,$zoomedIn:d.image===5||d.image===4,$zoomedOut:d.image===3,$panning:y}),(0,q.jsx)(vt,{children:d.image===3&&d.lightbox===2?(0,q.jsx)(L,{children:t}):null})]})]})}),_t=j(`figure`)`
  width: 100%;
  height: 100%;
  margin: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`,vt=j(`figcaption`)`
  font-size: 14px;
  min-height: 1.5em;
  font-weight: normal;
  margin-top: 8px;
  color: ${T(`textSecondary`)};
  flex-shrink: 0;
`,yt=j(pe)`
  position: fixed;
  inset: 0;
  background-color: ${T(`background`)};
  z-index: ${D.overlay};
  ${e=>e.animation===null?M`
          opacity: 0;
        `:e.animation.fadeIn?M`
            animation: ${e.animation.fadeIn.apply()}
              ${e.animation.fadeIn.duration}ms;
          `:e.animation.fadeOut?M`
              animation: ${e.animation.fadeOut.apply()}
                ${e.animation.fadeOut.duration}ms;
            `:``}
`,bt=j.img`
  visibility: ${e=>e.$hidden?`hidden`:`visible`};
  pointer-events: auto !important;
  max-width: 100%;
  min-height: 0;
  object-fit: contain;
  cursor: ${e=>e.$panning?`grabbing`:e.$zoomedOut?`zoom-in`:e.$zoomedIn?`zoom-out`:`default`};

  ${e=>e.animation?.zoomIn?M`
          animation: ${e.animation.zoomIn.apply()}
            ${e.animation.zoomIn.duration}ms;
        `:e.animation?.zoomOut?M`
            animation: ${e.animation.zoomOut.apply()}
              ${e.animation.zoomOut.duration}ms;
          `:e.animation?.fadeOut?M`
              animation: ${e.animation.fadeOut.apply()}
                ${e.animation.fadeOut.duration}ms;
            `:``}
`,xt=j(de)`
  position: fixed;
  inset: 0;
  z-index: ${D.modal};
  display: flex;
  justify-content: center;
  align-items: center;
  outline: none;
  padding-inline-end: ${e=>e.$commentsOpen?`360px`:`0`};
  transition: padding-inline-end 200ms ease-out;
`,Q=j(R)`
  background: transparent;
`,St=j(ye)`
  position: absolute;
  top: 0;
  right: ${e=>e.$commentsOpen?`360px`:`44px`};
  margin: 16px 12px;
  z-index: ${D.modal};
  background: ${e=>C(.2,e.theme.background)};
  backdrop-filter: blur(4px);
  border-radius: 6px;
  transition: right 200ms ease-out;

  ${e=>e.animation===null?M`
          opacity: 0;
        `:e.animation.fadeIn?M`
            animation: ${e.animation.fadeIn.apply()}
              ${e.animation.fadeIn.duration}ms;
          `:e.animation.fadeOut?M`
              animation: ${e.animation.fadeOut.apply()}
                ${e.animation.fadeOut.duration}ms;
            `:``}
`,Ct=j.div`
  position: fixed;
  top: 0;
  right: 0;
  margin: 16px 12px;
  z-index: ${D.modal+1};
  background: ${e=>C(.2,e.theme.background)};
  backdrop-filter: blur(4px);
  border-radius: 6px;

  ${e=>e.animation===null?M`
          opacity: 0;
        `:e.animation.fadeIn?M`
            animation: ${e.animation.fadeIn.apply()}
              ${e.animation.fadeIn.duration}ms;
          `:e.animation.fadeOut?M`
              animation: ${e.animation.fadeOut.apply()}
                ${e.animation.fadeOut.duration}ms;
            `:``}
`,wt=j.div`
  position: absolute;
  ${e=>e.dir===`left`?`left: 0;`:`right: ${e.$commentsOpen?`360px`:`0`};`}
  transition:
    opacity 500ms ease-in-out,
    right 200ms ease-out;
  z-index: ${D.modal};
  ${e=>e.$hidden&&`opacity: 0;`}
  ${e=>e.animation===null?M`
          opacity: 0;
        `:e.animation.fadeIn?M`
            animation: ${e.animation.fadeIn.apply()}
              ${e.animation.fadeIn.duration}ms;
          `:e.animation.fadeOut?M`
              animation: ${e.animation.fadeOut.apply()}
                ${e.animation.fadeOut.duration}ms;
            `:``}
`,Tt=j(Se)`
  ${e=>e.animation===null?M`
          opacity: 0;
        `:e.animation.fadeIn?M`
            animation: ${e.animation.fadeIn.apply()}
              ${e.animation.fadeIn.duration}ms;
          `:e.animation.fadeOut?M`
              animation: ${e.animation.fadeOut.apply()}
                ${e.animation.fadeOut.duration}ms;
            `:``}
`,Et=j.div`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: ${D.modal};
  display: flex;
  transform: translateX(${e=>e.$open?`0`:`100%`});
  transition: transform 200ms ease-out;
  ${e=>e.animation?.fadeOut?M`
          animation: ${e.animation.fadeOut.apply()}
            ${e.animation.fadeOut.duration}ms;
        `:``}
`,Dt=j(ve)`
  margin: 16px;
  opacity: 0.75;
  color: ${T(`text`)};
  outline: none;
  ${E(12)}

  &:hover {
    opacity: 1;
  }
`,Ot=p(ht),kt=class extends Fe{constructor(){super({state:{init:(e,t)=>({decorations:this.createDecorations(t)}),apply:(e,t,n,r)=>e.docChanged?we(e)||this.hasAnchorableChange(e)?{decorations:this.createDecorations(r)}:{decorations:t.decorations.map(e.mapping,e.doc)}:t},props:{decorations:e=>{let t=this.getState(e);return t?t.decorations:null}}})}isAnchorable(e){return e.type.name===`heading`||Array.isArray(e.attrs.marks)&&e.attrs.marks.some(e=>e.type===`comment`&&e.attrs?.id)}hasAnchorableChange(e){let t=!1,n=e=>{!t&&this.isAnchorable(e)&&(t=!0)};return H(e.before,e.doc,0,n),t||H(e.doc,e.before,0,n),t}createAnchorDecoration(e){return Ne.widget(e.pos,()=>{let t=document.createElement(`a`);return t.id=e.id,t.className=e.className,t},{side:-1,key:e.id})}createDecorations(e){let t=G.getAnchors(e.doc);return Ae.create(e.doc,t.map(this.createAnchorDecoration))}},At=()=>new kt;N();var jt,$=class extends K.PureComponent{constructor(...e){super(...e),this.state={isRTL:!1,isEditorFocused:!1,activeLightboxImage:null},this.isInitialized=!1,this.isBlurred=!0,this.elementRef=K.createRef(),this.wrapperRef=K.createRef(),this.renderers=d.set(),this.events=new Qe,this.value=(e=!0,t)=>{if(e){let e=this.serializer.serialize(this.view.state.doc);return t?e.trim():e}return(t?G.trim(this.view.state.doc):this.view.state.doc).toJSON()},this.calculateDir=()=>{if(!this.elementRef.current)return;let e=this.props.dir===`rtl`||getComputedStyle(this.elementRef.current).direction===`rtl`;this.state.isRTL!==e&&this.setState({isRTL:e})},this.focusAtStart=()=>{let e=Me.atStart(this.view.state.doc),t=this.view.state.tr.setSelection(e);this.view.dispatch(t),this.view.focus()},this.focusAtEnd=()=>{let e=Me.atEnd(this.view.state.doc),t=this.view.state.tr.setSelection(e);this.view.dispatch(t),this.view.focus()},this.focus=()=>{this.view.focus(),this.view.dispatch(this.view.state.tr.scrollIntoView())},this.blur=()=>{this.view.dom.blur(),window?.getSelection()?.removeAllRanges()},this.insertContent=e=>{let t=U.fromJSON(this.schema,e),{$from:n}=this.view.state.selection,r=n.before(n.depth),i=n.after(n.depth);this.view.dispatch(this.view.state.tr.replaceWith(r,i,t.content))},this.insertFiles=(e,t)=>Ce(this.view,e,this.view.state.selection.to,t,this.props),this.isEmpty=()=>G.isEmpty(this.view.state.doc),this.getHeadings=()=>G.getHeadings(this.view.state.doc),this.getImages=()=>G.getImages(this.view.state.doc),this.getLightboxImages=()=>_(G.getLightboxNodes(this.view.state.doc),e=>Ue.createLightboxImage(this.view,e.pos)),this.getTasks=()=>G.getTasks(this.view.state.doc),this.getComments=()=>G.getComments(this.view.state.doc),this.removeComment=e=>{let{state:t,dispatch:n}=this.view,r=t.tr;t.doc.descendants((n,i)=>{let a=n.marks.find(n=>n.type===t.schema.marks.comment&&n.attrs.id===e);if(a){r.removeMark(i,i+n.nodeSize,a);return}if(y(n.attrs?.marks)){let t=n.attrs.marks.filter(t=>t.attrs?.id!==e),a={...n.attrs,marks:t};r.setNodeMarkup(i,void 0,a)}}),n(r)},this.updateComment=(e,t)=>{let{state:n,dispatch:r}=this.view,i=n.tr;n.doc.descendants((r,a)=>{let o=r.marks.find(t=>t.type===n.schema.marks.comment&&t.attrs.id===e);if(o){let e=a,s=a+r.nodeSize,c=n.schema.marks.comment.create({...o.attrs,...t});i.removeMark(e,s,o).addMark(e,s,c);return}if(y(r.attrs?.marks)){let n=r.attrs.marks.map(n=>n.type===`comment`&&n.attrs?.id===e?{...n,attrs:{...n.attrs,...t}}:n),o={...r.attrs,marks:n};i.setNodeMarkup(a,void 0,o)}}),r(i)},this.updateActiveLightboxImage=e=>{this.setState(t=>({...t,activeLightboxImage:e}))},this.getPlainText=()=>{let{doc:e}=this.view.state;return We(e,0,e.content.size)},this.dispatchThemeChanged=e=>{this.view.dispatch(this.view.state.tr.setMeta(`theme`,e.detail))},this.handleChange=()=>{this.props.onChange&&this.props.onChange((e=!0,t=!1)=>this.view?this.value(e,t):void 0)},this.handleEditorInit=()=>{!this.props.onInit||this.isInitialized||(this.props.onInit(),this.isInitialized=!0)},this.handleEditorDestroy=()=>{this.props.onDestroy&&this.props.onDestroy()},this.handleEditorBlur=()=>(this.setState({isEditorFocused:!1}),!1),this.handleEditorFocus=()=>(this.setState({isEditorFocused:!0}),!1)}componentDidMount(){this.init(),window.addEventListener(`theme-changed`,this.dispatchThemeChanged),this.props.scrollTo&&this.scrollToAnchor(this.props.scrollTo),this.calculateDir(),!this.props.readOnly&&this.props.autoFocus&&this.focusAtEnd()}componentDidUpdate(e){if(this.props.value&&e.value!==this.props.value){let e=this.createState(this.props.value);this.view.updateState(e)}if(e.readOnly&&!this.props.readOnly){let e=this.view.state.doc.toJSON();this.view.destroy(),this.init();let t=this.createState(e);this.view.updateState(t)}else !e.readOnly&&this.props.readOnly&&(this.view.update({...this.view.props,editable:()=>!1}),Array.from(this.renderers).forEach(e=>e.setProp(`isEditable`,!1)));this.props.scrollTo&&this.props.scrollTo!==e.scrollTo&&this.scrollToAnchor(this.props.scrollTo),e.readOnly&&!this.props.readOnly&&this.props.autoFocus&&this.focusAtEnd(),e.dir!==this.props.dir&&this.calculateDir(),!this.isBlurred&&!this.state.isEditorFocused&&(this.isBlurred=!0,this.props.onBlur?.()),this.isBlurred&&this.state.isEditorFocused&&(this.isBlurred=!1,this.props.onFocus?.())}componentWillUnmount(){window.removeEventListener(`theme-changed`,this.dispatchThemeChanged),this.view?.destroy(),this.mutationObserver?.disconnect(),this.handleEditorDestroy()}init(){this.extensions=this.createExtensions(),this.nodes=this.createNodes(),this.marks=this.createMarks(),this.schema=this.createSchema(),this.plugins=this.createPlugins(),this.rulePlugins=this.createRulePlugins(),this.serializer=this.createSerializer(),this.parser=this.createParser(),this.nodeViews=this.createNodeViews(),this.widgets=this.createWidgets(),this.props.readOnly?(this.keymaps=[],this.inputRules=[],this.pasteParser=this.parser):(this.keymaps=this.createKeymaps(),this.inputRules=this.createInputRules(),this.pasteParser=this.createPasteParser()),this.view=this.createView(),this.commands=this.createCommands(),this.selectionToolbarMenus=this.extensions.selectionToolbarMenus}createExtensions(){return new _e(this.props.extensions,this)}createPlugins(){return this.extensions.plugins}createRulePlugins(){return this.extensions.rulePlugins}createKeymaps(){return this.extensions.keymaps({schema:this.schema})}createInputRules(){return this.extensions.inputRules({schema:this.schema})}createNodeViews(){return Object.fromEntries(this.extensions.extensions.filter(e=>e.component).map(e=>[e.name,(t,n,r,i)=>new et(e.component,{editor:this,extension:e,node:t,view:n,getPos:r,decorations:i})]))}createCommands(){return this.extensions.commands({schema:this.schema,view:this.view})}createWidgets(){return this.extensions.widgets}createNodes(){return this.extensions.nodes}createMarks(){return this.extensions.marks}createSchema(){return new Pe({nodes:this.nodes,marks:this.marks})}createSerializer(){return this.extensions.serializer()}createParser(){return this.extensions.parser({schema:this.schema,plugins:this.rulePlugins})}createPasteParser(){return this.extensions.parser({schema:this.schema,rules:{linkify:!0},plugins:this.rulePlugins})}createState(e){let t=this.createDocument(e||this.props.defaultValue);return this.props.readOnly?W.create({schema:this.schema,doc:t,plugins:[...this.plugins,At()]}):W.create({schema:this.schema,doc:t,plugins:[...this.plugins,...this.keymaps,At(),Re({color:this.props.theme.cursor}),ke(),Ee({rules:this.inputRules}),ze(De)]})}createDocument(e){return e instanceof U?e:typeof e==`string`?this.parser.parse(e)||void 0:U.fromJSON(this.schema,e)}createView(){if(!this.elementRef.current)throw Error(`createView called before ref available`);let e=e=>e.steps.some(e=>(e instanceof je||e instanceof Ve)&&e.slice.content?.firstChild?.type.name===this.schema.nodes.checkbox_item.name),t=e=>e.steps.some(e=>(e instanceof Be||e instanceof He)&&e.mark.type.name===this.schema.marks.comment.name),n=this,r=new Ie(this.elementRef.current,{handleDOMEvents:{blur:this.handleEditorBlur,focus:this.handleEditorFocus},attributes:{translate:this.props.readOnly?`yes`:`no`},state:this.createState(this.props.value),editable:()=>!this.props.readOnly,nodeViews:this.nodeViews,dispatchTransaction(r){if(this.isDestroyed)return;let{state:i,transactions:a}=this.state.applyTransaction(r);this.updateState(i),a.some(e=>e.docChanged)&&(!n.props.readOnly||n.props.canUpdate&&a.some(e)||n.props.canComment&&a.some(t))&&n.handleChange(),n.handleEditorInit(),n.calculateDir(),n.forceUpdate()}});return r.dom.setAttribute(`role`,`textbox`),r.dom.setAttribute(`aria-label`,`Editor content`),r}async scrollToAnchor(e){if(!e)return;function t(e){for(let t=e;t;t=t.parentElement){let e=getComputedStyle(t);if(e.display===`none`||e.opacity===`0`)return!1}return!0}try{this.mutationObserver?.disconnect(),this.mutationObserver=Pt(e,e=>{try{let t=this.view.posAtDOM(e,0,1);t>=0&&t<=this.view.state.doc.content.size&&this.view.dispatch(this.view.state.tr.setSelection(Oe.near(this.view.state.doc.resolve(t),1)))}catch{}t(e)&&e.scrollIntoView()},this.elementRef.current||void 0)}catch{b.debug(`editor`,`Attempted to scroll to invalid hash: ${e}`)}}render(){let{readOnly:e,canUpdate:t,grow:n,style:r,className:i,onKeyDown:a}=this.props,{isRTL:o}=this.state;return(0,q.jsx)(V.Provider,{value:this.wrapperRef.current,children:(0,q.jsxs)(Je.Provider,{value:this,children:[(0,q.jsxs)(I,{ref:this.wrapperRef,onKeyDown:a,style:r,className:i,align:`flex-start`,justify:`center`,column:!0,children:[(0,q.jsx)(Mt,{$rtl:o,grow:n,readOnly:e,readOnlyWriteCheckboxes:t,focusedCommentId:this.props.focusedCommentId,userId:this.props.userId,editorStyle:this.props.editorStyle,commenting:!!this.props.onClickCommentMark,ref:this.elementRef,lang:this.props.lang??``}),this.widgets&&!this.props.cacheOnly&&Object.values(this.widgets).map((t,n)=>(0,q.jsx)(t,{rtl:o,readOnly:e,selection:this.view.state.selection},String(n))),(0,q.jsx)(f,{children:()=>(0,q.jsx)(q.Fragment,{children:Array.from(this.renderers).map(e=>e.content)})})]}),!v(this.state.activeLightboxImage)&&(0,q.jsx)(Ot,{readOnly:e,images:this.getLightboxImages(),activeImage:this.state.activeLightboxImage,onUpdate:this.updateActiveLightboxImage,onClose:this.view.focus.bind(this.view)})]})})}};jt=$,jt.defaultProps={defaultValue:``,dir:`auto`,placeholder:`Write something nice…`,readOnly:!1,onFileUploadStart:()=>{},onFileUploadStop:()=>{},embeds:[],extensions:Te};var Mt=j(Ke)`
  ${e=>e.focusedCommentId&&M`
      span#comment-${e.focusedCommentId} {
        background: ${C(.5,e.theme.brand.marine)};
        text-decoration: underline 2px ${e.theme.commentMarkBackground};

        * {
          background: transparent !important;
        }
      }
      a#comment-${e.focusedCommentId}
        ~ span.component-image
        div.image-wrapper {
        outline: ${e.theme.commentedImageOutlineDark} solid 2px;
      }
    `}

  ${e=>e.userId&&M`
      .mention[data-id="${e.userId}"] {
        color: ${e.theme.textHighlightForeground};
        background: ${e.theme.textHighlight};

        &.ProseMirror-selectednode {
          outline-color: ${e.readOnly?`transparent`:w(.2,e.theme.textHighlight)};
        }
      }
    `}
`,Nt=K.forwardRef(function(e,t){return(0,q.jsx)(tt,{children:n=>(0,q.jsx)($,{theme:n,...e,ref:t})})}),Pt=(e,t,n=document.body)=>{let r=new MutationObserver(n=>{let r=[...n].flatMap(e=>[...e.addedNodes]).find(t=>t.matches?.(e));r&&t(r)});return n.querySelector(e)?t(n.querySelector(e)):r.observe(n,{childList:!0,subtree:!0}),r};export{$ as Editor,Nt as default};