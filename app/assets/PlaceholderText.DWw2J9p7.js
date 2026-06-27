import{o as e}from"./rolldown-runtime.CMxvf4Kt.js";import{Qt as t,en as n}from"./vendor-react.BDv3YiQX.js";import{a as r}from"./styles.3HqXuy1I.js";import{c as i,s as a}from"./vendor-styled.BLG-ZaDH.js";import{t as o}from"./Flex.DJ6mR3Bq.js";import{l as s}from"./animations.B6M7uYBl.js";import{n as c}from"./random.DIqG7W0r.js";var l=e(n());a();var u=t();function d({minWidth:e,maxWidth:t,...n}){return(0,u.jsx)(f,{width:`${l.useRef(c(e||75,t||100)).current/(n.header?2:1)}%`,...n})}var f=i(o)`
  width: ${e=>typeof e.width==`number`?`${e.width}px`:e.width};
  height: ${e=>e.height?e.height:e.header?24:18}px;
  margin-bottom: 6px;
  border-radius: 6px;
  background-color: ${r(`divider`)};
  animation: ${s} 2s infinite;
  animation-delay: ${e=>e.delay||0}s;

  &:last-child {
    margin-bottom: 0;
  }
`,p=l.memo(d,()=>!0);export{p as t};