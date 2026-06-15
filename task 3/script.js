const TMDB_API_KEY = "ee5a661ef8d4c404e5be2f47efdb417a";
const TMDB_API_BASE = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

const POSTER_FALLBACK_SVG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='500' height='750' viewBox='0 0 500 750'%3E%3Crect width='500' height='750' fill='%231e293b'/%3E%3Crect x='70' y='120' width='360' height='510' rx='24' fill='%230f172a' stroke='%23334155' stroke-width='3'/%3E%3Ccircle cx='250' cy='290' r='70' fill='%23334155'/%3E%3Cpath d='M160 460 L250 350 L340 460Z' fill='%23334155'/%3E%3Ctext x='250' y='590' text-anchor='middle' font-family='Arial' font-size='32' font-weight='700' fill='%2394a3b8'%3ENo Poster%3C/text%3E%3C/svg%3E";

window.POSTER_FALLBACK_SVG = POSTER_FALLBACK_SVG;
window.handlePosterError = function(img) {
  
  img.onerror = null;
  img.src = POSTER_FALLBACK_SVG;
};

const POSTER_COLOR_PAIRS = [
  ["#6366f1", "#a855f7"], 
  ["#ec4899", "#f97316"], 
  ["#06b6d4", "#3b82f6"], 
  ["#22c55e", "#14b8a6"], 
  ["#f59e0b", "#ef4444"], 
  ["#8b5cf6", "#ec4899"], 
  ["#10b981", "#3b82f6"], 
  ["#f43f5e", "#8b5cf6"], 
];

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function escapeXml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function wrapTitle(title, maxCharsPerLine = 14, maxLines = 3) {
  const words = title.split(" ");
  const lines = [];
  let current = "";
  for (const word of words) {
    if ((current + " " + word).trim().length > maxCharsPerLine && current) {
      lines.push(current.trim());
      current = word;
    } else {
      current = (current + " " + word).trim();
    }
    if (lines.length === maxLines - 1) break;
  }
  if (current) lines.push(current.trim());
  if (lines.length > maxLines) lines.length = maxLines;
  return lines;
}

