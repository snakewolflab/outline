"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MentionUser = exports.MentionURL = exports.MentionPullRequest = exports.MentionProject = exports.MentionIssue = exports.MentionGroup = exports.MentionDocument = exports.MentionDate = exports.MentionCollection = void 0;
var _mobxReact = require("mobx-react");
var _outlineIcons = require("outline-icons");
var React = _interopRequireWildcard(require("react"));
var _reactI18next = require("react-i18next");
var _reactRouterDom = require("react-router-dom");
var _styledComponents = _interopRequireDefault(require("styled-components"));
var _date = require("../../utils/date");
var _Backticks = require("../../components/Backticks");
var _Flex = _interopRequireDefault(require("../../components/Flex"));
var _Icon = _interopRequireDefault(require("../../components/Icon"));
var _IssueStatusIcon = require("../../components/IssueStatusIcon");
var _PullRequestIcon = require("../../components/PullRequestIcon");
var _Spinner = _interopRequireDefault(require("../../components/Spinner"));
var _Text = _interopRequireDefault(require("../../components/Text"));
var _useIsMounted = _interopRequireDefault(require("../../hooks/useIsMounted"));
var _useStores = _interopRequireDefault(require("../../hooks/useStores"));
var _theme = _interopRequireDefault(require("../../styles/theme"));
var _types = require("../../types");
var _utils = require("../styles/utils");
var _urls = require("../../utils/urls");
var _Squircle = _interopRequireDefault(require("../../components/Squircle"));
var _jsxRuntime = require("react/jsx-runtime");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
function _interopRequireWildcard(e, t) { if ("function" == typeof WeakMap) var r = new WeakMap(), n = new WeakMap(); return (_interopRequireWildcard = function (e, t) { if (!t && e && e.__esModule) return e; var o, i, f = { __proto__: null, default: e }; if (null === e || "object" != typeof e && "function" != typeof e) return f; if (o = t ? n : r) { if (o.has(e)) return o.get(e); o.set(e, f); } for (const t in e) "default" !== t && {}.hasOwnProperty.call(e, t) && ((i = (o = Object.defineProperty) && Object.getOwnPropertyDescriptor(e, t)) && (i.get || i.set) ? o(f, t, i) : f[t] = e[t]); return f; })(e, t); }
const getAttributesFromNode = node => {
  const spec = node.type.spec.toDOM?.(node);
  const {
    class: className,
    "data-unfurl": unfurl,
    ...attrs
  } = spec[1];
  return {
    className: className,
    unfurl: unfurl ? JSON.parse(unfurl) : undefined,
    ...attrs
  };
};
const MentionUser = exports.MentionUser = (0, _mobxReact.observer)(function MentionUser_(props) {
  const {
    isSelected,
    node
  } = props;
  const {
    users
  } = (0, _useStores.default)();
  const user = users.get(node.attrs.modelId);
  const {
    className,
    unfurl,
    ...attrs
  } = getAttributesFromNode(node);
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)("span", {
    ...attrs,
    className: (0, _utils.cn)(className, {
      "ProseMirror-selectednode": isSelected
    }),
    children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_outlineIcons.EmailIcon, {
      size: 18
    }), user?.name || node.attrs.label]
  });
});
const MentionGroup = exports.MentionGroup = (0, _mobxReact.observer)(function MentionGroup_(props) {
  const {
    isSelected,
    node
  } = props;
  const {
    groups
  } = (0, _useStores.default)();
  const group = groups.get(node.attrs.modelId);
  const {
    className,
    ...attrs
  } = getAttributesFromNode(node);
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)("span", {
    ...attrs,
    className: (0, _utils.cn)(className, {
      "ProseMirror-selectednode": isSelected
    }),
    children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_outlineIcons.EmailIcon, {
      size: 18
    }), group?.name || node.attrs.label]
  });
});
const MentionDocument = exports.MentionDocument = (0, _mobxReact.observer)(function MentionDocument_(props) {
  const {
    isSelected,
    node
  } = props;
  const {
    documents
  } = (0, _useStores.default)();
  const doc = documents.get(node.attrs.modelId);
  const modelId = node.attrs.modelId;
  const {
    className,
    unfurl,
    ...attrs
  } = getAttributesFromNode(node);
  React.useEffect(() => {
    if (modelId) {
      void documents.prefetchDocument(modelId);
    }
  }, [modelId, documents]);
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactRouterDom.Link, {
    ...attrs,
    className: (0, _utils.cn)(className, {
      "ProseMirror-selectednode": isSelected
    }),
    to: doc?.path ?? `/doc/${node.attrs.modelId}`,
    children: [doc?.icon ? /*#__PURE__*/(0, _jsxRuntime.jsx)(_Icon.default, {
      value: doc.icon,
      initial: doc.initial,
      color: doc.color,
      size: 18
    }) : /*#__PURE__*/(0, _jsxRuntime.jsx)(_outlineIcons.DocumentIcon, {
      size: 18
    }), doc?.title || node.attrs.label]
  });
});
const MentionCollection = exports.MentionCollection = (0, _mobxReact.observer)(function MentionCollection_(props) {
  const {
    isSelected,
    node
  } = props;
  const {
    collections
  } = (0, _useStores.default)();
  const collection = collections.get(node.attrs.modelId);
  const modelId = node.attrs.modelId;
  const {
    className,
    unfurl,
    ...attrs
  } = getAttributesFromNode(node);
  React.useEffect(() => {
    if (modelId) {
      void collections.fetch(modelId);
    }
  }, [modelId, collections]);
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)(_reactRouterDom.Link, {
    ...attrs,
    className: (0, _utils.cn)(className, {
      "ProseMirror-selectednode": isSelected
    }),
    to: collection?.path ?? `/collection/${node.attrs.modelId}`,
    children: [collection?.icon ? /*#__PURE__*/(0, _jsxRuntime.jsx)(_Icon.default, {
      value: collection.icon,
      initial: collection.initial,
      color: collection.color,
      size: 18
    }) : /*#__PURE__*/(0, _jsxRuntime.jsx)(_outlineIcons.CollectionIcon, {
      size: 18
    }), collection?.title || node.attrs.label]
  });
});
const MentionURL = props => {
  const {
    unfurls
  } = (0, _useStores.default)();
  const isMounted = (0, _useIsMounted.default)();
  const [loaded, setLoaded] = React.useState(false);
  const onChangeUnfurl = React.useRef(props.onChangeUnfurl).current; // stable reference to callback function.

  const {
    isSelected,
    node
  } = props;
  const {
    className,
    unfurl: unfurlAttr,
    ...attrs
  } = getAttributesFromNode(node);
  const url = typeof attrs.href === "string" ? attrs.href : undefined;
  const unfurl = url ? unfurls.get(url)?.data ?? unfurlAttr : undefined;
  React.useEffect(() => {
    if (!url) {
      setLoaded(true);
      return;
    }
    const fetchUnfurl = async () => {
      try {
        const unfurlModel = await unfurls.fetchUnfurl({
          url
        });
        if (!isMounted()) {
          return;
        }

        // We got a result back from the server, so update the unfurl in the node attributes.
        if (unfurlModel) {
          onChangeUnfurl(unfurlModel.data);
          return;
        }
        const attrs = getAttributesFromNode(node);
        // If we have a unfurl attribute, use that.
        // Otherwise, set a basic unfurl to avoid refetching again in future.
        // This will just show the URL with a generic link icon.
        const data = attrs.unfurl ? attrs.unfurl : {
          title: (0, _urls.toDisplayUrl)(url),
          faviconUrl: (0, _urls.cdnPath)("/images/link.png")
        };
        unfurls.add({
          id: url,
          type: _types.UnfurlResourceType.URL,
          fetchedAt: new Date().toISOString(),
          data
        });
      } finally {
        if (isMounted()) {
          setLoaded(true);
        }
      }
    };
    void fetchUnfurl();
  }, [unfurls, url, node, isMounted, onChangeUnfurl]);
  if (!unfurl) {
    return !loaded ? /*#__PURE__*/(0, _jsxRuntime.jsx)(MentionLoading, {
      className: className
    }) : /*#__PURE__*/(0, _jsxRuntime.jsx)(MentionError, {
      className: className
    });
  }
  return /*#__PURE__*/(0, _jsxRuntime.jsx)("a", {
    ...attrs,
    className: (0, _utils.cn)(className, {
      "ProseMirror-selectednode": isSelected
    }),
    href: url,
    target: "_blank",
    rel: "noopener noreferrer nofollow",
    children: /*#__PURE__*/(0, _jsxRuntime.jsxs)(_Flex.default, {
      align: "center",
      gap: 6,
      children: [unfurl.faviconUrl ? /*#__PURE__*/(0, _jsxRuntime.jsx)(Logo, {
        src: unfurl.faviconUrl,
        alt: ""
      }) : null, /*#__PURE__*/(0, _jsxRuntime.jsx)(_Text.default, {
        children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_Backticks.Backticks, {
          content: unfurl.title
        })
      })]
    })
  });
};
exports.MentionURL = MentionURL;
const MentionIssue = exports.MentionIssue = (0, _mobxReact.observer)(props => {
  const {
    unfurls
  } = (0, _useStores.default)();
  const isMounted = (0, _useIsMounted.default)();
  const [loaded, setLoaded] = React.useState(false);
  const onChangeUnfurl = React.useRef(props.onChangeUnfurl).current; // stable reference to callback function.

  const {
    isSelected,
    node
  } = props;
  const {
    className,
    unfurl: unfurlAttr,
    ...attrs
  } = getAttributesFromNode(node);
  const unfurl = unfurls.get(attrs.href)?.data ?? unfurlAttr;
  React.useEffect(() => {
    const fetchIssue = async () => {
      const unfurlModel = await unfurls.fetchUnfurl({
        url: attrs.href
      });
      if (!isMounted()) {
        return;
      }
      if (unfurlModel) {
        onChangeUnfurl({
          ...unfurlModel.data,
          description: null
        });
      }
      setLoaded(true);
    };
    void fetchIssue();
  }, [unfurls, attrs.href, isMounted, onChangeUnfurl]);
  if (!unfurl) {
    return !loaded ? /*#__PURE__*/(0, _jsxRuntime.jsx)(MentionLoading, {
      className: className
    }) : /*#__PURE__*/(0, _jsxRuntime.jsx)(MentionError, {
      className: className
    });
  }
  const issue = unfurl;
  let service = _types.IntegrationService.GitLab;
  try {
    const parsedUrl = new URL(issue.url);
    service = parsedUrl.hostname === "github.com" ? _types.IntegrationService.GitHub : parsedUrl.hostname === "linear.app" ? _types.IntegrationService.Linear : _types.IntegrationService.GitLab;
  } catch {
    // Invalid URL in unfurl data, default to GitLab
  }
  return /*#__PURE__*/(0, _jsxRuntime.jsx)("a", {
    ...attrs,
    className: (0, _utils.cn)(className, {
      "ProseMirror-selectednode": isSelected
    }),
    href: attrs.href,
    target: "_blank",
    rel: "noopener noreferrer nofollow",
    children: /*#__PURE__*/(0, _jsxRuntime.jsxs)(_Flex.default, {
      align: "center",
      gap: 6,
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_IssueStatusIcon.IssueStatusIcon, {
        size: 14,
        service: service,
        state: issue.state
      }), /*#__PURE__*/(0, _jsxRuntime.jsxs)(_Flex.default, {
        align: "center",
        gap: 4,
        children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_Text.default, {
          children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_Backticks.Backticks, {
            content: issue.title
          })
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_Text.default, {
          type: "tertiary",
          children: issue.id
        })]
      })]
    })
  });
});
const MentionProject = exports.MentionProject = (0, _mobxReact.observer)(props => {
  const {
    unfurls
  } = (0, _useStores.default)();
  const isMounted = (0, _useIsMounted.default)();
  const [loaded, setLoaded] = React.useState(false);
  const onChangeUnfurl = React.useRef(props.onChangeUnfurl).current;
  const {
    isSelected,
    node
  } = props;
  const {
    className,
    unfurl: unfurlAttr,
    ...attrs
  } = getAttributesFromNode(node);
  const unfurl = unfurls.get(attrs.href)?.data ?? unfurlAttr;
  React.useEffect(() => {
    const fetchProject = async () => {
      const unfurlModel = await unfurls.fetchUnfurl({
        url: attrs.href
      });
      if (!isMounted()) {
        return;
      }
      if (unfurlModel) {
        onChangeUnfurl({
          ...unfurlModel.data,
          description: null
        });
      }
      setLoaded(true);
    };
    void fetchProject();
  }, [unfurls, attrs.href, isMounted, onChangeUnfurl]);
  if (!unfurl) {
    return !loaded ? /*#__PURE__*/(0, _jsxRuntime.jsx)(MentionLoading, {
      className: className
    }) : /*#__PURE__*/(0, _jsxRuntime.jsx)(MentionError, {
      className: className
    });
  }
  const project = unfurl;
  return /*#__PURE__*/(0, _jsxRuntime.jsx)("a", {
    ...attrs,
    className: (0, _utils.cn)(className, {
      "ProseMirror-selectednode": isSelected
    }),
    href: attrs.href,
    target: "_blank",
    rel: "noopener noreferrer nofollow",
    children: /*#__PURE__*/(0, _jsxRuntime.jsxs)(_Flex.default, {
      align: "center",
      gap: 6,
      children: [project.avatarUrl ? /*#__PURE__*/(0, _jsxRuntime.jsx)(ProjectAvatar, {
        src: project.avatarUrl,
        alt: ""
      }) : /*#__PURE__*/(0, _jsxRuntime.jsx)(_Squircle.default, {
        color: project.color,
        size: 12
      }), /*#__PURE__*/(0, _jsxRuntime.jsxs)(_Flex.default, {
        align: "center",
        gap: 4,
        children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_Text.default, {
          children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_Backticks.Backticks, {
            content: project.name
          })
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_Text.default, {
          type: "tertiary",
          children: project.progress !== undefined ? `${Math.round(project.progress * 100)}%` : project.id
        })]
      })]
    })
  });
});
const MentionPullRequest = exports.MentionPullRequest = (0, _mobxReact.observer)(props => {
  const {
    unfurls
  } = (0, _useStores.default)();
  const isMounted = (0, _useIsMounted.default)();
  const [loaded, setLoaded] = React.useState(false);
  const onChangeUnfurl = React.useRef(props.onChangeUnfurl).current; // stable reference to callback function.

  const {
    isSelected,
    node
  } = props;
  const {
    className,
    unfurl: unfurlAttr,
    ...attrs
  } = getAttributesFromNode(node);
  const unfurl = unfurls.get(attrs.href)?.data ?? unfurlAttr;
  React.useEffect(() => {
    const fetchPR = async () => {
      const unfurlModel = await unfurls.fetchUnfurl({
        url: attrs.href
      });
      if (!isMounted()) {
        return;
      }
      if (unfurlModel) {
        onChangeUnfurl({
          ...unfurlModel.data,
          description: null
        });
      }
      setLoaded(true);
    };
    void fetchPR();
  }, [unfurls, attrs.href, isMounted, onChangeUnfurl]);
  const sharedProps = {
    className: (0, _utils.cn)(className, {
      "ProseMirror-selectednode": isSelected
    })
  };
  if (!unfurl) {
    return !loaded ? /*#__PURE__*/(0, _jsxRuntime.jsx)(MentionLoading, {
      ...sharedProps
    }) : /*#__PURE__*/(0, _jsxRuntime.jsx)(MentionError, {
      ...sharedProps
    });
  }
  const pullRequest = unfurl;
  return /*#__PURE__*/(0, _jsxRuntime.jsx)("a", {
    ...attrs,
    ...sharedProps,
    href: attrs.href,
    target: "_blank",
    rel: "noopener noreferrer nofollow",
    children: /*#__PURE__*/(0, _jsxRuntime.jsxs)(_Flex.default, {
      align: "center",
      gap: 6,
      children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_PullRequestIcon.PullRequestIcon, {
        size: 14,
        state: pullRequest.state
      }), /*#__PURE__*/(0, _jsxRuntime.jsxs)(_Flex.default, {
        align: "center",
        gap: 4,
        children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_Text.default, {
          children: /*#__PURE__*/(0, _jsxRuntime.jsx)(_Backticks.Backticks, {
            content: pullRequest.title
          })
        }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_Text.default, {
          type: "tertiary",
          children: pullRequest.id
        })]
      })]
    })
  });
});
// Loaded lazily so its browser-only dependencies (Radix, react-day-picker)
// don't enter the editor schema's static import graph, which is also used on
// the server.
const DateMentionPicker = /*#__PURE__*/React.lazy(() => Promise.resolve().then(() => _interopRequireWildcard(require("./DateMentionPicker"))));
const MentionDate = exports.MentionDate = (0, _mobxReact.observer)(function MentionDate_(props) {
  const {
    isSelected,
    isEditable,
    node,
    onChangeDate
  } = props;
  const {
    t
  } = (0, _reactI18next.useTranslation)();
  const {
    auth
  } = (0, _useStores.default)();
  const {
    className,
    unfurl,
    ...attrs
  } = getAttributesFromNode(node);
  const language = auth.user?.language;
  const iso = typeof node.attrs.modelId === "string" ? node.attrs.modelId : "";
  const display = (0, _date.dateToRelativeReadable)(iso, t, language);
  const selectedDate = (0, _date.parseISODate)(iso) ?? undefined;
  const content = /*#__PURE__*/(0, _jsxRuntime.jsx)(DateMention, {
    ...attrs,
    className: (0, _utils.cn)(className, {
      "ProseMirror-selectednode": isSelected
    }),
    $editable: isEditable,
    children: display
  });
  if (!isEditable) {
    return content;
  }
  return /*#__PURE__*/(0, _jsxRuntime.jsx)(React.Suspense, {
    fallback: content,
    children: /*#__PURE__*/(0, _jsxRuntime.jsx)(DateMentionPicker, {
      selectedDate: selectedDate,
      language: language,
      onChange: onChangeDate,
      children: content
    })
  });
});
const MentionLoading = _ref => {
  let {
    className
  } = _ref;
  const {
    t
  } = (0, _reactI18next.useTranslation)();
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)("span", {
    className: className,
    children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(_Spinner.default, {}), /*#__PURE__*/(0, _jsxRuntime.jsx)(_Text.default, {
      type: "tertiary",
      children: `${t("Loading")}…`
    })]
  });
};
const MentionError = _ref2 => {
  let {
    className
  } = _ref2;
  const {
    t
  } = (0, _reactI18next.useTranslation)();
  return /*#__PURE__*/(0, _jsxRuntime.jsxs)("span", {
    className: className,
    children: [/*#__PURE__*/(0, _jsxRuntime.jsx)(StyledWarningIcon, {
      size: 20,
      color: _theme.default.danger
    }), /*#__PURE__*/(0, _jsxRuntime.jsx)(_Text.default, {
      type: "secondary",
      children: `${t("Error loading data")}`
    })]
  });
};
const DateMention = _styledComponents.default.span.withConfig({
  componentId: "sc-1evgffw-0"
})(["cursor:", ";user-select:none;"], props => props.$editable ? "pointer" : "default");
const StyledWarningIcon = (0, _styledComponents.default)(_outlineIcons.WarningIcon).withConfig({
  componentId: "sc-1evgffw-1"
})(["margin:0 -2px;"]);
const Logo = _styledComponents.default.img.withConfig({
  componentId: "sc-1evgffw-2"
})(["width:16px;height:16px;"]);
const ProjectAvatar = _styledComponents.default.img.withConfig({
  componentId: "sc-1evgffw-3"
})(["width:12px;height:12px;border-radius:2px;"]);