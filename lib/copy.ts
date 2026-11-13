import type { Locale } from "@/lib/locale";
import type { DiscoverErrorCode } from "@/lib/types";

export type Copy = {
  metaTitle: string;
  metaDescription: string;
  skip: string;
  eyebrow: string;
  title: string;
  lede: string;
  scoringShort: string;
  scoringLong: string;
  source: string;
  languageLabel: string;
  dialogTitle: string;
  dialogIntro: string;
  dialogFoot: string;
  factors: {
    velocity: string;
    recency: string;
    activity: string;
    docs: string;
    license: string;
    community: string;
  };
  factorLabels: {
    velocity: string;
    recency: string;
    activity: string;
    docs: string;
    license: string;
    community: string;
  };
  modeLabel: string;
  modeNew: string;
  modeRising: string;
  modeHelpNew: string;
  modeHelpRising: string;
  keyword: string;
  keywordPlaceholder: string;
  topic: string;
  topicPlaceholder: string;
  language: string;
  anyLanguage: string;
  created: string;
  windows: { "7": string; "30": string; "90": string };
  suggestedTopics: string;
  clear: string;
  search: string;
  searching: string;
  sort: string;
  sorts: { score: string; stars: string; velocity: string; updated: string };
  querySummary: string;
  watch: string;
  watchScore: (score: number) => string;
  noDescription: string;
  stars: string;
  forks: string;
  whyWatch: string;
  viewOnGitHub: string;
  noLicense: string;
  emptyTitle: string;
  emptyBody: string;
  errorTitles: Record<DiscoverErrorCode, string>;
  errorHonest: string;
  step1: string;
  step2Lead: string;
  step2Mid: string;
  step2End: string;
  step3Lead: string;
  step3Rest: string;
  resetAt: (when: string) => string;
  retry: string;
  footer: string;
  licenseLine: string;
  pageErrorTitle: string;
  pageErrorBody: string;
  heading: (shown: number) => string;
  detail: (since: string, total: string) => string;
  readmeOn: string;
  readmeOff: string;
  quota: (remaining: number, limit: number) => string;
  authOn: string;
  authOff: string;
  incomplete: string;
  timeout: string;
  network: string;
  badToken: string;
  rateAuth: string;
  rateAnon: string;
  rejected: string;
  statusFailed: (status: number) => string;
};

