import"./rolldown-runtime.CMxvf4Kt.js";import{D as e,Qt as t,en as n,wt as r}from"./vendor-react.BDv3YiQX.js";import{r as i}from"./mobxreact.esm.BaBZO6aD.js";import{a,t as o}from"./styles.3HqXuy1I.js";import{t as s}from"./usePrevious.DSWAD__5.js";import{t as c}from"./useStores.C2HL3oms.js";import{c as l,o as u,s as d}from"./vendor-styled.BLG-ZaDH.js";import{t as f}from"./lib.CIyroSo6.js";import{t as p}from"./Flex.DJ6mR3Bq.js";import{t as m}from"./animations.B6M7uYBl.js";import{t as h}from"./useCurrentUser.yDT7QBRq.js";import{t as g}from"./DocumentBreadcrumb.kSDZtoZb.js";import{t as _}from"./Time.CCtr95LZ.js";n();var v=f();d();var y=t(),b=e=>!Number.isFinite(+e)||e<0?0:e>100?100:+e,x=({color:e,percentage:t,offset:n})=>{let r=n*.7,i=2*Math.PI*r,a;return t&&(t=t>85&&t<100?85:t,a=(100-t)*i/100),(0,y.jsx)(`circle`,{r,cx:n,cy:n,fill:`none`,stroke:a===i?``:e,strokeWidth:2.5,strokeDasharray:i,strokeDashoffset:t?a:0,strokeLinecap:`round`,style:{transition:`stroke-dashoffset 0.6s ease 0s`}})},S=({percentage:e,size:t=16})=>{let n=u();e=b(e);let r=Math.floor(t/2);return(0,y.jsx)(C,{width:t,height:t,children:(0,y.jsxs)(`g`,{transform:`rotate(-90 ${r} ${r})`,children:[(0,y.jsx)(x,{color:n.progressBarBackground,offset:r}),e>0&&(0,y.jsx)(x,{color:n.accent,percentage:e,offset:r})]})})},C=l.svg`
  flex-shrink: 0;
`;d();function w(e,t,n){return n===0?e(`{{ total }} task`,{total:t,count:t}):n===t?e(`{{ completed }} task done`,{completed:n,count:n}):e(`{{ completed }} of {{ total }} tasks`,{total:t,completed:n})}function T({document:t}){let{tasks:n,tasksPercentage:r}=t,{t:i}=e(),a=u(),{completed:o,total:c}=n,l=o===c,d=s(l),f=w(i,c,o);return(0,y.jsxs)(p,{align:`center`,style:{padding:`0 1px`},gap:2,shrink:!1,children:[o===c?(0,y.jsx)(E,{color:a.accent,size:20,$animated:l&&d===!1}):(0,y.jsx)(S,{percentage:r}),f]})}var E=l(v.DoneIcon)`
  margin: -1px;
  animation: ${e=>e.$animated?m:`none`} 600ms;
  transform-origin: center center;
`,D=i(T);d();var O=({showPublished:t,showCollection:n,showLastViewed:i,showParentDocuments:a,document:o,revision:s,children:l,replace:u,to:d,...f})=>{let{t:p}=e(),{collections:m}=c(),v=h(),{modifiedSinceViewed:b,updatedAt:x,updatedBy:S,createdAt:C,publishedAt:w,archivedAt:T,deletedAt:E,isDraft:O,lastViewedAt:P,isTasks:F}=o;if(!S)return null;let I=o.collectionId?m.get(o.collectionId):void 0,L=v.id===S.id,R=S.name,z;z=s?(0,y.jsxs)(`span`,{children:[s.createdBy?.id===v.id?p(`You updated`):p(`{{ userName }} updated`,{userName:R}),` `,(0,y.jsx)(_,{dateTime:s.createdAt,addSuffix:!0})]}):E?(0,y.jsxs)(`span`,{children:[L?p(`You deleted`):p(`{{ userName }} deleted`,{userName:R}),` `,(0,y.jsx)(_,{dateTime:E,addSuffix:!0})]}):T?(0,y.jsxs)(`span`,{children:[L?p(`You archived`):p(`{{ userName }} archived`,{userName:R}),` `,(0,y.jsx)(_,{dateTime:T,addSuffix:!0})]}):o.sourceMetadata&&o.sourceMetadata?.importedAt&&o.sourceMetadata.importedAt>=x?(0,y.jsxs)(`span`,{children:[o.sourceMetadata.createdByName?p(`{{ userName }} updated`,{userName:o.sourceMetadata.createdByName}):p(`Imported`),` `,(0,y.jsx)(_,{dateTime:C,addSuffix:!0})]}):C===x?(0,y.jsxs)(`span`,{children:[L?p(`You created`):p(`{{ userName }} created`,{userName:R}),` `,(0,y.jsx)(_,{dateTime:x,addSuffix:!0})]}):w&&(w===x||t)?(0,y.jsxs)(`span`,{children:[L?p(`You published`):p(`{{ userName }} published`,{userName:R}),` `,(0,y.jsx)(_,{dateTime:w,addSuffix:!0})]}):(0,y.jsxs)(N,{highlight:b&&!L,children:[L?p(`You updated`):p(`{{ userName }} updated`,{userName:R}),` `,(0,y.jsx)(_,{dateTime:x,addSuffix:!0})]});let B=I?I.getChildrenForDocument(o.id).length:0,V=F,H=()=>O||!i?null:P?(0,y.jsxs)(M,{children:[(0,y.jsx)(k,{}),p(`Viewed`),` `,(0,y.jsx)(_,{dateTime:P,addSuffix:!0,shorten:!0})]}):L?null:(0,y.jsxs)(M,{children:[(0,y.jsx)(k,{}),(0,y.jsx)(N,{highlight:!0,children:p(`Never viewed`)})]});return(0,y.jsxs)(j,{align:`center`,$rtl:o.dir===`rtl`,...f,dir:`ltr`,children:[d?(0,y.jsx)(r,{to:d,replace:u,children:z}):z,n&&I&&(0,y.jsxs)(`span`,{children:[`\xA0`,p(`in`),`\xA0`,(0,y.jsx)(A,{children:(0,y.jsx)(g,{document:o,maxDepth:1,onlyText:!0})})]}),a&&B>0&&(0,y.jsxs)(`span`,{children:[(0,y.jsx)(k,{}),B,` `,p(`nested document`,{count:B})]}),H(),V&&(0,y.jsxs)(y.Fragment,{children:[(0,y.jsx)(k,{}),(0,y.jsx)(D,{document:o})]}),l]})},k=l.span`
  padding: 0 0.4em;

  &::after {
    content: "•";
  }
`,A=l.strong`
  font-weight: 550;
`,j=l(p)`
  justify-content: ${e=>e.$rtl?`flex-end`:`flex-start`};
  color: ${a(`textTertiary`)};
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  min-width: 0;
`,M=l.span`
  ${o()}
`,N=l.span`
  font-weight: ${e=>e.highlight?`600`:`400`};
`,P=i(O);export{k as n,P as t};