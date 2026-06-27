import{o as e}from"./rolldown-runtime.CMxvf4Kt.js";import{D as t,Qt as n,S as r,en as i}from"./vendor-react.BDv3YiQX.js";import{G as a,U as o,W as s}from"./vendor-es-toolkit.XcNOARzK.js";import{c,h as l,l as u}from"./types.CmWxpsn8.js";import{a as d,b as f,i as p}from"./styles.3HqXuy1I.js";import{n as m}from"./usePersistedState.GsSAxQcG.js";import{t as h}from"./i18next.B4DNOaAz.js";import{t as ee}from"./useStores.C2HL3oms.js";import{c as g,s as _}from"./vendor-styled.BLG-ZaDH.js";import{t as v}from"./lib.CIyroSo6.js";import{r as y}from"./Tooltip.DlvdmaJm.js";import{t as b}from"./Text.ChaouWsf.js";import{t as x}from"./Flex.DJ6mR3Bq.js";import{h as S,i as te}from"./index.CHF0CgVb.js";import{a as C,i as w,o as T,r as E,t as D}from"./Emoji.DItFl6FR.js";import{t as ne}from"./EmojiCreateDialog.BeenOpO3.js";import{s as O,u as k}from"./Icon.ClgBIv_u.js";import{t as A}from"./NudeButton.tKECI9NH.js";import{i as re,r as ie,t as ae}from"./Popover.CIIe-PnX.js";import{t as oe}from"./HStack.CJJZAD6g.js";import{t as j}from"./useCurrentTeam.Bg4emvG8.js";import{t as M}from"./usePolicy.CPwNtdBL.js";var N=e(i()),P=v(),F=function(e){return e.All=`All`,e.Frequent=`Frequent`,e.Search=`Search`,e}({}),se={All:h.t(`All`),Frequent:h.t(`Frequently Used`),Search:h.t(`Search Results`),People:h.t(`Smileys & People`),Nature:h.t(`Animals & Nature`),Foods:h.t(`Food & Drink`),Activity:h.t(`Activity`),Places:h.t(`Travel & Places`),Objects:h.t(`Objects`),Symbols:h.t(`Symbols`),Flags:h.t(`Flags`),Custom:h.t(`Custom`)},I={Get:24,Track:30},L={Base:`icon-state`,EmojiSkinTone:`emoji-skintone`,IconsFrequency:`icons-freq`,EmojisFrequency:`emojis-freq`,LastIcon:`last-icon`,LastEmoji:`last-emoji`,CustomEmojisFrequency:`custom-emojis-freq`,LastCustomEmoji:`last-custom-emoji`},R=e=>`${L.Base}.${e}`,z=R(L.EmojiSkinTone),B=R(L.IconsFrequency),V=R(L.EmojisFrequency),H=R(L.LastIcon),U=R(L.LastEmoji),W=R(L.CustomEmojisFrequency),G=R(L.LastCustomEmoji),K=e=>e.sort((e,t)=>e[1]>=t[1]?-1:1);_();var q=n(),ce=({width:e,height:t,data:n,columns:r,itemWidth:i},a)=>(0,q.jsx)(ue,{outerRef:a,width:e,height:t,itemCount:n.length,itemSize:i,itemData:{data:n,columns:r},children:le}),le=({index:e,style:t,data:n})=>{let{data:r,columns:i}=n,a=r[e];return(0,q.jsx)(de,{style:t,columns:i,children:a})},ue=g(r)`
  padding: 0px 12px;
  overflow-x: hidden !important;

  // Needed for the absolutely positioned children
  // to respect the VirtualList's padding
  & > div {
    position: relative;
  }
`,de=g.div`
  display: grid;
  grid-template-columns: ${({columns:e})=>`repeat(${e}, 1fr)`};
  align-content: center;
`,fe=N.forwardRef(ce);_();var J=g(A)`
  width: 32px;
  height: 32px;
  padding: 4px;

  &: ${p} {
    background: ${d(`listItemHoverBackground`)};
  }

  @media (max-width: ${f.tablet-1}px) {
    width: 40px;
    height: 40px;
  }
`;_();var pe=32,me=40,he=24,ge=32,_e=({width:e,height:t,data:n,empty:r,onIconSelect:i},o)=>{let c=y(),u=c?me:pe,d=c?ge:he,f=Math.max(1,Math.floor((e-24)/u));return(0,q.jsx)(fe,{ref:o,width:e,height:t,data:s(n.flatMap(e=>{let t=(0,q.jsx)(ve,{type:`tertiary`,size:`xsmall`,weight:`bold`,children:se[e.category]},e.category);if(e.icons.length===0)return e.category===`Search`?[[t],[r]]:[];let n=a(e.icons.map(e=>e.type===l.SVG?(0,q.jsx)(J,{onClick:()=>i({id:e.name,value:e.name}),style:{"--delay":`${e.delay}ms`},children:(0,q.jsx)(ye,{as:k.getComponent(e.name),color:e.color,size:d,children:e.initial})},e.name):(0,q.jsx)(J,{onClick:()=>i({id:e.id,value:e.value}),children:(0,q.jsx)(D,{width:d,height:d,size:c?d:void 0,children:e.type===l.Custom?(0,q.jsx)(O,{value:e.value,title:e.name}):e.value})},e.id)),f);return[[t],...n]})),columns:f,itemWidth:u})},ve=g(b)`
  grid-column: 1 / -1;
  padding-left: 6px;
`,ye=g.svg`
  transition:
    color 150ms ease-in-out,
    fill 150ms ease-in-out;
  transition-delay: var(--delay);
`,Y=N.forwardRef(_e);_();var X=g(A)`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  color: ${d(`textSecondary`)};
  border: 1px solid ${d(`inputBorder`)};
  padding: 4px;

  &: ${p} {
    border: 1px solid ${d(`inputBorderFocused`)};
  }
`;_();var be=({skinTone:e,onChange:n})=>{let{t:r}=t(),[i,a]=(0,N.useState)(!1),o=(0,N.useMemo)(()=>E({id:`hand`}),[]),s=(0,N.useCallback)(e=>{a(!1),n(e)},[n]),c=(0,N.useMemo)(()=>Object.values(u).map(e=>{let t=o[e];return t?(0,q.jsx)(J,{onClick:()=>s(e),children:(0,q.jsx)(D,{width:24,height:24,children:t.value})},t.value):null}).filter(Boolean),[o,s]);return(0,q.jsxs)(ae,{open:i,onOpenChange:a,children:[(0,q.jsx)(re,{children:(0,q.jsx)(X,{"aria-label":r(`Choose default skin tone`),children:o[e]?.value})}),(0,q.jsx)(ie,{side:`bottom`,align:`end`,"aria-label":r(`Choose default skin tone`),width:208,scrollable:!1,shrink:!0,children:(0,q.jsx)(xe,{children:c})})]})},xe=g(x)`
  padding: 0 8px;
`;_();var Se=g(oe)`
  height: 48px;
  padding: 6px 12px 0px;
`,Z=g(S)`
  flex-grow: 1;
  min-width: 0;
`,Ce={[l.Custom]:G,[l.Emoji]:U,[l.SVG]:H},we={[l.Custom]:W,[l.Emoji]:V,[l.SVG]:B},Te={[l.Custom]:``,[l.Emoji]:z,[l.SVG]:``},Q=e=>{let[t,n]=m(Te[e],u.Default),[r,i]=m(we[e],{}),[a,o]=m(Ce[e],void 0);return{emojiSkinTone:t,setEmojiSkinTone:n,incrementIconCount:N.useCallback(e=>{r[e]=(r[e]??0)+1,i({...r}),o(e)},[r,i,o]),getFrequentIcons:N.useCallback(()=>{let e=Object.entries(r);if(e.length>I.Track){let t=K(e).slice(0,I.Track);i(Object.fromEntries(t))}let t=K(e).slice(0,I.Get).map(([e,t])=>e),n=t.includes(a??``);return a&&!n&&(t.pop(),t.push(a)),t},[r,a,i])}},Ee=410,De=({panelWidth:e,query:n,panelActive:r,onEmojiChange:i,onQueryChange:a,height:o=Ee})=>{let{t:s}=t(),{emojis:c,dialogs:u}=ee(),d=M(j()),f=N.useRef(null),p=N.useRef(null),m=te(()=>c.orderedData.map($),[c.orderedData]),{emojiSkinTone:h,setEmojiSkinTone:g,incrementIconCount:_,getFrequentIcons:v}=Q(l.Emoji),{incrementIconCount:y,getFrequentIcons:b}=Q(l.Custom),S=N.useMemo(()=>v(),[v]),[C,w]=N.useState([]),T=N.useCallback(e=>{a(e.target.value)},[a]),E=N.useCallback(e=>{g(e)},[g]),D=N.useCallback(()=>{u.openModal({title:s(`Upload emoji`),content:(0,q.jsx)(ne,{onSubmit:u.closeAllModals})})},[u,s]),O=N.useCallback(({id:e,value:t})=>{i(t),m.some(t=>t.id===e)||C.some(t=>t.id===e)?y(e):_(e)},[i,_,y,m,C]);N.useEffect(()=>{b().forEach(e=>{c.fetch(e).then(t=>{w(n=>n.some(t=>t.id===e)?n:[...n,$(t)])}).catch(()=>{})})},[c,b]);let k=n===``?ke({skinTone:h,freqEmojis:S,customEmojis:m,freqCustomEmojis:C}):Oe({query:n,skinTone:h,customEmojis:m});return N.useLayoutEffect(()=>{r&&(p.current?.scroll({top:0}),requestAnimationFrame(()=>f.current?.focus()))},[r]),(0,q.jsxs)(x,{column:!0,children:[(0,q.jsxs)(Se,{children:[(0,q.jsx)(Z,{ref:f,value:n,placeholder:`${s(`Search emoji`)}…`,onChange:T}),(0,q.jsx)(be,{skinTone:h,onChange:E}),d.update&&(0,q.jsx)(X,{onClick:D,"aria-label":s(`Upload emoji`),children:(0,q.jsx)(P.PlusIcon,{})})]}),(0,q.jsx)(Y,{ref:p,width:e,height:o-48,data:k,onIconSelect:O,empty:(0,q.jsx)(J,{onClick:D,children:(0,q.jsx)(P.PlusIcon,{})})})]})},Oe=({query:e,skinTone:t,customEmojis:n})=>{let r=T({query:e,skinTone:t}),i=[...n.filter(t=>t.name?.toLowerCase().includes(e.toLowerCase())),...r.map(e=>({type:l.Emoji,id:e.id,value:e.value}))];return[{category:F.Search,icons:i}]},ke=({skinTone:e,freqEmojis:t,customEmojis:n,freqCustomEmojis:r})=>{let i=C({skinTone:e}),a=()=>{let n=[...w({ids:t,skinTone:e}).map(e=>({type:l.Emoji,id:e.id,value:e.value})),...r];return{category:F.Frequent,icons:n}},s=e=>({category:e,icons:(i[e]??[]).map(e=>({type:l.Emoji,id:e.id,value:e.value}))}),u=o(a(),s(c.People),s(c.Nature),s(c.Foods),s(c.Activity),s(c.Places),s(c.Objects),s(c.Symbols),s(c.Flags));return n.length&&u.push({category:`Custom`,icons:n}),u},$=e=>({type:l.Custom,id:e.id,value:e.id,name:e.name});export{De as default,Y as n,F as r,Q as t};