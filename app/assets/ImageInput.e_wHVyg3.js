import{o as e}from"./rolldown-runtime.CMxvf4Kt.js";import{D as t,Qt as n,Yt as r,en as i,n as a,w as o}from"./vendor-react.BDv3YiQX.js";import{r as s}from"./mobxreact.esm.BaBZO6aD.js";import{t as c}from"./error.vBZ69-kD.js";import{t as l}from"./types.CmWxpsn8.js";import{a as u}from"./styles.3HqXuy1I.js";import{n as d}from"./files.CmF6VZkY.js";import{t as f}from"./useStores.C2HL3oms.js";import{c as p,s as m}from"./vendor-styled.BLG-ZaDH.js";import{t as h}from"./lib.CIyroSo6.js";import{t as g}from"./Flex.DJ6mR3Bq.js";import{D as _,W as v}from"./index.CHF0CgVb.js";import{t as y}from"./LoadingIndicator.ByiNnFx6.js";import{n as b}from"./validations.cMvxVRaR.js";import{t as x}from"./compressImage.B-eGR-UZ.js";import{a as S,i as C,r as w}from"./Avatar.BF9p6cQc.js";import{o as T}from"./urls.BeUIrGVa.js";var E=h(),D=e(r()),O=e(i()),k=e(a());m();var A=n(),j=({onSuccess:e,onError:n,submitText:r,borderRadius:i,children:a})=>{let{dialogs:s}=f(),{t:u}=t(),[d,p]=(0,O.useState)(!1),[m,h]=(0,O.useState)(!1),g=O.useCallback(async(t,r)=>{try{e((await v(await x(t,{maxHeight:512,maxWidth:512}),{name:r.name,preset:l.Avatar})).url)}catch(e){n(c(e))}finally{p(!1),h(!1),s.closeAllModals()}},[s,e,n]),_=O.useCallback((e,t)=>{p(!0),setTimeout(()=>g(e,t),0)},[g]),y=O.useCallback(()=>{p(!1),h(!1)},[]),S=O.useCallback(async e=>{h(!0),s.openModal({title:``,content:(0,A.jsx)(M,{file:e[0],onUpload:_,isUploading:d,borderRadius:i??150,submitText:r||u(`Crop image`)}),onClose:y})},[u,s,_,y,d,i,r]),{getRootProps:C,getInputProps:w}=o({accept:b.avatarContentTypes.join(`, `),onDropAccepted:S});return m?null:(0,A.jsxs)(`div`,{...C(),children:[(0,A.jsx)(`input`,{...w()}),a]})},M=s(({file:e,onUpload:n,isUploading:r,borderRadius:i,submitText:a})=>{let{ui:o}=f(),{t:s}=t(),[c,l]=(0,O.useState)(1),u=(0,O.useRef)(null),p=O.useCallback(()=>{let t=u.current?.getImage();(0,D.default)(t,`canvas is not defined`),n(d(t.toDataURL()),e)},[e,n]),m=O.useCallback(e=>{let t=e.target;t instanceof HTMLInputElement&&l(parseFloat(t.value))},[]);return(0,A.jsxs)(g,{auto:!0,column:!0,align:`center`,justify:`center`,children:[r&&(0,A.jsx)(y,{}),(0,A.jsx)(N,{children:(0,A.jsx)(k.default,{ref:u,image:e,width:250,height:250,border:25,borderRadius:i,color:o.theme===`light`?[255,255,255,.6]:[0,0,0,.6],scale:c,rotate:0})}),(0,A.jsx)(P,{type:`range`,min:`0.1`,max:`2`,step:`0.01`,defaultValue:`1`,onChange:m}),(0,A.jsx)(`br`,{}),(0,A.jsx)(T,{fullwidth:!0,onClick:p,disabled:r,children:r?`${s(`Uploading`)}…`:a})]})}),N=p(g)`
  margin-bottom: 30px;
`,P=p.input`
  display: block;
  width: 300px;
  margin-bottom: 30px;
  height: 4px;
  cursor: var(--pointer);
  color: inherit;
  border-radius: 99999px;
  background-color: #dee1e3;
  appearance: none;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    height: 16px;
    width: 16px;
    border-radius: 50%;
    background: ${u(`text`)};
    cursor: var(--pointer);
  }

  &:focus {
    outline: none;
  }
`,F=s(j);m();function I({model:e,onSuccess:n,alt:r,showRemoveOption:i=!0,...a}){let{t:o}=t();return(0,A.jsxs)(g,{gap:8,justify:`space-between`,children:[(0,A.jsx)(R,{children:(0,A.jsxs)(F,{onSuccess:n,submitText:o(`Crop Image`),...a,children:[(0,A.jsx)(S,{model:e,size:w.Upload,variant:C.Round,alt:r}),(0,A.jsx)(g,{auto:!0,align:`center`,justify:`center`,className:`upload`,children:(0,A.jsx)(E.EditIcon,{})})]})}),e.avatarUrl&&i&&(0,A.jsx)(_,{onClick:()=>n(null),neutral:!0,children:o(`Remove`)})]})}var L=`
  width: ${w.Upload}px;
  height: ${w.Upload}px;
`,R=p(g)`
  ${L};
  position: relative;
  font-size: 14px;
  border-radius: 50%;
  box-shadow: 0 0 0 1px ${u(`backgroundSecondary`)};
  background: ${u(`background`)};
  overflow: hidden;

  .upload {
    ${L};
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    opacity: 0;
    cursor: var(--pointer);
    transition: all 250ms;
  }

  &:hover .upload {
    opacity: 1;
    background: rgba(0, 0, 0, 0.75);
    color: ${e=>e.theme.white};
  }
`;export{I as t};