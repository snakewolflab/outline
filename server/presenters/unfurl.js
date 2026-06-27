"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _dateFns = require("date-fns");
var _i18next = require("i18next");
var _types = require("../../shared/types");
var _date = require("../../shared/utils/date");
var _models = require("../models");
var _i18n = require("../utils/i18n");
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- heterogeneous payload from internal callers and third-party unfurl plugins.

async function presentUnfurl(data, options) {
  switch (data.type) {
    case _types.UnfurlResourceType.Mention:
      return presentMention(data, options);
    case _types.UnfurlResourceType.Group:
      return presentGroup(data);
    case _types.UnfurlResourceType.Document:
      return presentDocument(data);
    case _types.UnfurlResourceType.PR:
      return presentPR(data);
    case _types.UnfurlResourceType.Issue:
      return presentIssue(data);
    case _types.UnfurlResourceType.Project:
      return presentProject(data);
    default:
      return presentURL(data);
  }
}
const presentURL = data => {
  // TODO: For backwards compatibility, remove once cache has expired in next release.
  if (data.transformedUnfurl) {
    delete data.transformedUnfurl;
    return data; // this would have been transformed by the unfurl plugin.
  }
  return {
    type: _types.UnfurlResourceType.URL,
    url: data.url,
    title: data.meta.title,
    description: data.meta.description,
    thumbnailUrl: (data.links.thumbnail ?? [])[0]?.href ?? "",
    faviconUrl: (data.links.icon ?? [])[0]?.href ?? ""
  };
};
const presentMention = async (data, options) => {
  const user = data.user;
  const document = data.document;
  const lastOnlineInfo = presentLastOnlineInfoFor(user);
  const lastViewedInfo = await presentLastViewedInfoFor(user, document);
  return {
    type: _types.UnfurlResourceType.Mention,
    name: user.name,
    email: options && options.includeEmail ? user.email : null,
    avatarUrl: user.avatarUrl,
    color: user.color,
    lastActive: `${lastOnlineInfo} • ${lastViewedInfo}`
  };
};
const presentGroup = async data => {
  const group = data.group;
  const memberCount = await group.memberCount;
  return {
    type: _types.UnfurlResourceType.Group,
    name: group.name,
    description: group.description,
    memberCount,
    users: data.users.map(user => ({
      id: user.id,
      name: user.name,
      avatarUrl: user.avatarUrl,
      color: user.color
    }))
  };
};
const presentDocument = data => {
  const document = data.document;
  const viewer = data.viewer;
  const url = data.url;
  return {
    url: url ?? document.url,
    type: _types.UnfurlResourceType.Document,
    id: document.id,
    title: document.titleWithDefault,
    summary: document.getSummary(),
    lastActivityByViewer: viewer ? presentLastActivityInfoFor(document, viewer) : undefined
  };
};
const presentPR = data => data; // this would have been transformed by the unfurl plugin.

const presentIssue = data => data; // this would have been transformed by the unfurl plugin.

const presentProject = data => data; // this would have been transformed by the unfurl plugin.

const presentLastOnlineInfoFor = user => {
  const locale = (0, _date.dateLocale)(user.language);
  let info;
  if (!user.lastActiveAt) {
    info = (0, _i18next.t)("Never logged in", {
      ...(0, _i18n.opts)(user)
    });
  } else if ((0, _dateFns.differenceInMinutes)(new Date(), user.lastActiveAt) < 5) {
    info = (0, _i18next.t)("Online now", {
      ...(0, _i18n.opts)(user)
    });
  } else {
    info = (0, _i18next.t)("Online {{ timeAgo }}", {
      timeAgo: (0, _dateFns.formatDistanceToNowStrict)(user.lastActiveAt, {
        addSuffix: true,
        locale
      }),
      ...(0, _i18n.opts)(user)
    });
  }
  return info;
};
const presentLastViewedInfoFor = async (user, document) => {
  const lastView = await _models.View.findOne({
    where: {
      userId: user.id,
      documentId: document.id
    },
    order: [["updatedAt", "DESC"]]
  });
  const lastViewedAt = lastView ? lastView.updatedAt : undefined;
  const locale = (0, _date.dateLocale)(user.language);
  let info;
  if (!lastViewedAt) {
    info = (0, _i18next.t)("Never viewed", {
      ...(0, _i18n.opts)(user)
    });
  } else if ((0, _dateFns.differenceInMinutes)(new Date(), lastViewedAt) < 5) {
    info = (0, _i18next.t)("Viewed just now", {
      ...(0, _i18n.opts)(user)
    });
  } else {
    info = (0, _i18next.t)("Viewed {{ timeAgo }}", {
      timeAgo: (0, _dateFns.formatDistanceToNowStrict)(lastViewedAt, {
        addSuffix: true,
        locale
      }),
      ...(0, _i18n.opts)(user)
    });
  }
  return info;
};
const presentLastActivityInfoFor = (document, viewer) => {
  const locale = (0, _date.dateLocale)(viewer.language);
  const wasUpdated = document.createdAt !== document.updatedAt;
  let info;
  if (wasUpdated) {
    const lastUpdatedByViewer = document.updatedBy.id === viewer.id;
    if (lastUpdatedByViewer) {
      info = (0, _i18next.t)("You updated {{ timeAgo }}", {
        timeAgo: (0, _dateFns.formatDistanceToNowStrict)(document.updatedAt, {
          addSuffix: true,
          locale
        }),
        ...(0, _i18n.opts)(viewer)
      });
    } else {
      info = (0, _i18next.t)("{{ user }} updated {{ timeAgo }}", {
        user: document.updatedBy.name,
        timeAgo: (0, _dateFns.formatDistanceToNowStrict)(document.updatedAt, {
          addSuffix: true,
          locale
        }),
        ...(0, _i18n.opts)(viewer)
      });
    }
  } else {
    const lastCreatedByViewer = document.createdById === viewer.id;
    if (lastCreatedByViewer) {
      info = (0, _i18next.t)("You created {{ timeAgo }}", {
        timeAgo: (0, _dateFns.formatDistanceToNowStrict)(document.createdAt, {
          addSuffix: true,
          locale
        }),
        ...(0, _i18n.opts)(viewer)
      });
    } else {
      info = (0, _i18next.t)("{{ user }} created {{ timeAgo }}", {
        user: document.createdBy.name,
        timeAgo: (0, _dateFns.formatDistanceToNowStrict)(document.createdAt, {
          addSuffix: true,
          locale
        }),
        ...(0, _i18n.opts)(viewer)
      });
    }
  }
  return info;
};
var _default = exports.default = presentUnfurl;