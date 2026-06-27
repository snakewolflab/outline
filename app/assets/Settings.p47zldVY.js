import{o as e}from"./rolldown-runtime.CMxvf4Kt.js";import{D as t,Nt as n,O as r,Pt as i,Qt as a,en as o,h as s}from"./vendor-react.BDv3YiQX.js";import{r as c}from"./mobxreact.esm.BaBZO6aD.js";import{I as l,K as u,O as d}from"./vendor-es-toolkit.XcNOARzK.js";import{t as f}from"./env.DFiVzB6Q.js";import{t as p}from"./error.vBZ69-kD.js";import{t as m}from"./styles.3HqXuy1I.js";import{d as h}from"./styles.BAW3KELE.js";import{i as g}from"./useIsMounted.p6I_9muu.js";import{t as _}from"./useStores.C2HL3oms.js";import{c as v,s as y}from"./vendor-styled.BLG-ZaDH.js";import{t as b}from"./lib.CIyroSo6.js";import{r as x,t as S}from"./Tooltip.DlvdmaJm.js";import{t as C}from"./Text.ChaouWsf.js";import{t as w}from"./Flex.hyJN9561.js";import{t as T}from"./Fade.DoZVoUzz.js";import{t as E}from"./Input.4J78Wued.js";import{D,N as O,T as k,h as ee,ot as A,y as te}from"./index.CHF0CgVb.js";import{d as j}from"./validations.cMvxVRaR.js";import{t as ne}from"./ConfirmationDialog.DoECaosc.js";import{t as M}from"./HStack.CJJZAD6g.js";import{t as N}from"./useCurrentTeam.Bg4emvG8.js";import{t as re}from"./usePolicy.CPwNtdBL.js";import{a as ie,r as ae}from"./Avatar.BF9p6cQc.js";import{v as P}from"./sections.CtYETy3k.js";import{r as oe}from"./random.DIqG7W0r.js";import{n as se,r as ce,t as le}from"./OverflowMenuButton.e_BZrgS_.js";import{t as ue}from"./Time.CCtr95LZ.js";import{i as de,n as F,r as I,t as L}from"./dist.BCRYHFyK.js";import{t as R}from"./Actions.B8zShC8m.js";import{t as z}from"./Scene.9CTEOJZr.js";import{n as B,t as V}from"./SortableTable.HDGHqCsY.js";import{t as H}from"./StickyFilters.CESYHNW4.js";import{t as fe}from"./Status.CxvNLyeY.js";var U=b(),W=e(o()),G=a();function pe({webhook:e,onSubmit:n}){let{t:r}=t();return(0,G.jsx)(ne,{onSubmit:async()=>{await e.delete(),n()},submitText:r(`Delete`),savingText:`${r(`Deleting`)}…`,danger:!0,children:r(`Are you sure you want to delete the {{ name }} webhook?`,{name:e.name})})}y();var K={attachments:[`attachments.create`,`attachments.update`,`attachments.delete`],users:[`users.create`,`users.signin`,`users.update`,`users.suspend`,`users.activate`,`users.delete`,`users.invite`,`users.promote`,`users.demote`],documents:[`documents.create`,`documents.publish`,`documents.unpublish`,`documents.delete`,`documents.permanent_delete`,`documents.archive`,`documents.unarchive`,`documents.restore`,`documents.move`,`documents.update`,`documents.title_change`,`documents.add_user`,`documents.remove_user`,`documents.add_group`,`documents.remove_group`],collections:[`collections.create`,`collections.update`,`collections.delete`,`collections.add_user`,`collections.remove_user`,`collections.add_group`,`collections.remove_group`,`collections.move`,`collections.permission_changed`],comments:[`comments.create`,`comments.update`,`comments.delete`],revisions:[`revisions.create`],fileOperations:[`fileOperations.create`,`fileOperations.update`,`fileOperations.delete`],groups:[`groups.create`,`groups.update`,`groups.delete`,`groups.add_user`,`groups.remove_user`],integrations:[`integrations.create`,`integrations.update`],shares:[`shares.create`,`shares.update`,`shares.revoke`],teams:[`teams.update`],pins:[`pins.create`,`pins.update`,`pins.delete`],webhookSubscriptions:[`webhookSubscriptions.create`,`webhookSubscriptions.delete`,`webhookSubscriptions.update`],views:[`views.create`]};function me(){return`ol_whs_${oe(32)}`}function q({label:e,value:t,register:n,...r}){let i=(0,G.jsxs)(G.Fragment,{children:[(0,G.jsx)(`input`,{type:`checkbox`,defaultValue:t,...n(`events`,{})}),(0,G.jsx)(C,{children:e})]});return t===`*`?(0,G.jsx)(X,{...r,children:i}):(0,G.jsx)(he,{...r,children:i})}function J({handleSubmit:e,webhookSubscription:n}){let{t:i}=t(),a=N(),{register:o,handleSubmit:c,formState:f,watch:p,setValue:m}=s({mode:`all`,defaultValues:{events:n?[...n.events]:[],name:n?.name,url:n?.url,secret:n?n?.secret:me()}}),h=p(`events`),g=p(`url`),_=!A&&typeof g==`string`&&g.startsWith(`http://`),v=l(h,e=>!e.includes(`.`)),y=d(h,`*`),b=l(h,e=>{let[t]=e.split(`.`);return v.length===0||e===t||!v.includes(t)}),S=x(),T=(0,W.useRef)({});(0,W.useEffect)(()=>{y&&m(`events`,[`*`])},[y,m]),(0,W.useEffect)(()=>{u(h,b)||m(`events`,b)},[h,b,m]),(0,W.useEffect)(()=>{Object.entries(K).forEach(([e,t])=>{let n=T.current[e];if(n){let r=v.includes(e),i=t.filter(e=>h.includes(e));n.indeterminate=!r&&i.length>0&&i.length<t.length}})},[h,v]);let O=i(n?`Update`:`Create`),k=i(n?`Updating`:`Creating`);return(0,G.jsxs)(`form`,{onSubmit:c(e),children:[(0,G.jsx)(C,{as:`p`,type:`secondary`,children:(0,G.jsx)(r,{children:`Provide a descriptive name for this webhook and the URL we should send a POST request to when matching events are created.`})}),(0,G.jsxs)(ve,{children:[(0,G.jsx)(E,{required:!0,autoFocus:!n,flex:!0,label:i(`Name`),placeholder:i(`A memorable identifer`),...o(`name`,{required:!0})}),(0,G.jsx)(E,{required:!0,flex:!0,pattern:A?`https://.*`:`https?://.*`,maxLength:j.maxUrlLength,placeholder:`https://…`,label:i(`URL`),error:_?i(`Webhook delivery over http is insecure, use https if possible`):void 0,...o(`url`,{required:!0,maxLength:j.maxUrlLength})}),(0,G.jsx)(E,{flex:!0,spellCheck:!1,label:i(`Signing secret`),...o(`secret`,{required:!1})})]}),(0,G.jsx)(C,{as:`p`,type:`secondary`,children:(0,G.jsx)(r,{children:`Subscribe to all events, groups, or individual events. We recommend only subscribing to the minimum amount of events that your application needs to function.`})}),(0,G.jsx)(q,{label:i(`All events`),value:`*`,style:{marginLeft:24},register:o}),(0,G.jsx)(Z,{disabled:y,children:(0,G.jsx)(w,{column:!0,children:Object.entries(K).filter(([e])=>e!==`comment`||a.commentingEnabled).map(([e,t],n)=>{let{ref:r,...a}=o(`events`,{});return(0,G.jsx)(ge,{isMobile:S,children:(0,G.jsxs)(F,{defaultOpen:!1,children:[(0,G.jsx)(I,{asChild:!0,children:(0,G.jsxs)(X,{children:[(0,G.jsx)(Y,{"aria-hidden":`true`}),(0,G.jsx)(`input`,{type:`checkbox`,defaultValue:e,...a,onClick:e=>e.stopPropagation(),ref:t=>{T.current[e]=t,r(t)}}),(0,G.jsx)(C,{children:i(`All {{ groupName }} events`,{groupName:e.replace(/s$/,``)})})]})}),(0,G.jsx)(_e,{children:(0,G.jsx)(Z,{disabled:v.includes(e),children:t.map(e=>(0,G.jsx)(q,{label:e,value:e,register:o},e))})})]})},n)})})}),(0,G.jsx)(w,{justify:`flex-end`,children:(0,G.jsx)(D,{type:`submit`,disabled:f.isSubmitting||!f.isValid,children:f.isSubmitting?`${k}…`:O})})]})}var he=v.label`
  display: flex;
  align-items: center;
  padding: 0.5em 0;
  color: ${e=>e.theme.textSecondary};
  font-size: 13px;
  font-family: ${e=>e.theme.fontFamilyMono};
  gap: 8px;
`,Y=v(U.DisclosureIcon)`
  transition: transform 250ms ease-out;
  flex-shrink: 0;
  margin-right: -4px;
`,X=v.button.attrs({type:`button`})`
  display: flex;
  align-items: center;
  font-weight: 500;
  background: none;
  border: none;
  padding: 0.2em 0;
  cursor: var(--pointer);
  width: 100%;
  text-align: left;
  color: inherit;
  gap: 8px;

  &[aria-expanded="false"] {
    ${Y} {
      transform: rotate(-90deg);
    }
  }
`,Z=v.fieldset`
  padding: 0;
  margin: 0;
  border: none;
  margin-bottom: 1em;

  ${({disabled:e})=>e&&`
    opacity: 0.75;
    `}
`,ge=v.div`
  margin-left: -4px;
`,_e=v(L)`
  overflow: hidden;
  padding-left: 48px;

  &[data-state="open"] {
    animation: slideDown 250ms ease-out;
  }

  &[data-state="closed"] {
    animation: slideUp 250ms ease-out;
  }

  @keyframes slideDown {
    from {
      height: 0;
      opacity: 0;
    }
    to {
      height: var(--radix-collapsible-content-height);
      opacity: 1;
    }
  }

  @keyframes slideUp {
    from {
      height: var(--radix-collapsible-content-height);
      opacity: 1;
    }
    to {
      height: 0;
      opacity: 0;
    }
  }
`,ve=v.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 1em;
`;function ye({onSubmit:e,webhookSubscription:n}){let{t:r}=t();return(0,G.jsx)(J,{handleSubmit:W.useCallback(async t=>{try{let i=Array.isArray(t.events)?t.events:[t.events],a={...t,events:i};await n.save(a),g.success(r(`Webhook updated`)),e()}catch(e){g.error(p(e))}},[r,e,n]),webhookSubscription:n})}function be({onSubmit:e}){let{webhookSubscriptions:n}=_(),{t:r}=t();return(0,G.jsx)(J,{handleSubmit:W.useCallback(async t=>{try{let i=Array.isArray(t.events)?t.events:[t.events],a={...t,events:i};await n.create(a),g.success(r(`Webhook created`)),e()}catch(e){g.error(p(e))}},[r,e,n])})}var xe=h({name:({t:e})=>e(`New webhook`),analyticsName:`New webhook`,section:P,icon:(0,G.jsx)(U.PlusIcon,{}),keywords:`create`,visible:()=>O.policies.abilities(O.auth.team?.id||``).createWebhookSubscription,perform:({t:e,event:t})=>{t?.preventDefault(),t?.stopPropagation(),O.dialogs.openModal({title:e(`New webhook`),content:(0,G.jsx)(be,{onSubmit:O.dialogs.closeAllModals})})}}),Q=({webhook:e})=>h({name:({t:e})=>`${e(`Edit`)}…`,analyticsName:`Edit webhook`,section:P,icon:(0,G.jsx)(U.EditIcon,{}),perform:({t,event:n})=>{n?.preventDefault(),n?.stopPropagation(),O.dialogs.openModal({title:t(`Edit webhook`),content:(0,G.jsx)(ye,{onSubmit:O.dialogs.closeAllModals,webhookSubscription:e})})}}),Se=({webhook:e})=>h({name:({t:e})=>`${e(`Delete`)}…`,analyticsName:`Delete webhook`,section:P,icon:(0,G.jsx)(U.TrashIcon,{}),keywords:`delete remove`,dangerous:!0,perform:({t,event:n})=>{n?.preventDefault(),n?.stopPropagation(),O.dialogs.openModal({title:t(`Delete webhook`),content:(0,G.jsx)(pe,{onSubmit:O.dialogs.closeAllModals,webhook:e})})}});function $(e){return se((0,W.useMemo)(()=>[Q({webhook:e}),Se({webhook:e})],[e]))}function Ce({webhook:e}){let{t:n}=t();return(0,G.jsx)(ce,{action:$(e),align:`end`,ariaLabel:n(`Webhook`),children:(0,G.jsx)(le,{})})}var we=c(Ce);y();var Te=50,Ee=104,De=c(function({webhook:e,menuLabel:t,children:n}){return(0,G.jsx)(de,{action:$(e),ariaLabel:t,children:n})}),Oe=c(function(e){let{t:n}=t(),r=(0,W.useCallback)((e,t)=>(0,G.jsx)(De,{webhook:e,menuLabel:n(`Webhook`),children:t}),[n]);return(0,G.jsx)(V,{columns:(0,W.useMemo)(()=>[{type:`data`,id:`name`,header:n(`Name`),accessor:e=>e.name,component:e=>(0,G.jsxs)(M,{spacing:4,wrap:!0,children:[(0,G.jsx)(S,{content:e.enabled?n(`Active`):n(`Disabled`),children:(0,G.jsx)(fe,{$color:e.enabled?`success`:`textTertiary`})}),(0,G.jsx)(C,{selectable:!0,children:e.name})]}),width:`2fr`},{type:`data`,id:`url`,header:n(`URL`),accessor:e=>e.url,component:e=>(0,G.jsx)(ke,{type:`tertiary`,monospace:!0,selectable:!0,title:e.url,children:e.url}),width:`3fr`},{type:`data`,id:`createdById`,header:n(`Created by`),accessor:e=>e.createdBy?.name,component:e=>e.createdBy?(0,G.jsxs)(M,{children:[(0,G.jsx)(ie,{model:e.createdBy,size:ae.Medium}),(0,G.jsx)(C,{selectable:!0,children:e.createdBy.name})]}):null,width:`2fr`},{type:`data`,id:`updatedAt`,header:n(`Last updated`),accessor:e=>e.updatedAt,component:e=>e.updatedAt?(0,G.jsx)(ue,{dateTime:e.updatedAt,addSuffix:!0,shorten:!0}):null,width:`1.5fr`},{type:`action`,id:`action`,component:e=>(0,G.jsx)(we,{webhook:e}),width:`50px`}],[n]),rowHeight:Te,stickyOffset:Ee,decorateRow:r,...e})}),ke=v(C)`
  ${m()}
  max-width: 100%;
