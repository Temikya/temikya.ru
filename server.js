require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const morgan = require("morgan");

const moviesRoutes = require("./routes/movies");
const aiRoutes = require("./routes/ai");

const app = express();


// ======================
// MIDDLEWARE
// ======================

app.use(cors({
    origin: [
        "https://temikya.ru",
        "https://www.temikya.ru"
    ]
}));

app.use(express.json());


// ======================
// LOGGER
// ======================

app.use(
    morgan(
        ":method :url :status :response-time ms"
    )
);


// ======================
// REQUEST LOGGER
// ======================

app.use((req, res, next) => {

    console.log(
        `📩 ${req.method} ${req.url}`
    );

    next();
});


// ======================
// API ROUTES
// ======================

app.use(
    "/api/movies",
    moviesRoutes
);

app.use(
    "/api/ai",
    aiRoutes
);


// ======================
// STATIC FRONTEND
// ======================

app.use(
    express.static(
        path.join(
            __dirname,
            "public"
        )
    )
);


// ======================
// MAIN PAGE
// ======================

app.get("/", (req, res) => {

    res.sendFile(
        path.join(
            __dirname,
            "public",
            "index.html"
        )
    );
});


// ======================
// GLOBAL ERROR HANDLER
// ======================

app.use(
    (
        err,
        req,
        res,
        next
    ) => {

        console.error(
            "❌ SERVER ERROR:"
        );

        console.error(err);

        res.status(500).json({
            error:
                "Ошибка сервера"
        });
    }
);


// ======================
// SERVER START
// ======================

const PORT =
    process.env.PORT || 5000;

app.listen(PORT, () => {

    console.log(`
🚀 Server running
🌍 http://localhost:${PORT}
    `);
});


