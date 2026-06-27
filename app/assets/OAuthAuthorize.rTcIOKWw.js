import{o as e}from"./rolldown-runtime.CMxvf4Kt.js";import{D as t,O as n,Qt as r,en as i}from"./vendor-react.BDv3YiQX.js";import{t as a}from"./env.DFiVzB6Q.js";import{a as o,n as s,r as c,t as l}from"./ApiClient.DGII2f_c.js";import{t as u}from"./tiny-cookie.Ot6E6ho9.js";import{r as d}from"./domains.B4wkHaLc.js";import{a as f}from"./styles.3HqXuy1I.js";import{a as p}from"./urls.A6UTQq4z.js";import{c as m,s as h}from"./vendor-styled.BLG-ZaDH.js";import{t as g}from"./lib.CIyroSo6.js";import{t as _}from"./Text.DjIJ7ekC.js";import{t as v}from"./Text.ChaouWsf.js";import{t as y}from"./Flex.hyJN9561.js";import{S as b,T as x,ot as S,y as C}from"./index.CHF0CgVb.js";import{n as w}from"./language.Cn_9rZbC.js";import{t as T}from"./LoadingIndicator.ByiNnFx6.js";import{t as E}from"./useCurrentTeam.Bg4emvG8.js";import{a as D,i as O,r as k}from"./Avatar.BF9p6cQc.js";import{t as A}from"./useRequest.Cr7T5hwh.js";import{o as j}from"./urls.BeUIrGVa.js";import{a as M,n as N,r as P,t as F}from"./Login.MGSDonD8.js";import{t as I}from"./OutlineIcon.CO_vVptf.js";import{t as L}from"./OAuthScopeHelper.E4jg9-Qh.js";import{t as R}from"./Form.D7YIlFmE.js";var z=e(i());h();function B(){return JSON.parse(u(`sessions`)||`{}`)}var V=g(),H=r();function U({team:e,oauthClient:t}){return(0,H.jsx)(_,{type:`tertiary`,children:(0,H.jsxs)(y,{gap:12,align:`center`,children:[(0,H.jsx)(D,{variant:O.Square,model:{avatarUrl:t.avatarUrl,initial:t.name[0]},size:k.XXLarge,alt:t.name}),(0,H.jsx)(V.MoreIcon,{}),(0,H.jsx)(D,{variant:O.Square,model:e,size:k.XXLarge,alt:e.name})]})})}function W({sessions:e}){let{t:n}=t(),[r,i]=(0,z.useState)(!1),o=new URL(window.location.href),s=a.APP_NAME;return r?(0,H.jsx)(F,{onBack:()=>i(!1)}):(0,H.jsxs)(P,{children:[(0,H.jsx)(M,{locale:w()}),(0,H.jsxs)(N,{children:[(0,H.jsx)(I,{size:k.XXLarge}),(0,H.jsx)(q,{children:n(`Choose a workspace`)}),(0,H.jsxs)(_,{type:`tertiary`,as:`p`,children:[n(`Choose an {{ appName }} workspace or login to continue connecting this app`,{appName:s}),`.`]}),Object.keys(e)?.map(t=>{let n=e[t];return(0,H.jsxs)(K,{href:n.url+o.pathname+o.search,children:[(0,H.jsx)(D,{variant:O.Square,model:{avatarUrl:n.logoUrl,initial:n.name[0]},size:k.Large,alt:n.name}),n.name,(0,H.jsx)(G,{})]},n.url)}),(0,H.jsxs)(K,{onClick:()=>i(!0),children:[(0,H.jsx)(V.ArrowIcon,{size:k.Large}),n(`Login to workspace`)]})]})]})}var G=m(V.ArrowIcon)`
  position: absolute;
  transition: all 0.2s ease-in-out;
  opacity: 0;
  right: 12px;
`,K=m.a`
  position: relative;
  left: -8px;
  right: -8px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  margin: 4px;
  border-radius: 8px;
  width: 100%;
  color: ${f(`text`)};
  font-weight: ${f(`fontWeightMedium`)};

  &:hover {
    background: ${f(`listItemHoverBackground`)};

    ${G} {
      opacity: 1;
      right: 8px;
    }
  }
`,q=m(x).attrs({as:`h2`,centered:!0})`
  margin-top: 0;
`;h();function J(){let e=E({rejectOnEmpty:!1}),t=B();if(e)return(0,H.jsx)(X,{});let n=d(window.location.hostname).host===d(a.URL).host,r=Object.keys(t).length>0;return S&&r&&n?(0,H.jsx)(W,{sessions:t}):(0,H.jsx)(F,{})}function Y(e){return!e||e===`claudeai`?[`read`,`write`]:e.split(` `).filter(Boolean)}function X(){let e=E({rejectOnEmpty:!1}),r=C(),{t:i}=t(),[a,u]=(0,z.useState)(!1),[d,f]=(0,z.useState)(!1),m=(0,z.useRef)(),{client_id:h,redirect_uri:g,response_type:_,code_challenge:x,code_challenge_method:S,state:D,scope:O}=Object.fromEntries(r),k=S?.trim(),[j]=(0,z.useState)(()=>Y(O)),{error:F,data:I}=A(()=>l.post(`/oauthClients.info`,{clientId:h,redirectUri:g}),!0),B=()=>{if(g&&!F){let e=new URL(g);e.searchParams.set(`error`,`access_denied`),window.location.href=e.toString();return}window.history.length?window.history.back():window.location.href=`/`},V=()=>{u(!0),m.current=window.setTimeout(()=>u(!1),5e3)};(0,z.useEffect)(()=>{let e=window.setTimeout(()=>f(!0),1e3);return()=>{window.clearTimeout(e),m.current&&window.clearTimeout(m.current)}},[]);let W=[!h&&`client_id`,!g&&`redirect_uri`,!_&&`response_type`,!D&&`state`].filter(Boolean);if(W.length||F||!e)return(0,H.jsx)(P,{children:(0,H.jsxs)(N,{children:[(0,H.jsx)(Q,{children:i(`An error occurred`)}),F instanceof o?(0,H.jsxs)(v,{as:`p`,type:`secondary`,children:[i(`The OAuth client could not be found, please check the provided client ID`),(0,H.jsx)($,{children:h})]}):F instanceof c?(0,H.jsxs)(v,{as:`p`,type:`secondary`,children:[i(`The OAuth client could not be loaded, please check the redirect URI is valid`),(0,H.jsx)($,{children:g})]}):F instanceof s?(0,H.jsxs)(v,{as:`p`,type:`secondary`,children:[i(`The OAuth client could not be loaded, please check your workspace subdomain is correct`),(0,H.jsx)($,{children:F.message})]}):(0,H.jsxs)(v,{as:`p`,type:`secondary`,children:[i(`Required OAuth parameters are missing`),(0,H.jsx)($,{children:W.map(e=>(0,H.jsxs)(`span`,{children:[e,(0,H.jsx)(`br`,{})]},e))})]})]})});if(!I)return(0,H.jsx)(T,{});let{name:G,developerName:K,developerUrl:q}=I.data;return(0,H.jsxs)(P,{children:[(0,H.jsx)(M,{locale:w()}),(0,H.jsx)(b,{title:i(`Authorize`)}),(0,H.jsxs)(N,{gap:12,children:[(0,H.jsx)(U,{team:e,oauthClient:I.data}),(0,H.jsx)(Q,{children:i(`{{ appName }} wants to access {{ teamName }}`,{appName:G,teamName:e.name})}),K&&(0,H.jsx)(v,{type:`secondary`,as:`p`,style:{marginTop:-12},children:(0,H.jsx)(n,{defaults:`By <em>{{ developerName }}</em>`,values:{developerName:K},components:{em:q?(0,H.jsx)(v,{as:`a`,type:`secondary`,weight:`bold`,href:q,target:`_blank`,rel:`noopener noreferrer`}):(0,H.jsx)(`strong`,{})}})}),(0,H.jsxs)(v,{type:`secondary`,as:`p`,children:[i(`{{ appName }} will be able to access your account and perform the following actions`,{appName:G}),`:`]}),(0,H.jsx)(`ul`,{style:{width:`100%`,paddingLeft:`1em`,marginTop:0},children:L.normalizeScopes(j.length?j:[],i).map(e=>(0,H.jsx)(`li`,{children:(0,H.jsx)(v,{type:`secondary`,children:e})},e))}),(0,H.jsx)(v,{type:`tertiary`,as:`p`,style:{wordBreak:`break-all`},children:p(g)?(0,H.jsx)(n,{children:`You will be redirected to a local application after authorizing.`}):(0,H.jsx)(n,{defaults:`You will be redirected to <em>{{ redirectUri }}</em> after authorizing. Make sure you trust this URL.`,values:{redirectUri:g},components:{em:(0,H.jsx)(`strong`,{})}})}),(0,H.jsxs)(R,{method:`POST`,action:`/oauth/authorize`,style:{width:`100%`},onSubmit:V,children:[(0,H.jsx)(`input`,{type:`hidden`,name:`client_id`,value:h??``}),(0,H.jsx)(`input`,{type:`hidden`,name:`redirect_uri`,value:g??``}),(0,H.jsx)(`input`,{type:`hidden`,name:`response_type`,value:_??``}),(0,H.jsx)(`input`,{type:`hidden`,name:`state`,value:D??``}),(0,H.jsx)(`input`,{type:`hidden`,name:`scope`,value:j.join(` `)}),x&&(0,H.jsx)(`input`,{type:`hidden`,name:`code_challenge`,value:x}),k&&(0,H.jsx)(`input`,{type:`hidden`,name:`code_challenge_method`,value:k}),(0,H.jsxs)(y,{gap:8,justify:`space-between`,children:[(0,H.jsx)(Z,{type:`button`,onClick:B,neutral:!0,children:i(`Cancel`)}),(0,H.jsx)(Z,{type:`submit`,disabled:!d||a,children:i(`Authorize`)})]})]})]})]})}var Z=m(j)`
  width: calc(50% - 4px);
`,Q=m(x).attrs({as:`h2`,centered:!0})`
  margin-top: 0;
`,$=m.pre`
  background: ${f(`backgroundSecondary`)};
  padding: 16px;
  border-radius: 4px;
  font-size: 12px;
  white-space: pre-wrap;
`;export{J as default};