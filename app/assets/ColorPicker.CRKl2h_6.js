import{o as e}from"./rolldown-runtime.CMxvf4Kt.js";import{Qt as t,_ as n,en as r,v as i,y as a}from"./vendor-react.BDv3YiQX.js";import{t as o}from"./polished.esm.DNeFoW8-.js";import{a as s}from"./styles.3HqXuy1I.js";import{c,o as l,r as u,s as d}from"./vendor-styled.BLG-ZaDH.js";import{t as f}from"./lib.CIyroSo6.js";import{xt as p}from"./useKeyDown.Du2PZ2Ep.js";var m=e(p()),h=f(),g=e(r());d();var _=t(),v=`#7e3d3db3`;function y({activeColor:e,onSelect:t,alpha:n}){let[r,i]=(0,g.useState)(e||v),[a,s]=(0,g.useState)(!1),c=l(),u=(0,g.useRef)(null),d=(0,g.useRef)(null),f=(0,g.useCallback)(e=>{let n=document.activeElement,r=u.current?.contains(n);t(e),r&&n&&n.focus()},[t]),p=e=>{i(e),f(e)},y=(0,g.useCallback)(()=>{(0,m.default)(r),d.current?.focus(),s(!0),setTimeout(()=>s(!1),500)},[r]);return(0,_.jsxs)(b,{ref:u,tabIndex:-1,children:[n?(0,_.jsx)(C,{color:r,onChange:i,onChangeEnd:f}):(0,_.jsx)(S,{color:r,onChange:i,onChangeEnd:f}),(0,_.jsxs)(w,{children:[(0,_.jsx)(T,{color:r,onChange:p,prefixed:!0,alpha:n}),(0,_.jsx)(E,{ref:d,onClick:y,type:`button`,children:a?(0,_.jsx)(h.CheckmarkIcon,{size:16,color:o(.2,c.brand.green)}):(0,_.jsx)(h.CopyIcon,{size:16})})]})]})}var b=c.div`
  padding: 4px;
  display: flex;
  flex-direction: column;
`,x=u`
  &.react-colorful {
    width: auto;

    & > .react-colorful__saturation {
      border-radius: 4px 4px 0 0;
    }

    & .react-colorful__pointer {
      width: 14px;
      height: 14px;
    }

    & .react-colorful__interactive:focus .react-colorful__pointer {
      transform: translate(-50%, -50%) scale(1.25);
    }

    & > .react-colorful__hue {
      height: 8px;
      border-radius: 0 0 4px 4px;
      margin-bottom: 8px;
    }
  }
`,S=c(i)`
  ${x}
`,C=c(a)`
  ${x}

  &.react-colorful > .react-colorful__alpha {
    height: 8px;
    border-radius: 4px;
    margin-top: 8px;
    margin-bottom: 8px;
  }
`,w=c.div`
  display: flex;
  justify-content: space-between;
  gap: 4px;
  margin-top: 8px;
`,T=c(n)`
  flex: 1;
  padding: 4px 6px;
  border: 1px solid ${s(`inputBorder`)};
  border-radius: 4px;
  font-size: 12px;
  background: ${s(`background`)};
  color: ${s(`text`)};

  &:focus {
    outline: none;
    border-color: ${s(`accent`)};
  }
`,E=c.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border: 1px solid ${s(`inputBorder`)};
  border-radius: 4px;
  background: ${s(`background`)};
  color: ${s(`textSecondary`)};
  cursor: pointer;

  &:hover {
    background: ${s(`backgroundSecondary`)};
    color: ${s(`text`)};
  }
`;export{y as t};