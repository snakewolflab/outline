import{o as e}from"./rolldown-runtime.CMxvf4Kt.js";import{D as t,Qt as n,en as r}from"./vendor-react.BDv3YiQX.js";import{r as i}from"./mobxreact.esm.BaBZO6aD.js";import{a}from"./styles.3HqXuy1I.js";import{f as o,h as s}from"./styles.BAW3KELE.js";import{t as c}from"./Desktop.YvZPTfe5.js";import{u as l}from"./routeHelpers.Dp2pk1Po.js";import{t as u}from"./useStores.C2HL3oms.js";import{c as d,s as f}from"./vendor-styled.BLG-ZaDH.js";import{t as p}from"./lib.CIyroSo6.js";import{t as m}from"./Tooltip.DlvdmaJm.js";import{t as h}from"./Flex.DJ6mR3Bq.js";import{t as g}from"./Icon.ClgBIv_u.js";import{t as _}from"./NudeButton.tKECI9NH.js";import{n as v}from"./DocumentBreadcrumb.kSDZtoZb.js";import{h as y}from"./sections.CtYETy3k.js";import{n as b,r as x}from"./OverflowMenuButton.e_BZrgS_.js";f();var S=p(),C=e(r()),w=n(),T=(e=6)=>{let{documents:n,ui:r}=u(),{t:i}=t();return(0,C.useMemo)(()=>n.recentlyViewed.filter(e=>e.id!==r.activeDocumentId).slice(0,e).map(e=>s({name:e.titleWithDefault,analyticsName:`Recently viewed document`,section:y,description:v(e,i),icon:e.icon?(0,w.jsx)(g,{value:e.icon,initial:e.initial,color:e.color??void 0}):(0,w.jsx)(S.DocumentIcon,{outline:e.isDraft}),to:l(e)})),[e,r.activeDocumentId,n.recentlyViewed,i])},E=10;function D(e){let{t:n}=t(),{documents:r}=u(),[i,a]=C.useState(!1),[s,l]=C.useState(!1),[d,f]=C.useState(!1),p=T(E),h=b(C.useMemo(()=>[o({name:n(`Recent`),actions:p})],[n,p])),g=C.useCallback(()=>{r.fetchRecentlyViewed({limit:E})},[r]);return C.useEffect(()=>{if(c.bridge&&`onNavigationStateChanged`in c.bridge)return f(!0),c.bridge.onNavigationStateChanged(e=>{a(e.canGoBack),l(e.canGoForward)})},[]),!c.isMacApp()||!d?null:(0,w.jsxs)(O,{gap:4,...e,children:[(0,w.jsx)(m,{content:n(`Go back`),disabled:!i,children:(0,w.jsx)(_,{"aria-label":n(`Go back`),disabled:!i,onClick:()=>c.bridge?.goBack(),children:(0,w.jsx)(A,{$enabled:i})})}),(0,w.jsx)(m,{content:n(`Go forward`),disabled:!s,children:(0,w.jsx)(_,{"aria-label":n(`Go forward`),disabled:!s,onClick:()=>c.bridge?.goForward(),children:(0,w.jsx)(k,{$enabled:s})})}),(0,w.jsx)(m,{content:n(`History`),children:(0,w.jsx)(x,{action:h,ariaLabel:n(`History`),onOpen:g,children:(0,w.jsx)(_,{"aria-label":n(`History`),children:(0,w.jsx)(j,{})})})})]})}var O=d(h)`
  position: absolute;
  inset-inline-end: 12px;
  top: 20px;

  button {
    cursor: default;
  }
`,k=d(S.ArrowIcon)`
  color: ${a(`textTertiary`)};
  opacity: ${e=>e.$enabled?.5:.15};
  transition: color 100ms ease-in-out;

  &:active,
  &:hover {
    opacity: ${e=>e.$enabled?1:.15};
  }

  [dir="rtl"] & {
    transform: rotate(180deg);
  }
`,A=d(k)`
  transform: rotate(180deg);
  flex-shrink: 0;

  [dir="rtl"] & {
    transform: rotate(0deg);
  }
`,j=d(S.ClockIcon)`
  color: ${a(`textTertiary`)};
  opacity: 0.5;
  transition: color 100ms ease-in-out;

  &:active,
  &:hover,
  [data-state="open"] & {
    opacity: 1;
  }
`,M=i(D);export{T as n,M as t};