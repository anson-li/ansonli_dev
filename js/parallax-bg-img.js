window.addEventListener('scroll', function (e) {
  var scrolled = window.pageYOffset;
  const background = document.querySelector('.bg-img');
  background.style.top = (scrolled * 0) - 150 + 'px';
});