const en: Copy = {
  metaTitle: "Repo Scout — noteworthy new GitHub repositories",
  metaDescription:
    "Discover recently created and fast-growing public GitHub repositories. Ranked by star velocity, activity, documentation, and license, with a reason on every card.",
  skip: "Skip to results",
  eyebrow: "Public GitHub · last 7, 30, or 90 days",
  title: "Find noteworthy new repositories before they are famous.",
  lede: "Search projects created recently, filter by language and topic, and read a short reason on every card. The watch score looks at star velocity, fresh pushes, documentation, and license — not the raw star total.",
  scoringShort: "Scoring",
  scoringLong: "How scoring works",
  source: "Source",
  languageLabel: "Language",
  dialogTitle: "How the watch score works",
  dialogIntro:
    "Repo Scout asks GitHub for the most-starred public repositories in your window, then re-ranks that page. The sentence on each card is written from the strongest signals. The bars show the full breakdown.",
  dialogFoot:
    "Archived repositories are multiplied by 0.25. The score is a reading aid for public metadata, not a judgment of code quality. GitHub still chooses which repositories are on the page: the first 30 matches when sorted by stars.",
  factors: {
    velocity:
      "Stars divided by age, on a log scale. Forty stars a day saturates this factor, so a two-week-old project can outrank an older one with more total stars.",
    recency:
      "Newer repositories score higher. The first three days receive full marks; after six months this factor fades out.",
    activity:
      "Days since the last push. A push in the last day is full marks. A quiet quarter contributes almost nothing.",
    docs: "Description, topics, homepage, and README length. README size is read only when a token is set. Without one, the other writing signals are scaled up so an unchecked README is not scored as a missing README.",
    license:
      "A permissive license scores highest, a copyleft license still scores well, and no license scores zero.",
    community: "Forks, with a small bonus when people are forking as well as starring.",
  },
  factorLabels: {
    velocity: "Star velocity",
    recency: "Recency",
    activity: "Recent activity",
    docs: "Documentation",
    license: "License",
    community: "Community",
  },
  modeLabel: "Discovery mode",
  modeNew: "New",
  modeRising: "Rising",
  modeHelpNew:
    "New keeps every public repository created in this window. GitHub returns the most-starred matches, then Repo Scout re-ranks them.",
  modeHelpRising:
    "Rising keeps repositories created in this window that were pushed in the last 7 days and already have at least 5 stars.",
  keyword: "Keyword",
  keywordPlaceholder: "compiler, vector, lsp…",
  topic: "Topic",
  topicPlaceholder: "e.g. cli",
  language: "Language",
  anyLanguage: "Any language",
  created: "Created",
  windows: { "7": "Last 7 days", "30": "Last 30 days", "90": "Last 90 days" },
  suggestedTopics: "Suggested topics",
  clear: "Clear",
  search: "Search",
  searching: "Searching…",
  sort: "Sort",
  sorts: {
    score: "Watch score",
    stars: "Stars",
    velocity: "Star velocity",
    updated: "Latest push",
  },
  querySummary: "GitHub query",
  watch: "Watch",
  watchScore: (score) => `Watch score ${score} out of 100`,
  noDescription: "No description provided.",
  stars: "stars",
  forks: "forks",
  whyWatch: "Why watch",
  viewOnGitHub: "View on GitHub",
  noLicense: "No license",
  emptyTitle: "No repositories matched",
  emptyBody:
    "GitHub returned no public, non-fork repositories for this search. Widen the time window, clear the topic, or try a broader keyword. Repo Scout does not fill the gap with sample projects.",
  errorTitles: {
    rate_limited: "GitHub rate limit reached",
    invalid_token: "GitHub rejected the token",
    network: "GitHub could not be reached",
    github_error: "GitHub search failed",
  },
  errorHonest: "The list stays empty rather than showing made-up repositories.",
  step1: "Create a GitHub personal access token that can read public repositories.",
  step2Lead: "Copy",
  step2Mid: "to",
  step2End: ".",
  step3Lead: "Set",
  step3Rest:
    "and restart the dev server. The token stays on the server and is never sent to the browser.",
  resetAt: (when) => `The current limit window resets at ${when}.`,
  retry: "Try again",
  footer: "Live data from the GitHub Search API. Watch scores are Repo Scout’s, not GitHub’s.",
  licenseLine: "MIT License",
  pageErrorTitle: "This page hit a snag",
  pageErrorBody:
    "The discovery view failed before it could finish rendering. No repository list was filled in to cover the gap.",
  heading: (shown) =>
    shown === 1 ? "1 repository to consider" : `${shown} repositories to consider`,
  detail: (since, total) =>
    `Created on or after ${since}. GitHub reports about ${total} matches. Repo Scout re-ranks the most-starred page it returned, instead of trusting star count alone.`,
  readmeOn: "README length is included in the documentation score.",
  readmeOff:
    "README length is not checked without a token. Documentation is scored from the description, topics, and homepage, then scaled so that missing check is not treated as a missing README.",
  quota: (remaining, limit) => `Search quota: ${remaining} of ${limit} left in this window.`,
  authOn: "GitHub token connected. Higher search limits are active.",
  authOff: "No token connected. Unauthenticated search allows about 10 requests per minute.",
  incomplete: "GitHub marked this search as incomplete, so the page may be missing matches.",
  timeout: "The GitHub search request timed out before Repo Scout received a result.",
  network: "Repo Scout could not reach the GitHub API. Check the connection and try again.",
  badToken:
    "GitHub rejected the token in GITHUB_TOKEN. Replace it with a valid token that can read public repositories, or remove it to continue without one.",
  rateAuth: "GitHub rate-limited this token. Wait for the window to reset, then try again.",
  rateAnon: "GitHub rate-limited unauthenticated search from this server.",
  rejected: "GitHub rejected this search. Try a shorter keyword or a simpler topic.",
  statusFailed: (status) => `GitHub search failed with status ${status}. Try again in a moment.`,
};

