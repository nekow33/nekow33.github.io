# hahaws.github.io

https://hahaws.github.io

个人博客。**Jekyll 4 + [Minimal Mistakes](https://mmistakes.github.io/minimal-mistakes/)** 主题，
GitHub Actions 构建后推送到 `hahaws/hahaws.github.io` 仓库的 `publish` 分支。

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

## 写一篇新文章

在 `_posts/` 下新建 `YYYY-MM-DD-英文短标题.md`，URL 由「日期 + 文件名」决定：
`/posts/<日期>-<标题>/`（与旧 Hugo 站完全一致，老链接不会失效）。

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
  聚合页里的每个分类是一个锚点区块，文章页的分类链接会直接跳到对应位置。
- **标签 tags**：可放多个，同样出现在 `/tags/` 聚合页和文章页顶部。
- **目录 TOC**：`_config.yml` 的 `defaults` 已全局开启（`toc: true`、`toc_sticky: true`），
  正文里用 `##` / `###` 自动生成右侧目录；单篇想关掉就写 `toc: false`。
- **代码高亮**：三个反引号围栏，可加语言名（如 ```python），由 rouge 渲染。
- **草稿**：front matter 里写 `published: false` 就不发布。
- **公式**：front matter 里写 `mathjax: true` 才会加载 MathJax（见 `_posts/2022-08-26-test-tex.md`，该文是草稿）。

## 换配色 / 改站点信息

- 配色：改 `_config.yml` 里的 `minimal_mistakes_skin`，
  可选 `air` / `aqua` / `contrast` / `dark` / `dirt` / `mint` / `neon` / `plum` / `sunrise`。
- 标题、简介、作者、社交链接：`_config.yml` 的 `title` / `description` / `author` / `footer`。
- 顶部菜单：`_data/navigation.yml`。

## 部署

推送到 `master` 分支即自动触发：

1. `ubuntu-latest` + Ruby 3.4，`bundle exec jekyll build` 生成 `_site/`；
2. `peaceiris/actions-gh-pages` 用仓库 Secret `BLOG_GENERATE`（Personal Access Token）把 `_site/`
   推到 `hahaws/hahaws.github.io` 的 `publish` 分支；
3. 对端仓库 Settings → Pages 指向 `publish` 分支，即 https://hahaws.github.io 。

`_config.yml` 里的 `url` / `baseurl` 必须和实际域名一致（用户站是根路径，所以 `baseurl: ""`）。
