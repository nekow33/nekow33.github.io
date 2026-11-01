# hahaws.github.io

https://nekow33.github.io

个人博客。**Jekyll 4 + [Minimal Mistakes](https://mmistakes.github.io/minimal-mistakes/)** 主题，
GitHub Actions 构建后推送到本仓库的 `publish` 分支，Pages 直接从该分支发布。

> 注：GitHub 账号已从 `hahaws` 改名为 `nekow33`，所以站点地址从 `https://hahaws.github.io`
> 变成了 `https://nekow33.github.io`。仓库原名 `hahaws.github.io`，已改名为 `nekow33.github.io`
> （用户站要求仓库名与账号名一致，这样才能挂在根路径 `/` 上）。

## 目录结构

```
├── _config.yml                 # 站点主配置（标题、主题、插件、分类/标签、目录等）
├── Gemfile / Gemfile.lock      # Ruby 依赖（锁版本，保证本地与 CI 一致）
├── index.html                  # 首页（layout: home，自动分页）
├── 404.md                      # 404 页面
├── _data/
│   ├── navigation.yml          # 顶部导航菜单
│   └── ui-text.yml             # 主题界面文案（含简繁中文）
├── _includes/head/custom.html  # 自定义 <head>，MathJax 按文章开关
├── _pages/
│   ├── categories.md           # /categories/ 分类聚合页
│   └── tags.md                 # /tags/ 标签聚合页
├── _posts/                     # 文章：YYYY-MM-DD-标题.md
└── .github/workflows/
    └── generate_pages.yml      # 构建 + 部署流水线
```

## 本地预览

需要 Ruby 3.x（Arch 上是 `sudo pacman -S ruby ruby-bundled-gems`）：

```bash
bundle install
bundle exec jekyll serve
# 打开 http://127.0.0.1:4000
```

> Gemfile 里显式声明了 `csv` / `logger` / `bigdecimal`，因为 Ruby 3.4 把它们从默认 gem
> 降级为 bundled gem，不声明会导致 Jekyll 起不来。构建时 MM 自带的 SCSS 会刷一堆
> `@import is deprecated` 警告，不影响产物，可以忽略。

## 日常发布流程（三步）

```bash
# 1. 写文章
vim _posts/2025-01-01-my-post.md     # front matter 见下

# 2. 本地看一眼（可选）
bundle exec jekyll serve

# 3. 提交推送，剩下的交给 Actions
git add -A
git commit -m "post: my post"
git push
```

推送后 GitHub Actions 自动：`bundle exec jekyll build` → 把 `_site/` 推到 `publish` 分支 →
Pages 发布，约 1~2 分钟生效。

**仓库只需一次性配置**（已完成过就不用管）：

- Settings → Pages → Source 选 *Deploy from a branch*，Branch 选 `publish` / `/ (root)`
- Settings → Actions → General → Workflow permissions 勾上 *Read and write permissions*
  （部署步骤要用 `GITHUB_TOKEN` 推 `publish` 分支；不再需要个人 PAT 和 Secret）

## 写一篇新文章

在 `_posts/` 下新建 `YYYY-MM-DD-英文短标题.md`，URL 为 `/posts/<日期>-<标题>/`：

```markdown
---
title: "文章标题"
date: 2025-01-01 10:00:00 +0800
categories:
  - 建站
tags:
  - Jekyll
  - GitHub Pages
---

## 一级小节

正文……
```

- **分类 categories**：一篇放一个（或少数几个），会出现在 `/categories/` 聚合页和文章页顶部。
  聚合页里每个分类是一个锚点区块，文章页的分类链接会直接跳到对应位置。
- **标签 tags**：可放多个，同样出现在 `/tags/` 聚合页和文章页顶部。
- **目录 TOC**：`_config.yml` 的 `defaults` 已全局开启（`toc: true`、`toc_sticky: true`），
  正文里用 `##` / `###` 自动生成右侧目录；单篇想关掉就写 `toc: false`。
- **代码高亮**：三个反引号围栏，可加语言名（如 ```python），由 rouge 渲染。
- **草稿**：front matter 里写 `published: false` 就不发布。
- **公式**：front matter 里写 `mathjax: true` 才会加载 MathJax。

## 换配色 / 改站点信息

- 配色：改 `_config.yml` 里的 `minimal_mistakes_skin`，
  可选 `air` / `aqua` / `contrast` / `dark` / `dirt` / `mint` / `neon` / `plum` / `sunrise`。
- 标题、简介、作者、社交链接：`_config.yml` 的 `title` / `description` / `author` / `footer`。
- 顶部菜单：`_data/navigation.yml`。

`_config.yml` 里的 `url` / `baseurl` 必须和实际域名一致（用户站挂在根路径，`baseurl: ""`）。
