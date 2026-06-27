import{o as e}from"./rolldown-runtime.CMxvf4Kt.js";import{D as t,O as n,Qt as r,en as i,wt as a}from"./vendor-react.BDv3YiQX.js";import{r as o}from"./mobxreact.esm.BaBZO6aD.js";import{k as s}from"./vendor-es-toolkit.XcNOARzK.js";import{a as c,i as l,t as u}from"./styles.3HqXuy1I.js";import{w as d}from"./routeHelpers.Dp2pk1Po.js";import{t as f}from"./useStores.C2HL3oms.js";import{c as p,s as m}from"./vendor-styled.BLG-ZaDH.js";import{t as h}from"./Text.ChaouWsf.js";import{t as g}from"./Flex.hyJN9561.js";import{D as _,T as v,h as y}from"./index.CHF0CgVb.js";import{s as b}from"./DocumentContext.QKzyz-MH.js";import{t as x}from"./useSettingsConfig.ZYImN4Op.js";import{t as S}from"./Scene.9CTEOJZr.js";import{t as C}from"./StickyFilters.CESYHNW4.js";import{t as w}from"./Status.CxvNLyeY.js";var T=e(i());m();var E=r();function D({integration:e,isConnected:n}){let{t:r}=t();return(0,E.jsxs)(O,{as:a,to:e.path,children:[(0,E.jsxs)(g,{justify:`space-between`,align:`flex-start`,children:[(0,E.jsxs)(b,{align:`flex-start`,children:[(0,E.jsx)(e.icon,{size:32,monochrome:!1}),(0,E.jsxs)(b,{spacing:2,align:`flex-start`,children:[(0,E.jsx)(k,{children:e.name}),n&&(0,E.jsx)(w,{children:r(`Connected`)})]})]}),(0,E.jsx)(_,{as:`span`,neutral:!0,children:r(`Configure`)})]}),(0,E.jsx)(A,{children:e.description})]})}var O=p.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  padding: 20px;
  width: 300px;
  background: ${c(`background`)};
  border: 1px solid ${c(`inputBorder`)};
  color: ${c(`text`)};
  border-radius: 8px;
  transition: box-shadow 200ms ease;
  cursor: var(--pointer);

  &: ${l} {
    box-shadow:
      rgba(0, 0, 0, 0.08) 0px 2px 4px,
      rgba(0, 0, 0, 0.06) 0px 4px 8px;
  }
`,k=p(h)`
  margin: 0 0 -4px;
  font-size: 16px;
  font-weight: 600;
  color: ${c(`text`)};
  ${u()}
`,A=p(h)`
  margin: 12px 0 0;
  font-size: 15px;
  max-width: 100%;
  color: ${c(`textTertiary`)};
`;m();function j(){let{t:e}=t(),{integrations:r}=f(),i=x(),[a,o]=T.useState(``),c=e=>{o(e.target.value)},l=s(i.filter(t=>t.group===e(`Integrations`)&&t.enabled&&t.path!==d(`integrations`)&&t.name.toLowerCase().includes(a.toLowerCase())),e=>e.pluginId&&r.findByService(e.pluginId)?`connected`:`available`);return(0,E.jsxs)(S,{title:e(`Integrations`),children:[(0,E.jsx)(v,{children:e(`Integrations`)}),(0,E.jsx)(h,{as:`p`,type:`secondary`,children:(0,E.jsx)(n,{children:`Configure a variety of integrations with third-party services.`})}),(0,E.jsx)(C,{children:(0,E.jsx)(y,{short:!0,value:a,placeholder:`${e(`Filter`)}…`,onChange:c})}),(0,E.jsxs)(M,{gap:30,wrap:!0,children:[l.connected?.map(e=>(0,E.jsx)(D,{integration:e,isConnected:!0},e.path)),l.available?.map(e=>(0,E.jsx)(D,{integration:e},e.path)),l.available?.length%2==1&&(0,E.jsx)(O,{style:{visibility:`hidden`}})]})]})}var M=p(g)`
  margin-top: 20px;
  width: "100%";
`,N=o(j);export{N as default};