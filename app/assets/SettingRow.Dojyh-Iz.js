import"./rolldown-runtime.CMxvf4Kt.js";import{Qt as e,en as t}from"./vendor-react.BDv3YiQX.js";import{r as n}from"./polished.esm.DNeFoW8-.js";import{c as r,s as i,t as a}from"./vendor-styled.BLG-ZaDH.js";import{t as o}from"./Text.ChaouWsf.js";import{t as s}from"./Flex.DJ6mR3Bq.js";t(),i();var c=e(),l=r(s)`
  padding: ${e=>e.$compact?`12px 0`:`22px 0`};
  align-items: ${e=>e.$compact?`center`:`initial`};
  border-bottom: 1px solid
    ${e=>e.$border===!1?`transparent`:n(.5,e.theme.divider)};

  &:last-child {
    border-bottom: 0;
  }
`,u=r.div`
  display: flex;
  flex-direction: column;
  flex-basis: 100%;
  flex: 1;

  &:first-child {
    min-width: 50%;

    ${a(`tablet`)`
      min-width: 65%;
    `}
  }

  &:last-child {
    min-width: 0;

    > * {
      align-self: flex-end;
    }

    ${a(`tablet`)`
      > * {
        align-self: initial;
      }
    `}
  }

  ${a(`tablet`)`
    p {
      margin-bottom: 0;
    }
  `};
`,d=r(o)`
  margin-bottom: 4px;
`,f=({visible:e,description:t,compact:n,name:r,label:i,border:a,children:s})=>e===!1?null:(0,c.jsxs)(l,{gap:32,$border:a,$compact:n,children:[(0,c.jsxs)(u,{children:[(0,c.jsx)(d,{as:`h3`,children:(0,c.jsx)(`label`,{htmlFor:r,children:i})}),t&&(0,c.jsx)(o,{as:`p`,type:`secondary`,children:t})]}),(0,c.jsx)(u,{children:s})]});export{f as t};