import{o as e}from"./rolldown-runtime.CMxvf4Kt.js";import{B as t,D as n,It as r,Nt as i,Pt as a,Qt as o,c as s,en as c}from"./vendor-react.BDv3YiQX.js";import{r as l}from"./mobxreact.esm.BaBZO6aD.js";import{C as u}from"./vendor-es-toolkit.XcNOARzK.js";import{L as d}from"./vendor-date.DdRVOm94.js";import{t as f}from"./Logger.6jrPKWwS.js";import{n as p}from"./constants.DIkZqJ_5.js";import{a as m,i as h,t as g}from"./styles.3HqXuy1I.js";import{n as _}from"./usePersistedState.GsSAxQcG.js";import{a as v,c as y}from"./styles.BAW3KELE.js";import{_ as ee,l as b,u as te}from"./routeHelpers.Dp2pk1Po.js";import{t as ne}from"./useStores.C2HL3oms.js";import{c as x,r as S,s as C}from"./vendor-styled.BLG-ZaDH.js";import{t as w}from"./lib.CIyroSo6.js";import{r as re}from"./Tooltip.DlvdmaJm.js";import{t as T}from"./Text.DjIJ7ekC.js";import{t as E}from"./Text.ChaouWsf.js";import{t as ie}from"./Flex.hyJN9561.js";import{t as D}from"./Fade.DoZVoUzz.js";import{K as O,R as k,U as A,u as ae,y as oe}from"./index.CHF0CgVb.js";import{t as se}from"./Scrollable.DWFqONda.js";import{a as j,r as M}from"./DocumentContext.QKzyz-MH.js";import{t as ce}from"./useKeyDown.Du2PZ2Ep.js";import{t as N}from"./useUserLocale.rzwPfV9U.js";import{r as P}from"./DocumentBreadcrumb.kSDZtoZb.js";import{t as F}from"./useBoolean.CKHZbah2.js";import{a as I,r as L}from"./Avatar.BF9p6cQc.js";import{t as R}from"./PaginatedList.CQlHVOKx.js";import{n as z,t as B}from"./Item.BO-tv8Y1.js";import{n as le}from"./InputSelectPermission.BjNMUyYO.js";import{n as ue}from"./CollectionIcon.BhY-S6Ej.js";import{n as V,r as de,t as fe}from"./OverflowMenuButton.e_BZrgS_.js";import{t as H}from"./Time.CCtr95LZ.js";import{a as U,i as W,r as G}from"./CommandBarResults.Yuyu2tXK.js";import{i as pe}from"./dist.BCRYHFyK.js";import{t as me}from"./Facepile.Ck6Znvvp.js";import{r as K}from"./RevisionViewer.CgP-e_Mi.js";import{t as he}from"./SidebarLayout.Dk-1CJri.js";var q=e(c()),ge=e(s()),J=w();C();var Y=o(),_e=({item:e})=>{let{t}=n(),r={userName:e.actor?.name},i,a;switch(e.name){case`documents.archive`:a=(0,Y.jsx)(J.ArchiveIcon,{}),i=t(`{{userName}} archived`,r);break;case`documents.unarchive`:a=(0,Y.jsx)(J.RestoreIcon,{}),i=t(`{{userName}} restored`,r);break;case`documents.delete`:a=(0,Y.jsx)(J.TrashIcon,{}),i=t(`{{userName}} deleted`,r);break;case`documents.add_user`:a=(0,Y.jsx)(J.UserIcon,{}),i=t(`{{userName}} added {{addedUserName}}`,{...r,addedUserName:e.user?.name??t(`a user`)});break;case`documents.remove_user`:a=(0,Y.jsx)(J.CrossIcon,{}),i=t(`{{userName}} removed {{removedUserName}}`,{...r,removedUserName:e.user?.name??t(`a user`)});break;case`documents.restore`:a=(0,Y.jsx)(J.RestoreIcon,{}),i=t(`{{userName}} moved from trash`,r);break;case`documents.publish`:a=(0,Y.jsx)(J.PublishIcon,{}),i=t(`{{userName}} published`,r);break;case`documents.unpublish`:a=(0,Y.jsx)(J.UnpublishIcon,{}),i=t(`{{userName}} unpublished`,r);break;case`documents.move`:a=(0,Y.jsx)(J.MoveIcon,{}),i=t(`{{userName}} moved`,r);break;default:f.warn(`Unhandled item`,{item:e})}return i?(0,Y.jsxs)(Z,{children:[(0,Y.jsx)(ve,{size:`xsmall`,type:`secondary`,children:a}),(0,Y.jsxs)(T,{size:`xsmall`,type:`secondary`,children:[i,` ·`,` `,(0,Y.jsx)(H,{dateTime:e.createdAt,relative:!0,shorten:!0,addSuffix:!0})]})]}):null},X=S`
  &::before {
    content: "";
    display: block;
    position: absolute;
    top: -8px;
    left: 22px;
    width: 1px;
    height: calc(50% - 14px + 8px);
    background: ${m(`divider`)};
    mix-blend-mode: ${e=>e.theme.isDark?`lighten`:`multiply`};
    z-index: 1;
  }

  &:first-child::before {
    display: none;
  }

  &:nth-child(2)::before {
    display: none;
  }

  &::after {
    content: "";
    display: block;
    position: absolute;
    top: calc(50% + 14px);
    left: 22px;
    width: 1px;
    height: calc(50% - 14px);
    background: ${m(`divider`)};
    mix-blend-mode: ${e=>e.theme.isDark?`lighten`:`multiply`};
    z-index: 1;
  }

  &:last-child::after {
    display: none;
  }

  h3 + &::before {
    display: none;
  }
`,ve=x(T)`
  height: 24px;
  min-width: 24px;
`,Z=x.li`
  display: flex;
  align-items: center;
  gap: 8px;
  list-style: none;
  margin: 8px 0;
  padding: 4px 10px;
  white-space: nowrap;
  position: relative;

  time {
    white-space: nowrap;
  }

  svg {
    flex-shrink: 0;
  }

  ${X}
`,ye=l(_e);function be({document:e,revisionId:t}){let{t:r}=n(),i=V((0,q.useMemo)(()=>[U,y,G(t),W(t)],[t]));return(0,Y.jsx)(v,{value:{activeModels:[e]},children:(0,Y.jsx)(de,{action:i,align:`end`,ariaLabel:r(`Revision options`),children:(0,Y.jsx)(fe,{})})})}var xe=l(be);function Q(e,t){return e.collaborators&&e.collaborators.length===2?`${e.collaborators[0].name} and ${e.collaborators[1].name}`:e.collaborators&&e.collaborators.length>2?t(`{{count}} people`,{count:e.collaborators.length}):e.createdBy?.name}C();var Se=({item:e,document:t,...r})=>{let{t:i}=n(),o=a(),s=P(),[c,l,u]=F(),d=K.latestId(t.id)===e.id,f=(0,q.useRef)(null),p=V((0,q.useMemo)(()=>[U,y,G(e.id),W(e.id)],[e.id])),m=()=>{f.current?.focus()},h,g,_;if(e.deletedAt)g=(0,Y.jsx)(J.TrashIcon,{}),h=i(`Revision deleted`);else{g=(0,Y.jsx)(J.EditIcon,{size:16});let n=Q(e,i);h=d?(0,Y.jsxs)(Y.Fragment,{children:[i(`Current version`),` · `,n]}):i(`{{userName}} edited`,{userName:n}),_={pathname:b(t,d?`latest`:e.id),search:o.search,state:{sidebarContext:s,retainScrollPosition:!0}}}return t.isDeleted&&(_=void 0),e.deletedAt?(0,Y.jsxs)(Z,{children:[(0,Y.jsx)(we,{size:`xsmall`,type:`secondary`,children:g}),(0,Y.jsxs)(E,{size:`xsmall`,type:`secondary`,children:[h,` ·`,` `,(0,Y.jsx)(H,{dateTime:e.deletedAt,relative:!0,shorten:!0,addSuffix:!0})]})]}):(0,Y.jsx)(v,{value:{activeModels:[t,e]},children:(0,Y.jsx)(pe,{action:p,ariaLabel:i(`Revision options`),onOpen:l,onClose:u,children:(0,Y.jsx)(Ee,{small:!0,exact:!0,to:_,title:(0,Y.jsx)(H,{dateTime:e.createdAt,format:{en_US:`MMM do, h:mm a`,fr_FR:`'Le 'd MMMM 'à' H:mm`},relative:!1,addSuffix:!0,onClick:m}),image:e.collaborators?(0,Y.jsx)(me,{users:e.collaborators,limit:3}):(0,Y.jsx)(I,{model:e.createdBy,size:L.Large}),subtitle:(0,Y.jsx)(Ce,{children:h}),actions:(0,Y.jsx)(Te,{children:(0,Y.jsx)(xe,{document:t,revisionId:e.id})}),ref:f,$menuOpen:c,...r})})})},Ce=x.div`
  ${g()})
`,we=x(E)`
  height: 24px;
  min-width: 24px;
`,Te=x(j)`
  height: 24px;
`,Ee=x(z)`
  border: 0;
  position: relative;
  margin: 8px 0;
  padding: 8px;
  border-radius: 8px;

  ${B} {
    opacity: 0;
  }

  &:${h},
  &:active,
  &:focus,
  &:focus-within,
  &:has([data-state="open"]) {
    background: ${m(`listItemHoverBackground`)};

    ${B} {
      opacity: 1;
    }
  }

  ${e=>e.$menuOpen&&S`
      background: ${m(`listItemHoverBackground`)};

      ${B} {
        opacity: 1;
      }
    `}

  ${X}
`,De=l(Se);C();var Oe=q.memo(function({empty:e,heading:t,items:n,fetch:r,options:i,document:a,...o}){return(0,Y.jsx)(ke,{items:n,empty:e,heading:t,fetch:r,options:i,isDuplicate:q.useCallback((e,t)=>e instanceof A&&t instanceof A?Math.abs(d(new Date(e.createdAt),new Date(t.createdAt)))<10&&e.name===t.name&&e.actorId===t.actorId&&e.userId===t.userId&&e.documentId===t.documentId&&e.collectionId===t.collectionId:!1,[]),renderItem:e=>e instanceof k?(0,Y.jsx)(De,{item:e,document:a},e.id):(0,Y.jsx)(ye,{item:e,document:a},e.id),renderHeading:e=>(0,Y.jsx)(Ae,{children:e}),...o})}),ke=x(R)`
  padding: 0 12px;
`,Ae=x(`h3`)`
  font-size: 15px;
  padding: 0 4px;
`;C();var $=`previous`;function je({showChanges:e,onShowChangesToggle:r,items:i,document:a,selectedRevisionId:o,compareTo:s,onCompareToChange:c}){let{t:l}=n(),u=N(),d=q.useRef(e),f=q.useMemo(()=>{let e=i.filter(e=>e instanceof k),n=O(u),r=o===`latest`&&a?K.latestId(a.id):o,s=[{type:`item`,label:l(`Previous version`),value:$}],c=a?K.latestId(a.id):void 0,d=new Date().getFullYear(),f;for(let i of e){if(i.id===r)continue;let e=new Date(i.createdAt),a=e.getFullYear();a!==d&&a!==f&&(s.push({type:`heading`,label:String(a)}),f=a);let o=t(e,`MMM do, h:mm a`,{locale:n}),u=Q(i,l);s.push({type:`item`,label:i.name??o,value:i.id===c?`latest`:i.id,description:u})}return s},[i,o,a,u,l]);return(0,Y.jsx)(Ne,{children:(0,Y.jsxs)(M,{children:[(0,Y.jsx)(T,{size:`small`,as:`div`,style:{padding:4},children:(0,Y.jsx)(ue,{label:l(`Highlight changes`),checked:e,onChange:r})}),e&&(0,Y.jsx)(D,{animate:!d.current,children:(0,Y.jsx)(Me,{options:f,value:s,onChange:c,label:l(`Compare to`),displayValue:e=>(0,Y.jsxs)(Y.Fragment,{children:[(0,Y.jsx)(T,{weight:`bold`,children:l(`Compare to`)}),` `,e?.label]}),labelHidden:!0,nude:!0,short:!0})})]})})}var Me=x(le)`
  margin: -4px -9px -1px;
  width: calc(100% + 18px);
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  position: relative;
  inset-block-end: -1px;
  height: 40px;
`,Ne=x.div`
  margin: 0 16px 8px;
  border: 1px solid ${e=>e.theme.inputBorder};
  border-radius: 6px;
  padding: 8px 8px 0;
  flex-shrink: 0;
`,Pe=[`documents.publish`,`documents.unpublish`,`documents.archive`,`documents.unarchive`,`documents.delete`,`documents.restore`,`documents.add_user`,`documents.remove_user`,`documents.move`];function Fe(){let{events:e,documents:t,revisions:a}=ne(),{t:o}=n(),s=r(),c=r({path:ee}),l=i(),d=oe(),f=P(),m=t.get(s.params.documentSlug),[h,g]=q.useState(0),[v,y]=q.useState(0),b=re(),[x,S]=q.useState(()=>d.get(`compareTo`)??`previous`),[C,w]=_(`history-show-changes`,!0),T=new URLSearchParams(l.location.search),[E,D]=q.useState(T.get(`changes`)===`true`||C),O=q.useCallback(e=>{let t=new URLSearchParams(l.location.search);Object.entries(e).forEach(([e,n])=>{n===null?t.delete(e):t.set(e,n)});let n=t.toString();l.replace({pathname:l.location.pathname,search:n?`?${n}`:``,state:l.location.state})},[l]),A=q.useCallback(e=>{D(e),w(e),e?O({changes:`true`}):(S($),O({changes:null,compareTo:null}))},[O,w]),j=c?.params.revisionId,M=q.useRef(j);q.useEffect(()=>{M.current!==j&&(M.current=j,S($),O({compareTo:null}))},[j,O]);let N=q.useCallback(e=>{S(e),O({compareTo:e===`previous`?null:e})},[O]);q.useEffect(()=>{C&&O({changes:`true`})},[C,O]);let F=q.useCallback(async()=>{if(!m)return[];let t=p.defaultLimit,[n,r]=await Promise.all([a.fetchPage({documentId:m.id,offset:h,limit:t}),e.fetchPage({events:Pe,documentId:m.id,offset:v,limit:t})]),i=u([...n,...r],`createdAt`,`desc`).slice(0,t);return g(h+n.length),y(v+i.length-n.length),i},[m,a,e,h,v]),I=q.useMemo(()=>{if(!m)return[];let e=K.latestId(m.id);return a.getByDocumentId(m.id).filter(t=>t.id!==e).slice(0,h)},[m,a.orderedData,h]),L=q.useMemo(()=>m?e.getByDocumentId(m.id).slice(0,v):[],[m,e.orderedData,v]),R=q.useMemo(()=>{let e=u([...I,...L],`createdAt`,`desc`),t=I[0];if(t&&m){let n=a.get(t.id);if(n?.title!==m.title||!(0,ge.default)(n.data,m.data)){let t=m.updatedBy?.id??``;e.unshift(new k({id:K.latestId(m.id),createdAt:m.updatedAt,createdById:t,collaboratorIds:[t]},a))}}return e},[a,m,I,L]),z=q.useCallback(()=>{b||(m?l.push({pathname:te(m),state:{sidebarContext:f}}):l.goBack())},[l,m,f,b]);return ce(`Escape`,z),(0,Y.jsxs)(he,{title:o(`History`),onClose:z,scrollable:!1,children:[(0,Y.jsx)(je,{showChanges:E,onShowChangesToggle:A,items:R,document:m,selectedRevisionId:j,compareTo:x,onCompareToChange:N}),(0,Y.jsx)(se,{hiddenScrollbars:!0,topShadow:!0,children:m?(0,Y.jsx)(Oe,{"aria-label":o(`History`),fetch:F,items:R,document:m,empty:(0,Y.jsx)(ie,{align:`center`,justify:`center`,style:{minHeight:b?`70vh`:void 0,height:`100%`},auto:!0,children:(0,Y.jsx)(ae,{children:o(`No history yet`)})})}):null})]})}var Ie=l(Fe);export{Ie as default};