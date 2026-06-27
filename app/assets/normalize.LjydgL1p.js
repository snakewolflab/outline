function e(e){let t=0,n=e.split(`
`).length,r=Math.min(3,Math.floor(n/5)),i=e.match(/^```/gm);i&&i.length>1&&(t+=i.length);let a=e.match(/\$(.+)\$/g);a&&a.length>0&&(t+=a.length);let o=e.match(/\[[^]+\]\(https?:\/\/\S+\)/gm);o&&(t+=o.length*2);let s=e.match(/\[[^]+\]\(\/\S+\)/gm);s&&(t+=s.length*2);let c=e.match(/^#{1,6}\s+\S+/gm);c&&(t+=c.length);let l=e.match(/^[-*]\s\S+/gm);l&&(t+=l.length);let u=e.match(/\|\s?[:-]+\s?\|/gm);return u&&(t+=u.length),t>r}function t(e){let t=/^\s?(\[(X|\s|_|-)\]\s(.*)?)/gim;for(;e.match(t);)e=e.replace(t,e=>`- ${e.trim()}`);return e=e.replace(/\n{3,}/g,`

\\
`),e}export{e as n,t};