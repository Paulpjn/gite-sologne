/* =====================================================
   GÎTE DES ÉTANGS DE SOLOGNE — JavaScript principal
   ===================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ---- NAVBAR STICKY ---- */
  const navbar = document.getElementById('navbar');
  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---- MENU BURGER (mobile) ---- */
  const burger = document.querySelector('.nav-burger');
  const navLinks = document.querySelector('.nav-links');

  if (burger && navLinks) {
    burger.addEventListener('click', () => {
      burger.classList.toggle('active');
      navLinks.classList.toggle('open');
      document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
    });

    // Ferme le menu au clic sur un lien
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        burger.classList.remove('active');
        navLinks.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  /* ---- HERO ANIMATION LOAD ---- */
  const hero = document.getElementById('hero');
  if (hero) {
    requestAnimationFrame(() => hero.classList.add('loaded'));
  }

  /* ---- FADE-IN AU SCROLL ---- */
  const fadeEls = document.querySelectorAll('.fade-in');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  fadeEls.forEach(el => observer.observe(el));

  /* ---- LIGHTBOX GALERIE ---- */
  const lightbox     = document.getElementById('lightbox');
  const lbImg        = document.getElementById('lightbox-img');
  const lbCaption    = document.getElementById('lightbox-caption');
  const lbClose      = document.getElementById('lightbox-close');
  const lbPrev       = document.getElementById('lightbox-prev');
  const lbNext       = document.getElementById('lightbox-next');

  const galerieItems = [...document.querySelectorAll('.galerie-item')];
  let currentIndex = 0;

  const openLightbox = (index) => {
    currentIndex = index;
    const item = galerieItems[index];
    lbImg.src = item.dataset.full || item.querySelector('img').src;
    lbCaption.textContent = item.dataset.caption || '';
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
    setTimeout(() => { lbImg.src = ''; }, 300);
  };

  const showPrev = () => openLightbox((currentIndex - 1 + galerieItems.length) % galerieItems.length);
  const showNext = () => openLightbox((currentIndex + 1) % galerieItems.length);

  galerieItems.forEach((item, idx) => {
    item.addEventListener('click', () => openLightbox(idx));
  });

  if (lbClose)  lbClose.addEventListener('click', closeLightbox);
  if (lbPrev)   lbPrev.addEventListener('click', showPrev);
  if (lbNext)   lbNext.addEventListener('click', showNext);

  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (!lightbox?.classList.contains('active')) return;
    if (e.key === 'Escape')      closeLightbox();
    if (e.key === 'ArrowLeft')   showPrev();
    if (e.key === 'ArrowRight')  showNext();
  });

  /* ---- MINI CALENDRIER DISPONIBILITÉS ---- */
  const calWrap = document.getElementById('calendrier');
  if (calWrap) buildCalendar(calWrap);

  function buildCalendar(container) {
    const now = new Date();
    const months = [];
    for (let i = 0; i < 3; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      months.push(d);
    }

    // Dates fictives indisponibles (format YYYY-MM-DD)
    const indisponibles = [
      '2026-07-04','2026-07-05','2026-07-06','2026-07-07',
      '2026-07-08','2026-07-09','2026-07-10','2026-07-11',
      '2026-07-12','2026-07-13','2026-07-14','2026-07-15',
      '2026-07-16','2026-07-17','2026-07-18','2026-07-19',
      '2026-08-08','2026-08-09','2026-08-10','2026-08-11',
      '2026-08-12','2026-08-13','2026-08-14','2026-08-15',
      '2026-08-16','2026-08-17','2026-08-18','2026-08-19',
      '2026-08-20','2026-08-21','2026-08-22','2026-08-23',
    ];

    const monthNames = ['Janvier','Février','Mars','Avril','Mai','Juin',
                        'Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
    const dayNames = ['Lu','Ma','Me','Je','Ve','Sa','Di'];

    const grid = document.createElement('div');
    grid.className = 'cal-grid';

    months.forEach(date => {
      const year  = date.getFullYear();
      const month = date.getMonth();
      const firstDay = new Date(year, month, 1).getDay(); // 0=dim
      const offset = (firstDay + 6) % 7; // lundi en premier
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      const monthEl = document.createElement('div');
      monthEl.className = 'cal-month';
      monthEl.innerHTML = `<h4 class="cal-title">${monthNames[month]} ${year}</h4>`;

      const table = document.createElement('table');
      table.className = 'cal-table';

      const thead = document.createElement('thead');
      thead.innerHTML = `<tr>${dayNames.map(d => `<th>${d}</th>`).join('')}</tr>`;
      table.appendChild(thead);

      const tbody = document.createElement('tbody');
      let row = document.createElement('tr');
      let dayCount = 0;

      // Cellules vides avant le premier jour
      for (let i = 0; i < offset; i++) {
        row.appendChild(document.createElement('td'));
        dayCount++;
      }

      for (let d = 1; d <= daysInMonth; d++) {
        if (dayCount % 7 === 0 && dayCount > 0) {
          tbody.appendChild(row);
          row = document.createElement('tr');
        }

        const td = document.createElement('td');
        td.textContent = d;

        const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
        const cellDate = new Date(year, month, d);
        const today = new Date(); today.setHours(0,0,0,0);

        if (cellDate < today) {
          td.classList.add('cal-past');
        } else if (indisponibles.includes(dateStr)) {
          td.classList.add('cal-indispo');
          td.title = 'Indisponible';
        } else {
          td.classList.add('cal-dispo');
          td.title = 'Disponible';
        }

        row.appendChild(td);
        dayCount++;
      }

      // Rembourrage fin de ligne
      while (dayCount % 7 !== 0) {
        row.appendChild(document.createElement('td'));
        dayCount++;
      }
      tbody.appendChild(row);
      table.appendChild(tbody);
      monthEl.appendChild(table);
      grid.appendChild(monthEl);
    });

    // Légende
    const legende = document.createElement('div');
    legende.className = 'cal-legende';
    legende.innerHTML = `
      <span class="cal-leg-item"><span class="cal-dot cal-dispo"></span> Disponible</span>
      <span class="cal-leg-item"><span class="cal-dot cal-indispo"></span> Indisponible</span>
    `;

    container.appendChild(grid);
    container.appendChild(legende);
  }

  /* ---- FORMULAIRE NETLIFY ---- */
  const form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = new FormData(form);
      try {
        const res = await fetch('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams(data).toString(),
        });
        if (res.ok) {
          form.style.display = 'none';
          document.getElementById('form-success').style.display = 'block';
        } else {
          alert('Une erreur est survenue. Merci de réessayer ou de nous contacter par téléphone.');
        }
      } catch {
        alert('Impossible d\'envoyer le message. Vérifiez votre connexion.');
      }
    });
  }

  /* ---- SCROLL VERS #contact depuis boutons Réserver ---- */
  document.querySelectorAll('[data-scroll-to]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(btn.dataset.scrollTo);
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });

});
