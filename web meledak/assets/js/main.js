const CLINIC_CONFIG = {
  name: "Praktek Dokter Umum dr. Suwanda Hendrawan, MARS",
  whatsappNumber: "6287762780631",
  gallery: [
    {
      src: "assets/images/ruang-periksa-1.jpg",
      width: 768,
      height: 1024,
      title: "Ruang Periksa dan Konsultasi Dokter Utama",
      category: "periksa",
      badge: "Ruang Periksa",
      desc: "Ruang pemeriksaan dokter ber-AC yang dilengkapi meja konsultasi, ranjang periksa pasien, tiang infus, dan wastafel cuci tangan medis."
    },
    {
      src: "assets/images/ruang-tunggu-1.jpg",
      width: 1024,
      height: 576,
      title: "Ruang Tunggu Pasien dan Keluarga",
      category: "tunggu",
      badge: "Ruang Tunggu",
      desc: "Deretan kursi tunggu pasien yang bersih dan nyaman dengan sirkulasi udara sejuk untuk pasien dan keluarga pengantar."
    },
    {
      src: "assets/images/area-pendaftaran.jpg",
      width: 1024,
      height: 576,
      title: "Ruang Resepsionis dan Pendaftaran Pasien",
      category: "resepsionis",
      badge: "Resepsionis",
      desc: "Meja administrasi penerimaan pasien untuk pendaftaran awal, pencatatan rekam medis, dan informasi antrean konsultasi."
    }
  ]
};

document.addEventListener("DOMContentLoaded", () => {
  setupThemeToggle();
  setupMobileNavigation();
  setupOperationalSchedule();
  setupFacilityGallery();
  setupServicePreselect();
  setupBookingForm();
  setupScrollSpy();
});

function setupThemeToggle() {
  const btn = document.getElementById("theme-toggle-btn");
  const label = document.getElementById("theme-toggle-label");
  if (!btn || !label) return;

  let savedTheme = null;
  try {
    savedTheme = localStorage.getItem("clinic_theme");
  } catch (e) {
    savedTheme = null;
  }

  const initialTheme = savedTheme === "dark" ? "dark" : "light";
  applyTheme(initialTheme);

  btn.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
    const next = current === "dark" ? "light" : "dark";
    applyTheme(next);
    try {
      localStorage.setItem("clinic_theme", next);
    } catch (e) {
      // Ignore storage error in restricted browsing modes.
    }
  });

  function applyTheme(theme) {
    if (theme === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
      btn.setAttribute("aria-pressed", "true");
      label.textContent = "Tema Terang";
    } else {
      document.documentElement.removeAttribute("data-theme");
      btn.setAttribute("aria-pressed", "false");
      label.textContent = "Tema Gelap";
    }
  }
}

function setupMobileNavigation() {
  const btn = document.getElementById("mobile-menu-btn");
  const drawer = document.getElementById("mobile-menu-drawer");
  if (!btn || !drawer) return;

  function closeDrawer(returnFocus) {
    drawer.classList.remove("is-open");
    btn.setAttribute("aria-expanded", "false");
    if (returnFocus) btn.focus();
  }

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = drawer.classList.toggle("is-open");
    btn.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  drawer.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => closeDrawer(false));
  });

  document.addEventListener("click", (e) => {
    if (drawer.classList.contains("is-open") && !drawer.contains(e.target) && !btn.contains(e.target)) {
      closeDrawer(false);
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && drawer.classList.contains("is-open")) {
      closeDrawer(true);
    }
  });
}

