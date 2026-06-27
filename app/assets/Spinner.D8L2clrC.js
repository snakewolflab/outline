import"./rolldown-runtime.CMxvf4Kt.js";import{Qt as e,en as t}from"./vendor-react.BDv3YiQX.js";import{c as n,s as r}from"./vendor-styled.BLG-ZaDH.js";t(),r();var i=e();function a({color:e,...t}){return(0,i.jsx)(o,{width:`16px`,height:`16px`,viewBox:`0 0 16 16`,xmlns:`http://www.w3.org/2000/svg`,...t,children:(0,i.jsx)(s,{$color:e,fill:`none`,strokeWidth:`2`,strokeLinecap:`round`,cx:`8`,cy:`8`,r:`6`})})}var o=n.svg`
  @keyframes rotator {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(270deg);
    }
  }

  animation: rotator 1.4s linear infinite;
  margin: 4px;
`,s=n.circle`
  @keyframes dash {
    0% {
      stroke-dashoffset: 47;
    }
    50% {
      stroke-dashoffset: 11;
      transform: rotate(135deg);
    }
    100% {
      stroke-dashoffset: 47;
      transform: rotate(450deg);
    }
  }

  stroke: ${e=>e.$color||e.theme.textSecondary};
  stroke-dasharray: 46;
  stroke-dashoffset: 0;
  transform-origin: center;
  animation: dash 1.4s ease-in-out infinite;
`;export{a as t};