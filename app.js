const request = require('request');
const cheerio = require('cheerio');
const cors = require('cors');

// Express App
let app = require('express')();
app.use(cors());
let port = process.env.PORT || 3000;

const fetchMovies = (pageId) => {
    return new Promise((resolve, reject) => {
        request(`https://yts.ag/browse-movies?page=${pageId}`, (err, response, body) => {
            let $ = cheerio.load(body)
            let movies = [];
            $('.browse-movie-wrap').each((i, elem) => {
                let movie = {
                    title: $(elem).find('.browse-movie-title').text(),
                    year: $(elem).find('.browse-movie-year').text(),
                    page: $(elem).find('.browse-movie-link').attr('href'),
                    rating: $(elem).find('.rating').text().split(' ')[0],
                    imgSrc : $(elem).find('figure img').attr('data-cfsrc'),
                    genre : [],
                    link: []
                }
                $(elem).find('figcaption').find('h4').each((i, e) => {
                    if (i!== 0)
                        movie.genre.push($(e).text())
                });
                $(elem).find('.browse-movie-tags a').each( (i, e) => {
                    let quality = $(e).text();
                    let link = $(e).attr('href')
                    movie.link.push({quality, link});
                });
                movies.push(movie)
            });
            resolve(movies);
        });
    });
}

app.get('/:pageId', (req, res) => {
    fetchMovies(req.params.pageId)
        .then(movies => res.json(movies))
});

app.get('*', (req, res) => {
    res.redirect('/1');
})

app.listen(port, () => {
    console.log('Listening at port', port);
});