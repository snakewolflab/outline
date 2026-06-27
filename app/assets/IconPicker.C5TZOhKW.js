import{o as e}from"./rolldown-runtime.CMxvf4Kt.js";import{D as t,Qt as n,en as r}from"./vendor-react.BDv3YiQX.js";import{h as i}from"./types.CmWxpsn8.js";import{a,i as o}from"./styles.3HqXuy1I.js";import{i as s}from"./theme.DkGRr6T8.js";import{t as c}from"./collections.C1xZeKhg.js";import{t as l}from"./useStores.C2HL3oms.js";import{c as u,r as d,s as f}from"./vendor-styled.BLG-ZaDH.js";import{t as p}from"./lib.CIyroSo6.js";import{r as m}from"./Tooltip.DlvdmaJm.js";import{t as h}from"./Flex.DJ6mR3Bq.js";import{h as g}from"./index.CHF0CgVb.js";import{r as _,t as v,u as y}from"./Icon.ClgBIv_u.js";import{t as b}from"./NudeButton.tKECI9NH.js";import{i as x,r as S,t as C}from"./Popover.CIIe-PnX.js";import w,{n as T,r as E,t as D}from"./EmojiPanel.BZ-ef40d.js";import{i as O,n as k,r as A,t as j}from"./dist.CNsnWH2t.js";import{t as ee}from"./useWindowSize.CYc0Z4gf.js";import{a as M,n as N,t as P}from"./Drawer.DylWdgHO.js";import{n as F,t as I}from"./SwatchButton.CRaDxjjl.js";import{t as L}from"./PopoverButton.DGJvip20.js";var R=p(),z=e(r());f();var B=n(),V=({activeColor:e,onSelect:t})=>{let[n,r]=z.useState(e),i=c.includes(n),a=i?void 0:n;z.useEffect(()=>{r(e)},[e]);let o=e=>{r(e),t(e)};return(0,B.jsxs)(W,{justify:`space-between`,align:`center`,auto:!0,children:[(0,B.jsx)(U,{activeColor:n,onClick:o}),(0,B.jsx)(H,{}),(0,B.jsx)(I,{color:a,active:!i,onChange:o,pickerInModal:!0})]})},H=u.div`
  width: 1px;
  height: 24px;
  background-color: ${a(`inputBorder`)};
`,U=({activeColor:e,onClick:t})=>(0,B.jsx)(B.Fragment,{children:c.map(n=>(0,B.jsx)(F,{color:n,active:n===e,onClick:()=>t(n)},n))}),W=u(h)`
  height: 48px;
  padding: 8px 12px;
  border-bottom: 1px solid ${a(`inputBorder`)};
`;f();var G=Object.keys(y.mapping).length,K=314,q=({panelWidth:e,initial:n,color:r,query:a,panelActive:o,onIconChange:s,onColorChange:c,onQueryChange:l})=>{let{t:u}=t(),d=z.useRef(null),f=z.useRef(null),{incrementIconCount:p,getFrequentIcons:m}=D(i.SVG),g=z.useMemo(()=>m(),[m]),_=g.length,v=z.useMemo(()=>y.findIcons(a),[a]),b=a!==``,x=b?E.Search:E.All,S=250/(G+_),C=z.useCallback(e=>{l(e.target.value)},[l]),w=z.useCallback(({id:e,value:t})=>{s(t),p(e)},[s,p]),O={category:x,icons:v.map((e,t)=>({type:i.SVG,name:e,color:r,initial:n,delay:Math.round((t+_)*S),onClick:w}))},k=b?[O]:[{category:E.Frequent,icons:g.map((e,t)=>({type:i.SVG,name:e,color:r,initial:n,delay:Math.round((t+_)*S),onClick:w}))},O];return z.useLayoutEffect(()=>{o&&(f.current?.scroll({top:0}),requestAnimationFrame(()=>d.current?.focus()))},[o]),(0,B.jsxs)(h,{column:!0,children:[(0,B.jsx)(J,{align:`center`,children:(0,B.jsx)(Y,{ref:d,value:a,placeholder:`${u(`Search icons`)}…`,onChange:C})}),(0,B.jsx)(V,{width:e,activeColor:r,onSelect:c}),(0,B.jsx)(T,{ref:f,width:e,height:K,data:k,onIconSelect:w})]})},J=u(h)`
  height: 48px;
  padding: 6px 12px 0px;
`,Y=u(g)`
  flex-grow: 1;
`;f();var X={Icon:`icon`,Emoji:`emoji`},te=408,Z=({icon:e,color:n,size:r=24,initial:a,className:o,popoverPosition:c,allowDelete:u,onChange:d,onOpen:f,onClose:p,borderOnHover:h,children:g})=>{let{t:y}=t(),{emojis:b}=l(),{width:w}=ee(),T=m(),[E,D]=z.useState(!1),[O,k]=z.useState(``),[A,j]=z.useState(n),F=_(e),I=z.useMemo(()=>F===i.Emoji?X.Emoji:X.Icon,[F]),[R,V]=z.useState(I),H=T?w-12:te,U=z.useCallback(e=>{V(e)},[]),W=z.useCallback(()=>{V(I)},[I]),G=z.useCallback(e=>{D(e),e?f?.():(p?.(),k(``),W())},[f,p,W]),K=z.useCallback(e=>{d(e,_(e)===i.SVG?A:null)},[d,A]),q=z.useCallback(t=>{j(t),_(e)===i.SVG&&d(e,t)},[e,d]),J=z.useCallback(()=>{D(!1),d(null,null)},[D,d]),Y=(0,B.jsx)(L,{"aria-label":y(`Show menu`),className:o,size:r,$borderOnHover:h,children:g||(F&&e?(0,B.jsx)(v,{value:e,color:n,size:r,initial:a}):(0,B.jsx)(re,{color:s.placeholder,size:r}))}),Z=(0,B.jsx)(ne,{open:E,activeTab:R,iconColor:A,iconInitial:a??``,query:O,panelWidth:H,allowDelete:!!(u&&e),onTabChange:U,onQueryChange:k,onIconChange:K,onIconColorChange:q,onIconRemove:J});return z.useEffect(()=>{V(I)},[I]),z.useEffect(()=>{E&&b.fetchAll()},[E,b]),T?(0,B.jsxs)(P,{open:E,onOpenChange:D,children:[(0,B.jsx)(M,{asChild:!0,children:Y}),(0,B.jsx)(N,{"aria-label":y(`Icon Picker`),children:Z})]}):(0,B.jsxs)(C,{open:E,onOpenChange:G,modal:!0,children:[(0,B.jsx)(x,{children:Y}),(0,B.jsx)(S,{"aria-label":y(`Icon Picker`),width:H,side:c===`right`?`right`:`bottom`,align:c===`bottom-start`?`start`:`center`,scrollable:!1,shrink:!0,children:Z})]})},ne=({open:e,activeTab:n,iconColor:r,iconInitial:i,query:a,panelWidth:o,allowDelete:s,onTabChange:c,onQueryChange:l,onIconChange:u,onIconColorChange:d,onIconRemove:f})=>{let{t:p}=t();return(0,B.jsxs)(A,{value:n,onValueChange:c,children:[(0,B.jsxs)(ae,{justify:`space-between`,align:`center`,children:[(0,B.jsxs)(k,{children:[(0,B.jsx)(Q,{value:X.Icon,"aria-label":p(`Icons`),$active:n===X.Icon,children:p(`Icons`)}),(0,B.jsx)(Q,{value:X.Emoji,"aria-label":p(`Emojis`),$active:n===X.Emoji,children:p(`Emojis`)})]}),s&&(0,B.jsx)(ie,{onClick:f,children:p(`Remove`)})]}),(0,B.jsx)($,{value:X.Icon,children:(0,B.jsx)(q,{panelWidth:o,initial:i,color:r,query:a,panelActive:e&&n===X.Icon,onIconChange:u,onColorChange:d,onQueryChange:l})}),(0,B.jsx)($,{value:X.Emoji,children:(0,B.jsx)(w,{panelWidth:o,query:a,panelActive:e&&n===X.Emoji,onEmojiChange:u,onQueryChange:l})})]})},re=u(R.SmileyIcon)`
  flex-shrink: 0;

  @media print {
    display: none;
  }
`,ie=u(b)`
  width: auto;
  font-weight: 500;
  font-size: 14px;
  color: ${a(`textTertiary`)};
  padding: 8px 12px;
  transition: color 100ms ease-in-out;
  &: ${o} {
    color: ${a(`textSecondary`)};
  }
`,ae=u(h)`
  padding-left: 12px;
  border-bottom: 1px solid ${a(`inputBorder`)};
`,Q=u(O)`
  position: relative;
  font-weight: 500;
  font-size: 14px;
  cursor: var(--pointer);
  background: none;
  border: 0;
  padding: 8px 12px;
  user-select: none;
  color: ${({$active:e})=>a(e?`textSecondary`:`textTertiary`)};
  transition: color 100ms ease-in-out;

  &: ${o} {
    color: ${a(`textSecondary`)};
  }

  ${({$active:e})=>e&&d`
      &:after {
        content: "";
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 1px;
        background: ${a(`textSecondary`)};
      }
    `}
`,$=u(j)`
  height: 410px;
  overflow-y: auto;
`,oe=z.memo(Z);export{oe as default};