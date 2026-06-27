import{D as e,Qt as t}from"./vendor-react.BDv3YiQX.js";import{o as n}from"./ApiClient.DGII2f_c.js";import{a as r}from"./styles.3HqXuy1I.js";import{t as i}from"./useEventListener.C_K9fUNE.js";import{c as a,s as o}from"./vendor-styled.BLG-ZaDH.js";import{t as s}from"./lib.CIyroSo6.js";import{t as c}from"./Flex.DJ6mR3Bq.js";import{u as l}from"./index.CHF0CgVb.js";import{t as u}from"./ButtonLink.Fzf_wCFW.js";var d=s();o();var f=t();function p({error:t,retry:r,...a}){let{t:o}=e();i(`online`,r);let s=t instanceof n?(0,f.jsxs)(f.Fragment,{children:[(0,f.jsx)(d.DisconnectedIcon,{}),` `,o(`You’re offline.`)]}):(0,f.jsxs)(f.Fragment,{children:[(0,f.jsx)(d.WarningIcon,{}),` `,o(`Sorry, an error occurred.`)]});return(0,f.jsx)(m,{...a,children:(0,f.jsxs)(c,{align:`center`,gap:4,wrap:!0,children:[s,` `,(0,f.jsxs)(u,{onClick:()=>r(),children:[o(`Click to retry`),`…`]})]})})}var m=a(l)`
  padding: 8px 0;
  white-space: nowrap;

  ${u} {
    color: ${r(`textTertiary`)};

    &:hover {
      color: ${r(`textSecondary`)};
      text-decoration: underline;
    }
  }
`;export{p as t};