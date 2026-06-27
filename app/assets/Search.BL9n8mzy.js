import{o as e}from"./rolldown-runtime.CMxvf4Kt.js";import{D as t,It as n,Nt as r,Pt as i,Qt as a,en as o,g as s,wt as c}from"./vendor-react.BDv3YiQX.js";import{r as l}from"./mobxreact.esm.BaBZO6aD.js";import{t as ee}from"./env.DFiVzB6Q.js";import{E as u}from"./types.CmWxpsn8.js";import{n as te}from"./constants.DIkZqJ_5.js";import{t as d}from"./query-string.BZ_VmwFF.js";import{a as f,i as p}from"./styles.3HqXuy1I.js";import{t as ne}from"./urls.A6UTQq4z.js";import{n as m}from"./vendor-shared.BQZUQcdb.js";import{C as h}from"./routeHelpers.Dp2pk1Po.js";import{t as g}from"./useStores.C2HL3oms.js";import{c as _,o as v,s as y,t as b}from"./vendor-styled.BLG-ZaDH.js";import{t as x}from"./lib.CIyroSo6.js";import{r as re,t as S}from"./Tooltip.DlvdmaJm.js";import{t as C}from"./Text.ChaouWsf.js";import{t as w}from"./Flex.DJ6mR3Bq.js";import{n as T,t as E}from"./Fade.DoZVoUzz.js";import{y as ie}from"./index.CHF0CgVb.js";import{t as ae}from"./LoadingIndicator.ByiNnFx6.js";import{t as D}from"./NudeButton.tKECI9NH.js";import{t as O}from"./HStack.CJJZAD6g.js";import{a as k,r as A}from"./Avatar.BF9p6cQc.js";import{n as j,r as M}from"./index.es.Dxujvyep.js";import{r as N}from"./PaginatedList.CQlHVOKx.js";import{n as P}from"./CollectionIcon.BhY-S6Ej.js";import{s as oe}from"./OverflowMenuButton.e_BZrgS_.js";import{v as se}from"./CommandBarResults.Yuyu2tXK.js";import{t as ce}from"./Scene.9CTEOJZr.js";import{t as le}from"./usePaginatedRequest.BbH1Y7V8.js";import{t as ue}from"./DocumentListItem.BH4djB4g.js";import{n as F,t as I}from"./FilterOptions.CccAOFSG.js";import{n as de,t as fe}from"./DateFilter.DTFKxi0G.js";var L=e(d());y();var R=x(),z=e(o()),B=a();function pe(e){let{t:n}=t();return(0,B.jsx)(`div`,{children:(0,B.jsx)(S,{content:n(`Remove document filter`),children:(0,B.jsx)(F,{onClick:e.onClick,icon:(0,B.jsx)(R.CloseIcon,{}),neutral:!0,children:e.document.titleWithDefault})})})}var me=({statusFilter:e,onSelect:n})=>{let{t:r}=t(),i=(0,z.useMemo)(()=>[{key:u.Published,label:r(`Published`)},{key:u.Archived,label:r(`Archived`)},{key:u.Draft,label:r(`Drafts`)}],[r]);return(0,B.jsx)(I,{options:i,selectedKeys:e,onSelect:t=>{let r;r=e.includes(t)?e.filter(e=>e!==t):[...e,t],n({statusFilter:r})},defaultLabel:r(`Any status`)})};function V({searchQuery:e}){let{t:n}=t(),r=(0,z.useRef)(null),{focused:i,...a}=M(r,!1);return j(i,r),(0,B.jsxs)(U,{to:h({query:e.query}),ref:r,...a,children:[e.query,(0,B.jsx)(S,{content:n(`Remove search`),children:(0,B.jsx)(H,{"aria-label":n(`Remove search`),onClick:async t=>{t.preventDefault(),await e.delete()},children:(0,B.jsx)(R.CloseIcon,{})})})]})}var H=_(D)`
  opacity: 0;
  color: ${f(`textTertiary`)};

  &:focus,
  &:${p} {
    opacity: 1;
    color: ${f(`text`)};
  }
`,U=_(c)`
  display: flex;
  justify-content: space-between;
  color: ${f(`textSecondary`)};
  cursor: var(--pointer);
  padding: 1px 8px;
  border-radius: 4px;
  line-height: 24px;
  font-size: 14px;
  margin: 0 -8px;

  &:focus-visible {
    outline: none;
  }

  &:focus,
  &:${p} {
    color: ${f(`text`)};
    background: ${f(`backgroundSecondary`)};

    ${H} {
      opacity: 1;
    }
  }
`;y();function W({onEscape:e},n){let{searches:r}=g(),{t:i}=t();z.useEffect(()=>{r.fetchPage({source:`app`})},[r]);let a=r.recent.length?(0,B.jsxs)(B.Fragment,{children:[(0,B.jsx)(G,{children:i(`Recent searches`)}),(0,B.jsx)(K,{ref:n,onEscape:e,"aria-label":i(`Recent searches`),items:r.recent,children:()=>r.recent.map(e=>(0,B.jsx)(V,{searchQuery:e},e.id))})]}):null;return(0,B.jsx)(E,{animate:!r.recent.length,children:a})}var G=_.h2`
  font-weight: 500;
  font-size: 14px;
  line-height: 1.5;
  color: ${f(`textSecondary`)};
  margin: 12px 0 0;
`,K=_(N)`
  padding: 0;
  margin-top: 8px;
`,he=l(z.forwardRef(W));y();function q({defaultValue:e,...t},n){let r=v(),i=z.useCallback(()=>{n.current?.focus()},[n]);return z.useEffect(()=>{let t=(e||``).length;n.current?.setSelectionRange(t,t);let r=setTimeout(()=>{i()},100);return()=>{clearTimeout(r)}},[n,e,i]),(0,B.jsxs)(J,{align:`center`,children:[(0,B.jsx)(X,{size:46,color:r.placeholder,onClick:i}),(0,B.jsx)(Y,{...t,defaultValue:e,ref:n,spellCheck:`false`,type:`search`,autoFocus:!0})]})}var J=_(w)`
  position: relative;
  margin-bottom: 8px;
`,Y=_.input`
  width: 100%;
  padding-block: 10px 10px;
  padding-inline: 60px 10px;
  font-size: 30px;
  font-weight: 400;
  outline: none;
  border: 0;
  background: ${f(`inputBackground`)};
  border-radius: 4px;
  color: ${f(`text`)};

  ::-webkit-search-cancel-button {
    -webkit-appearance: none;
  }
  ::-webkit-input-placeholder {
    color: ${f(`placeholder`)};
  }
  :-moz-placeholder {
    color: ${f(`placeholder`)};
  }
  ::-moz-placeholder {
    color: ${f(`placeholder`)};
  }
  :-ms-input-placeholder {
    color: ${f(`placeholder`)};
  }
`,X=_(R.SearchIcon)`
  position: absolute;
  inset-inline-start: 8px;
  opacity: 0.7;
`,ge=z.forwardRef(q),_e=({sort:e,direction:n,onSelect:r})=>{let{t:i}=t(),a=(0,z.useMemo)(()=>[{key:`relevance-DESC`,label:i(`Relevance`),icon:(0,B.jsx)(R.SortDescendingIcon,{size:20})},{key:`updatedAt-DESC`,label:i(`Recently updated`),icon:(0,B.jsx)(R.SortDescendingIcon,{size:20})},{key:`updatedAt-ASC`,label:i(`Least recently updated`),icon:(0,B.jsx)(R.SortAscendingIcon,{size:20})},{key:`createdAt-DESC`,label:i(`Newest`),icon:(0,B.jsx)(R.SortDescendingIcon,{size:20})},{key:`createdAt-ASC`,label:i(`Oldest`),icon:(0,B.jsx)(R.SortAscendingIcon,{size:20})},{key:`title-ASC`,label:i(`A → Z`),icon:(0,B.jsx)(R.SortAscendingIcon,{size:20})},{key:`title-DESC`,label:i(`Z → A`),icon:(0,B.jsx)(R.SortDescendingIcon,{size:20})}],[i]),o=e&&n?`${e}-${n}`:`relevance-DESC`;return(0,B.jsx)(I,{showFilter:!1,showIcons:!1,disclosure:!1,options:a,selectedKeys:[o],onSelect:e=>{let[t,n]=e.split(`-`);r(t,n)},defaultLabel:i(`Relevance`)})};y();var Z={sort:`name`,direction:`ASC`};function ve(e){let{onSelect:n,userId:r}=e,{t:i}=t(),{users:a}=g();return(0,B.jsx)(I,{options:(0,z.useMemo)(()=>{let e=a.all.map(e=>({key:e.id,label:e.name,icon:(0,B.jsx)(ye,{model:e,size:A.Small})}));return[{key:``,label:i(`Any author`),icon:(0,B.jsx)(R.UserIcon,{size:20})},...e]},[a.all,i]),selectedKeys:[r],onSelect:n,defaultLabel:i(`Any author`),fetchQuery:a.fetchPage,fetchQueryOptions:Z,showFilter:!0})}var ye=_(k)`
  margin: 2px;
`,be=l(ve);y();function xe(){let{t:e}=t(),{documents:a,searches:o}=g(),c=re(),l=ie(),d=i(),f=r(),p=n(),_=z.useCallback(()=>f.goBack(),[f]),v=z.useRef(null),y=z.useRef(null),b=z.useRef(null),x=ne(p.params.query??l.get(`q`)??l.get(`query`)??``).trim(),S=x===``?void 0:x,E=l.get(`collectionId`)??``,D=l.get(`userId`)??``,O=l.get(`documentId`)??void 0,k=l.get(`dateFilter`)??``,A=l.getAll(`statusFilter`)?.length?l.getAll(`statusFilter`):[u.Published,u.Draft],j=l.get(`titleFilter`)===`true`,M=l.get(`sort`)??``,N=l.get(`direction`)??``,P=!!(S||E||D),F=O?a.get(O):void 0,I={document:!!F,collection:!F,user:!F||!!(F&&S),documentType:P,date:P,title:!!S&&!F,sort:P},R=z.useMemo(()=>({query:S,statusFilter:A,collectionId:E,userId:D,dateFilter:k,titleFilter:j,documentId:O,sort:M,direction:N}),[S,JSON.stringify(A),E,D,k,j,O,M,N]),{data:V,next:H,end:U,error:W,loading:G}=le(z.useMemo(()=>(S&&o.add({id:m(),query:S,createdAt:new Date().toISOString()}),P?async e=>{let t={offset:e?.offset,limit:e?.limit};return j?await a.searchTitles({...R,...t}):await a.search({...R,...t})}:()=>Promise.resolve([])),[S,j,R,o,a,P]),{limit:te.defaultLimit}),K=e=>{let t=p.params.query?h():d.pathname;f.replace({pathname:t,search:L.stringify({...L.parse(d.search),q:e},{skipEmptyString:!0})})},q=e=>{e.sort===`relevance`&&(e.sort=void 0,e.direction=void 0),f.replace({pathname:d.pathname,search:L.stringify({...L.parse(d.search),...e},{skipEmptyString:!0})})},J=e=>{if(!e.nativeEvent.isComposing){if(e.key===`Enter`){K(e.currentTarget.value);return}if(e.key===`Escape`)return e.preventDefault(),f.goBack();if(e.key===`ArrowUp`&&e.currentTarget.value){let t=e.currentTarget.value.length;(e.currentTarget.selectionEnd||0)===0&&(e.currentTarget.selectionStart=0,e.currentTarget.selectionEnd=t,e.preventDefault())}if(e.key===`ArrowDown`&&!e.shiftKey){if(e.preventDefault(),e.currentTarget.value){let t=e.currentTarget.value.length;if((e.currentTarget.selectionStart||0)<t){e.currentTarget.selectionStart=t,e.currentTarget.selectionEnd=t;return}}(y.current?.firstElementChild??b.current?.firstElementChild)?.focus()}}},Y=()=>v.current?.focus(),X=!G&&S&&V?.length===0,Z=I.sort?(0,B.jsx)(_e,{sort:M,direction:N,onSelect:(e,t)=>q({sort:e,direction:t})}):null;return(0,B.jsxs)(ce,{textTitle:S?`${S} – ${e(`Search`)}`:e(`Search`),actions:c?Z:null,children:[(0,B.jsx)(se,{trigger:`Escape`,handler:_}),G&&(0,B.jsx)(ae,{}),(0,B.jsxs)(Se,{column:!0,auto:!0,children:[(0,B.jsxs)(`form`,{method:`GET`,action:h(),onSubmit:oe,children:[(0,B.jsx)(ge,{name:`query`,ref:v,placeholder:`${e(O?`Search in document`:E?`Search in collection`:`Search`)}…`,onKeyDown:J,defaultValue:S??``},S?`search`:`recent`),(0,B.jsxs)(we,{children:[(0,B.jsxs)(w,{align:`center`,gap:4,wrap:!0,children:[I.document&&(0,B.jsx)(pe,{document:F,onClick:()=>{q({documentId:void 0})}}),I.collection&&(0,B.jsx)(de,{collectionId:E,onSelect:e=>q({collectionId:e})}),I.user&&(0,B.jsx)(be,{userId:D,onSelect:e=>q({userId:e})}),I.documentType&&(0,B.jsx)(me,{statusFilter:A,onSelect:({statusFilter:e})=>q({statusFilter:e})}),I.date&&(0,B.jsx)(fe,{dateFilter:k,onSelect:e=>q({dateFilter:e})}),I.title&&(0,B.jsx)(Te,{width:26,height:14,label:e(`Search titles only`),onChange:e=>{q({titleFilter:e})},checked:j,inForm:!1})]}),c?null:Z]})]}),P?(0,B.jsxs)(B.Fragment,{children:[W?(0,B.jsx)(T,{children:(0,B.jsxs)(Q,{column:!0,children:[(0,B.jsx)(C,{as:`h1`,children:e(`Something went wrong`)}),(0,B.jsxs)(C,{as:`p`,type:`secondary`,children:[e(`Please try again or contact support if the problem persists`),`.`]})]})}):X?(0,B.jsx)(T,{children:(0,B.jsx)(Q,{column:!0,children:(0,B.jsx)(C,{as:`p`,type:`secondary`,children:e(`No documents found for your search filters.`)})})}):null,(0,B.jsxs)($,{column:!0,children:[(0,B.jsx)(Ce,{ref:y,onEscape:Y,"aria-label":e(`Search Results`),items:V??[],children:()=>V?.length&&!W?V.map(e=>(0,B.jsx)(ue,{document:e.document,highlight:S,context:e.context,showCollection:!0},e.document.id)):null}),(0,B.jsx)(s,{onEnter:U||G?void 0:H,debug:ee.ENVIRONMENT===`development`},V?.length)]})]}):O?null:(0,B.jsx)(he,{ref:b,onEscape:Y})]})]})}var Q=_(w)`
  text-align: center;
  margin: 30vh auto 0;
  max-width: 380px;
  transform: translateY(-50%);
`,Se=_(w)`
  ${b(`tablet`)`
    margin-top: 40px;
  `};
`,$=_(w)`
  margin-bottom: 150px;
`,Ce=_(N)`
  display: flex;
  flex-direction: column;
  flex: 1;
`,we=_(O)`
  flex-wrap: wrap;
  justify-content: space-between;
  margin-bottom: 12px;
  transition: opacity 100ms ease-in-out;
  padding: 8px 0;

  ${b(`tablet`)`
    padding: 0;
  `};
`,Te=_(P)`
  white-space: nowrap;
  margin-left: 8px;
  font-size: 14px;
  font-weight: 400;
  height: 28px;
`,Ee=l(xe);export{Ee as default};