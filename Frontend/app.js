(() => {
  const reveals = document.querySelectorAll(".reveal");

  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if(e.isIntersecting){
        e.target.classList.add("is-visible");
      }
    });
  }, {threshold:0.15});

  reveals.forEach(el => observer.observe(el));
})();
