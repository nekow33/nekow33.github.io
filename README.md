# hahaws.github.io

https://nekow33.github.io

个人博客。**Jekyll 4 + 自带的极简纯文本主题**（layout 和 CSS 都在本仓库里，没有任何第三方主题依赖）：
等宽字体、白底黑字、窄栏、蓝色下划线链接、已访问链接变紫，文章页左侧固定目录。

## 目录结构

```
├── _config.yml                 # 站点配置（标题、文章集合、Markdown、默认 layout）
├── Gemfile / Gemfile.lock      # Ruby 依赖（锁版本，保证本地与 CI 一致）
├── index.html                  # 首页（layout: home）
├── 404.md                      # 404 页面
├── _data/navigation.yml        # 顶部导航菜单（首页 / 分类）
├── _layouts/
│   ├── default.html            # 页面骨架：head、页头导航
│   ├── home.html               # 首页：文章列表
│   ├── post.html               # 文章页：分类、目录、上下篇
│   ├── page.html               # 普通页面（404 等）
│   └── taxonomy.html           # 分类页
├── _pages/categories.md        # /categories/ 分类聚合页
├── _articles/                  # 文章（文件名随便取，不用带日期）
├── assets/
│   ├── css/main.css            # 主题样式（配色改这里的 CSS 变量）
│   ├── css/syntax.css          # rouge 代码高亮配色
│   └── js/toc.js               # 从正文 h2/h3 生成左侧目录
└── .github/workflows/
    └── generate_pages.yml      # 构建 + 部署流水线
```

## 本地预览


```bash
bundle install
bundle exec jekyll serve
# 打开 http://127.0.0.1:4000
```

> 需要 Ruby 3.x（Arch 上是 `sudo pacman -S ruby ruby-bundled-gems`）：
> 如果执行`bundle install`失败，检查是否安装了基础编译环境`base-devel`
> 需要在仓库根目录执行，不要在里面的目录执行，会执行失败

## 写一篇新文章

文章放在 **`_articles/`** 目录，**文件名随便取，不需要日期**（例如 `_articles/rust学习.md`），
URL 就是 `/posts/<文件名>/`：

```markdown
---
title: "文章标题"
date: 2026-11-03
categories:
  - Rust
---

## 一级小节

正文……
```

- `title`：页面标题（写中文没问题）
- `date`：**只用于文章排序和上下篇**，页面上不显示，写法随意（`2026-11-03` 即可）
- `categories`：决定它出现在 `/categories/` 的哪个分类下
- `toc: false`：关掉左侧目录（默认开启）
- `published: false`：草稿，不发布

## 发布

```bash
git add -A && git commit -m "post: 新文章" && git push
```

推送后 GitHub Actions 自动：`bundle exec jekyll build` → 把 `_site/` 推到 `publish` 分支 →
Pages 发布，约 1 分钟生效。

**仓库只需一次性配置**（已完成过就不用管）：

- Settings → Pages → Source 选 *Deploy from a branch*，Branch 选 `publish` / `/ (root)`
- Settings → Actions → General → Workflow permissions 选 *Read and write permissions*

## 改外观

- 配色/字体：`assets/css/main.css` 顶部的 `:root` 变量（`--fg` / `--bg` / `--link` / `--visited` / `--rule` / `--code-bg`）。
- 标题、简介、作者：`_config.yml` 的 `title` / `description` / `author`。
- 顶部菜单：`_data/navigation.yml`。
