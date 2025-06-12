// TMDb API key
const apiKey = "737c3b9fda83c5f6c1e009c89cc3557e";

// DOM elements
const moviesContainer = document.getElementById("movies-container");
const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const suggestionsBox = document.getElementById("suggestions");
const genreRow = document.getElementById("genreRow");
const languages = [
  { code: "ta", name: "Tamil" },
  { code: "te", name: "Telugu" },
  { code: "ml", name: "Malayalam" },
  { code: "en", name: "English" },
  { code: "hi", name: "Hindi" },
  { code: "kn", name: "Kannada" },
  { code: "fr", name: "French" },
  { code: "ja", name: "Japanese" }
];


// Load Popular Movies
function fetchPopularMovies(page = 1) {
  fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=en-US&page=${page}`)
    .then(response => response.json())
    .then(data => {
      displayMovies(data.results);
      createPopularPagination(data.total_pages, page);
    })
    .catch(error => {
      console.error("Error loading popular movies:", error);
      moviesContainer.innerHTML = `<p class="text-danger">Failed to load movies.</p>`;
    });
}

function createPopularPagination(totalPages, currentPage) {
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";

  const maxPages = Math.min(totalPages, 1000);
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(startPage + 4, maxPages);

  if (endPage - startPage < 4) {
    startPage = Math.max(1, endPage - 4);
  }

  if (currentPage > 1) {
    const prevBtn = document.createElement("button");
    prevBtn.classList.add("btn", "btn-sm", "btn-outline-light", "m-1");
    prevBtn.innerText = "Previous";
    prevBtn.addEventListener("click", () => {
      fetchPopularMovies(currentPage - 1);
      scrollToTop();
    });
    pagination.appendChild(prevBtn);
  }

  for (let i = startPage; i <= endPage; i++) {
    const btn = document.createElement("button");
    btn.classList.add("btn", "btn-sm", "m-1", i === currentPage ? "btn-success" : "btn-outline-light");
    btn.innerText = i;

    btn.addEventListener("click", () => {
      fetchPopularMovies(i);
      scrollToTop();
    });

    pagination.appendChild(btn);
  }

  if (currentPage < maxPages) {
    const nextBtn = document.createElement("button");
    nextBtn.classList.add("btn", "btn-sm", "btn-outline-light", "m-1");
    nextBtn.innerText = "Next";
    nextBtn.addEventListener("click", () => {
      fetchPopularMovies(currentPage + 1);
      scrollToTop();
    });
    pagination.appendChild(nextBtn);
  }
}

// Display movies in the UI
function displayMovies(movies) {
  moviesContainer.innerHTML = "";
  movies.forEach(movie => {
    const col = document.createElement("div");
    col.classList.add("col");

    const card = `<div class="card bg-dark text-white border-secondary h-100">
    <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" class="card-img-top" alt="${movie.title}">
    <div class="card-body">
    <h5 class="card-title">${movie.title}</h5>
    <button class="btn btn-outline-success btn-sm" onclick='addToWatchlist(${JSON.stringify({
      id: movie.id,
      title: movie.title,
      poster: movie.poster_path
    })})'>Add to Watchlist</button>
    </div>
  </div>
  `;


    col.innerHTML = card;
    moviesContainer.appendChild(col);
  });

  document.querySelectorAll(".btn-sm[data-id]").forEach(button => {
  button.addEventListener("click", () => {
    const movie = {
      id: button.dataset.id,
      title: button.dataset.title,
      poster: button.dataset.poster
    };

    addToWatchlist(movie);
  });
});
}


function addToWatchlist(movie) {
  let watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];

  // Check for duplicates
  if (!watchlist.some(m => m.id === movie.id)) {
    watchlist.push(movie);
    localStorage.setItem("watchlist", JSON.stringify(watchlist));
    alert(`${movie.title} added to your watchlist!`);
  } else {
    alert(`${movie.title} is already in your watchlist.`);
  }
}

searchInput.addEventListener("input", async () => {
    const query = searchInput.value.trim();
    suggestionsBox.innerHTML = "";
    
    if (query.length === 0) {
        suggestionsBox.style.display = "none";
        return;
    }

    const response = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=737c3b9fda83c5f6c1e009c89cc3557e&query=${encodeURIComponent(query)}`);
    const data = await response.json();

    if (data.results.length > 0) {
        data.results.slice(0, 5).forEach(movie => {
            const li = document.createElement("li");
            li.className = "list-group-item list-group-item-action";
            li.textContent = movie.title;
            li.addEventListener("click", () => {
                searchInput.value = movie.title;
                suggestionsBox.style.display = "none";
            });
            suggestionsBox.appendChild(li);
        });
        suggestionsBox.style.display = "block";
    } else {
        suggestionsBox.style.display = "none";
    }
});
document.addEventListener("click", (e) => {
    if (!document.getElementById("searchForm").contains(e.target)) {
        suggestionsBox.style.display = "none";
    }
});

