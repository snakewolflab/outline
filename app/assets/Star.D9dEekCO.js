import{D as e,Qt as t}from"./vendor-react.BDv3YiQX.js";import{r as n}from"./mobxreact.esm.BaBZO6aD.js";import{i as r}from"./styles.3HqXuy1I.js";import{a as i}from"./styles.BAW3KELE.js";import{c as a,o,s}from"./vendor-styled.BLG-ZaDH.js";import{t as c}from"./lib.CIyroSo6.js";import{t as l}from"./NudeButton.tKECI9NH.js";import{D as u,E as d,d as f,f as p}from"./DocumentBreadcrumb.kSDZtoZb.js";var m=c();s();var h=t();function g({size:t,document:n,collection:r,color:a,...s}){let{t:c}=e(),g=o(),v=n||r;return v?(0,h.jsx)(i,{value:{activeModels:[n,r].filter(e=>!!e)},children:(0,h.jsx)(l,{hideOnActionDisabled:!0,tooltip:{content:v.isStarred?c(`Unstar document`):c(`Star document`),delay:500},action:r?r.isStarred?u:d:n?n.isStarred?p:f:void 0,size:t,...s,children:v.isStarred?(0,h.jsx)(_,{size:t,color:g.yellow}):(0,h.jsx)(_,{size:t,color:a??g.textTertiary,as:m.UnstarredIcon})})}):null}var _=a(m.StarredIcon)`
  flex-shrink: 0;
  transition: all 100ms ease-in-out;

  &: ${r} {
    transform: scale(1.1);
  }
  &:active {
    transform: scale(0.95);
  }

  @media print {
    display: none;
  }
`,v=n(g);export{v as n,_ as t};