import"./rolldown-runtime.CMxvf4Kt.js";import{D as e,Qt as t,en as n}from"./vendor-react.BDv3YiQX.js";import{r}from"./mobxreact.esm.BaBZO6aD.js";import{a as i}from"./styles.3HqXuy1I.js";import{c as a,s as o}from"./vendor-styled.BLG-ZaDH.js";import{f as s}from"./Tooltip.DlvdmaJm.js";import{t as c}from"./Flex.DJ6mR3Bq.js";import{a as l,r as u}from"./Avatar.BF9p6cQc.js";n(),o();var d=t();function f({users:t,overflow:n=0,size:r=u.Large,limit:i=8,renderAvatar:a=l,showTooltip:o=!0,...c}){let{t:f}=e(),h=t.filter(Boolean),_=n===1&&h.length-i===1,v=h.slice(-(_?i+1:i)),y=a;return n>0&&!_&&v.unshift({id:`overflow`,initial:`${t.length?`+`:``}${n}`,name:f(`{{count}} more user`,{count:n})}),(0,d.jsxs)(g,{...c,children:[v.map((e,t)=>{let n=t===0;return(0,d.jsx)(y,{showTooltip:o,model:e,size:r,style:{marginRight:n?0:-4,...n||v.length===1?{}:{clipPath:`url(#${m(r)})`}}},e.id)}),(0,d.jsx)(s,{children:(0,d.jsx)(p,{size:r})})]})}function p({size:e}){return(0,d.jsx)(h,{width:`25`,height:`28`,viewBox:`0 0 25 28`,fill:`none`,xmlns:`http://www.w3.org/2000/svg`,children:(0,d.jsx)(`clipPath`,{id:m(e),children:(0,d.jsx)(`path`,{transform:e===28?``:`scale(${e/28})`,d:`M14.0633 0.5C18.1978 0.5 21.8994 2.34071 24.3876 5.24462C22.8709 7.81315 22.0012 10.8061 22.0012 14C22.0012 17.1939 22.8709 20.1868 24.3876 22.7554C21.8994 25.6593 18.1978 27.5 14.0633 27.5C6.57035 27.5 0.5 21.4537 0.5 14C0.5 6.54628 6.57035 0.5 14.0633 0.5Z`})})})}function m(e){return`facepile-${e}`}var h=a.svg`
  position: absolute;
  top: 0;
  left: 0;
`,g=a(c)`
  align-items: center;
  flex-direction: row-reverse;
  cursor: var(--pointer);

  *:hover {
    clip-path: none !important;
    box-shadow: 0 0 0 2px ${i(`background`)};
  }
`,_=r(f);export{_ as t};