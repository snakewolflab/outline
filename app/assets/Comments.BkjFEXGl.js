import{o as e}from"./rolldown-runtime.CMxvf4Kt.js";import{D as t,It as n,Qt as r,en as i}from"./vendor-react.BDv3YiQX.js";import{i as a}from"./vendor-framer-motion.CmOZgGZV.js";import{r as o}from"./mobxreact.esm.BaBZO6aD.js";import{j as s}from"./types.CmWxpsn8.js";import{a as c}from"./styles.3HqXuy1I.js";import{n as l}from"./usePersistedState.GsSAxQcG.js";import{t as u}from"./useStores.C2HL3oms.js";import{c as d,s as f}from"./vendor-styled.BLG-ZaDH.js";import{r as p}from"./Tooltip.DlvdmaJm.js";import{t as m}from"./Flex.DJ6mR3Bq.js";import{n as h}from"./Fade.DoZVoUzz.js";import{rt as g,u as _,y as v}from"./index.CHF0CgVb.js";import{t as y}from"./useCurrentUser.yDT7QBRq.js";import{t as b}from"./Scrollable.DWFqONda.js";import{n as x}from"./DocumentContext.QKzyz-MH.js";import{t as S}from"./usePolicy.CPwNtdBL.js";import{t as C}from"./useKeyDown.Du2PZ2Ep.js";import{t as w}from"./ButtonSmall.CszGSrX1.js";import{n as T}from"./InputSelectPermission.BjNMUyYO.js";import{n as E,t as D}from"./CommentThread.BgmzdSkr.js";import{t as O}from"./ArrowIcon.pziaqp-X.js";import{n as k}from"./Editor.B9kw8lj8.js";import{t as A}from"./SidebarLayout.Dk-1CJri.js";var j=e(i());f();var M=r(),N=({viewingResolved:e,onChange:n})=>{let{t:r}=t(),i=y(),a=i.getPreference(s.SortCommentsByOrderInDocument)?g.OrderInDocument:g.MostRecent,o=e?`resolved`:a,c=j.useCallback(e=>{e!==`resolved`&&e!==a&&(i.setPreference(s.SortCommentsByOrderInDocument,e===g.OrderInDocument),i.save()),n?.(e)},[i,n,a]);return(0,M.jsx)(P,{options:j.useMemo(()=>[{type:`item`,label:r(`Most recent`),value:g.MostRecent},{type:`item`,label:r(`Order in doc`),value:g.OrderInDocument},{type:`separator`},{type:`item`,label:r(`Resolved`),value:`resolved`}],[r]),value:o,onChange:c,label:r(`Sort comments`),labelHidden:!0,borderOnHover:!0})},P=d(T)`
  color: ${c(`textSecondary`)};
`;f();function F(){let{ui:e,comments:r,documents:i}=u(),o=y(),{editor:c,isEditorInitialized:d,setFocusedCommentId:f}=x(),{t:_}=t(),w=n(),T=i.get(w.params.documentSlug),E=k(),P=S(T),F=p(),[V,H]=(0,j.useState)(v().get(`resolved`)!==null||E?.isResolved||!1),U=(0,j.useRef)(null),W=(0,j.useRef)(0),G=(0,j.useRef)(!0),[K,q]=(0,j.useState)(!1);C(`Escape`,()=>T&&e.set({rightSidebar:null})),(0,j.useEffect)(()=>{E&&E.isResolved!==V&&H(E.isResolved)},[E,V]);let[J,Y]=l(`draft-${T?.id}-new`,void 0),X=o.getPreference(s.SortCommentsByOrderInDocument)?{type:g.OrderInDocument,referencedCommentIds:c?.getComments().map(e=>e.id)??[]}:{type:g.MostRecent},Z=T?V?r.resolvedThreadsInDocument(T.id,X):r.unresolvedThreadsInDocument(T.id,X):[],Q=Z.length>0,$=()=>{U.current&&U.current.scrollTo({top:U.current.scrollHeight})},ee=()=>{if(U.current){let e=U.current.scrollHeight,t=U.current.scrollTop,n=U.current.clientHeight;G.current=Math.abs(e-(t+n))<=50,G.current&&q(!1)}};(0,j.useEffect)(()=>{T&&d&&X.type===g.MostRecent&&!V&&$()},[X.type,T,d,V]),(0,j.useEffect)(()=>{q(!1),X.type===g.MostRecent&&!V&&Z.length>W.current&&(G.current?$():q(!0)),W.current=Z.length},[X.type,Z.length,V]);let te=!T||!d?null:(0,M.jsxs)(M.Fragment,{children:[(0,M.jsx)(b,{id:`comments`,bottomShadow:!E,hiddenScrollbars:!0,topShadow:!0,ref:U,onScroll:ee,children:(0,M.jsxs)(R,{$hasComments:Q,children:[Q?Z.map(e=>(0,M.jsx)(D,{comment:e,document:T,recessed:!!E&&E.id!==e.id,focused:E?.id===e.id},e.id)):(0,M.jsx)(L,{align:`center`,justify:`center`,auto:!0,children:(0,M.jsx)(I,{children:_(V?`No resolved comments`:`No comments yet`)})}),K&&(0,M.jsx)(h,{children:(0,M.jsx)(z,{onClick:$,children:(0,M.jsxs)(m,{align:`center`,children:[_(`New comments`),`\xA0`,(0,M.jsx)(O,{size:20})]})})})]})}),(0,M.jsx)(a,{initial:!1,children:(!E||F)&&P.comment&&!V&&(0,M.jsx)(B,{draft:J,onSaveDraft:Y,documentId:T.id,placeholder:`${_(`Add a comment`)}…`,autoFocus:!1,animatePresence:!0,standalone:!0})})]});return(0,M.jsx)(A,{title:(0,M.jsxs)(m,{align:`center`,justify:`space-between`,gap:8,auto:!0,children:[(0,M.jsx)(`div`,{style:F?{padding:`0 8px`}:void 0,children:_(`Comments`)}),(0,M.jsx)(N,{viewingResolved:V,onChange:e=>{H(e===`resolved`)}})]}),onClose:()=>{e.set({rightSidebar:null}),f(null)},scrollable:!1,children:te})}var I=d(_)`
  position: absolute;
  top: calc(50vh - 30px);
  transform: translateY(-50%);
`,L=d(m)`
  padding-bottom: 65px;
  height: 100%;
`,R=d.div`
  height: ${e=>e.$hasComments?`auto`:`100%`};
  padding-bottom: 60px;
`,z=d(w)`
  position: sticky;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  opacity: 0.8;
  border-radius: 12px;
  padding: 0 4px;

  &:hover {
    opacity: 1;
  }
`,B=d(E)`
  padding: 12px;
  padding-inline-end: 18px;
  padding-inline-start: 12px;
`,V=o(F);export{V as default};