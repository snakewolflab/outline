import{o as e}from"./rolldown-runtime.CMxvf4Kt.js";import{D as t,Qt as n,en as r}from"./vendor-react.BDv3YiQX.js";import{a as i,i as a}from"./styles.3HqXuy1I.js";import{c as o,s}from"./vendor-styled.BLG-ZaDH.js";import{r as c}from"./Tooltip.DlvdmaJm.js";import{a as l}from"./DocumentContext.QKzyz-MH.js";import{t as u}from"./NudeButton.tKECI9NH.js";import{i as d,r as f,t as p}from"./Popover.CIIe-PnX.js";import{a as m,n as h,r as g,t as _}from"./Drawer.DylWdgHO.js";import{t as v}from"./ColorPicker.CRKl2h_6.js";var y=e(r());s();var b=n(),x=y.forwardRef(({color:e,active:t=!1,size:n=24,...r},i)=>(0,b.jsx)(C,{$active:t,$size:n,...r,style:{"--color":e,...r.style},ref:i,children:(0,b.jsx)(S,{})})),S=o.span`
  width: 10px;
  height: 5px;
  border-left: 2px solid white;
  border-bottom: 2px solid white;
  transform: translateY(-25%) rotate(-45deg);
`,C=o(u)`
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: ${({$size:e})=>e}px;
  height: ${({$size:e})=>e}px;
  border-radius: 50%;
  background: var(
    --color,
    linear-gradient(135deg, #ff5858 0%, #fbcc34 50%, #00c6ff 100%)
  );

  &: ${a} {
    outline: 2px solid ${i(`menuBackground`)} !important;
    box-shadow: 0px 0px 3px 3px var(--color);
  }

  & ${S} {
    display: ${({$active:e})=>e?`block`:`none`};
  }
`;s();var w=({color:e,active:n=!1,size:r=24,onChange:i,className:a,pickerInModal:o=!0})=>{let{t:s}=t(),u=c(),f=(0,b.jsx)(x,{"aria-label":s(`Select a color`),className:a,color:e,active:n,size:r}),v=(0,b.jsx)(E,{alpha:!1,activeColor:e,onSelect:e=>i(e)});return u?(0,b.jsxs)(_,{children:[(0,b.jsx)(m,{asChild:!0,children:f}),(0,b.jsxs)(h,{"aria-label":s(`Select a color`),children:[(0,b.jsx)(g,{}),(0,b.jsx)(l,{children:v})]})]}):(0,b.jsxs)(p,{modal:o,children:[(0,b.jsx)(d,{children:f}),(0,b.jsx)(T,{side:`bottom`,align:`end`,"aria-label":s(`Select a color`),shrink:!0,children:v})]})},T=o(f)`
  width: auto;
  padding: 8px;
`,E=o(v)`
  background: inherit !important;
  box-shadow: none !important;
  border: 0 !important;
  border-radius: 0 !important;
  user-select: none;
  width: auto !important;

  input {
    user-select: text;
    color: ${i(`text`)} !important;
  }
`;export{x as n,w as t};