function setupOperationalSchedule() {
  const statusChips = document.querySelectorAll(".live-status-chip");
  const statusTexts = document.querySelectorAll(".live-status-text");
  const timeOutput = document.getElementById("current-wib-time");
  const dayCheckSelect = document.getElementById("schedule-day-checker");
  const dayCheckResult = document.getElementById("schedule-checker-result");

  function evaluateWibSchedule() {
    const now = new Date();
    // Convert client clock to WIB (UTC+7) so schedule status stays accurate regardless of visitor timezone.
    const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
    const wib = new Date(utcMs + 7 * 3600000);

    const day = wib.getDay();
    const hours = wib.getHours();
    const minutes = wib.getMinutes();
    const totalMinutes = hours * 60 + minutes;

    const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const pad = (n) => String(n).padStart(2, "0");
    if (timeOutput) {
      timeOutput.textContent = `${dayNames[day]}, ${pad(hours)}.${pad(minutes)} WIB`;
    }

    document.querySelectorAll("[data-schedule-group]").forEach((row) => {
      const group = row.getAttribute("data-schedule-group");
      row.classList.remove("is-today");
      const badge = row.querySelector(".today-badge");
      if (badge) badge.hidden = true;

      const isMatch =
        (group === "weekday" && day >= 1 && day <= 5) ||
        (group === "saturday" && day === 6) ||
        (group === "sunday" && day === 0);

      if (isMatch) {
        row.classList.add("is-today");
        if (badge) badge.hidden = false;
      }
    });

    let isOpen = false;
    let label = "";

    if (day >= 1 && day <= 5) {
      if (totalMinutes >= 360 && totalMinutes < 420) {
        isOpen = true;
        label = "Sedang Buka: Sesi Pagi (06.00 - 07.00 WIB)";
      } else if (totalMinutes >= 1080 && totalMinutes < 1260) {
        isOpen = true;
        label = "Sedang Buka: Sesi Sore (18.00 - 21.00 WIB)";
      } else if (totalMinutes < 360) {
        label = "Sedang Tutup: Buka Pagi Pukul 06.00 WIB";
      } else if (totalMinutes >= 420 && totalMinutes < 1080) {
        label = "Istirahat Siang: Buka Kembali Pukul 18.00 WIB";
      } else {
        label = "Sedang Tutup: Buka Besok Pukul 06.00 WIB";
      }
    } else if (day === 6) {
      if (totalMinutes >= 360 && totalMinutes < 420) {
        isOpen = true;
        label = "Sedang Buka: Sabtu Pagi (06.00 - 07.00 WIB)";
      } else if (totalMinutes < 360) {
        label = "Sedang Tutup: Buka Sabtu Pukul 06.00 WIB";
      } else {
        label = "Sabtu Sore Libur: Buka Minggu Pukul 08.00 WIB";
      }
    } else {
      if (totalMinutes >= 480 && totalMinutes < 1260) {
        isOpen = true;
        label = "Sedang Buka: Layanan Minggu (08.00 - 21.00 WIB)";
      } else if (totalMinutes < 480) {
        label = "Sedang Tutup: Buka Minggu Pukul 08.00 WIB";
      } else {
        label = "Sedang Tutup: Buka Senin Pukul 06.00 WIB";
      }
    }

    statusTexts.forEach((el) => {
      el.textContent = label;
    });

    statusChips.forEach((chip) => {
      chip.classList.remove("status-chip--open", "status-chip--closed");
      chip.classList.add(isOpen ? "status-chip--open" : "status-chip--closed");
    });
  }

  evaluateWibSchedule();
  setInterval(evaluateWibSchedule, 30000);

  if (dayCheckSelect && dayCheckResult) {
    const descriptions = {
      weekday: "Senin s/d Jumat: Buka Sesi Pagi (06.00 - 07.00 WIB) dan Sesi Sore (18.00 - 21.00 WIB).",
      saturday: "Sabtu: Buka Sesi Pagi (06.00 - 07.00 WIB). Sesi Sore LIBUR.",
      sunday: "Minggu: Buka penuh dari pagi hingga malam (08.00 - 21.00 WIB)."
    };
    dayCheckSelect.addEventListener("change", () => {
      const val = dayCheckSelect.value;
      dayCheckResult.textContent = descriptions[val] || descriptions.weekday;
    });
  }
}

