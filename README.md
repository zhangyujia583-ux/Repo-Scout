# Repo Scout

[![CI](https://github.com/zhangyujia583-ux/Repo-Scout/actions/workflows/ci.yml/badge.svg)](https://github.com/zhangyujia583-ux/Repo-Scout/actions/workflows/ci.yml)

Repo Scout helps developers find noteworthy **new** public GitHub repositories, not only the ones that are already famous.

It searches the GitHub API for repositories created in the last 7, 30, or 90 days, then re-ranks that page with a watch score. Every card links to the real repository and explains, in one sentence, why it is worth a look.

![Repo Scout showing live GitHub repositories with watch scores and reasons](docs/screenshot.png)

## What it is

A small web app for open-source discovery:

- Browse repositories **created** in a time window, or switch to **Rising** (created in that window, pushed in the last 7 days, at least 5 stars).
- Filter by programming language, GitHub topic, and keyword.
- Sort the current page by watch score, stars, star velocity, or latest push. Sorting does not issue another GitHub request.
- Each card shows the owner, name, description, language, stars, license, and a short recommendation. The name and “View on GitHub” open the repository.
- Switch the interface between English and 中文 with the control in the header, or open `/?lang=zh`. The watch-score sentence is written in the selected language. The numeric score does not change.

GitHub chooses the candidate page: the 30 most-starred public, non-fork, non-archived matches for your query. Repo Scout then re-ranks those 30. It does not pretend to have scanned every new repository on GitHub, and it never fills the page with invented projects. If the API is rate-limited or unreachable, the page says so.

## Why it exists

Star-count charts and “most starred this month” lists converge on projects that are already large. A repository created four days ago with a clear README, a license, and a fast early star rate is easy to miss if you only sort by the raw total.

Repo Scout exists to make that early signal visible, and to show the reasoning instead of hiding it behind a single number.

## How ranking works

The watch score is a 0–100 sum of six public signals. The weights live in `lib/score.ts` and are covered by unit tests.

| Signal | Weight | What it measures |
| --- | ---: | --- |
| Star velocity | 32 | Stars divided by age, on a log scale. 40 stars/day saturates the factor. |
| Recency | 16 | Full marks in the first 3 days, then a step down through 6 months. |
| Recent activity | 18 | Days since the last push. A push in the last day is full marks. |
| Documentation | 18 | Description, topics, homepage, and README length when a token is set. |
| License | 10 | Permissive licenses score 10, copyleft 8, other SPDX ids 6, non-SPDX “other” 4, missing 0. |
| Community | 6 | Fork volume, plus a small bonus when the fork-to-star ratio is healthy. |

Archived repositories would be multiplied by 0.25. The search query already excludes them.

The sentence on each card uses the strongest of those signals (at most three clauses). The six bars are the full breakdown, so a signal that did not fit in the sentence is still visible.

**README length and tokens.** Checking README size costs one GitHub API call per repository. Repo Scout does that only when `GITHUB_TOKEN` (or `GH_TOKEN`) is set. Without a token, description, topics, and homepage are scaled up to the full documentation weight. An unchecked README is not scored as a missing README, and the card will not claim one exists. The results header says which mode you are in.

The score is a reading aid for public metadata. It is not a measure of code quality, security, or maintenance.

## Run locally

Requires Node.js 20 or newer.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm test    # scoring, query building, locale, and sort tests
npm run lint
npm run build
```

GitHub Actions runs `npm test` and `npm run lint` on every push and pull request to `main`.

## Environment variables

Copy the example file and restart the dev server after editing it.

```bash
cp .env.example .env.local
```

| Variable | Required | Purpose |
| --- | --- | --- |
| `GITHUB_TOKEN` | No | Classic personal access token, or a fine-grained token with public-repository read access. Also accepts `GH_TOKEN`. |

Unauthenticated search allows about **10 requests per minute** and does not include README length. A token raises the search limit (about 30 requests per minute for most tokens) and turns on README scoring.

The token is read on the server only. Do not prefix it with `NEXT_PUBLIC_`, and do not commit `.env.local`. If GitHub rejects the token or rate-limits the app, the page explains how to fix it and does not substitute sample repositories.

A classic token with no extra scopes is enough for public repository metadata. Fine-grained tokens need read access to public repositories.

## Project layout

```
app/                Next.js App Router UI
components/         Header, filters, cards, empty and error states
lib/score.ts        Watch score (pure, tested)
lib/filters.ts      Search-query builder (pure, tested)
lib/github.ts       GitHub Search API client
```

## Stack

Next.js, React, TypeScript, Tailwind CSS, and shadcn/ui. Tests run with Vitest.

## License

[MIT](LICENSE)

## 中文简介

**Repo Scout** 是一个开源项目发现工具。它帮助开发者找到最近创建、或正在变热的 GitHub 公开仓库，而不只是那些已经很有名的项目。

### 它是什么

应用会按时间窗口（最近 7、30 或 90 天）搜索公开仓库，再用一套「关注分」重新排序，并在每张卡片上写明推荐理由。卡片包含仓库名、所有者、简介、语言、star 数、许可证，并链接到真实的 GitHub 仓库。可以按语言、topic 和关键词筛选。页眉可以在 English 和中文之间切换，地址栏加上 `?lang=zh` 也会打开中文界面。关注分的数字不变，推荐理由会换成中文。

GitHub 先返回该查询下 star 最多的 30 个公开、非 fork、未归档仓库，Repo Scout 再对这一页重新排序。它不会假装扫过了 GitHub 上的每一个新仓库，也不会在接口失败时编造数据。

### 为什么做它

只按 star 总数排序时，新仓库很难被看见。一个诞生几天、文档清楚、许可证明确、star 增速很快的项目，往往排在老项目后面。Repo Scout 把增速、新近程度、最近推送、文档和许可证摊开，让「为什么值得看」可以被读懂。

### 排名怎么计算

关注分满分 100，由六个公开信号相加：

- **Star 增速（32）**：star 数除以仓库年龄，取对数。大约每天 40 个 star 记满。
- **新近程度（16）**：越新越高，前 3 天满分，半年后基本不再加分。
- **最近活跃（18）**：距离最后一次 push 的天数。最近一天内有推送为满分。
- **文档（18）**：简介、topics、主页，以及在配置了 token 时的 README 长度。
- **许可证（10）**：宽松许可证最高，copyleft 次之，没有许可证为 0。
- **社区（6）**：fork 数量，以及 fork 相对 star 的比例。

已归档仓库会把分数乘以 0.25（搜索条件本身已排除归档仓库）。

没有 `GITHUB_TOKEN` 时不会逐个请求 README。这时简介、topics 和主页会被放大到文档项的满分权重，避免把「没检查到」当成「没有 README」。卡片文案也不会声称存在 README。页面上会写明当前是否包含 README 长度。

关注分只概括公开元数据，不代表代码质量。

### 本地运行

需要 Node.js 20 或更高版本。

```bash
npm install
npm run dev
```

浏览器打开 [http://localhost:3000](http://localhost:3000)。

```bash
npm test
npm run lint
npm run build
```

### 环境变量

```bash
cp .env.example .env.local
```

`GITHUB_TOKEN` 可选，也可以用 `GH_TOKEN`。不配置也能运行，但未登录的 Search API 大约每分钟 10 次请求，并且不会把 README 长度算进分数。配置 token 后限额更高，并会读取 README 大小。

Token 只在服务端读取，不要加 `NEXT_PUBLIC_` 前缀，也不要提交 `.env.local`。如果触发限流或 token 无效，页面会说明原因，并提示如何添加 token。
