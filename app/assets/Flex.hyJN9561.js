import{c as e,s as t}from"./vendor-styled.BLG-ZaDH.js";t();var n=e.div.withConfig({shouldForwardProp:e=>![`auto`,`column`,`align`,`justify`,`wrap`,`shrink`,`reverse`,`gap`].includes(e)})`
  display: flex;
  flex: ${({auto:e})=>e?`1 1 auto`:`initial`};
  flex-direction: ${({column:e,reverse:t})=>t?e?`column-reverse`:`row-reverse`:e?`column`:`row`};
  align-items: ${({align:e})=>e};
  justify-content: ${({justify:e})=>e};
  flex-wrap: ${({wrap:e})=>e?`wrap`:`initial`};
  flex-shrink: ${({shrink:e})=>e===!0?1:e===!1?0:`initial`};
  gap: ${({gap:e})=>e===void 0?`initial`:`${e}px`};
  min-height: 0;
  min-width: 0;
`;export{n as t};