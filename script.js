(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Typing effect
  const roles = ["CAD Automation Engineer", "Data Analyst", "Python Developer", "AI-assisted Web Builder"];
  const typed = document.getElementById("typed");
  let r = 0, c = 0, deleting = false;
  function type() {
    const word = roles[r];
    typed.textContent = word.slice(0, c);
    if (!deleting && c === word.length) { deleting = true; return setTimeout(type, 1500); }
    if (deleting && c === 0) { deleting = false; r = (r + 1) % roles.length; }
    c += deleting ? -1 : 1;
    setTimeout(type, deleting ? 40 : 80);
  }
  if (reduceMotion) typed.textContent = roles[0]; else type();

  // Nav + scroll progress
  const nav = document.getElementById("nav");
  const progress = document.getElementById("progress");
  window.addEventListener("scroll", () => {
    nav.classList.toggle("scrolled", window.scrollY > 20);
    const h = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + "%";
  }, { passive: true });

  const navLinks = document.getElementById("navLinks");
  document.getElementById("menuBtn").addEventListener("click", () => navLinks.classList.toggle("open"));
  navLinks.addEventListener("click", () => navLinks.classList.remove("open"));

  // Reveal on scroll + counters
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("visible");
      e.target.querySelectorAll("[data-count]").forEach(countUp);
      io.unobserve(e.target);
    });
  }, { threshold: 0.15 });
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

  function countUp(el) {
    const target = +el.dataset.count;
    let n = 0;
    const step = () => {
      n += 1;
      el.textContent = n;
      if (n < target) setTimeout(step, 250);
    };
    step();
  }

  // 3D tilt on project cards
  if (!reduceMotion) {
    document.querySelectorAll(".tilt").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const b = card.getBoundingClientRect();
        const x = (e.clientX - b.left) / b.width - 0.5;
        const y = (e.clientY - b.top) / b.height - 0.5;
        card.style.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-4px)`;
      });
      card.addEventListener("mouseleave", () => { card.style.transform = ""; });
    });
  }

  document.getElementById("year").textContent = new Date().getFullYear();

  // Particle network background
  const canvas = document.getElementById("bg");
  const ctx = canvas.getContext("2d");
  let w, h, pts;
  const mouse = { x: -999, y: -999 };

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    const count = Math.min(90, Math.floor((w * h) / 18000));
    pts = Array.from({ length: count }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
    }));
  }
  window.addEventListener("resize", resize);
  window.addEventListener("mousemove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
  resize();

  function draw() {
    ctx.clearRect(0, 0, w, h);
    for (const p of pts) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1.6, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(56,189,248,0.7)";
      ctx.fill();
    }
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
        if (d < 130) {
          ctx.strokeStyle = `rgba(167,139,250,${0.18 * (1 - d / 130)})`;
          ctx.beginPath();
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[j].x, pts[j].y);
          ctx.stroke();
        }
      }
      const m = Math.hypot(pts[i].x - mouse.x, pts[i].y - mouse.y);
      if (m < 160) {
        ctx.strokeStyle = `rgba(244,114,182,${0.4 * (1 - m / 160)})`;
        ctx.beginPath();
        ctx.moveTo(pts[i].x, pts[i].y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.stroke();
      }
    }
    requestAnimationFrame(draw);
  }
  if (!reduceMotion) draw();
})();
