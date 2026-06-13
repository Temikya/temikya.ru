const express = require("express");
const OpenAI = require("openai");

const router = express.Router();

const openai = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1"
});

router.post("/", async (req, res) => {

    try {

        const { prompt, movies } = req.body;

        if (!prompt) {
            return res.status(400).json({
                answer: "Введите запрос"
            });
        }

        const movieList = movies
            .slice(0, 80)
            .map(movie => ({
                title: movie.title,
                year: movie.year,
                rating: movie.rating,
                genre: movie.genre,
                description: movie.description,
                posterURL: movie.posterURL,
                imdbId: movie.imdbId
            }));

        const completion =
            await openai.chat.completions.create({

                model: "openai/gpt-4o-mini",

                messages: [
                    {
                        role: "system",
                        content: `
Ты AI помощник по фильмам.

Нужно:
- подобрать 5 фильмов
- учитывать настроение пользователя
- выбирать ТОЛЬКО из списка

Ответ верни ТОЛЬКО JSON.

Формат:

{
  "text": "краткое вступление",
  "movies": [
    {
      "title": "",
      "reason": ""
    }
  ]
}
`
                    },

                    {
                        role: "user",
                        content: `
Запрос: ${prompt}

Список фильмов:
${JSON.stringify(movieList)}
`
                    }
                ]
            });

        const answer =
            completion.choices[0]
            .message.content;

        let parsed;

        try {
            parsed = JSON.parse(answer);
        } catch {

            return res.json({
                answer:
                    "ИИ не смог подобрать фильмы 😥"
            });
        }

        const recommendedMovies =
            parsed.movies.map(aiMovie => {

                const found =
                    movies.find(
                        movie =>
                            movie.title
                                .toLowerCase()
                                .includes(
                                    aiMovie.title
                                        .toLowerCase()
                                )
                    );

                return {
                    ...found,
                    reason:
                        aiMovie.reason
                };
            })
            .filter(Boolean);

        res.json({
            text: parsed.text,
            movies: recommendedMovies
        });

    } catch (error) {

        console.error(
            error.response?.data ||
            error.message
        );

        res.status(500).json({
            answer:
                "Ошибка AI 😥"
        });
    }
});

module.exports = router;