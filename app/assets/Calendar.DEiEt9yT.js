import"./rolldown-runtime.CMxvf4Kt.js";import{Qt as e,en as t,t as n}from"./vendor-react.BDv3YiQX.js";import{a as r}from"./styles.3HqXuy1I.js";import{c as i,s as a}from"./vendor-styled.BLG-ZaDH.js";t(),a();var o=e();function s(e){return(0,o.jsx)(c,{children:(0,o.jsx)(n,{showOutsideDays:!0,fixedWeeks:!0,...e})})}var c=i.div`
  padding: 12px;
  color: ${r(`text`)};

  .rdp {
    margin: 0;
  }

  /* Visually-hidden accessibility labels (would otherwise show without the
     base stylesheet). */
  .rdp-vhidden {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: -1px;
    padding: 0;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    border: 0;
    appearance: none;
  }

  .rdp-month {
    width: 100%;
  }

  .rdp-caption {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 2px 8px;
  }

  .rdp-caption_label {
    font-size: 14px;
    font-weight: 600;
    color: ${r(`text`)};
  }

  .rdp-nav {
    display: flex;
    gap: 2px;
  }

  .rdp-nav_button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    padding: 0;
    border: 0;
    background: none;
    border-radius: 4px;
    color: ${r(`textSecondary`)};
    cursor: pointer;
    transition: background 100ms ease;

    &:hover {
      background: ${r(`listItemHoverBackground`)};
    }
  }

  .rdp-nav_icon {
    width: 16px;
    height: 16px;
  }

  .rdp-table {
    border-collapse: collapse;
    width: 100%;
  }

  .rdp-head_cell {
    font-size: 12px;
    font-weight: 500;
    text-transform: none;
    color: ${r(`textTertiary`)};
    padding: 4px 0;
    text-align: center;
  }

  .rdp-cell {
    padding: 1px;
    text-align: center;
  }

  .rdp-day {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 34px;
    border: 0;
    background: none;
    border-radius: 50%;
    font-family: inherit;
    font-size: 13px;
    font-variant-numeric: tabular-nums;
    color: ${r(`text`)};
    cursor: pointer;
    transition: background 100ms ease;

    &:hover:not([disabled]):not(.rdp-day_selected) {
      background: ${r(`listItemHoverBackground`)};
    }

    &:focus-visible:not([disabled]) {
      outline: 2px solid ${r(`accent`)};
      outline-offset: -2px;
    }
  }

  /* Today, when not selected, is emphasised with the accent colour. */
  .rdp-day_today:not(.rdp-day_selected) {
    font-weight: 700;
    color: ${r(`accent`)};
  }

  /* Days belonging to the previous/next month are clearly de-emphasised. */
  .rdp-day_outside {
    color: ${r(`textTertiary`)};
    opacity: 0.5;
  }

  .rdp-day[disabled] {
    color: ${r(`textTertiary`)};
    opacity: 0.4;
    cursor: default;
  }

  /* The selected day is a solid accent-filled circle. */
  .rdp-day_selected,
  .rdp-day_selected:hover,
  .rdp-day_selected:focus-visible {
    background: ${r(`accent`)};
    color: ${r(`accentText`)};
    font-weight: 500;
    opacity: 1;
  }
`;export{s as t};