// Handle search
searchForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const query = searchInput.value.trim();
  suggestionsBox.style.display = "none"; 

  if (query) {
    fetch(`https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${query}`)
      .then(response => response.json())
      .then(data => {
        if (data.results.length === 0) {
          document.getElementById("movieSectionHeading").innerText = "";
          moviesContainer.innerHTML = `<p class="text-warning">No results found for "${query}"</p>`;
        }
        else {
          document.getElementById("movieSectionHeading").innerText = "";
          displayMovies(data.results);
        }
      })
      .catch(error => {
        console.error("Search error:", error);
        moviesContainer.innerHTML = `<p class="text-danger">Search failed. Try again later.</p>`;
      });
  }
});

// Load genres for Explore section
function loadGenres() {
  const navbarGenreMenu = document.getElementById("navbarGenreMenu");
  const genreRow = document.getElementById("genreRow");

  fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}&language=en-US`)
    .then(response => response.json())
    .then(data => {
      const excludedGenres = ["Romance", "Documentary"];

      data.genres.forEach(genre => {
        if (!excludedGenres.includes(genre.name)) {
          // 1. Add Genre Button to Explore Category
          const genreCol = document.createElement("div");
          genreCol.classList.add("col-4", "col-md-2", "mb-4");

          genreCol.innerHTML = `
            <button class="btn btn-outline-light w-100" data-genre="${genre.id}">
              ${genre.name}
            </button>
          `;

          genreRow.appendChild(genreCol);

          // 2. Add Genre Link to Navbar Dropdown
          const genreItem = document.createElement("li");
          genreItem.innerHTML = `
            <a class="dropdown-item" href="#" data-genre="${genre.id}">${genre.name}</a>
          `;
          navbarGenreMenu.appendChild(genreItem);
        }
      });

      // Click Event for Explore Category Buttons
      genreRow.addEventListener("click", function (e) {
        if (e.target.dataset.genre) {
          const genreId = e.target.dataset.genre;
          fetchMoviesByGenre(genreId, 1);
        }
      });

      // Click Event for Navbar Genre Links
      navbarGenreMenu.addEventListener("click", function (e) {
        e.preventDefault();
        if (e.target.dataset.genre) {
          const genreId = e.target.dataset.genre;
          fetchMoviesByGenre(genreId, 1);
        }
      });
    })
    .catch(err => {
      console.error("Error loading genres:", err);
    });
}


function loadLanguages() {
  const navbarLanguageMenu = document.getElementById("navbarLanguageMenu");

  languages.forEach(lang => {
    const langItem = document.createElement("li");
    langItem.innerHTML = `
      <a class="dropdown-item" href="#" data-lang="${lang.code}">${lang.name}</a>
    `;
    navbarLanguageMenu.appendChild(langItem);
  });

  navbarLanguageMenu.addEventListener("click", function (e) {
  e.preventDefault();
  if (e.target.dataset.lang) {
    const langCode = e.target.dataset.lang;
    const langName = languages.find(l => l.code === langCode)?.name || "Selected";
    document.getElementById("movieSectionHeading").innerText = `${langName} Movies`;
    fetchMoviesByLanguage(langCode, 1);
  }
});

}


function fetchMoviesByGenre(genreId, page = 1) {
  fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}&language=en-US`)
    .then(response => response.json())
    .then(genreData => {
      const genreName = genreData.genres.find(g => g.id == genreId)?.name || "Genre";
      document.getElementById("movieSectionHeading").innerText = `${genreName} Movies`;

      return fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=${genreId}&page=${page}`);
    })
    .then(res => res.json())
    .then(data => {
      displayMovies(data.results);
      createGenrePagination(data.total_pages, genreId, page); 
    })
    .catch(err => {
      moviesContainer.innerHTML = `<p class="text-danger">Couldn't load genre movies.</p>`;
      console.error("Genre fetch error:", err);
    });
}


function fetchMoviesByLanguage(langCode, page = 1) {
  fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_original_language=${langCode}&page=${page}`)
    .then(res => res.json())
    .then(data => {
      displayMovies(data.results);
      createPagination(data.total_pages, langCode, page);
    })
    .catch(err => {
      moviesContainer.innerHTML = `<p class="text-danger">Couldn't load movies in selected language.</p>`;
      console.error("Language fetch error:", err);
    });
}

