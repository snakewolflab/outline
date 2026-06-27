import{t as e}from"./Desktop.YvZPTfe5.js";import{c as t,s as n}from"./vendor-styled.BLG-ZaDH.js";import{D as r,O as i}from"./index.CHF0CgVb.js";n();var a=t(r)`
  height: 40px;

  ${i} {
    padding: 4px 16px;
  }
`,o=`app.getoutline.com`,s=`https://${o}`;function c(e){let t=encodeURIComponent(e);if(!/^[a-z\d-]{1,63}$/.test(t))throw Error(`Invalid subdomain`);return`https://${t}.getoutline.com`}async function l(t){let n=c(t.toLowerCase().trim().replace(/^https?:\/\//,``));await e.bridge?.addCustomHost(n),window.location.href=n}function u(e){let t=e.trim().replace(/\/+$/,``),n=/^https?:\/\//i.test(t)?t:`https://${t}`;return new URL(n).origin}async function d(t){let n=u(t);if(!e.bridge?.loadAuthConfig)throw Error(`Host validation is unavailable`);let r=await e.bridge.loadAuthConfig(n);if(!Array.isArray(r?.providers))throw Error(`Host is not an Outline installation`);return n}async function f(t){await e.bridge?.addCustomHost(t),window.location.href=t}export{d as a,l as i,o as n,a as o,f as r,s as t};