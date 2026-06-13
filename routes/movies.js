const express =
    require("express");

const axios =
    require("axios");

const router =
    express.Router();

router.get(
    "/",
    async (req, res) => {

        try {

            const response =
                await axios.get(
                    "https://api.sampleapis.com/movies/animation"
                );

            const movies =
                await Promise.all(
                    response.data
                        .slice(0, 80)
                        .map(async (
                            movie,
                            index
                        ) => {

                            try {

                                const omdb =
                                    await axios.get(
                                        `https://www.omdbapi.com/?i=${movie.imdbId}&apikey=${process.env.OMDB_API_KEY}`
                                    );

                                return {
                                    id:
                                        index + 1,

                                    title:
                                        movie.title,

                                    posterURL:
                                        omdb.data
                                            .Poster &&
                                        omdb.data
                                            .Poster !==
                                            "N/A"
                                            ? omdb
                                                .data
                                                .Poster
                                            : "https://placehold.co/300x450?text=No+Poster",

                                    imdbId:
                                        movie.imdbId,

                                    description:
                                        omdb
                                            .data
                                            .Plot ||
                                        "Описание отсутствует",

                                    rating:
                                        omdb
                                            .data
                                            .imdbRating ||
                                        "N/A",

                                    year:
                                        omdb
                                            .data
                                            .Year ||
                                        "Неизвестно",

                                    genre:
                                        omdb
                                            .data
                                            .Genre ||
                                        "Неизвестно"
                                };

                            } catch {

                                return {
                                    id:
                                        index + 1,

                                    title:
                                        movie.title,

                                    posterURL:
                                        movie.posterURL ||
                                        "https://placehold.co/300x450?text=No+Poster",

                                    imdbId:
                                        movie.imdbId,

                                    description:
                                        "Описание отсутствует",

                                    rating:
                                        "N/A",

                                    year:
                                        "Неизвестно",

                                    genre:
                                        "Неизвестно"
                                };
                            }
                        })
                );

            res.json(
                movies
            );

        } catch (error) {

            console.error(
                error.message
            );

            res.status(500)
                .json({
                    error:
                        "Ошибка загрузки фильмов"
                });
        }
    }
);

module.exports =
    router;