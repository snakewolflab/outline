import{o as e}from"./rolldown-runtime.CMxvf4Kt.js";import{D as t,E as n,Qt as r,en as i,wt as a}from"./vendor-react.BDv3YiQX.js";import{i as o}from"./vendor-framer-motion.CmOZgGZV.js";import{r as s}from"./mobxreact.esm.BaBZO6aD.js";import{U as c,m as l}from"./vendor-es-toolkit.XcNOARzK.js";import{a as u,i as d}from"./styles.3HqXuy1I.js";import{i as f}from"./useIsMounted.p6I_9muu.js";import{t as p}from"./useStores.C2HL3oms.js";import{c as m,s as h}from"./vendor-styled.BLG-ZaDH.js";import{t as g}from"./lib.CIyroSo6.js";import{r as _,t as v}from"./Tooltip.DlvdmaJm.js";import{t as y}from"./Text.ChaouWsf.js";import{t as b}from"./Flex.hyJN9561.js";import{t as x}from"./Flex.DJ6mR3Bq.js";import{n as S}from"./Fade.DoZVoUzz.js";import{r as C,t as w}from"./Input.4J78Wued.js";import{H as T,O as E,d as ee,u as te,vt as ne}from"./index.CHF0CgVb.js";import{t as D}from"./useCurrentUser.yDT7QBRq.js";import{t as O}from"./Scrollable.DWFqONda.js";import{t as k}from"./NudeButton.tKECI9NH.js";import{i as A,r as j,t as re}from"./Popover.CIIe-PnX.js";import{n as ie,t as ae}from"./useWindowSize.CYc0Z4gf.js";import{t as M}from"./IsEmail.C-SoK2gU.js";import{a as N,r as P,t as F}from"./Avatar.BF9p6cQc.js";import{r as I,t as L}from"./PaginatedList.CQlHVOKx.js";import{t as R}from"./PlaceholderText.DWw2J9p7.js";import{t as z}from"./Placeholder.C5Q53KAq.js";import{n as B,t as V}from"./ListItem.DytBt8q8.js";import{t as H}from"./CopyToClipboard.BJGqvUA0.js";import{t as U}from"./ButtonSmall.CszGSrX1.js";import{t as W}from"./InputMemberPermissionSelect.B9itSCeD.js";import{t as G}from"./ButtonLink.Fzf_wCFW.js";var K=g(),q=e(i());h();var J=r(),Y=s(({group:e,children:n})=>{let{t:r}=t(),{groupUsers:i}=p(),[a,o]=q.useState(!1),s=q.useMemo(()=>i.inGroup(e.id),[i.orderedData,e.id]),c=q.useMemo(()=>({id:e.id}),[e.id]),l=q.useCallback(e=>(0,J.jsx)(B,{image:(0,J.jsx)(N,{model:e.user,size:P.Medium}),title:e.user.name,subtitle:e.user.email},e.id),[]);return(0,J.jsxs)(re,{open:a,onOpenChange:o,children:[(0,J.jsx)(A,{children:n}),(0,J.jsx)(j,{align:`start`,side:`right`,sideOffset:8,width:320,scrollable:!0,shrink:!0,children:(0,J.jsxs)(oe,{children:[(0,J.jsxs)(b,{style:{marginBottom:8},column:!0,children:[(0,J.jsx)(y,{size:`medium`,weight:`bold`,children:e.name}),(0,J.jsx)(y,{size:`small`,type:`tertiary`,children:r(`{{ count }} members`,{count:e.memberCount})})]}),a&&(0,J.jsx)(L,{items:s,fetch:i.fetchPage,options:c,renderItem:l})]})})]})}),oe=m.div`
  display: flex;
  flex-direction: column;
  margin: 12px 24px;
`;h();var se=m.div`
  ${k}:${d},
  ${k}[aria-expanded="true"] {
    background: ${u(`buttonNeutralHoverBackground`)};
  }
`,ce=m.div`
  border-top: 1px dashed ${u(`divider`)};
  margin: 8px 0;
`,le=m(K.InfoIcon).attrs({size:18})`
  vertical-align: bottom;
  margin-right: 2px;
  flex-shrink: 0;
`,ue=m(w)`
  padding: 12px 0 1px;
  min-width: 100px;
  flex: 1;

  ${C}:not(:first-child) {
    padding: 4px 8px 4px 0;
    flex: 1;
  }
`,de=m(a)`
  color: ${u(`textSecondary`)};
  text-decoration: underline;
`,fe=m.span`
  padding: 0 2px 0 8px;
  flex: 0 1 auto;
  cursor: text;
  color: ${u(`placeholder`)};
  user-select: none;
`,pe=m(b)`
  position: sticky;
  z-index: 1;
  top: 0;
  background: ${u(`menuBackground`)};
  color: ${u(`textTertiary`)};
  border-bottom: 1px solid ${u(`inputBorder`)};
  padding: 0 24px 12px;
  margin-top: 0;
  margin-left: -24px;
  margin-right: -24px;
  margin-bottom: 12px;
  cursor: text;

  &:before {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    top: -20px;
    height: 20px;
    background: ${u(`menuBackground`)};
  }
`,me={initial:{opacity:0,width:0,marginRight:0},animate:{opacity:1,width:`auto`,marginRight:8,transition:{type:`spring`,duration:.2,bounce:0}},exit:{opacity:0,width:0,marginRight:0}};function he({url:e,onCopy:n}){let{t:r}=t(),i=(0,q.useRef)(),a=(0,q.useCallback)(()=>(n(),i.current=setTimeout(()=>{f.message(r(`Link copied to clipboard`))},100),()=>{i.current&&clearTimeout(i.current)}),[n,r]);return(0,J.jsx)(v,{content:r(`Copy link`),placement:`top`,children:(0,J.jsx)(H,{text:e,onCopy:a,children:(0,J.jsx)(k,{type:`button`,children:(0,J.jsx)(K.LinkIcon,{size:20})})})})}h();function ge({permission:e,permissions:n,action:r,onChange:i}){let{t:a}=t();return(0,J.jsx)(S,{timing:`150ms`,children:(0,J.jsxs)(b,{gap:4,children:[(0,J.jsx)(X,{permissions:n,onChange:i,value:e}),(0,J.jsx)(U,{action:r,children:a(`Add`)})]})},`invite`)}var X=m(W)`
  font-size: 13px;
  height: 26px;

  ${E} {
    line-height: 26px;
    min-height: 26px;
  }
`,_e=q.forwardRef(function({onChange:e,onClick:r,onKeyDown:i,query:a,back:s,action:c},l){let{t:u}=t(),d=q.useRef(null),f=_(),p=q.useCallback(e=>{e.target.closest(`button`)||(d.current?.focus(),r(e))},[r]);return f?(0,J.jsxs)(x,{align:`center`,style:{marginBottom:12},auto:!0,children:[s,(0,J.jsx)(w,{placeholder:`${u(`Add or invite`)}…`,value:a,onChange:e,onClick:r,onKeyDown:i,autoFocus:!0,margin:0,flex:!0,children:c},`input`)]}):(0,J.jsx)(pe,{align:`center`,onClick:p,children:(0,J.jsxs)(o,{initial:!1,children:[s,(0,J.jsx)(C,{ref:n([d,l]),placeholder:`${u(`Add or invite`)}…`,value:a,onChange:e,onClick:r,onKeyDown:i,style:{padding:`6px 0`}},`input`),c]})})}),Z=({elementRef:e,maxViewportPercentage:t=90,margin:n=16})=>{let[r,i]=q.useState(10),{height:a}=ae(),o=q.useCallback(()=>{if(e?.current){let r=a/100*t-n;i(Math.min(r,e?.current?a-e.current.getBoundingClientRect().top-n:0))}else i(0)},[e,a,n,t]);return q.useLayoutEffect(o,[o]),{maxHeight:r,calcMaxHeight:o}};h();var ve=s(q.forwardRef(function({document:e,collection:n,query:r,pendingIds:i,addPendingId:a,removePendingId:o,onEscape:s},l){let u=q.useRef(!1),{users:d,groups:f}=p(),{t:m}=t(),h=D(),g=q.useRef(null),{maxHeight:_}=Z({elementRef:g,maxViewportPercentage:70}),v=ie(e=>{d.fetchPage({query:e}),f.fetchPage({query:e})},250,void 0,{leading:!0}),y=q.useCallback(e=>({id:e,name:e,avatarUrl:``,color:ne(e),initial:e[0].toUpperCase(),email:m(`Invite to workspace`)}),[m]),b=q.useMemo(()=>{let t=(e?d.notInDocument(e.id,r).filter(e=>e.id!==h.id):n?d.notInCollection(n.id,r):d.activeOrInvited).filter(e=>!e.isSuspended);return M(r)&&t.push(y(r)),[...e?f.notInDocument(e.id,r):n?f.notInCollection(n.id,r):[],...t]},[y,d,d.activeOrInvited,f,f.orderedData,e?.id,e?.members,n?.id,h.id,r,m]),x=q.useMemo(()=>i.map(e=>M(e)?y(e):d.get(e)??f.get(e)).filter(Boolean),[d,f,y,i]);q.useEffect(()=>{v(r)},[r,v]);function S(e){return e instanceof T?{title:e.name,subtitle:(0,J.jsx)(`span`,{onClick:e=>e.stopPropagation(),children:(0,J.jsx)(Y,{group:e,children:(0,J.jsx)(xe,{children:m(`{{ count }} member`,{count:e.memberCount})})})}),image:(0,J.jsx)(F,{group:e})}:{title:e.name,subtitle:e.email?e.email:e.isViewer?m(`Viewer`):m(`Editor`),image:(0,J.jsx)(N,{model:e,size:P.Medium})}}let C=b.length===0,w=new Set(i),E=b.filter(e=>!w.has(e.id));return d.isFetching&&C&&u.current?(0,J.jsx)(z,{}):(u.current=!1,(0,J.jsx)(Se,{ref:g,hiddenScrollbars:!0,style:{maxHeight:_},children:(0,J.jsx)(I,{ref:l,onEscape:s,"aria-label":m(`Suggestions for invitation`),items:c(x,E),children:()=>[...x.map(e=>(0,J.jsx)(ye,{keyboardNavigation:!0,...S(e),onClick:()=>o(e.id),onKeyDown:t=>{t.key===`Enter`&&(t.preventDefault(),t.stopPropagation(),o(e.id))},actions:(0,J.jsxs)(J.Fragment,{children:[(0,J.jsx)(Q,{}),(0,J.jsx)($,{})]})},e.id)),x.length>0&&(E.length>0||C)&&(0,J.jsx)(be,{},`separator`),...E.map(e=>(0,J.jsx)(B,{keyboardNavigation:!0,...S(e),onClick:()=>a(e.id),onKeyDown:t=>{t.key===`Enter`&&(t.preventDefault(),t.stopPropagation(),a(e.id))},actions:(0,J.jsx)(V,{})},e.id)),C&&(0,J.jsx)(te,{style:{marginTop:22},children:m(`No matches`)},`empty`)]})}))})),Q=m(K.CheckmarkIcon)`
  color: ${u(`accent`)};
`,$=m(K.CloseIcon)`
  display: none;
`,ye=m(B)`
  &: ${d} {
    ${Q} {
      display: none;
    }

    ${$} {
      display: block;
    }
  }
`,be=m.div`
  border-top: 1px dashed ${u(`divider`)};
  margin: 12px 0;
`,xe=m(G)`
  color: ${u(`textTertiary`)};
  &:hover {
    text-decoration: underline;
  }
`,Se=m(O)`
  padding: 12px 24px;
  margin: -12px -24px;
`;function Ce({count:e=1}){return(0,J.jsx)(ee,{delay:500,children:(0,J.jsx)(S,{children:l(e,e=>(0,J.jsx)(B,{image:(0,J.jsx)(R,{width:P.Medium,height:P.Medium}),title:(0,J.jsx)(R,{maxWidth:50,minWidth:30,height:14,style:{marginTop:4,marginBottom:4}}),subtitle:(0,J.jsx)(R,{maxWidth:75,minWidth:50,height:12,style:{marginBottom:4}})},e))})})}export{ge as a,ce as c,de as d,se as f,_e as i,ue as l,Y as m,ve as n,he as o,me as p,Z as r,fe as s,Ce as t,le as u};