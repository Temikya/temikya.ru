const container =
    document.getElementById(
        "moviesContainer"
    );

const searchInput =
    document.getElementById(
        "searchInput"
    );

const genreFilter =
    document.getElementById(
        "genreFilter"
    );

const ratingFilter =
    document.getElementById(
        "ratingFilter"
    );

const yearFilter =
    document.getElementById(
        "yearFilter"
    );

const aiBtn =
    document.getElementById(
        "aiBtn"
    );

const aiInput =
    document.getElementById(
        "aiInput"
    );

const aiResponse =
    document.getElementById(
        "aiResponse"
    );

let allMovies = [];


// ======================
// LOAD MOVIES
// ======================

async function loadMovies() {

    try {

        const response =
            await fetch(
                "/api/movies"
            );

        const movies =
            await response.json();

        allMovies =
            movies;

        fillFilters(
            movies
        );

        renderMovies(
            movies
        );

    } catch (error) {

        console.error(
            "Ошибка загрузки:",
            error
        );
    }
}


// ======================
// RENDER MOVIES
// ======================

function renderMovies(
    movies
) {

    container.innerHTML =
        "";

    movies.forEach(
        movie => {

            const poster =
                movie.posterURL ||
                "https://placehold.co/300x450?text=No+Poster";

            const description =
                movie.description
                    ? movie.description
                        .slice(0, 100)
                        + "..."
                    : "Описание отсутствует";

            const card =
`
<div class="movie-card">

    <img
        src="${poster}"
        onerror="
this.src='https://placehold.co/300x450?text=No+Poster'
        "
    >

    <div class="movie-info">

        <h3>
            ${movie.title}
        </h3>

        <p class="movie-year">
            📅 ${movie.year || "—"}
        </p>

        <p class="movie-rating">
            ⭐ ${movie.rating || "—"}
        </p>

        <p class="movie-description">
            ${description}
        </p>

    </div>

</div>
`;

            const wrapper =
                document.createElement(
                    "div"
                );

            wrapper.innerHTML =
                card;

            const cardElement =
                wrapper.firstElementChild;

            // КЛИК ПО КАРТОЧКЕ
            cardElement.addEventListener(
                "click",
                () => {

                    openMovie(
                        movie
                    );
                }
            );

            container.appendChild(
                cardElement
            );
        }
    );
}


// ======================
// MOVIE MODAL
// ======================

function openMovie(
    movie
) {

    const modal =
        document.createElement(
            "div"
        );

    modal.className =
        "movie-modal";

    modal.innerHTML =
`
<div class="movie-modal-content">

    <span class="close-modal">
        ✖
    </span>

    <img
        src="${movie.posterURL}"
        onerror="
this.src='https://placehold.co/300x450?text=No+Poster'
        "
    >

    <div class="movie-modal-info">

        <h2>
            ${movie.title}
        </h2>

        <p>
            ⭐ Рейтинг:
            ${movie.rating || "—"}
        </p>

        <p>
            📅 Год:
            ${movie.year || "—"}
        </p>

        <p>
            🎭 Жанр:
            ${movie.genre || "Не указан"}
        </p>

        <br>

        <p>
            ${movie.description ||
            "Описание отсутствует"}
        </p>

    </div>

</div>
`;

    document.body.appendChild(
        modal
    );

    modal
        .querySelector(
            ".close-modal"
        )
        .addEventListener(
            "click",
            () => {

                modal.remove();
            }
        );

    modal.addEventListener(
        "click",
        (e) => {

            if (
                e.target === modal
            ) {

                modal.remove();
            }
        }
    );
}


// ======================
// FILTERS
// ======================

function fillFilters(
    movies
) {

    genreFilter.innerHTML =
        `<option value="">
Все жанры
</option>`;

    yearFilter.innerHTML =
        `<option value="">
Все годы
</option>`;

    const genres =
        new Set();

    const years =
        new Set();

    movies.forEach(
        movie => {

            if (
                movie.genre
            ) {

                movie.genre
                    .split(",")

                    .forEach(
                        g => genres.add(
                            g.trim()
                        )
                    );
            }

            if (
                movie.year
            ) {

                years.add(
                    movie.year
                );
            }
        }
    );

    [...genres]
        .sort()

        .forEach(g => {

            genreFilter.innerHTML +=
`
<option value="${g}">
${g}
</option>
`;
        });

    [...years]
        .sort((a, b) => b - a)

        .forEach(y => {

            yearFilter.innerHTML +=
`
<option value="${y}">
${y}
</option>
`;
        });
}


function applyFilters() {

    const text =
        searchInput.value
            .toLowerCase();

    const genre =
        genreFilter.value;

    const rating =
        ratingFilter.value;

    const year =
        yearFilter.value;

    const filtered =
        allMovies.filter(
            movie => {

                const search =
                    movie.title
                        ?.toLowerCase()
                        .includes(
                            text
                        );

                const genreOk =
                    !genre ||
                    movie.genre?.includes(
                        genre
                    );

                const ratingOk =
                    !rating ||
                    parseFloat(
                        movie.rating || 0
                    ) >= rating;

                const yearOk =
                    !year ||
                    String(
                        movie.year
                    ) === year;

                return (
                    search &&
                    genreOk &&
                    ratingOk &&
                    yearOk
                );
            }
        );

    renderMovies(
        filtered
    );
}


searchInput.addEventListener(
    "input",
    applyFilters
);

genreFilter.addEventListener(
    "change",
    applyFilters
);

ratingFilter.addEventListener(
    "change",
    applyFilters
);

yearFilter.addEventListener(
    "change",
    applyFilters
);


// ======================
// AI
// ======================

aiBtn.addEventListener(
    "click",

    async () => {

        const prompt =
            aiInput.value.trim();

        if (!prompt) {

            return;
        }

        aiResponse.innerHTML =
`
<div class="ai-loading">
🤖 ИИ подбирает фильмы...
</div>
`;

        try {

            const response =
                await fetch(
                    "/api/ai",
                    {
                        method:
                            "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({
                                prompt,
                                movies:
                                    allMovies
                            })
                    }
                );

            const data =
                await response.json();

            let html =
`
<h3>
🤖 Рекомендации
</h3>

<p>
${data.text || ""}
</p>

<div class="ai-movies">
`;

            data.movies?.forEach(
                movie => {

                    html +=
`
<div class="ai-card">

    <img
        src="${movie.posterURL}"
    >

    <div>

        <h4>
            ${movie.title}
        </h4>

        <p>
            ⭐ ${movie.rating}
        </p>

        <p>
            📅 ${movie.year}
        </p>

        <p>
            ${movie.reason}
        </p>

    </div>

</div>
`;
                }
            );

            html +=
`
</div>
`;

            aiResponse.innerHTML =
                html;

        } catch (error) {

            console.error(
                error
            );

            aiResponse.innerHTML =
                "Ошибка AI 😥";
        }
    }
);


// ======================

loadMovies();