const zh: Copy = {
  metaTitle: "Repo Scout — 值得关注的新 GitHub 仓库",
  metaDescription:
    "发现最近创建、正在变热的 GitHub 公开仓库。按 star 增速、最近活跃、文档和许可证排序，每张卡片都写明理由。",
  skip: "跳到结果",
  eyebrow: "公开 GitHub · 最近 7、30 或 90 天",
  title: "在它们成名之前，找到值得关注的新仓库。",
  lede: "搜索最近创建的公开项目，按语言和 topic 筛选，每张卡片都写明推荐理由。关注分看的是 star 增速、最近推送、文档和许可证，而不是 star 总数。",
  scoringShort: "评分",
  scoringLong: "评分怎么算",
  source: "源码",
  languageLabel: "界面语言",
  dialogTitle: "关注分怎么计算",
  dialogIntro:
    "Repo Scout 先向 GitHub 要这个时间窗口里 star 最多的公开仓库，再对这一页重新排序。卡片上的句子来自最强的信号，下面的条形是完整分解。",
  dialogFoot:
    "已归档仓库会把分数乘以 0.25。这个分数只帮助阅读公开元数据，不是对代码质量的判断。GitHub 仍然决定这一页有哪些仓库：按 star 排序后的前 30 个匹配。",
  factors: {
    velocity:
      "star 数除以仓库年龄，取对数。大约每天 40 个 star 记满，所以一个两周大的项目可以排在 star 总数更高的老项目前面。",
    recency: "越新越高。前 3 天满分，半年之后这一项基本不再加分。",
    activity: "距离最后一次 push 的天数。最近一天内有推送为满分。一个季度没有动静，几乎不加分。",
    docs: "简介、topics、主页，以及 README 长度。只有配置了 token 才会读取 README 大小。没有 token 时，其余文字信号会被放大，避免把「没检查到」当成「没有 README」。",
    license: "宽松许可证最高，copyleft 仍然有分，没有许可证为 0。",
    community: "看 fork 数量。如果既有 star 也有人 fork，会有一小笔加分。",
  },
  factorLabels: {
    velocity: "Star 增速",
    recency: "新近程度",
    activity: "最近活跃",
    docs: "文档",
    license: "许可证",
    community: "社区",
  },
  modeLabel: "发现模式",
  modeNew: "新仓库",
  modeRising: "变热",
  modeHelpNew:
    "「新仓库」保留这个时间窗口里创建的全部公开仓库。GitHub 先返回 star 最多的匹配，Repo Scout 再重新排序。",
  modeHelpRising:
    "「变热」只保留这个窗口内创建、最近 7 天有推送、并且至少有 5 个 star 的仓库。",
  keyword: "关键词",
  keywordPlaceholder: "compiler、vector、lsp…",
  topic: "话题",
  topicPlaceholder: "例如 cli",
  language: "语言",
  anyLanguage: "任意语言",
  created: "创建时间",
  windows: { "7": "最近 7 天", "30": "最近 30 天", "90": "最近 90 天" },
  suggestedTopics: "建议的话题",
  clear: "清除",
  search: "搜索",
  searching: "搜索中…",
  sort: "排序",
  sorts: {
    score: "关注分",
    stars: "Star",
    velocity: "Star 增速",
    updated: "最近推送",
  },
  querySummary: "GitHub 查询",
  watch: "关注",
  watchScore: (score) => `关注分 ${score}，满分 100`,
  noDescription: "没有简介。",
  stars: "star",
  forks: "fork",
  whyWatch: "为什么看",
  viewOnGitHub: "在 GitHub 打开",
  noLicense: "无许可证",
  emptyTitle: "没有匹配的仓库",
  emptyBody:
    "GitHub 没有返回符合条件的公开、非 fork 仓库。可以把时间窗口放宽，清掉话题，或换一个更宽的关键词。Repo Scout 不会用示例项目填补空白。",
  errorTitles: {
    rate_limited: "GitHub 触发了速率限制",
    invalid_token: "GitHub 拒绝了 token",
    network: "无法连接 GitHub",
    github_error: "GitHub 搜索失败",
  },
  errorHonest: "列表保持为空，不会显示编造的仓库。",
  step1: "创建一个可以读取公开仓库的 GitHub personal access token。",
  step2Lead: "把",
  step2Mid: "复制为",
  step2End: "。",
  step3Lead: "设置",
  step3Rest: "并重启开发服务器。Token 只留在服务端，不会发到浏览器。",
  resetAt: (when) => `当前限额窗口将在 ${when} 重置。`,
  retry: "再试一次",
  footer: "数据来自 GitHub Search API。关注分是 Repo Scout 的算法，不是 GitHub 的。",
  licenseLine: "MIT 许可证",
  pageErrorTitle: "这一页没有渲染完",
  pageErrorBody: "发现视图在完成之前失败了。页面没有用假数据补上仓库列表。",
  heading: (shown) => `${shown} 个值得看的仓库`,
  detail: (since, total) =>
    `创建于 ${since} 或之后。GitHub 报告大约有 ${total} 个匹配。Repo Scout 会对返回的 star 最多的那一页重新排序，而不是只看 star 总数。`,
  readmeOn: "文档分已计入 README 长度。",
  readmeOff:
    "没有 token 时不检查 README 长度。文档分来自简介、topics 和主页，并已放大，避免把未检查当成没有 README。",
  quota: (remaining, limit) => `搜索配额：本窗口还剩 ${remaining} / ${limit}。`,
  authOn: "已连接 GitHub token，搜索限额更高。",
  authOff: "未连接 token。未登录搜索大约每分钟 10 次。",
  incomplete: "GitHub 把这次搜索标为不完整，这一页可能缺少匹配。",
  timeout: "GitHub 搜索在返回结果前超时了。",
  network: "Repo Scout 无法连接 GitHub API。检查网络后再试。",
  badToken:
    "GitHub 拒绝了 GITHUB_TOKEN。换成一个可以读取公开仓库的有效 token，或者删掉它，继续以未登录方式使用。",
  rateAuth: "GitHub 对这个 token 触发了速率限制。等窗口重置后再试。",
  rateAnon: "GitHub 对这台服务器的未登录搜索触发了速率限制。",
  rejected: "GitHub 拒绝了这次搜索。试一个更短的关键词，或更简单的话题。",
  statusFailed: (status) => `GitHub 搜索失败，状态码 ${status}。过一会儿再试。`,
};

export function t(locale: Locale): Copy {
  return locale === "zh" ? zh : en;
}