function createGenrePagination(totalPages, genreId, currentPage) {
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";

  const maxPages = Math.min(totalPages, 1000);
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(startPage + 4, maxPages);

  if (endPage - startPage < 4) {
    startPage = Math.max(1, endPage - 4);
  }

  if (currentPage > 1) {
    const prevBtn = document.createElement("button");
    prevBtn.classList.add("btn", "btn-sm", "btn-outline-light", "m-1");
    prevBtn.innerText = "Previous";
    prevBtn.addEventListener("click", () => {
      fetchMoviesByGenre(genreId, currentPage - 1);
      scrollToTop();
    });
    pagination.appendChild(prevBtn);
  }

  for (let i = startPage; i <= endPage; i++) {
    const btn = document.createElement("button");
    btn.classList.add("btn", "btn-sm", "m-1", i === currentPage ? "btn-success" : "btn-outline-light");
    btn.innerText = i;

    btn.addEventListener("click", () => {
      fetchMoviesByGenre(genreId, i);
      scrollToTop();
    });

    pagination.appendChild(btn);
  }

  if (currentPage < maxPages) {
    const nextBtn = document.createElement("button");
    nextBtn.classList.add("btn", "btn-sm", "btn-outline-light", "m-1");
    nextBtn.innerText = "Next";
    nextBtn.addEventListener("click", () => {
      fetchMoviesByGenre(genreId, currentPage + 1);
      scrollToTop();
    });
    pagination.appendChild(nextBtn);
  }
}


function createPagination(totalPages, langCode, currentPage) {
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";

  const maxPages = Math.min(totalPages, 1000); // TMDb max is 1000
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(startPage + 4, maxPages);

  // Adjust if near the end
  if (endPage - startPage < 4) {
    startPage = Math.max(1, endPage - 4);
  }

  // Previous Button
  if (currentPage > 1) {
    const prevBtn = document.createElement("button");
    prevBtn.classList.add("btn", "btn-sm", "btn-outline-light", "m-1");
    prevBtn.innerText = "Previous";
    prevBtn.addEventListener("click", () => {
      fetchMoviesByLanguage(langCode, currentPage - 1);
      scrollToTop();
    });
    pagination.appendChild(prevBtn);
  }

  // Page Numbers
  for (let i = startPage; i <= endPage; i++) {
    const btn = document.createElement("button");
    btn.classList.add("btn", "btn-sm", "m-1", i === currentPage ? "btn-success" : "btn-outline-light");
    btn.innerText = i;

    btn.addEventListener("click", () => {
      fetchMoviesByLanguage(langCode, i);
      scrollToTop();
    });

    pagination.appendChild(btn);
  }

  // Next Button
  if (currentPage < maxPages) {
    const nextBtn = document.createElement("button");
    nextBtn.classList.add("btn", "btn-sm", "btn-outline-light", "m-1");
    nextBtn.innerText = "Next";
    nextBtn.addEventListener("click", () => {
      fetchMoviesByLanguage(langCode, currentPage + 1);
      scrollToTop();
    });
    pagination.appendChild(nextBtn);
  }
}

document.getElementById("watchlistLink").addEventListener("click", function (e) {
  e.preventDefault(); // Prevent navigation
  displayWatchlist();
});

function displayWatchlist() {
  const watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];

    document.getElementById("pagination").innerHTML = ""; 
  document.getElementById("movieSectionHeading").innerText = "Your Watchlist";

  if (watchlist.length === 0) {
    moviesContainer.innerHTML = `<p class="text-warning">Your watchlist is empty.</p>`;
    return;
  }

  moviesContainer.innerHTML = "";

  watchlist.forEach(movie => {
    const col = document.createElement("div");
    col.classList.add("col");

    const card = `
      <div class="card bg-dark text-white border-secondary h-100">
        <img src="https://image.tmdb.org/t/p/w500${movie.poster}" class="card-img-top" alt="${movie.title}">
        <div class="card-body">
          <h5 class="card-title">${movie.title}</h5>
          <button class="btn btn-outline-danger btn-sm remove-btn" data-id="${movie.id}">Remove</button>
        </div>
      </div>
    `;

    col.innerHTML = card;
    moviesContainer.appendChild(col);
  });

  // Handle remove
  document.querySelectorAll(".remove-btn").forEach(btn => {
    btn.addEventListener("click", function () {
      const movieId = this.dataset.id;
      const updatedList = watchlist.filter(m => m.id != movieId);
      localStorage.setItem("watchlist", JSON.stringify(updatedList));
      displayWatchlist(); // Refresh after removing
    });
  });
}

function addToWatchlist(movie) {
  let watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];
  if (watchlist.find(m => m.id === movie.id)) {
    alert(`${movie.title} is already in your watchlist`);
    return;
  }
  watchlist.push(movie);
  localStorage.setItem("watchlist", JSON.stringify(watchlist));
  alert(`${movie.title} added to your watchlist`);
}

document.getElementById("homeLink").addEventListener("click", function (e) {
  e.preventDefault();
  document.getElementById("movieSectionHeading").innerText = "Popular Movies";
  fetchPopularMovies(1);
  scrollToTop();
});


function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


fetchPopularMovies(1); 
loadGenres();
loadLanguages();