function setupFacilityGallery() {
  const filterTabs = document.querySelectorAll(".filter-tab");
  const galleryCards = document.querySelectorAll(".gallery-card");
  const searchInput = document.getElementById("gallery-search-input");
  const resetBtn = document.getElementById("gallery-reset-btn");
  const emptyResetBtn = document.getElementById("gallery-empty-reset-btn");
  const retryErrorBtn = document.getElementById("gallery-error-retry-btn");
  const emptyBox = document.getElementById("gallery-empty-state");
  const loadingBox = document.getElementById("gallery-loading-state");
  const errorBox = document.getElementById("gallery-error-state");
  const countLabel = document.getElementById("gallery-count-label");

  let activeCategory = "all";
  let searchQuery = "";

  function applyGalleryFilter() {
    if (errorBox) errorBox.hidden = true;
    let visibleCount = 0;

    galleryCards.forEach((card) => {
      const category = card.getAttribute("data-category");
      const title = (card.getAttribute("data-title") || "").toLowerCase();
      const matchCat = activeCategory === "all" || category === activeCategory;
      const matchQuery = !searchQuery || title.includes(searchQuery);

      if (matchCat && matchQuery) {
        card.hidden = false;
        visibleCount++;
      } else {
        card.hidden = true;
      }
    });

    if (countLabel) {
      countLabel.textContent = `Menampilkan ${visibleCount} dari ${galleryCards.length} dokumentasi fasilitas`;
    }

    if (emptyBox) {
      emptyBox.hidden = visibleCount > 0;
    }
  }

  filterTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      activeCategory = tab.getAttribute("data-filter") || "all";
      filterTabs.forEach((t) => t.setAttribute("aria-selected", "false"));
      tab.setAttribute("aria-selected", "true");

      if (loadingBox) {
        loadingBox.hidden = false;
        setTimeout(() => {
          loadingBox.hidden = true;
          applyGalleryFilter();
        }, 120);
      } else {
        applyGalleryFilter();
      }
    });
  });

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      searchQuery = searchInput.value.trim().toLowerCase();
      applyGalleryFilter();
    });
  }

  function resetAllFilters() {
    activeCategory = "all";
    searchQuery = "";
    if (searchInput) searchInput.value = "";
    filterTabs.forEach((t) => {
      t.setAttribute("aria-selected", t.getAttribute("data-filter") === "all" ? "true" : "false");
    });
    applyGalleryFilter();
  }

  if (resetBtn) resetBtn.addEventListener("click", resetAllFilters);
  if (emptyResetBtn) emptyResetBtn.addEventListener("click", resetAllFilters);
  if (retryErrorBtn) retryErrorBtn.addEventListener("click", resetAllFilters);

  // Show error state if any gallery image fails to load.
  document.querySelectorAll(".gallery-card img").forEach((img) => {
    img.addEventListener("error", () => {
      if (errorBox) errorBox.hidden = false;
    });
  });

  // Lightbox dialog logic with focus restoration.
  const modal = document.getElementById("lightbox-modal");
  const modalImg = document.getElementById("lightbox-img");
  const modalTitle = document.getElementById("lightbox-title");
  const modalDesc = document.getElementById("lightbox-desc");
  const modalBadge = document.getElementById("lightbox-badge");
  const modalCounter = document.getElementById("lightbox-counter");
  const closeBtn = document.getElementById("lightbox-close");
  const prevBtn = document.getElementById("lightbox-prev");
  const nextBtn = document.getElementById("lightbox-next");

  let currentIndex = 0;
  let lastTriggerEl = null;

  function openLightbox(index, triggerEl) {
    if (!modal) return;
    if (triggerEl) lastTriggerEl = triggerEl;

    currentIndex = (index + CLINIC_CONFIG.gallery.length) % CLINIC_CONFIG.gallery.length;
    const item = CLINIC_CONFIG.gallery[currentIndex];
    if (!item) return;

    modalImg.src = item.src;
    modalImg.width = item.width;
    modalImg.height = item.height;
    modalImg.alt = item.title;
    modalTitle.textContent = item.title;
    modalDesc.textContent = item.desc;
    modalBadge.textContent = item.badge;
    modalCounter.textContent = `Foto ${currentIndex + 1} dari ${CLINIC_CONFIG.gallery.length}`;

    modal.hidden = false;
    document.body.style.overflow = "hidden";
    if (closeBtn) closeBtn.focus();
  }

  function closeLightbox() {
    if (!modal) return;
    modal.hidden = true;
    document.body.style.overflow = "";
    if (lastTriggerEl && typeof lastTriggerEl.focus === "function") {
      lastTriggerEl.focus();
    }
  }

  document.querySelectorAll("[data-lightbox-index]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.getAttribute("data-lightbox-index"), 10);
      openLightbox(idx, btn);
    });
  });

  if (closeBtn) closeBtn.addEventListener("click", closeLightbox);
  if (prevBtn) prevBtn.addEventListener("click", () => openLightbox(currentIndex - 1));
  if (nextBtn) nextBtn.addEventListener("click", () => openLightbox(currentIndex + 1));

  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeLightbox();
    });
  }

  document.addEventListener("keydown", (e) => {
    if (!modal || modal.hidden) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") openLightbox(currentIndex - 1);
    if (e.key === "ArrowRight") openLightbox(currentIndex + 1);
  });
}

