# hahaws.github.io

https://nekow33.github.io

个人博客。**Jekyll 4 + 自带的极简纯文本主题**（layout 和 CSS 都在本仓库里，没有任何第三方主题依赖）：
等宽字体、白底黑字、窄栏、蓝色下划线链接、已访问链接变紫，文章页左侧固定目录。

> 注：GitHub 账号已从 `hahaws` 改名为 `nekow33`，所以站点地址从 `https://hahaws.github.io`
> 变成了 `https://nekow33.github.io`。仓库原名 `hahaws.github.io`，已改名为 `nekow33.github.io`
> （用户站要求仓库名与账号名一致，这样才能挂在根路径 `/` 上）。

## 目录结构

```
├── _config.yml                 # 站点配置（标题、分页、Markdown、默认 layout）
├── Gemfile / Gemfile.lock      # Ruby 依赖（锁版本，保证本地与 CI 一致）
├── index.html                  # 首页（layout: home，自动分页）
├── 404.md                      # 404 页面
├── _data/navigation.yml        # 顶部导航菜单（首页 / 分类）
├── _layouts/
│   ├── default.html            # 页面骨架：head、页头导航
│   ├── home.html               # 首页：文章列表 + 分页
│   ├── post.html               # 文章页：日期、分类、目录、上下篇
│   ├── page.html               # 普通页面（404 等）
│   └── taxonomy.html           # 分类页
├── _pages/categories.md        # /categories/ 分类聚合页
├── _posts/                     # 文章：YYYY-MM-DD-标题.md
├── assets/
│   ├── css/main.css            # 主题样式（配色改这里的 CSS 变量）
│   ├── css/syntax.css          # rouge 代码高亮配色
│   └── js/toc.js               # 从正文 h2/h3 生成左侧目录
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
> 降级为 bundled gem，不声明会导致 Jekyll 起不来。

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
Pages 发布，约 1 分钟生效。

**仓库只需一次性配置**（已完成过就不用管）：

- Settings → Pages → Source 选 *Deploy from a branch*，Branch 选 `publish` / `/ (root)`
- Settings → Actions → General → Workflow permissions 选 *Read and write permissions*
  （部署步骤用内置 `GITHUB_TOKEN` 推 `publish` 分支，不需要个人 PAT）

## 写一篇新文章

在 `_posts/` 下新建 `YYYY-MM-DD-英文短标题.md`，URL 为 `/posts/<日期>-<标题>/`：

```markdown
---
title: "文章标题"
date: 2025-01-01 10:00:00 +0800
categories:
  - 建站
---

## 一级小节

正文……
```

- **分类 categories**：一篇放一个（或少数几个），出现在 `/categories/` 聚合页和文章页顶部。
  聚合页里每个分类是一个锚点区块，文章页的分类链接会直接跳到对应位置。
- **日期**：`date` 只用于文章排序和 URL（`/posts/<日期>-<标题>/`），页面上不显示。
- **目录 TOC**：默认开启（`_config.yml` 的 `defaults` 里 `toc: true`），由 `assets/js/toc.js`
  从正文的 `##` / `###` 生成；单篇想关掉就写 `toc: false`。
- **代码高亮**：三个反引号围栏，可加语言名（如 ```python），由 rouge 渲染。
- **草稿**：front matter 里写 `published: false` 就不发布。
- **公式**：front matter 里写 `mathjax: true` 才会加载 MathJax。

## 改外观

- 配色/字体：`assets/css/main.css` 顶部的 `:root` 变量（`--fg` / `--bg` / `--link` / `--visited` / `--rule` / `--code-bg`）。
- 标题、简介、作者：`_config.yml` 的 `title` / `description` / `author`。
- 顶部菜单：`_data/navigation.yml`。
