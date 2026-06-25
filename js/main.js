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
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

  /* ---- LIGHTBOX GALERIE ---- */
  const lightbox  = document.getElementById('lightbox');
  const lbImg     = document.getElementById('lightbox-img');
  const lbCaption = document.getElementById('lightbox-caption');
  const lbClose   = document.getElementById('lightbox-close');
  const lbPrev    = document.getElementById('lightbox-prev');
  const lbNext    = document.getElementById('lightbox-next');

  let galerieItems = [];
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

  const initLightbox = () => {
    document.querySelectorAll('.galerie-grid').forEach(grid => {
      grid.addEventListener('click', (e) => {
        const item = e.target.closest('.galerie-item');
        if (!item) return;
        galerieItems = [...grid.querySelectorAll('.galerie-item')];
        openLightbox(galerieItems.indexOf(item));
      });
    });
  };

  initLightbox();

  if (lbClose) lbClose.addEventListener('click', closeLightbox);
  if (lbPrev)  lbPrev.addEventListener('click', showPrev);
  if (lbNext)  lbNext.addEventListener('click', showNext);

  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (!lightbox?.classList.contains('active')) return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowLeft')  showPrev();
    if (e.key === 'ArrowRight') showNext();
  });

  /* ---- CHARGEMENT DONNÉES CMS ---- */
  loadCMSData();

  async function loadCMSData() {
    async function fetchJSON(path) {
      try {
        const r = await fetch(path + '?v=' + Date.now(), { cache: 'no-store' });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return await r.json();
      } catch (e) {
        console.error(`[CMS] Erreur chargement ${path} :`, e.message);
        return null;
      }
    }

    const base = '/gite-sologne/_data';
    const [general, propriete, tarifs, proprietaires, galerie, activites, localisation, contact, avis] = await Promise.all([
      fetchJSON(`${base}/general.json`),
      fetchJSON(`${base}/propriete.json`),
      fetchJSON(`${base}/tarifs.json`),
      fetchJSON(`${base}/proprietaires.json`),
      fetchJSON(`${base}/galerie.json`),
      fetchJSON(`${base}/activites.json`),
      fetchJSON(`${base}/localisation.json`),
      fetchJSON(`${base}/contact.json`),
      fetchJSON(`${base}/avis.json`),
    ]);

    applyGeneral(general);
    applyPropriete(propriete);
    applyTarifs(tarifs);
    applyProprietaires(proprietaires);
    applyGalerie(galerie || { interieur: [], exterieur: [] });
    applyActivites(activites);
    applyLocalisation(localisation);
    applyContact(contact);
    applyAvis(avis);
    initGalerieTabs();
    document.querySelectorAll('.galerie-grid .fade-in').forEach(el => observer.observe(el));
    document.querySelectorAll('#cms-activites-grid .fade-in').forEach(el => observer.observe(el));
    document.querySelectorAll('#cms-avis .fade-in').forEach(el => observer.observe(el));
  }

  /* ---- HELPERS ---- */
  const el = (id) => document.getElementById(id);

  const setText = (id, val) => {
    const node = el(id);
    if (node && val !== undefined && val !== null) node.textContent = val;
  };

  const setHTML = (id, html) => {
    const node = el(id);
    if (node && html) node.innerHTML = html;
  };

  const setHref = (id, href) => {
    const node = el(id);
    if (node) node.href = href;
  };

  const setSrc = (id, src) => {
    const node = el(id);
    if (node && src) node.src = src;
  };

  const md2html = (str) =>
    (str || '').split(/\n\n+/).map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('');

  /* ---- FONCTIONS D'APPLICATION ---- */

  function applyGeneral(d) {
    if (!d) return;

    [el('cms-nom-gite'), el('cms-footer-nom')].forEach(node => {
      if (node) node.textContent = d.nom_gite;
    });

    setText('cms-hero-titre', d.titre_hero || d.nom_gite);
    setText('cms-hero-eyebrow', d.slogan);
    setText('cms-hero-slogan', d.description_hero);
    setText('cms-btn-principal', d.btn_principal);
    setText('cms-btn-secondaire', d.btn_secondaire);

    if (d.photo_hero) {
      const heroBg = document.querySelector('.hero-bg');
      if (heroBg) {
        const heroPath = d.photo_hero.startsWith('/images/')
          ? '/gite-sologne' + d.photo_hero
          : d.photo_hero;
        console.log('[CMS] photo hero :', heroPath);
        heroBg.style.backgroundImage = `url("${heroPath}")`;
      }
    }

    document.title = d.nom_gite || document.title;
  }

  function applyPropriete(d) {
    if (!d) return;

    setText('cms-propriete-eyebrow', d.eyebrow);
    setText('cms-propriete-titre', d.titre);
    setText('cms-propriete-accroche', d.accroche);
    if (d.description) setHTML('cms-propriete-desc', md2html(d.description));
    setText('cms-capacite', d.capacite);
    setText('cms-chambres', d.chambres);
    setText('cms-surface', d.surface);
    if (d.photo) setSrc('cms-propriete-img', d.photo);

    const ul = el('cms-equipements');
    if (ul && Array.isArray(d.equipements) && d.equipements.length) {
      ul.innerHTML = d.equipements
        .map(e => `<li>${e.item || e}</li>`)
        .join('');
    }
  }

  function applyTarifs(d) {
    if (!d) return;

    setText('cms-tarifs-eyebrow', d.eyebrow);
    setText('cms-tarifs-titre', d.titre);
    setText('cms-tarifs-accroche', d.accroche);

    const tbody = el('cms-tarifs-tbody');
    if (tbody && Array.isArray(d.saisons) && d.saisons.length) {
      const badgeClasses = ['saison-basse', 'saison-medium', 'saison-haute'];
      tbody.innerHTML = d.saisons.map((s, i) => {
        const badge = badgeClasses[i] || 'saison-basse';
        const nuits = s.sejour_min > 1 ? `${s.sejour_min} nuits` : '1 nuit';
        return `<tr>
          <td><span class="saison-badge ${badge}">${s.nom}</span></td>
          <td>${s.periode}</td>
          <td class="prix-highlight">${s.prix_nuit} €</td>
          <td class="prix-highlight">${s.prix_semaine ? s.prix_semaine + ' €' : '—'}</td>
          <td>${nuits}</td>
        </tr>`;
      }).join('');
    }

    const infosEl = el('cms-tarifs-infos');
    if (infosEl && Array.isArray(d.infos_pratiques) && d.infos_pratiques.length) {
      infosEl.innerHTML = d.infos_pratiques.map(info => `
        <div class="info-card">
          <h4>${info.titre}</h4>
          <p>${info.texte}</p>
        </div>`).join('');
    }
  }

  function applyProprietaires(d) {
    if (!d) return;

    setText('cms-proprio-nom', d.nom);
    if (d.texte) setHTML('cms-proprio-texte', md2html(d.texte));
    if (d.photo) setSrc('cms-proprio-photo', d.photo);
    if (d.citation) setText('cms-proprio-citation', d.citation);
  }

  function applyGalerie(d) {
    if (!d) return;
    renderGalerieGrid('cms-galerie-interieur', d.interieur);
    renderGalerieGrid('cms-galerie-exterieur', d.exterieur);
  }

  function renderGalerieGrid(gridId, photos) {
    const grid = el(gridId);
    if (!grid || !Array.isArray(photos) || !photos.length) return;
    const delays = ['', 'fade-in-delay-1', 'fade-in-delay-2', 'fade-in-delay-3'];
    const sorted = [...photos].sort((a, b) => (a.ordre || 0) - (b.ordre || 0));
    grid.innerHTML = sorted.map((photo, i) => {
      const delay = delays[i % delays.length];
      return `<div class="galerie-item fade-in ${delay}" role="listitem"
                   data-full="${photo.photo}"
                   data-caption="${photo.titre || ''}">
        <img src="${photo.photo}" alt="${photo.titre || ''}" loading="lazy" />
        <div class="galerie-overlay" aria-hidden="true"><span>&#128269;</span></div>
      </div>`;
    }).join('');
  }

  function initGalerieTabs() {
    document.querySelectorAll('.galerie-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.galerie-tab').forEach(t => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        document.querySelectorAll('.galerie-grid').forEach(grid => grid.classList.add('galerie-hidden'));
        el(`cms-galerie-${tab.dataset.tab}`)?.classList.remove('galerie-hidden');
      });
    });
  }

  function applyActivites(d) {
    if (!d) return;
    setText('cms-activites-sous-titre', d.sous_titre);
    setText('cms-activites-titre', d.titre);
    setText('cms-activites-description', d.description);
    const grid = el('cms-activites-grid');
    if (!grid || !Array.isArray(d.activites) || !d.activites.length) return;
    const delays = ['', 'fade-in-delay-1', 'fade-in-delay-2'];
    grid.innerHTML = d.activites.map((a, i) => {
      const delay = delays[i % delays.length];
      return `<article class="activite-card fade-in ${delay}">
        <div class="activite-img">
          <img src="${a.photo || ''}" alt="${a.titre || ''}" loading="lazy" />
        </div>
        <div class="activite-body">
          <span class="activite-icon">${a.icone || ''}</span>
          <h3>${a.titre || ''}</h3>
          <p>${a.description || ''}</p>
        </div>
      </article>`;
    }).join('');
  }

  function applyLocalisation(d) {
    if (!d) return;
    if (d.description) setText('cms-loc-description', d.description);
    if (d.adresse) setHTML('cms-loc-adresse', d.adresse.replace(/\n/g, '<br>'));
    if (d.latitude && d.longitude) {
      const lat = parseFloat(d.latitude);
      const lon = parseFloat(d.longitude);
      const dLon = 0.11, dLat = 0.06;
      const bbox = `${(lon - dLon).toFixed(4)}%2C${(lat - dLat).toFixed(4)}%2C${(lon + dLon).toFixed(4)}%2C${(lat + dLat).toFixed(4)}`;
      const iframe = el('carte-iframe');
      if (iframe) iframe.src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lon}`;
    }
    const distEl = el('cms-loc-distances');
    if (distEl && Array.isArray(d.distances) && d.distances.length) {
      distEl.innerHTML = d.distances.map(dist => `
        <div class="loc-info">
          <span class="loc-icon" aria-hidden="true">${dist.icone || '📍'}</span>
          <div>
            <strong>${dist.label || ''}</strong>
            <span>${(dist.detail || '').replace(/\n/g, '<br>')}</span>
          </div>
        </div>`).join('');
    }
  }

  function applyContact(d) {
    if (!d) return;

    if (d.telephone) {
      const tel = el('cms-contact-tel');
      if (tel) {
        tel.textContent = d.telephone;
        tel.href = 'tel:' + d.telephone.replace(/\s/g, '');
      }
    }

    if (d.email) {
      [el('cms-contact-email'), el('cms-footer-email')].forEach(node => {
        if (node) {
          node.textContent = d.email;
          node.href = 'mailto:' + d.email;
        }
      });
    }

    if (d.message_accueil) setText('cms-contact-message', d.message_accueil);
    if (d.horaires) setText('cms-contact-horaires', d.horaires);
    if (d.heure_arrivee) setText('cms-contact-arrivee', d.heure_arrivee);
    if (d.heure_depart) setText('cms-contact-depart', d.heure_depart);
  }

  function applyAvis(d) {
    const grid = el('cms-avis');
    if (!grid || !d || !Array.isArray(d.avis) || !d.avis.length) return;
    const delays = ['', 'fade-in-delay-1', 'fade-in-delay-2'];
    grid.innerHTML = d.avis.map((a, i) => {
      const note = Math.min(5, Math.max(0, parseInt(a.note) || 0));
      const etoiles = '★'.repeat(note) + '☆'.repeat(5 - note);
      const delay = delays[i % delays.length];
      const dateStr = a.date
        ? new Date(a.date + 'T00:00:00').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
        : '';
      return `<article class="avis-card fade-in ${delay}">
        <div class="avis-etoiles" aria-label="Note : ${note} sur 5">${etoiles}</div>
        <blockquote class="avis-texte">« ${a.texte || ''} »</blockquote>
        <footer class="avis-footer">
          <strong class="avis-auteur">${a.auteur || ''}</strong>
          <span class="avis-meta">
            <time class="avis-date" datetime="${a.date || ''}">${dateStr}</time>${a.source ? ` · ${a.source}` : ''}
          </span>
        </footer>
      </article>`;
    }).join('');
  }

  /* ---- CALENDRIER DISPONIBILITÉS (iCal Airbnb) ---- */
  const calWrap = document.getElementById('calendrier');
  if (calWrap) buildCalendar(calWrap);

  async function buildCalendar(container) {
    const ICAL_WORKER = 'https://gite-sologne-ical.ppajon.workers.dev';
    const PAGE_SIZE    = 3;
    const TOTAL_MONTHS = 12;

    let indisponibles = new Set();
    try {
      const r = await fetch(ICAL_WORKER, { cache: 'no-store' });
      if (r.ok) {
        const data = await r.json();
        indisponibles = new Set(data.dates || []);
      } else {
        console.warn('[Calendrier] Worker iCal :', r.status);
      }
    } catch (e) {
      console.warn('[Calendrier] Impossible de charger les disponibilités :', e.message);
    }

    const monthNames = ['Janvier','Février','Mars','Avril','Mai','Juin',
                        'Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
    const dayNames   = ['Lu','Ma','Me','Je','Ve','Sa','Di'];
    const now        = new Date();
    let page         = 0;

    function buildMonthEl(i) {
      const date        = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const year        = date.getFullYear();
      const month       = date.getMonth();
      const startOffset = (new Date(year, month, 1).getDay() + 6) % 7;
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const today       = new Date(); today.setHours(0, 0, 0, 0);

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

      for (let k = 0; k < startOffset; k++) {
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
        const ymd = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        if (new Date(year, month, d) < today) {
          td.className = 'cal-past';
        } else if (indisponibles.has(ymd)) {
          td.className = 'cal-indispo';
          td.title = 'Indisponible';
        } else {
          td.className = 'cal-dispo';
          td.title = 'Disponible';
        }
        row.appendChild(td);
        dayCount++;
      }
      while (dayCount % 7 !== 0) {
        row.appendChild(document.createElement('td'));
        dayCount++;
      }
      tbody.appendChild(row);
      table.appendChild(tbody);
      monthEl.appendChild(table);
      return monthEl;
    }

    function render() {
      container.innerHTML = '';

      const nav     = document.createElement('div');
      nav.className = 'cal-nav';

      const btnPrev = document.createElement('button');
      btnPrev.className = 'cal-btn';
      btnPrev.innerHTML = '&#8592; Précédent';
      btnPrev.disabled  = page === 0;
      btnPrev.addEventListener('click', () => { page--; render(); });

      const btnNext = document.createElement('button');
      btnNext.className = 'cal-btn';
      btnNext.innerHTML = 'Suivant &#8594;';
      btnNext.disabled  = (page + 1) * PAGE_SIZE >= TOTAL_MONTHS;
      btnNext.addEventListener('click', () => { page++; render(); });

      nav.appendChild(btnPrev);
      nav.appendChild(btnNext);
      container.appendChild(nav);

      const grid    = document.createElement('div');
      grid.className = 'cal-grid';
      const start   = page * PAGE_SIZE;
      for (let i = start; i < Math.min(start + PAGE_SIZE, TOTAL_MONTHS); i++) {
        grid.appendChild(buildMonthEl(i));
      }
      container.appendChild(grid);

      const legende = document.createElement('div');
      legende.className = 'cal-legende';
      legende.innerHTML = `
        <span class="cal-leg-item"><span class="cal-dot cal-dispo"></span> Disponible</span>
        <span class="cal-leg-item"><span class="cal-dot cal-indispo"></span> Indisponible</span>
      `;
      container.appendChild(legende);
    }

    render();
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
