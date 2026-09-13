document.querySelectorAll('.faq-cat-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.faq-cat-btn').forEach(b => b.classList.remove('is-active'));
    btn.classList.add('is-active');
    const cat = btn.dataset.cat;
    document.querySelectorAll('.faq-group').forEach(g => {
      g.style.display = (cat === 'all' || g.dataset.group === cat) ? '' : 'none';
    });
  });
});
