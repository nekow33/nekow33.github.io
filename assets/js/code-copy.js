// 给每个代码块加一个"复制"按钮
(function () {
  var blocks = document.querySelectorAll('.highlight, pre');

  blocks.forEach(function (block) {
    if (block.tagName === 'PRE') {
      var parent = block.parentElement;
      if (parent && parent.classList.contains('highlight')) return;
    }
    if (block.querySelector('.copy-btn')) return;

    var pre = block.tagName === 'PRE' ? block : block.querySelector('pre');
    if (!pre) return;

    if (getComputedStyle(block).position === 'static') {
      block.style.position = 'relative';
    }

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'copy-btn';
    btn.textContent = '复制';

    btn.addEventListener('click', function () {
      var text = pre.innerText;
      var done = function () {
        btn.textContent = '已复制';
        btn.classList.add('copied');
        setTimeout(function () {
          btn.textContent = '复制';
          btn.classList.remove('copied');
        }, 1500);
      };

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done);
      } else {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); done(); } catch (e) { /* ignore */ }
        document.body.removeChild(ta);
      }
    });

    block.appendChild(btn);
  });
})();
