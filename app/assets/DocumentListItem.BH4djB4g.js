import{o as e}from"./rolldown-runtime.CMxvf4Kt.js";import{D as t,E as n,Qt as r,en as i,wt as a}from"./vendor-react.BDv3YiQX.js";import{r as o}from"./mobxreact.esm.BaBZO6aD.js";import{a as s,i as c}from"./styles.3HqXuy1I.js";import{a as ee}from"./styles.BAW3KELE.js";import{u as l}from"./routeHelpers.Dp2pk1Po.js";import{t as u}from"./useStores.C2HL3oms.js";import{c as d,o as f,r as p,s as m,t as h}from"./vendor-styled.BLG-ZaDH.js";import{t as g}from"./lib.CIyroSo6.js";import{r as _,t as v}from"./Tooltip.DlvdmaJm.js";import{t as y}from"./Flex.DJ6mR3Bq.js";import{t as b}from"./useCurrentUser.yDT7QBRq.js";import{a as x}from"./DocumentContext.QKzyz-MH.js";import{t as S}from"./Icon.ClgBIv_u.js";import{t as C}from"./NudeButton.tKECI9NH.js";import{i as te,r as ne}from"./DocumentBreadcrumb.kSDZtoZb.js";import{t as w}from"./useBoolean.CKHZbah2.js";import{n as T,r as E}from"./index.es.Dxujvyep.js";import{l as D,n as O,p as k}from"./CommandBarResults.Yuyu2tXK.js";import{i as A}from"./dist.BCRYHFyK.js";import{t as j}from"./Badge.DtQWyED7.js";import{t as M}from"./useDragAndDrop.CVeXjLGX.js";import{t as N}from"./DocumentMeta.BntMpg_t.js";import{n as P,t as F}from"./Star.D9dEekCO.js";var I=e(i()),L=g();m();var R=r(),z=/<b\b[^>]*>(.*?)<\/b>/gi;function B(e){return e.replace(new RegExp(z.source),`$1`)}function V(e,r){let{t:i}=t(),a=b(),o=f(),{userMemberships:s,groupMemberships:c}=u(),d=ne(),[p,m,h]=w(),g=_(),x=I.useRef(null);r&&(x=r);let{focused:C,...O}=E(x,!1);T(C,x);let{document:F,showParentDocuments:V,showCollection:J,showPublished:Y,showDraft:X=!0,highlight:Z,context:ie,...ae}=e,oe=!!Z&&!!F.title.toLowerCase().includes(Z.toLowerCase()),se=!F.isArchived,Q=!!(s.getByDocumentId(F.id)||c.getByDocumentId(F.id)),ce=D({document:F,user:a,currentContext:d}),le=te({documentId:F.id}),[{isDragging:ue},$]=M(F.asNavigationNode,0,F,!1,!1),de=I.useMemo(()=>n([x,$]),[x,$]);return(0,R.jsx)(ee,{value:{activeModels:[F,...!Q&&F.collection?[F.collection]:[]]},children:(0,R.jsx)(A,{action:le,ariaLabel:i(`Document options`),onOpen:m,onClose:h,children:(0,R.jsxs)(W,{ref:de,dir:F.dir,$isStarred:F.isStarred,$isDragging:ue,$menuOpen:p,to:{pathname:l(F),search:Z?`?q=${encodeURIComponent(Z)}`:void 0,state:{title:F.titleWithDefault,sidebarContext:ce}},...ae,...O,children:[(0,R.jsxs)(y,{gap:4,auto:!0,children:[(0,R.jsx)(H,{children:F.icon?(0,R.jsx)(S,{value:F.icon,color:F.color??void 0,initial:F.initial}):(0,R.jsx)(L.DocumentIcon,{outline:F.isDraft,color:o.textSecondary})}),(0,R.jsxs)(re,{children:[(0,R.jsxs)(G,{dir:F.dir,children:[(0,R.jsx)(K,{text:F.titleWithDefault,highlight:Z,dir:F.dir}),F.isBadgedNew&&F.createdBy?.id!==a.id&&(0,R.jsx)(j,{yellow:!0,children:i(`New`)}),F.isDraft&&X&&(0,R.jsx)(v,{content:i(`Only visible to you`),placement:`top`,children:(0,R.jsx)(j,{children:i(`Draft`)})}),se&&!g&&(0,R.jsx)(P,{document:F})]}),!oe&&(0,R.jsx)(q,{text:ie,highlight:Z?z:void 0,processResult:B}),(0,R.jsx)(N,{document:F,showCollection:J,showPublished:Y,showParentDocuments:V,showLastViewed:!0})]})]}),(0,R.jsx)(U,{children:(0,R.jsx)(k,{document:F,onOpen:m,onClose:h})})]})})})}var H=d.div`
  flex-shrink: 0;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  width: 24px;
`,re=d.div`
  flex-grow: 1;
  flex-shrink: 1;
  min-width: 0;
`,U=d(x)`
  display: none;
  align-items: center;
  margin: 8px;
  flex-shrink: 0;
  flex-grow: 0;
  color: ${s(`textSecondary`)};

  ${C}:${c},
  ${C}[aria-expanded= "true"] {
    background: ${s(`sidebarControlHoverBackground`)};
  }

  ${h(`tablet`)`
    display: flex;
  `};
`,W=d(a)`
  display: flex;
  align-items: center;
  margin: 10px -8px;
  padding: 6px 8px;
  border-radius: 8px;
  max-height: 50vh;
  width: calc(100vw - 8px);
  cursor: var(--pointer);
  transition: opacity 250ms ease;
  opacity: ${e=>e.$isDragging?.1:1};

  &:focus-visible {
    outline: none;
  }

  ${h(`tablet`)`
    width: auto;
  `};

  ${U} {
    opacity: 0;
  }

  ${F} {
    opacity: ${e=>e.$isStarred?`1 !important`:0};
  }

  &:${c},
  &:active,
  &:focus,
  &:focus-within {
    background: ${s(`listItemHoverBackground`)};

    ${U} {
      opacity: 1;
    }

    ${F} {
      opacity: 0.5;

      &:${c} {
        opacity: 1;
      }
    }
  }

  ${e=>e.$menuOpen&&p`
      background: ${s(`listItemHoverBackground`)};

      ${U} {
        opacity: 1;
      }

      ${F} {
        opacity: 0.5;
      }
    `}
`,G=d.span`
  display: flex;
  justify-content: ${e=>e.rtl?`flex-end`:`flex-start`};
  align-items: center;
  margin-top: 0;
  margin-bottom: 0.1em;
  white-space: nowrap;
  color: ${s(`text`)};
  font-family: ${s(`fontFamily`)};
  font-weight: 500;
  font-size: 18px;
  line-height: 1.2;
  gap: 4px;
`,K=d(O)`
  max-width: 90%;
  overflow: hidden;
  text-overflow: ellipsis;
`,q=d(O)`
  display: block;
  color: ${s(`textSecondary`)};
  font-size: 15px;
  margin-top: -0.25em;
  margin-bottom: 0.25em;
  max-height: 90px;
  overflow: hidden;
`,J=o(I.forwardRef(V));export{J as t};