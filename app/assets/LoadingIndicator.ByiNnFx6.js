import{o as e}from"./rolldown-runtime.CMxvf4Kt.js";import{Qt as t,en as n}from"./vendor-react.BDv3YiQX.js";import{r}from"./mobxreact.esm.BaBZO6aD.js";import{a as i,s as a}from"./styles.3HqXuy1I.js";import{t as o}from"./useStores.C2HL3oms.js";import{a as s,c,s as l}from"./vendor-styled.BLG-ZaDH.js";var u=e(n());function d(){let{ui:e}=o();return(0,u.useEffect)(()=>(e.enableProgressBar(),()=>e.disableProgressBar()),[e]),null}var f=r(d);l();var p=t(),m=()=>(0,p.jsx)(g,{children:(0,p.jsx)(_,{})}),h=s`
  from { margin-left: -100%; }
  to { margin-left: 100%; }
`,g=c.div`
  position: fixed;
  top: 0;
  z-index: ${a.loadingIndicatorBar};
  width: 100%;
  animation: ${h} 4s ease-in-out infinite;
  animation-delay: 250ms;
  margin-left: -100%;
`,_=c.div`
  width: 100%;
  height: 2px;
  background-color: ${i(`accent`)};
`,v=f;export{m as n,v as t};