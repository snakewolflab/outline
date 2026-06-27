import{c as e,s as t}from"./vendor-styled.BLG-ZaDH.js";t();var n=e.div`
  width: 24px;
  height: 24px;
  position: relative;

  &::after {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    width: 8px;
    height: 8px;
    background-color: ${e=>e.color??e.theme.accent};
    border-radius: 50%;
    transform: translate(-50%, -50%);
  }
`;export{n as t};