var e={mobile:0,mobileLarge:460,tablet:737,desktop:1025,desktopLarge:1600},t=typeof window<`u`,n=typeof process<`u`&&process.versions!==null&&process.versions.node!==null,r=typeof window<`u`&&window.matchMedia?.(`(display-mode: standalone)`).matches;function i(){return t?window.matchMedia?.(`(any-hover: none) and (pointer: coarse)`)?.matches:!1}function a(){return t?window.matchMedia?.(`(max-width: 736px)`)?.matches:!1}function o(){let e=getComputedStyle(document.documentElement);return window.CSS?.supports?.(`top`,`env(safe-area-inset-top)`)?{top:parseFloat(e.getPropertyValue(`--sat`)||`0`),right:parseFloat(e.getPropertyValue(`--sar`)||`0`),bottom:parseFloat(e.getPropertyValue(`--sab`)||`0`),left:parseFloat(e.getPropertyValue(`--sal`)||`0`)}:{top:0,right:0,bottom:0,left:0}}var s=t&&window.navigator.platform===`MacIntel`,c=t&&window.navigator.platform===`Win32`,l=t&&window.navigator.userAgent.includes(`Safari`)&&!window.navigator.userAgent.includes(`Chrome`)&&!window.navigator.userAgent.includes(`Chromium`),u=t&&window.navigator.userAgent.includes(`Firefox`);function d(){if(!t)return!1;let e=document,n=e.fullscreenEnabled??e.webkitFullscreenEnabled??e.msFullscreenEnabled,r=/iPhone|iPad|iPod/.test(navigator.userAgent);return!!n&&!r}var f=!1;try{let e=Object.defineProperty({},"passive",{get(){f=!0}});window.addEventListener(`testPassive`,null,e),window.removeEventListener(`testPassive`,null,e)}catch{}var p=f,m={toc:100,editorToolbar:750,header:800,sidebar:900,mobileSidebar:930,hoverPreview:950,overlay:2e3,modal:3e3,menu:4e3,toasts:5e3,popover:9e3,titleBarDivider:1e4,loadingIndicatorBar:2e4,commandBar:3e4,presentation:4e4,tooltip:5e4},h=i()?`active`:`hover`,g=()=>`
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
`,_=e=>t=>t.theme[e],v=()=>`
  -ms-overflow-style: none;
  overflow: -moz-scrollbars-none;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
`,y=e=>`
  &::before {
    position: absolute;
    content: "";
    top: -${e}px;
    right: -${e}px;
    left: -${e}px;
    bottom: -${e}px;
  }
`,b=e=>`
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: ${e};
  overflow: hidden;
  overflow-wrap: anywhere;
`;export{i as _,_ as a,e as b,d as c,u as d,s as f,l as g,r as h,h as i,o as l,n as m,y as n,b as o,a as p,v as r,m as s,g as t,t as u,c as v,p as y};