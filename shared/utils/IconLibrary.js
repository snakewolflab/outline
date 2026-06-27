"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.IconLibrary = void 0;
var _freeBrandsSvgIcons = require("@fortawesome/free-brands-svg-icons");
var _freeSolidSvgIcons = require("@fortawesome/free-solid-svg-icons");
var _reactFontawesome = require("@fortawesome/react-fontawesome");
var _compat = require("es-toolkit/compat");
var _outlineIcons = require("outline-icons");
var React = _interopRequireWildcard(require("react"));
var _styledComponents = _interopRequireDefault(require("styled-components"));
var _LetterIcon = _interopRequireDefault(require("../components/LetterIcon"));
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
class IconLibrary {
  /**
   * Get the component for a given icon name
   *
   * @param icon The name of the icon
   * @returns The component for the icon
   */
  static getComponent(icon) {
    return this.mapping[icon].component;
  }

  /**
   * Find an icon by keyword. This is useful for searching for an icon based on a user's input.
   *
   * @param keyword The keyword to search for
   * @returns The name of the icon that matches the keyword, or undefined if no match is found
   */
  static findIconByKeyword(keyword) {
    const keys = Object.keys(this.mapping);
    for (const key of keys) {
      const icon = this.mapping[key];
      const keywords = icon.keywords?.split(" ");
      const namewords = keyword.toLocaleLowerCase().split(" ");
      const matches = (0, _compat.intersection)(namewords, keywords);
      if (matches.length > 0) {
        return key;
      }
    }
    return undefined;
  }

  /**
   * Find icons.
   *
   * @param query The query to search for
   * @returns The icon results.
   */
  static findIcons(query) {
    return Object.keys(this.mapping).map(key => {
      const icon = this.mapping[key];
      const keywords = `${icon.keywords ?? ""} ${key}`;
      if (keywords.includes(query.toLocaleLowerCase())) {
        return key;
      }
      return undefined;
    }).filter(icon => !!icon);
  }

