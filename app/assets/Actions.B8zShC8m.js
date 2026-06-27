import{a as e}from"./styles.3HqXuy1I.js";import{c as t,s as n,t as r}from"./vendor-styled.BLG-ZaDH.js";import{t as i}from"./Flex.DJ6mR3Bq.js";n();var a=t(i)`
  justify-content: center;
  align-items: center;
  height: 32px;
  font-size: 15px;
  flex-shrink: 0;

  &:empty {
    display: none;
  }
`,o=t.div`
  flex-shrink: 0;
  width: 1px;
  height: 28px;
  background: ${e(`divider`)};
`;t(i)`
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  border-radius: 3px;
  background: ${e(`background`)};
  padding: 12px;
  backdrop-filter: blur(20px);
  gap: 12px;

  @media print {
    display: none;
  }

  ${r(`tablet`)`
    left: auto;
    padding: 24px;
  `};
`;export{o as n,a as t};