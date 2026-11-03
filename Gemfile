source "https://rubygems.org"

# 极简方案：Jekyll 4 + 官方插件，无第三方主题依赖
gem "jekyll", "~> 4.4"

gem "jekyll-sitemap" # sitemap.xml

# Ruby 3.x 不再内置 webrick，`jekyll serve` 需要它
gem "webrick", "~> 1.8"

# Ruby 3.4 起 csv / logger / bigdecimal 从默认 gem 降级为 bundled gem，
# 依赖链里仍有 require，这里显式声明以保证本地能跑
gem "csv"
gem "logger"
gem "bigdecimal"
