// 从正文的 h2 / h3 生成目录（纯前端，几行完事）
(function () {
  var toc = document.getElementById('toc');
  if (!toc) return;

  var content = document.querySelector('.content');
  if (!content) return;

  var heads = content.querySelectorAll('h2, h3');
  if (heads.length < 2) return;

  var list = document.createElement('ul');
  for (var i = 0; i < heads.length; i++) {
    var h = heads[i];
    if (!h.id) continue;

    var li = document.createElement('li');
    if (h.tagName === 'H3') li.className = 'toc-h3';

    var a = document.createElement('a');
    a.href = '#' + h.id;
    a.textContent = h.textContent;
    li.appendChild(a);
    list.appendChild(li);
  }

  if (!list.children.length) return;
  toc.appendChild(list);
  toc.hidden = false;
})();
