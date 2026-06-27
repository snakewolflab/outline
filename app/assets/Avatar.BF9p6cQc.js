import"./rolldown-runtime.CMxvf4Kt.js";import{D as e,Qt as t,en as n}from"./vendor-react.BDv3YiQX.js";import{r}from"./mobxreact.esm.BaBZO6aD.js";import{a as i}from"./polished.esm.DNeFoW8-.js";import{a}from"./styles.3HqXuy1I.js";import{c as o,o as s,r as c,s as l}from"./vendor-styled.BLG-ZaDH.js";import{t as u}from"./lib.CIyroSo6.js";import{t as d}from"./Tooltip.DlvdmaJm.js";import{t as f}from"./Flex.DJ6mR3Bq.js";import{t as p}from"./Squircle.Bx0gAWl1.js";import{t as m}from"./useBoolean.CKHZbah2.js";n(),l();var h=o(f)`
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: ${e=>i(e.color??e.theme.textTertiary)>.5?a(`black50`):a(`white75`)};
  background-color: ${e=>e.color??e.theme.textTertiary};
  width: ${e=>e.size}px;
  height: ${e=>e.size}px;
  flex-shrink: 0;

  // adjust font size down for each additional character
  font-size: ${e=>e.size/2-(e.content?.length??0)}px;
  font-weight: 500;
`;l();var g=t(),_=function(e){return e[e.Small=16]=`Small`,e[e.Toast=18]=`Toast`,e[e.Medium=24]=`Medium`,e[e.Large=28]=`Large`,e[e.XLarge=32]=`XLarge`,e[e.XXLarge=48]=`XXLarge`,e[e.Upload=64]=`Upload`,e}({}),v=function(e){return e.Round=`round`,e.Square=`square`,e}({});function y(e){let{model:t,style:n,variant:r=`round`,className:i,showTooltip:a,...o}=e,s=e.src||t?.avatarUrl,[c,l]=m(!1),u=t?.initial||(t?.name?t.name[0]:``).toUpperCase(),f=(0,g.jsx)(b,{style:n,$variant:r,$size:e.size,className:i,children:s&&!c?(0,g.jsx)(x,{onError:l,src:s,...o}):t?(0,g.jsx)(h,{color:t.color,...o,children:u}):(0,g.jsx)(h,{...o})});return a?(0,g.jsx)(d,{content:e.alt||t?.name||``,children:f}):f}y.defaultProps={size:24};var b=o.div`
  position: relative;
  user-select: none;
  flex-shrink: 0;
  border-radius: ${e=>e.$variant===`round`?`50%`:`${e.$size/8}px`};
  overflow: hidden;
  width: ${e=>e.$size}px;
  height: ${e=>e.$size}px;
`,x=o.img`
  display: block;
  width: ${e=>e.size}px;
  height: ${e=>e.size}px;
`,S=r(y);l();function C({onClick:t,user:n,isPresent:r,isEditing:i,isObserving:a,isCurrentUser:o,size:s=_.Large,style:c,alt:l}){let{t:u}=e(),f=u(r?i?`currently editing`:`currently viewing`:`previously edited`);return(0,g.jsx)(g.Fragment,{children:(0,g.jsx)(d,{content:(0,g.jsxs)(w,{children:[(0,g.jsx)(`strong`,{children:n.name}),` `,o&&`(${u(`You`)})`,f&&(0,g.jsxs)(g.Fragment,{children:[(0,g.jsx)(`br`,{}),f]})]}),placement:`bottom`,children:(0,g.jsx)(T,{$isPresent:r,$isObserving:a,$color:n.color,style:c,children:(0,g.jsx)(S,{model:n,onClick:t,size:s,alt:l})})})})}var w=o.div`
  text-align: center;
`,T=o.div`
  opacity: ${e=>e.$isPresent?1:.5};
  transition: opacity 250ms ease-in-out;
  border-radius: 50%;
  position: relative;

  ${e=>e.$isPresent&&c`
      &:after {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        border-radius: 50%;
        transition: border-color 100ms ease-in-out;
        border: 2px solid transparent;
        pointer-events: none;

        ${e=>e.$isObserving&&c`
            border: 2px solid ${e.$color};
            box-shadow: inset 0 0 0 2px ${e.theme.background};

            &:hover {
              top: -1px;
              left: -1px;
              right: -1px;
              bottom: -1px;
            }
          `}
      }

      &:hover:after {
        border: 2px solid ${e=>e.$color};
        box-shadow: inset 0 0 0 2px ${a(`background`)};
      }
    `}
`,E=r(C),D=u();l();function O({color:e,backgroundColor:t,size:n=_.Medium,className:r}){let i=s();return(0,g.jsx)(p,{color:e??i.text,size:n,className:r,children:(0,g.jsx)(D.GroupIcon,{"data-fixed-color":!0,color:t??i.background,size:n*.75})})}export{S as a,v as i,E as n,_ as r,O as t};