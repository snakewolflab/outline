import{t as e}from"./styles.3HqXuy1I.js";import{c as t,r as n,s as r}from"./vendor-styled.BLG-ZaDH.js";r();var i=t.span`
  margin-top: 0;
  text-align: ${e=>e.dir?e.dir:`inherit`};
  color: ${e=>e.type===`secondary`?e.theme.textSecondary:e.type===`tertiary`?e.theme.textTertiary:e.type===`danger`?e.theme.brand.red:e.theme.text};
  font-size: ${e=>e.size===`xlarge`?`26px`:e.size===`large`?`18px`:e.size===`medium`?`16px`:e.size===`small`?`14px`:e.size===`xsmall`?`13px`:`inherit`};

  ${e=>e.weight&&n`
      font-weight: ${e.weight===`xbold`?600:e.weight===`bold`?500:e.weight===`normal`?400:`inherit`};
    `}

  font-style: ${e=>e.italic?`italic`:`normal`};
  font-family: ${e=>e.monospace?e.theme.fontFamilyMono:`inherit`};

  white-space: normal;
  user-select: ${e=>e.selectable?`text`:`none`};

  ${t=>t.ellipsis&&e()}
`;export{i as t};