`;function Ae(){let e=N(),{t:a}=t(),{webhookSubscriptions:o}=_(),s=re(e),c=f.APP_NAME,l=te(),u=n(),d=i(),[p,m]=(0,W.useState)(l.get(`query`)||``),h=(0,W.useMemo)(()=>({query:l.get(`query`)||void 0,sort:l.get(`sort`)||`createdAt`,direction:(l.get(`direction`)||`desc`).toUpperCase()}),[l]),v=(0,W.useMemo)(()=>({id:h.sort,desc:h.direction===`DESC`}),[h.sort,h.direction]),y=o.orderedData,{data:b,error:x,loading:S,next:w}=B({data:(0,W.useMemo)(()=>h.query?o.findByQuery(h.query):y,[o,y,h.query]),sort:v,reqFn:o.fetchPage,reqParams:h}),E=(0,W.useCallback)((e,t)=>{t?l.set(e,t):l.delete(e),u.replace({pathname:d.pathname,search:l.toString()})},[l,u,d.pathname]),O=(0,W.useCallback)(e=>{m(e.target.value)},[]);return(0,W.useEffect)(()=>{x&&g.error(a(`Could not load webhooks`))},[a,x]),(0,W.useEffect)(()=>{let e=setTimeout(()=>E(`query`,p),250);return()=>clearTimeout(e)},[p,E]),(0,G.jsxs)(z,{title:a(`Webhooks`),icon:(0,G.jsx)(U.WebhooksIcon,{}),actions:(0,G.jsx)(G.Fragment,{children:s.createWebhookSubscription&&(0,G.jsx)(R,{children:(0,G.jsx)(D,{type:`button`,action:xe,icon:(0,G.jsx)(U.PlusIcon,{}),children:`${a(`New webhook`)}…`})})}),wide:!0,children:[(0,G.jsx)(k,{children:a(`Webhooks`)}),(0,G.jsx)(C,{as:`p`,type:`secondary`,children:(0,G.jsxs)(r,{children:[`Webhooks can be used to notify your application when events happen in`,` `,{appName:c},`. Events are sent as a https request with a JSON payload in near real-time.`]})}),(0,G.jsx)(H,{children:(0,G.jsx)(ee,{short:!0,value:p,placeholder:`${a(`Filter`)}…`,onChange:O})}),(0,G.jsx)(T,{animate:!b,children:(0,G.jsx)(Oe,{data:b??[],sort:v,loading:S,page:{hasNext:!!w,fetchNext:w}})})]})}var je=c(Ae);export{je as default};