function generatePosterSVG(title, id) {
  const idx = hashString(title + "_" + id) % POSTER_COLOR_PAIRS.length;
  const [colorA, colorB] = POSTER_COLOR_PAIRS[idx];
  const initial = (title || "?").trim().charAt(0).toUpperCase();
  const lines = wrapTitle(title || "Untitled");
  const lineHeight = 38;
  const startY = 620 - (lines.length - 1) * (lineHeight / 2);

  const textLines = lines
    .map((line, i) => `<text x="250" y="${startY + i * lineHeight}" text-anchor="middle" font-family="Arial, sans-serif" font-size="32" font-weight="700" fill="#ffffff">${escapeXml(line)}</text>`)
    .join("");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="750" viewBox="0 0 500 750">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${colorA}"/>
        <stop offset="100%" stop-color="${colorB}"/>
      </linearGradient>
    </defs>
    <rect width="500" height="750" fill="url(#g)"/>
    <circle cx="250" cy="280" r="90" fill="rgba(255,255,255,0.18)"/>
    <text x="250" y="305" text-anchor="middle" font-family="Arial, sans-serif" font-size="90" font-weight="800" fill="#ffffff">${escapeXml(initial)}</text>
    ${textLines}
    <text x="250" y="700" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" font-weight="600" fill="rgba(255,255,255,0.7)">CineExplorer</text>
  </svg>`;

  return "data:image/svg+xml," + encodeURIComponent(svg);
}

function getPosterUrl(posterPath, size = "w500", movie = null) {
 
  if (state.useOfflineMode || !posterPath) {
    if (movie) return generatePosterSVG(movie.title, movie.id);
    return POSTER_FALLBACK_SVG;
  }
  if (posterPath.startsWith("http")) return posterPath;
  const p = posterPath.startsWith("/") ? posterPath : "/" + posterPath;
  return `${TMDB_IMAGE_BASE}/${size}${p}`;
}

const MOCK_MOVIES = [
  {
    id: 27205, title: "Inception",
    overview: "Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets, is offered a chance to regain his old life as payment for a task considered to be impossible: the implantation of another person's idea into a target's subconscious.",
    poster_path: "/9gk7adHYeZCEwtmllYqhy5fs3ye.jpg",
    backdrop_path: "/s3TBrffK3feEKYd3XmGo2ah0Ze1.jpg",
    release_date: "2010-07-15", vote_average: 8.4, original_language: "en",
    genres: ["Action", "Science Fiction", "Adventure"], runtime: 148, popularity: 98.4
  },
  {
    id: 157336, title: "Interstellar",
    overview: "The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.",
    poster_path: "/gEU2QniE6E7vNIvTaK8vj6fhYhx.jpg",
    backdrop_path: "/xJHokMbNMwEE2yy09ns7Eq3Gd2p.jpg",
    release_date: "2014-11-05", vote_average: 8.4, original_language: "en",
    genres: ["Adventure", "Drama", "Science Fiction"], runtime: 169, popularity: 95.2
  },
  {
    id: 155, title: "The Dark Knight",
    overview: "Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets. The partnership proves effective, but they soon find themselves prey to a reign of chaos unleashed by a rising criminal mastermind known as the Joker.",
    poster_path: "/qJ2tW6WMUDux911r6m7K0etW5Xm.jpg",
    backdrop_path: "/lR7blDZuAnWY6bGzl8YIwKHCh14.jpg",
    release_date: "2008-07-16", vote_average: 8.5, original_language: "en",
    genres: ["Drama", "Action", "Crime", "Thriller"], runtime: 152, popularity: 94.8
  },
  {
    id: 19995, title: "Avatar",
    overview: "In the 22nd century, a paraplegic Marine is dispatched to the moon Pandora on a unique mission, but becomes torn between following his orders and protecting the world he feels is his home.",
    poster_path: "/kyeE2m2Xn6n5xtH0j2Yx04gA0mq.jpg",
    backdrop_path: "/cxEvMVe8A3mpSpdYABfp0rCmwWu.jpg",
    release_date: "2009-12-15", vote_average: 7.6, original_language: "en",
    genres: ["Action", "Adventure", "Fantasy", "Science Fiction"], runtime: 162, popularity: 88.5
  },
  {
    id: 324857, title: "Spider-Man: Into the Spider-Verse",
    overview: "Struggling to find his place in the world while juggling school and family, Brooklyn teen Miles Morales is unexpectedly bitten by a radioactive spider and develops superpowers. When the infamous Kingpin unleashes a portal to other dimensions, alternate versions of Spider-Man pull Miles into their orbit.",
    poster_path: "/iiZZdoQBEYBv6id8su7ImL0oCbD.jpg",
    backdrop_path: "/5wXsEBYj9NMrIMEOp6wQ69bJ3nJ.jpg",
    release_date: "2018-12-06", vote_average: 8.4, original_language: "en",
    genres: ["Animation", "Action", "Adventure", "Science Fiction"], runtime: 117, popularity: 89.2
  },
  {
    id: 603, title: "The Matrix",
    overview: "Set in the 22nd century, The Matrix tells the story of a computer hacker who joins a group of underground insurgents fighting the vast and powerful computers who now rule the earth.",
    poster_path: "/f89U3wzqrjFmZ9Sg6c5sO2jphHw.jpg",
    backdrop_path: "/ncEsesgOJDNrTUED89hYbA117wo.jpg",
    release_date: "1999-03-30", vote_average: 8.2, original_language: "en",
    genres: ["Action", "Science Fiction"], runtime: 136, popularity: 85.6
  },
  {
    id: 299534, title: "Avengers: Endgame",
    overview: "After the devastating events of Avengers: Infinity War, the universe is in ruins. With the help of remaining allies, the Avengers must assemble once more in order to undo Thanos's actions and restore the chaos.",
    poster_path: "/or06ExuOezvJad37ehuxtHNUpwX.jpg",
    backdrop_path: "/7RyHsO4yDXtBv1zUU5mf7O25mZJ.jpg",
    release_date: "2019-04-24", vote_average: 8.3, original_language: "en",
    genres: ["Action", "Adventure", "Science Fiction"], runtime: 181, popularity: 91.0
  },
  {
    id: 680, title: "Pulp Fiction",
    overview: "A burger-loving hitman, his philosophical partner, a drug-addled gangster's moll, and a washed-up boxer converge in this sprawling, comedic crime caper. Their adventures unfurl in three stories that weave in and out of each other.",
    poster_path: "/d5iil4xe7nqr6c5Cj0ONv6MALOH.jpg",
    backdrop_path: "/suaEOtk1N1sgg2MTM7oZd2cfVp3.jpg",
    release_date: "1994-09-10", vote_average: 8.5, original_language: "en",
    genres: ["Thriller", "Crime"], runtime: 154, popularity: 82.4
  },
  {
    id: 13, title: "Forrest Gump",
    overview: "A man with a low IQ has accomplished great things in his life and been present during significant historic events, in each case far exceeding what anyone imagined he could do. Yet his one true love eludes him.",
    poster_path: "/arw2vUYmIY7jd2z6vK6tGWgXArv.jpg",
    backdrop_path: "/qdIMHd4sEfJSckfVJfKQvisL02a.jpg",
    release_date: "1994-06-23", vote_average: 8.5, original_language: "en",
    genres: ["Comedy", "Drama", "Romance"], runtime: 142, popularity: 83.1
  },
  {
    id: 98, title: "Gladiator",
    overview: "A powerful Roman general, betrayed by the corrupt prince Commodus, is reduced to slavery and rises through the ranks of the gladiatorial arena to avenge the murder of his family and his emperor.",
    poster_path: "/ty8kEB4m4WNAD60g0gIY26XzC5G.jpg",
    backdrop_path: "/hND7xm4ib7LkpU3gO5Z1bBLl9Cr.jpg",
    release_date: "2000-05-01", vote_average: 8.2, original_language: "en",
    genres: ["Action", "Drama", "Adventure"], runtime: 155, popularity: 80.5
  },
  {
    id: 496243, title: "Parasite",
    overview: "All unemployed, Ki-taek's family takes a peculiar interest in the wealthy and glamorous Parks for their livelihood until they get entangled in an unexpected incident.",
    poster_path: "/7IiTTjV7Ja60mZ7jSD9vXQjG760.jpg",
    backdrop_path: "/TU9NIjwzjoKPwQHoHshkFcQUCG.jpg",
    release_date: "2019-05-30", vote_average: 8.5, original_language: "ko",
    genres: ["Comedy", "Thriller", "Drama"], runtime: 132, popularity: 78.4
  },
  {
    id: 129, title: "Spirited Away",
    overview: "A young girl, Chihiro, becomes trapped in a strange new world of spirits. When her parents undergo a mysterious transformation, she must summon the courage to work in a bathhouse to free herself and her family.",
    poster_path: "/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg",
    backdrop_path: "/bSXfU4dwZyBA1vMmXvejdRXBvuF.jpg",
    release_date: "2001-07-20", vote_average: 8.5, original_language: "ja",
    genres: ["Animation", "Family", "Fantasy"], runtime: 125, popularity: 76.8
  },
  {
    id: 597, title: "Titanic",
    overview: "101-year-old Rose DeWitt Bukater tells the story of her life aboard the Titanic, 84 years later, recalling how she met her true love Jack Dawson.",
    poster_path: "/9xjZS241Nwk82ewRYj2A5tHKhT1.jpg",
    backdrop_path: "/kHXEpyfl6zqn8a6YuozZUjRONiy.jpg",
    release_date: "1997-11-18", vote_average: 7.9, original_language: "en",
    genres: ["Drama", "Romance"], runtime: 194, popularity: 79.1
  },
  {
    id: 8587, title: "The Lion King",
    overview: "A young lion prince, Simba, is cast out of his pride by his cruel uncle Scar. He grows up in exile until his childhood friend Nala urges him to return and reclaim the kingdom.",
    poster_path: "/sKCr7eEeClpu56wB4n2ja7YgXjW.jpg",
    backdrop_path: "/wXSSTnN6KFYEGKAEVFyY8pfxzDM.jpg",
    release_date: "1994-06-23", vote_average: 8.3, original_language: "en",
    genres: ["Animation", "Family", "Drama"], runtime: 89, popularity: 74.2
  },
  {
    id: 438631, title: "Dune",
    overview: "Paul Atreides must travel to the most dangerous planet in the universe to ensure the future of his family and his people.",
    poster_path: "/d5NXSklXkiLTI3EF6pq4Xo6Q4OI.jpg",
    backdrop_path: "/jYEW5xZkZk2WTrdbMGAPFuBqbDc.jpg",
    release_date: "2021-09-15", vote_average: 7.8, original_language: "en",
    genres: ["Science Fiction", "Adventure"], runtime: 155, popularity: 84.9
  }
];

const GENRE_MAP = {
  28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime",
  99: "Documentary", 18: "Drama", 10751: "Family", 14: "Fantasy", 36: "History",
  27: "Horror", 10402: "Music", 9648: "Mystery", 10749: "Romance", 878: "Science Fiction",
  10770: "TV Movie", 53: "Thriller", 10752: "War", 37: "Western"
};

const state = {
  apiKey: TMDB_API_KEY,
  favorites: JSON.parse(localStorage.getItem("cine_explorer_favorites")) || [],
  searchHistory: JSON.parse(localStorage.getItem("cine_explorer_history")) || [],
  theme: localStorage.getItem("cine_explorer_theme") || "dark",
  currentMovies: [],
  currentPage: 1,
  totalPages: 1,
  currentQuery: "",
  activeFilter: "trending",
  activeSort: "popularity-desc",
  itemsPerPage: 6,
  useOfflineMode: true 
};

const DOM = {
  body: document.body,
  html: document.documentElement,
  searchForm: document.getElementById("search-form"),
  searchInput: document.getElementById("search-input"),
  clearSearchBtn: document.getElementById("clear-search"),
  searchHistoryDropdown: document.getElementById("search-history-dropdown"),
  historyItemsList: document.getElementById("history-items-list"),
  historyChipsSection: document.getElementById("history-chips-section"),
  historyChipsContainer: document.getElementById("history-chips-container"),
  clearHistoryBtn: document.getElementById("clear-history-btn"),
  navHome: document.getElementById("nav-home"),
  navFavorites: document.getElementById("nav-favorites"),
  navSettingsTrigger: document.getElementById("nav-settings-trigger"),
  homeLogo: document.getElementById("home-logo"),
  themeToggle: document.getElementById("theme-toggle"),
  hamburgerBtn: document.getElementById("hamburger-btn"),
  navControls: document.getElementById("nav-controls"),
  heroTitle: document.getElementById("hero-title"),
  heroBg: document.getElementById("hero-bg"),
  heroYear: document.getElementById("hero-year"),
  heroRatingValue: document.getElementById("hero-rating-value"),
  heroLang: document.getElementById("hero-lang"),
  heroDesc: document.getElementById("hero-desc"),
  heroDetailsBtn: document.getElementById("hero-details-btn"),
  heroFavBtn: document.getElementById("hero-fav-btn"),
  gridSectionTitle: document.getElementById("grid-section-title"),
  moviesGrid: document.getElementById("movies-grid"),
  sortSelect: document.getElementById("sort-select"),
  sortWrapper: document.getElementById("sort-wrapper"),
  emptyState: document.getElementById("empty-state"),
  emptyResetBtn: document.getElementById("empty-reset-btn"),
  paginationControls: document.getElementById("pagination-controls"),
  prevPageBtn: document.getElementById("prev-page-btn"),
  nextPageBtn: document.getElementById("next-page-btn"),
  pageNumDisplay: document.getElementById("page-num-display"),
  detailsModal: document.getElementById("details-modal"),
  modalCloseBtn: document.getElementById("modal-close-btn"),
  modalMoviePoster: document.getElementById("modal-movie-poster"),
  modalMovieTitle: document.getElementById("modal-movie-title"),
  modalMovieYear: document.getElementById("modal-movie-year"),
  modalMovieRuntime: document.getElementById("modal-movie-runtime"),
  modalMovieRating: document.getElementById("modal-movie-rating"),
  modalMovieLang: document.getElementById("modal-movie-lang"),
  modalMovieGenres: document.getElementById("modal-movie-genres"),
  modalMovieOverview: document.getElementById("modal-movie-overview"),
  modalFavToggleBtn: document.getElementById("modal-fav-toggle-btn"),
  modalFavText: document.getElementById("modal-fav-text"),
  apiSettingsModal: document.getElementById("api-settings-modal"),
  settingsCloseBtn: document.getElementById("settings-close-btn"),
  settingsCancelBtn: document.getElementById("settings-cancel-btn"),
  apiKeyInput: document.getElementById("api-key-input"),
  apiSettingsForm: document.getElementById("api-settings-form"),
  statusDot: document.getElementById("status-dot"),
  statusText: document.getElementById("status-text"),
  toastMessage: document.getElementById("toast-message"),
  toastIcon: document.getElementById("toast-icon"),
  toastText: document.getElementById("toast-text"),
  scrollTopBtn: document.getElementById("scroll-top-btn"),
  footerFavoritesCount: document.getElementById("footer-favorites-count"),
  footerHistoryCount: document.getElementById("footer-history-count"),
  footerModeStatus: document.getElementById("footer-mode-status")
};

function init() {
  setupTheme();
  setupEventListeners();
  updateApiStatusIndicator();
  updateFooterStats();
  DOM.apiKeyInput.value = state.apiKey;
  loadMovies(true);
}

function setupTheme() {
  DOM.html.setAttribute("data-theme", state.theme);
}

function toggleTheme() {
  state.theme = state.theme === "dark" ? "light" : "dark";
  localStorage.setItem("cine_explorer_theme", state.theme);
  setupTheme();
  showToast("🌗", `Switched to ${state.theme === "dark" ? "Dark" : "Light"} mode`);
}

async function fetchFromTMDB(endpoint, params = {}) {
  const qs = new URLSearchParams({ api_key: state.apiKey, ...params });
  const controller = new AbortController();
  const tid = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(`${TMDB_API_BASE}${endpoint}?${qs}`, {
      signal: controller.signal,
      headers: { Accept: "application/json" }
    });
    clearTimeout(tid);
    if (res.status === 401) throw new Error("Invalid API Key");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    clearTimeout(tid);
    throw err;
  }
}

async function fetchMoviesData() {
  if (state.useOfflineMode) return fetchMockMoviesData();
  try {
    const isSearch = state.activeFilter === "search";
    if (isSearch) {
      const d = await fetchFromTMDB("/search/movie", { query: state.currentQuery, page: state.currentPage });
      return { results: d.results || [], total_pages: d.total_pages || 1 };
    } else {
      const d = await fetchFromTMDB("/trending/movie/day", { page: state.currentPage });
      return { results: d.results || [], total_pages: Math.min(d.total_pages || 1, 10) };
    }
  } catch (err) {
    console.warn("TMDB failed, going offline:", err.message);
    showToast("⚠️", "API unavailable. Using offline data.");
    state.useOfflineMode = true;
    updateApiStatusIndicator();
    return fetchMockMoviesData();
  }
}

async function fetchMockMoviesData() {
  // Small delay so skeletons are visible
  await new Promise(r => setTimeout(r, 400));
  let list = [...MOCK_MOVIES];
  if (state.activeFilter === "search" && state.currentQuery) {
    const q = state.currentQuery.toLowerCase().trim();
    list = list.filter(m =>
      m.title.toLowerCase().includes(q) ||
      m.overview.toLowerCase().includes(q)
    );
  }
  const totalPages = Math.max(Math.ceil(list.length / state.itemsPerPage), 1);
  const start = (state.currentPage - 1) * state.itemsPerPage;
  return { results: list.slice(start, start + state.itemsPerPage), total_pages: totalPages };
}

async function loadMovies(updateSpotlight = false) {
  renderSkeletons();
  DOM.emptyState.style.display = "none";
  DOM.paginationControls.style.display = "none";

  if (state.activeFilter === "favorites") {
    await new Promise(r => setTimeout(r, 300));
    let favList = [...state.favorites];
    if (state.currentQuery) {
      const q = state.currentQuery.toLowerCase().trim();
      favList = favList.filter(m => m.title.toLowerCase().includes(q));
    }
    state.currentMovies = favList;
    state.totalPages = 1;
    renderMovieCards(favList);
    updatePagination();
    updateFooterStats();
    if (updateSpotlight) setupSpotlightMovie(favList[0] || MOCK_MOVIES[0]);
    return;
  }

  try {
    const data = await fetchMoviesData();
    state.currentMovies = data.results;
    state.totalPages = data.total_pages;
    if (!state.currentMovies.length) { renderEmptyState(); return; }
    sortAndRenderGrid();
    if (updateSpotlight && state.currentMovies.length > 0) {
      setupSpotlightMovie(state.currentMovies[0]);
    }
  } catch (err) {
    console.error("loadMovies error:", err);
    renderEmptyState();
  }
}

function sortAndRenderGrid() {
  const sorted = sortMovies(state.currentMovies, state.activeSort);
  renderMovieCards(sorted);
  updatePagination();
  updateFooterStats();
}

function sortMovies(movies, method) {
  return [...movies].sort((a, b) => {
    if (method === "rating-desc") return (b.vote_average || 0) - (a.vote_average || 0);
    if (method === "release_date-desc") return new Date(b.release_date || "1970") - new Date(a.release_date || "1970");
    if (method === "title-asc") return a.title.localeCompare(b.title);
    return (b.popularity || b.vote_average || 0) - (a.popularity || a.vote_average || 0);
  });
}

function setupSpotlightMovie(movie) {
  if (!movie) return;

  const backdropPath = movie.backdrop_path || movie.poster_path;
  if (!state.useOfflineMode && backdropPath) {
    const p = backdropPath.startsWith("/") ? backdropPath : "/" + backdropPath;
    DOM.heroBg.style.backgroundImage = `url('${TMDB_IMAGE_BASE}/w1280${p}')`;
  } else {
  
    const idx = hashString(movie.title + "_" + movie.id) % POSTER_COLOR_PAIRS.length;
    const [colorA, colorB] = POSTER_COLOR_PAIRS[idx];
    DOM.heroBg.style.backgroundImage = `linear-gradient(135deg, ${colorA}, ${colorB})`;
  }

  DOM.heroTitle.textContent = movie.title;
  DOM.heroYear.textContent = (movie.release_date || "").substring(0, 4) || "N/A";
  DOM.heroRatingValue.textContent = (movie.vote_average || 0).toFixed(1);
  DOM.heroLang.textContent = (movie.original_language || "en").toUpperCase();
  DOM.heroDesc.textContent = movie.overview || "No overview available.";

  DOM.heroDetailsBtn.onclick = () => showMovieModal(movie);
  updateSpotlightFavoriteBtn(state.favorites.some(f => f.id === movie.id));
  DOM.heroFavBtn.onclick = () => {
    toggleFavorite(movie);
    updateSpotlightFavoriteBtn(state.favorites.some(f => f.id === movie.id));
  };
}

function updateSpotlightFavoriteBtn(isFav) {
  DOM.heroFavBtn.classList.toggle("btn-primary", isFav);
  DOM.heroFavBtn.classList.toggle("btn-secondary", !isFav);
  DOM.heroFavBtn.querySelector("span").textContent = isFav ? "Favorited" : "Add Favorite";
}

function renderMovieCards(movies) {
  DOM.moviesGrid.innerHTML = "";

  if (!movies.length) {
    renderEmptyState();
    return;
  }

  movies.forEach(movie => {
    const card = document.createElement("div");
    card.className = "movie-card";

    const isFav = state.favorites.some(f => f.id === movie.id);
    const rating = (movie.vote_average || 0).toFixed(1);
    const year = (movie.release_date || "").substring(0, 4) || "N/A";
    const lang = (movie.original_language || "en").toUpperCase();
    const posterUrl = getPosterUrl(movie.poster_path, "w500", movie);

    card.innerHTML = `
      <div class="card-poster-wrapper">
        <span class="card-badge">
          <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
          <span>${rating}</span>
        </span>
        <button class="card-favorite-btn ${isFav ? "active" : ""}" aria-label="Toggle Favorite">
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5"
            fill="${isFav ? "var(--heart-color)" : "none"}" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>
        <img
          class="card-poster"
          src="${posterUrl}"
          alt="${movie.title} Poster"
          loading="eager"
          onerror="handlePosterError(this)"
        >
      </div>
      <div class="card-info">
        <h3 class="card-title">${movie.title}</h3>
        <div class="card-footer-meta">
          <span>${year}</span>
          <span class="card-lang">${lang}</span>
        </div>
        <button class="card-cta-btn">View Details</button>
      </div>
    `;

    const favBtn = card.querySelector(".card-favorite-btn");
    favBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleFavorite(movie);
      const nowFav = state.favorites.some(f => f.id === movie.id);
      favBtn.classList.toggle("active", nowFav);
      favBtn.querySelector("svg").setAttribute("fill", nowFav ? "var(--heart-color)" : "none");
    });

    card.addEventListener("click", (e) => {
      if (!e.target.closest(".card-favorite-btn")) showMovieModal(movie);
    });

    DOM.moviesGrid.appendChild(card);
  });
}

function renderSkeletons() {
  DOM.moviesGrid.innerHTML = "";
  const count = state.activeFilter === "favorites" ? Math.max(state.favorites.length, 3) : 6;
  for (let i = 0; i < count; i++) {
    const skel = document.createElement("div");
    skel.className = "movie-card skeleton-card";
    skel.innerHTML = `
      <div class="card-poster-wrapper skeleton-animation skeleton-poster"></div>
      <div class="card-info">
        <div class="skeleton-animation skeleton-title"></div>
        <div class="skeleton-meta">
          <div class="skeleton-animation skeleton-text"></div>
          <div class="skeleton-animation skeleton-text" style="width:15%"></div>
        </div>
        <div class="skeleton-animation skeleton-btn"></div>
      </div>`;
    DOM.moviesGrid.appendChild(skel);
  }
}

function renderEmptyState() {
  DOM.moviesGrid.innerHTML = "";
  DOM.emptyState.style.display = "flex";
  DOM.paginationControls.style.display = "none";
}

function updatePagination() {
  if (state.activeFilter === "favorites" || state.totalPages <= 1) {
    DOM.paginationControls.style.display = "none";
    return;
  }
  DOM.paginationControls.style.display = "flex";
  DOM.pageNumDisplay.textContent = `Page ${state.currentPage} of ${state.totalPages}`;
  DOM.prevPageBtn.disabled = state.currentPage === 1;
  DOM.nextPageBtn.disabled = state.currentPage === state.totalPages;
}

function showMovieModal(movie) {
  DOM.modalMovieTitle.textContent = movie.title;
  DOM.modalMovieYear.textContent = (movie.release_date || "").substring(0, 4) || "N/A";
  DOM.modalMovieRating.textContent = (movie.vote_average || 0).toFixed(1);
  DOM.modalMovieLang.textContent = (movie.original_language || "en").toUpperCase();
  DOM.modalMovieOverview.textContent = movie.overview || "No overview available.";
  DOM.modalMovieRuntime.textContent = movie.runtime ? `${movie.runtime} min` : "N/A";

  const posterUrl = getPosterUrl(movie.poster_path, "w500", movie);
  DOM.modalMoviePoster.onerror = () => {
    DOM.modalMoviePoster.onerror = null;
    DOM.modalMoviePoster.src = POSTER_FALLBACK_SVG;
  };
  DOM.modalMoviePoster.src = posterUrl;

  const genres = getGenreNames(movie);
  DOM.modalMovieGenres.innerHTML = genres.map(g => `<span class="genre-tag">${g}</span>`).join("");

  updateModalFavoriteBtn(state.favorites.some(f => f.id === movie.id));
  DOM.modalFavToggleBtn.onclick = () => {
    toggleFavorite(movie);
    updateModalFavoriteBtn(state.favorites.some(f => f.id === movie.id));
  };

  DOM.detailsModal.classList.add("active");
  DOM.body.style.overflow = "hidden";
}

function updateModalFavoriteBtn(isFav) {
  DOM.modalFavToggleBtn.classList.toggle("active", isFav);
  DOM.modalFavText.textContent = isFav ? "Favorited" : "Add to Favorites";
}

function closeMovieModal() {
  DOM.detailsModal.classList.remove("active");
  DOM.body.style.overflow = "";
  if (state.activeFilter === "favorites") loadMovies();
}

function getGenreNames(movie) {
  if (movie.genres?.length > 0) {
    return typeof movie.genres[0] === "string" ? movie.genres : movie.genres.map(g => g.name);
  }
  if (movie.genre_ids) return movie.genre_ids.map(id => GENRE_MAP[id]).filter(Boolean);
  return ["Drama"];
}

function toggleFavorite(movie) {
  const idx = state.favorites.findIndex(f => f.id === movie.id);
  if (idx > -1) {
    state.favorites.splice(idx, 1);
    showToast("💔", `Removed "${movie.title}" from favorites`);
  } else {
    state.favorites.push(movie);
    showToast("❤️", `Added "${movie.title}" to favorites`);
  }
  localStorage.setItem("cine_explorer_favorites", JSON.stringify(state.favorites));
  updateFooterStats();
  if (DOM.heroTitle.textContent === movie.title) {
    updateSpotlightFavoriteBtn(idx === -1);
  }
}

function addToHistory(query) {
  if (!query?.trim()) return;
  const clean = query.trim();
  state.searchHistory = state.searchHistory.filter(q => q.toLowerCase() !== clean.toLowerCase());
  state.searchHistory.unshift(clean);
  if (state.searchHistory.length > 8) state.searchHistory.pop();
  localStorage.setItem("cine_explorer_history", JSON.stringify(state.searchHistory));
  renderHistoryDropdown();
  renderHistoryChips();
  updateFooterStats();
}

function removeHistoryItem(index) {
  state.searchHistory.splice(index, 1);
  localStorage.setItem("cine_explorer_history", JSON.stringify(state.searchHistory));
  renderHistoryDropdown();
  renderHistoryChips();
  updateFooterStats();
}

function clearAllHistory() {
  state.searchHistory = [];
  localStorage.setItem("cine_explorer_history", JSON.stringify(state.searchHistory));
  renderHistoryDropdown();
  renderHistoryChips();
  updateFooterStats();
  showToast("🗑️", "Search history cleared");
}

function renderHistoryDropdown() {
  DOM.historyItemsList.innerHTML = "";
  if (!state.searchHistory.length) { DOM.searchHistoryDropdown.classList.remove("active"); return; }
  state.searchHistory.forEach((item, index) => {
    const li = document.createElement("li");
    li.className = "history-item";
    li.innerHTML = `
      <div class="history-text-wrapper">
        <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"
          stroke-linecap="round" stroke-linejoin="round" style="color:var(--text-muted)">
          <circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        <span>${item}</span>
      </div>
      <button type="button" class="delete-history-item" aria-label="Delete">&times;</button>`;
    li.querySelector(".history-text-wrapper").addEventListener("click", () => {
      DOM.searchInput.value = item;
      DOM.clearSearchBtn.style.display = "block";
      DOM.searchHistoryDropdown.classList.remove("active");
      triggerSearch(item);
    });
    li.querySelector(".delete-history-item").addEventListener("click", (e) => {
      e.stopPropagation();
      removeHistoryItem(index);
    });
    DOM.historyItemsList.appendChild(li);
  });
}

function renderHistoryChips() {
  DOM.historyChipsContainer.querySelectorAll(".history-chip").forEach(c => c.remove());
  if (!state.searchHistory.length) { DOM.historyChipsSection.style.display = "none"; return; }
  DOM.historyChipsSection.style.display = "block";
  state.searchHistory.slice(0, 5).forEach((item, index) => {
    const chip = document.createElement("button");
    chip.className = "history-chip";
    chip.innerHTML = `<span>${item}</span><span class="history-chip-remove">&times;</span>`;
    chip.addEventListener("click", (e) => {
      if (!e.target.classList.contains("history-chip-remove")) {
        DOM.searchInput.value = item;
        DOM.clearSearchBtn.style.display = "block";
        triggerSearch(item);
      } else {
        e.stopPropagation();
        removeHistoryItem(index);
      }
    });
    DOM.historyChipsContainer.appendChild(chip);
  });
}

let toastTid = null;
function showToast(icon, message) {
  if (toastTid) { clearTimeout(toastTid); DOM.toastMessage.classList.remove("active"); }
  DOM.toastIcon.textContent = icon;
  DOM.toastText.textContent = message;
  setTimeout(() => DOM.toastMessage.classList.add("active"), 50);
  toastTid = setTimeout(() => DOM.toastMessage.classList.remove("active"), 3000);
}

function openSettings() {
  DOM.apiSettingsModal.classList.add("active");
  DOM.body.style.overflow = "hidden";
  updateApiStatusIndicator();
}
function closeSettings() {
  DOM.apiSettingsModal.classList.remove("active");
  if (!DOM.detailsModal.classList.contains("active")) DOM.body.style.overflow = "";
}
function updateApiStatusIndicator() {
  const offline = state.useOfflineMode || !state.apiKey;
  DOM.statusDot.className = `status-dot ${offline ? "fallback" : "active"}`;
  DOM.statusText.textContent = offline ? "📚 Offline Mode — Using Local Data" : "✅ Live TMDB API Active";
  DOM.footerModeStatus.textContent = offline ? "Offline Mode" : "Live TMDB";
}
function updateFooterStats() {
  DOM.footerFavoritesCount.textContent = state.favorites.length;
  DOM.footerHistoryCount.textContent = state.searchHistory.length;
}

function selectView(viewName) {
  state.activeFilter = viewName;
  state.currentPage = 1;
  DOM.navHome.classList.remove("active");
  DOM.navFavorites.classList.remove("active");
  if (viewName === "trending") {
    DOM.navHome.classList.add("active");
    DOM.gridSectionTitle.textContent = "Trending Movies";
    DOM.sortWrapper.style.display = "flex";
    DOM.searchInput.value = "";
    DOM.clearSearchBtn.style.display = "none";
    state.currentQuery = "";
    loadMovies(true);
  } else if (viewName === "favorites") {
    DOM.navFavorites.classList.add("active");
    DOM.gridSectionTitle.textContent = "My Favorite Movies";
    DOM.sortWrapper.style.display = "flex";
    loadMovies(false);
  }
  DOM.navControls.classList.remove("active");
  DOM.hamburgerBtn.classList.remove("active");
}

function triggerSearch(query) {
  if (!query?.trim()) return;
  state.activeFilter = "search";
  state.currentQuery = query.trim();
  state.currentPage = 1;
  DOM.gridSectionTitle.textContent = `Results for "${state.currentQuery}"`;
  DOM.navHome.classList.remove("active");
  DOM.navFavorites.classList.remove("active");
  addToHistory(state.currentQuery);
  loadMovies(false);
}

function setupEventListeners() {
  DOM.homeLogo.addEventListener("click", (e) => { e.preventDefault(); selectView("trending"); });
  DOM.navHome.addEventListener("click", (e) => { e.preventDefault(); selectView("trending"); });
  DOM.navFavorites.addEventListener("click", (e) => { e.preventDefault(); selectView("favorites"); });
  DOM.navSettingsTrigger.addEventListener("click", (e) => {
    e.preventDefault(); openSettings();
    DOM.navControls.classList.remove("active");
    DOM.hamburgerBtn.classList.remove("active");
  });
  DOM.settingsCloseBtn.addEventListener("click", closeSettings);
  DOM.settingsCancelBtn.addEventListener("click", closeSettings);
  DOM.apiSettingsModal.addEventListener("click", (e) => { if (e.target === DOM.apiSettingsModal) closeSettings(); });
  DOM.apiSettingsForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const key = DOM.apiKeyInput.value.trim();
    state.apiKey = key || TMDB_API_KEY;
    state.useOfflineMode = !key;
    localStorage[key ? "setItem" : "removeItem"]("cine_explorer_key", key);
    showToast(key ? "🔑" : "📚", key ? "API Key saved! Connecting..." : "Using offline mode.");
    closeSettings();
    updateApiStatusIndicator();
    state.currentPage = 1;
    loadMovies(true);
  });
  DOM.themeToggle.addEventListener("click", toggleTheme);
  DOM.hamburgerBtn.addEventListener("click", () => {
    DOM.navControls.classList.toggle("active");
    DOM.hamburgerBtn.classList.toggle("active");
  });
  DOM.searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const q = DOM.searchInput.value.trim();
    if (q) { triggerSearch(q); DOM.searchHistoryDropdown.classList.remove("active"); }
  });
  DOM.searchInput.addEventListener("input", () => {
    DOM.clearSearchBtn.style.display = DOM.searchInput.value.length ? "block" : "none";
    if (DOM.searchInput.value.length && state.searchHistory.length) {
      renderHistoryDropdown();
      DOM.searchHistoryDropdown.classList.add("active");
    } else {
      DOM.searchHistoryDropdown.classList.remove("active");
    }
  });
  DOM.searchInput.addEventListener("focus", () => {
    renderHistoryDropdown();
    if (state.searchHistory.length) DOM.searchHistoryDropdown.classList.add("active");
  });
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".search-wrapper")) DOM.searchHistoryDropdown.classList.remove("active");
  });
  DOM.clearSearchBtn.addEventListener("click", () => {
    DOM.searchInput.value = "";
    DOM.clearSearchBtn.style.display = "none";
    DOM.searchHistoryDropdown.classList.remove("active");
    DOM.searchInput.focus();
  });
  DOM.clearHistoryBtn.addEventListener("click", (e) => { e.preventDefault(); clearAllHistory(); });
  DOM.sortSelect.addEventListener("change", (e) => { state.activeSort = e.target.value; sortAndRenderGrid(); });
  DOM.modalCloseBtn.addEventListener("click", closeMovieModal);
  DOM.detailsModal.addEventListener("click", (e) => { if (e.target === DOM.detailsModal) closeMovieModal(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") { closeMovieModal(); closeSettings(); } });
  DOM.prevPageBtn.addEventListener("click", () => {
    if (state.currentPage > 1) { state.currentPage--; loadMovies(false); DOM.moviesGrid.scrollIntoView({ behavior: "smooth" }); }
  });
  DOM.nextPageBtn.addEventListener("click", () => {
    if (state.currentPage < state.totalPages) { state.currentPage++; loadMovies(false); DOM.moviesGrid.scrollIntoView({ behavior: "smooth" }); }
  });
  DOM.emptyResetBtn.addEventListener("click", () => selectView("trending"));
  window.addEventListener("scroll", () => { DOM.scrollTopBtn.classList.toggle("active", window.scrollY > 400); });
  DOM.scrollTopBtn.addEventListener("click", () => { window.scrollTo({ top: 0, behavior: "smooth" }); });
  renderHistoryChips();
}

window.addEventListener("DOMContentLoaded", init);