function setupServicePreselect() {
  const buttons = document.querySelectorAll("[data-select-service]");
  const select = document.getElementById("booking-service");
  const formSection = document.getElementById("form-pendaftaran");

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const service = btn.getAttribute("data-select-service");
      if (select && service) {
        select.value = service;
      }
      if (formSection) {
        formSection.scrollIntoView({ behavior: "smooth", block: "start" });
        if (select) select.focus();
      }
    });
  });
}

function setupBookingForm() {
  const form = document.getElementById("whatsapp-booking-form");
  const errorBox = document.getElementById("form-error-state");
  const errorText = document.getElementById("form-error-text");
  const loadingBox = document.getElementById("form-loading-state");
  const successBox = document.getElementById("form-success-state");
  const directWaLink = document.getElementById("form-direct-wa-link");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (errorBox) errorBox.hidden = true;
    if (successBox) successBox.hidden = true;

    const nameInput = document.getElementById("booking-name");
    const ageInput = document.getElementById("booking-age");
    const categorySelect = document.getElementById("booking-category");
    const serviceSelect = document.getElementById("booking-service");
    const sessionSelect = document.getElementById("booking-session");
    const notesInput = document.getElementById("booking-notes");

    const name = nameInput ? nameInput.value.trim() : "";
    const age = ageInput ? ageInput.value.trim() : "";
    const category = categorySelect ? categorySelect.value : "Pasien Dewasa";
    const service = serviceSelect ? serviceSelect.value : "";
    const session = sessionSelect ? sessionSelect.value : "";
    const notes = notesInput ? notesInput.value.trim() : "";

    if (!name || name.length < 2) {
      if (errorBox && errorText) {
        errorText.textContent = "Mohon isi nama lengkap pasien minimal 2 karakter sebelum mengirim pendaftaran.";
        errorBox.hidden = false;
      }
      if (nameInput) nameInput.focus();
      return;
    }

    if (age && (Number(age) < 0 || Number(age) > 120)) {
      if (errorBox && errorText) {
        errorText.textContent = "Usia pasien harus berada di antara 0 sampai 120 tahun.";
        errorBox.hidden = false;
      }
      if (ageInput) ageInput.focus();
      return;
    }

    const lines = [
      `Halo Admin *${CLINIC_CONFIG.name}*,`,
      `Saya ingin mendaftar layanan kesehatan dengan data berikut:`,
      ``,
      `*Nama Pasien:* ${name}`,
      `*Usia / Kategori:* ${age ? age + " Tahun" : "Tidak diisi"} (${category})`,
      `*Layanan:* ${service}`,
      `*Jadwal Sesi:* ${session}`,
      `*Keluhan / Catatan:* ${notes || "Pemeriksaan dan konsultasi langsung di klinik"}`,
      ``,
      `Mohon informasi nomor antrean atau ketersediaan jadwal. Terima kasih.`
    ];

    const waUrl = `https://wa.me/${CLINIC_CONFIG.whatsappNumber}?text=${encodeURIComponent(lines.join("\n"))}`;

    if (loadingBox) loadingBox.hidden = false;

    setTimeout(() => {
      if (loadingBox) loadingBox.hidden = true;
      if (directWaLink) directWaLink.href = waUrl;
      if (successBox) successBox.hidden = false;
      window.open(waUrl, "_blank", "noopener,noreferrer");
    }, 220);
  });
}

function setupScrollSpy() {
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav-item");

  window.addEventListener("scroll", () => {
    let activeId = "";
    const offset = window.scrollY + 140;

    sections.forEach((sec) => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      if (offset >= top && offset < top + height) {
        activeId = sec.getAttribute("id") || "";
      }
    });

    navLinks.forEach((link) => {
      if (link.getAttribute("href") === `#${activeId}`) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });
  });
}