  /**
   * A map of all icons available to end users in the app. This does not include icons that are used
   * internally only, which can be imported from `outline-icons` directly.
   */
}
exports.IconLibrary = IconLibrary;
_defineProperty(IconLibrary, "mapping", {
  // Internal icons
  academicCap: {
    component: _outlineIcons.AcademicCapIcon,
    keywords: "learn teach lesson guide tutorial onboarding training"
  },
  bicycle: {
    component: _outlineIcons.BicycleIcon,
    keywords: "bicycle bike cycle"
  },
  beaker: {
    component: _outlineIcons.BeakerIcon,
    keywords: "lab research experiment test"
  },
  buildingBlocks: {
    component: _outlineIcons.BuildingBlocksIcon,
    keywords: "app blocks product prototype"
  },
  bookmark: {
    component: _outlineIcons.BookmarkedIcon,
    keywords: "bookmark"
  },
  browser: {
    component: _outlineIcons.BrowserIcon,
    keywords: "browser web app"
  },
  collection: {
    component: props => /*#__PURE__*/(0, _jsxRuntime.jsx)(_outlineIcons.CollectionIcon, {
      expanded: true,
      ...props
    }),
    keywords: "collection"
  },
  coins: {
    component: _outlineIcons.CoinsIcon,
    keywords: "coins money finance sales income revenue cash"
  },
  camera: {
    component: _outlineIcons.CameraIcon,
    keywords: "photo picture"
  },
  carrot: {
    component: _outlineIcons.CarrotIcon,
    keywords: "food vegetable produce"
  },
  clock: {
    component: _outlineIcons.ClockIcon,
    keywords: "time"
  },
  cloud: {
    component: _outlineIcons.CloudIcon,
    keywords: "cloud service aws infrastructure"
  },
  code: {
    component: _outlineIcons.CodeIcon,
    keywords: "developer api code development engineering programming"
  },
  database: {
    component: _outlineIcons.DatabaseIcon,
    keywords: "server ops database"
  },
  done: {
    component: _outlineIcons.DoneIcon,
    keywords: "checkmark success complete finished"
  },
  email: {
    component: _outlineIcons.EmailIcon,
    keywords: "email at"
  },
  eye: {
    component: _outlineIcons.EyeIcon,
    keywords: "eye view"
  },
  feedback: {
    component: _outlineIcons.FeedbackIcon,
    keywords: "faq help support"
  },
  flame: {
    component: _outlineIcons.FlameIcon,
    keywords: "fire flame hot"
  },
  graph: {
    component: _outlineIcons.GraphIcon,
    keywords: "chart analytics data"
  },
  globe: {
    component: _outlineIcons.GlobeIcon,
    keywords: "world translate"
  },
  hashtag: {
    component: _outlineIcons.HashtagIcon,
    keywords: "social media tag"
  },
  info: {
    component: _outlineIcons.InfoIcon,
    keywords: "info information"
  },
  icecream: {
    component: _outlineIcons.IceCreamIcon,
    keywords: "food dessert cone scoop"
  },
  image: {
    component: _outlineIcons.ImageIcon,
    keywords: "image photo picture"
  },
  internet: {
    component: _outlineIcons.InternetIcon,
    keywords: "network global globe world"
  },
  leaf: {
    component: _outlineIcons.LeafIcon,
    keywords: "leaf plant outdoors nature ecosystem climate"
  },
  library: {
    component: _outlineIcons.LibraryIcon,
    keywords: "library collection archive"
  },
  lightbulb: {
    component: _outlineIcons.LightBulbIcon,
    keywords: "lightbulb idea"
  },
  lightning: {
    component: _outlineIcons.LightningIcon,
    keywords: "lightning fast zap"
  },
  letter: {
    component: _LetterIcon.default,
    keywords: "letter"
  },
  math: {
    component: _outlineIcons.MathIcon,
    keywords: "math formula"
  },
  moon: {
    component: _outlineIcons.MoonIcon,
    keywords: "night moon dark"
  },
  notepad: {
    component: _outlineIcons.NotepadIcon,
    keywords: "journal notepad write notes"
  },
  padlock: {
    component: _outlineIcons.PadlockIcon,
    keywords: "padlock private security authentication authorization auth"
  },
  palette: {
    component: _outlineIcons.PaletteIcon,
    keywords: "design palette art brand"
  },
  pencil: {
    component: _outlineIcons.EditIcon,
    keywords: "copy writing post blog"
  },
  plane: {
    component: _outlineIcons.PlaneIcon,
    keywords: "airplane travel flight trip vacation"
  },
  promote: {
    component: _outlineIcons.PromoteIcon,
    keywords: "marketing promotion"
  },
  ramen: {
    component: _outlineIcons.RamenIcon,
    keywords: "soup food noodle bowl meal"
  },
  question: {
    component: _outlineIcons.QuestionMarkIcon,
    keywords: "question help support faq"
  },
  server: {
    component: _outlineIcons.ServerRackIcon,
    keywords: "ops infra server"
  },
  sun: {
    component: _outlineIcons.SunIcon,
    keywords: "day sun weather"
  },
  shapes: {
    component: _outlineIcons.ShapesIcon,
    keywords: "blocks toy"
  },
  sport: {
    component: _outlineIcons.SportIcon,
    keywords: "sport outdoor racket game"
  },
  smiley: {
    component: _outlineIcons.SmileyIcon,
    keywords: "emoji smiley happy"
  },
  target: {
    component: _outlineIcons.TargetIcon,
    keywords: "target goal sales"
  },
  team: {
    component: _outlineIcons.TeamIcon,
    keywords: "team building organization office"
  },
  terminal: {
    component: _outlineIcons.TerminalIcon,
    keywords: "terminal code"
  },
  thumbsup: {
    component: _outlineIcons.ThumbsUpIcon,
    keywords: "like social favorite upvote"
  },
  truck: {
    component: _outlineIcons.TruckIcon,
    keywords: "truck transport vehicle"
  },
  tools: {
    component: _outlineIcons.ToolsIcon,
    keywords: "tool settings"
  },
  vehicle: {
    component: _outlineIcons.VehicleIcon,
    keywords: "truck car travel transport"
  },
  warning: {
    component: _outlineIcons.WarningIcon,
    keywords: "warning alert error"
  },
  // Font awesome
  ...Object.fromEntries([_freeSolidSvgIcons.faBagShopping, _freeSolidSvgIcons.faBook, _freeSolidSvgIcons.faBrush, _freeSolidSvgIcons.faCake, _freeSolidSvgIcons.faCat, _freeSolidSvgIcons.faClapperboard, _freeSolidSvgIcons.faCompactDisc, _freeSolidSvgIcons.faCookieBite, _freeSolidSvgIcons.faCrow, _freeSolidSvgIcons.faCrown, _freeSolidSvgIcons.faCube, _freeSolidSvgIcons.faDna, _freeSolidSvgIcons.faDog, _freeSolidSvgIcons.faDollarSign, _freeSolidSvgIcons.faDisplay, _freeSolidSvgIcons.faDroplet, _freeSolidSvgIcons.faFaceDizzy, _freeSolidSvgIcons.faFaceGrinStars, _freeSolidSvgIcons.faFaceLaugh, _freeSolidSvgIcons.faFaceMeh, _freeSolidSvgIcons.faFaceSmileBeam, _freeSolidSvgIcons.faFaceSmileWink, _freeSolidSvgIcons.faFaceSurprise, _freeSolidSvgIcons.faFeather, _freeSolidSvgIcons.faFish, _freeSolidSvgIcons.faFolderClosed, _freeSolidSvgIcons.faFlaskVial, _freeSolidSvgIcons.faGamepad, _freeSolidSvgIcons.faGauge, _freeSolidSvgIcons.faGem, _freeSolidSvgIcons.faGift, _freeSolidSvgIcons.faHammer, _freeSolidSvgIcons.faHandsClapping, _freeSolidSvgIcons.faHeart, _freeSolidSvgIcons.faIndustry, _freeSolidSvgIcons.faKitMedical, _freeSolidSvgIcons.faLaptop, _freeSolidSvgIcons.faLaptopCode, _freeSolidSvgIcons.faMagnet, _freeSolidSvgIcons.faMap, _freeSolidSvgIcons.faMicrochip, _freeSolidSvgIcons.faMountainSun, _freeSolidSvgIcons.faMugHot, _freeSolidSvgIcons.faNetworkWired, _freeSolidSvgIcons.faNewspaper, _freeSolidSvgIcons.faPaintRoller, _freeSolidSvgIcons.faPassport, _freeSolidSvgIcons.faPaw, _freeSolidSvgIcons.faPenRuler, _freeSolidSvgIcons.faPesoSign, _freeSolidSvgIcons.faPhoneVolume, _freeSolidSvgIcons.faPizzaSlice, _freeSolidSvgIcons.faPrescription, _freeSolidSvgIcons.faPuzzlePiece, _freeSolidSvgIcons.faRainbow, _freeSolidSvgIcons.faRecordVinyl, _freeSolidSvgIcons.faRoad, _freeSolidSvgIcons.faRobot, _freeSolidSvgIcons.faRocket, _freeSolidSvgIcons.faSailboat, _freeSolidSvgIcons.faScissors, _freeSolidSvgIcons.faSeedling, _freeSolidSvgIcons.faShield, _freeSolidSvgIcons.faShirt, _freeSolidSvgIcons.faShop, _freeSolidSvgIcons.faSnowflake, _freeSolidSvgIcons.faSocks, _freeSolidSvgIcons.faSolarPanel, _freeSolidSvgIcons.faSpa, _freeSolidSvgIcons.faStarAndCrescent, _freeSolidSvgIcons.faStarOfLife, _freeSolidSvgIcons.faSterlingSign, _freeSolidSvgIcons.faSwatchbook, _freeSolidSvgIcons.faTent, _freeSolidSvgIcons.faTooth, _freeSolidSvgIcons.faTowerCell, _freeSolidSvgIcons.faTractor, _freeSolidSvgIcons.faTrain, _freeSolidSvgIcons.faTree, _freeSolidSvgIcons.faTrophy, _freeSolidSvgIcons.faUmbrella, _freeSolidSvgIcons.faUmbrellaBeach, _freeSolidSvgIcons.faUniversalAccess, _freeSolidSvgIcons.faUserGraduate, _freeSolidSvgIcons.faUtensils, _freeSolidSvgIcons.faVault, _freeSolidSvgIcons.faWandSparkles, _freeBrandsSvgIcons.faWebAwesome, _freeSolidSvgIcons.faWheelchairMove, _freeSolidSvgIcons.faWorm, _freeSolidSvgIcons.faYenSign, _freeBrandsSvgIcons.faApple, _freeBrandsSvgIcons.faWindows, _freeBrandsSvgIcons.faAndroid, _freeBrandsSvgIcons.faSquareJs, _freeBrandsSvgIcons.faPython, _freeBrandsSvgIcons.faXTwitter, _freeBrandsSvgIcons.faBluesky, _freeBrandsSvgIcons.faGithub, _freeBrandsSvgIcons.faGitlab, _freeBrandsSvgIcons.faDiscord, _freeBrandsSvgIcons.faDocker, _freeBrandsSvgIcons.faCodepen, _freeBrandsSvgIcons.faDropbox, _freeBrandsSvgIcons.faPaypal, _freeBrandsSvgIcons.faShopify, _freeBrandsSvgIcons.faSwift, _freeBrandsSvgIcons.faSlack, _freeSolidSvgIcons.faCircle, _freeSolidSvgIcons.faSquare, _freeSolidSvgIcons.faPentagon, _freeSolidSvgIcons.faHexagon, _freeSolidSvgIcons.faDiamond, _freeSolidSvgIcons.faSpiral].map(icon => [icon.iconName, {
    component: _ref => {
      let {
        color,
        size = 24,
        className,
        style
      } = _ref;
      return /*#__PURE__*/(0, _jsxRuntime.jsx)(FontAwesomeWrapper, {
        size: size,
        children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_reactFontawesome.FontAwesomeIcon, {
          style: {
            width: 0.6666666667 * size,
            height: 0.6666666667 * size,
            ...style
          },
          color: color,
          icon: icon,
          className: className
        })
      });
    }
  }]))
});
const FontAwesomeWrapper = _styledComponents.default.span.withConfig({
  componentId: "sc-jxn76y-0"
})(["display:flex;align-items:center;justify-content:center;width:", "px;height:", "px;"], props => props.size, props => props.size);