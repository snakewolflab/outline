import{o as e}from"./rolldown-runtime.CMxvf4Kt.js";import{D as t,Nt as n,Pt as r,Qt as i}from"./vendor-react.BDv3YiQX.js";import{r as a}from"./mobxreact.esm.BaBZO6aD.js";import{t as o}from"./query-string.BZ_VmwFF.js";import{t as s}from"./useStores.C2HL3oms.js";import{c,s as l}from"./vendor-styled.BLG-ZaDH.js";import{t as u}from"./lib.CIyroSo6.js";import{t as d}from"./Flex.DJ6mR3Bq.js";import{T as f,u as p}from"./index.CHF0CgVb.js";import{t as m}from"./Actions.B8zShC8m.js";import{t as h}from"./Scene.9CTEOJZr.js";import{t as g}from"./PaginatedDocumentList.D7tKMyQQ.js";import{t as _}from"./Subheading.CWg7x0YN.js";import{t as v}from"./InputSearchPage.Dhq7Btj4.js";import{n as y,t as b}from"./DateFilter.DTFKxi0G.js";import{t as x}from"./NewDocumentMenu.BEUSbHHA.js";var S=u(),C=e(o());l();var w=i();function T(){let{t:e}=t(),{documents:i}=s(),a=n(),o=r(),c=new URLSearchParams(o.search),l=c.get(`collectionId`)||void 0,u=c.get(`dateFilter`)||void 0,d=e=>{a.replace({pathname:o.pathname,search:C.stringify({...C.parse(o.search),...e},{skipEmptyString:!0})})},T=l||u,D={dateFilter:u,collectionId:l};return(0,w.jsxs)(h,{icon:(0,w.jsx)(S.DraftsIcon,{}),title:e(`Drafts`),left:(0,w.jsx)(v,{source:`drafts`,label:e(`Search documents`)}),actions:(0,w.jsx)(m,{children:(0,w.jsx)(x,{})}),children:[(0,w.jsx)(f,{children:e(`Drafts`)}),(0,w.jsxs)(_,{sticky:!0,children:[e(`Documents`),(0,w.jsxs)(E,{children:[(0,w.jsx)(y,{collectionId:l,onSelect:e=>d({collectionId:e})}),(0,w.jsx)(b,{dateFilter:u,onSelect:e=>d({dateFilter:e})})]})]}),(0,w.jsx)(g,{empty:(0,w.jsx)(p,{children:e(T?`No documents found for your filters.`:`You’ve not got any drafts at the moment.`)}),fetch:i.fetchDrafts,documents:i.drafts(D),options:D,showParentDocuments:!0,showCollection:!0})]})}var E=c(d)`
  opacity: 0.85;
  transition: opacity 100ms ease-in-out;
  position: absolute;
  right: 0;
  bottom: 0;
  padding: 0 0 6px;
  gap: 4px;

  &:hover {
    opacity: 1;
  }
`,D=a(T);export{D as default};