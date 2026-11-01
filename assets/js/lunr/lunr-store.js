var store = [{
        "title": "使用 Github Pages 和 Hugo 搭建个人博客",
        "excerpt":"一、创建一个Github Pages类型的Repo 在Github上创建一个新的Repository，仓库名称为xxx.github.io，其中xxx为自定义名称。仓库设置为Public，并且默认添加一个README文件。 仓库创建好后通过git clone下到本地备用 二、本地下载Hugo 到Hugo官网上通过指导下载Hugo https://gohugo.io/installation/ Windows通过winget下载更方便 winget install Hugo.Hugo.Extended 三、挑选并自定义Hugo主题 到Hugo主题网站上挑选喜欢的主题 https://themes.gohugo.io/ 大部分主题会在主页上写上安装使用方法，小部分简约型的主题安装比较简单，只需要将你喜欢的主题的Github仓库clone到本地，并覆盖之前新建的Github.io的仓库目录 四、本地运行查看效果 进入仓库目录，可以执行hugo编译静态网站，并通过hugo server在本地上查看生效效果。 五、推送Github仓库 本地准备好之后，可以直接推送到github的远端分支上 六、使用Github Actions提交后自动发布 1、生成Person access tokens Github进入Settings -&gt; Developer Settings -&gt; Personal acces tokens -&gt; Token(classic) 点击Generate new token创建一个新的token，Expiration选择No expiration，scopes勾选上repo、admin:repo_hook 复制保存新生成的token 2、生成Actions secrets Github进入刚创建的仓库，点击Settings -&gt; Security -&gt; Secrets and variables...","categories": ["建站"],
        "tags": ["Hugo","GitHub Pages"],
        "url": "/posts/2024-10-03-github-page-hugo/",
        "teaser": null
      }]
