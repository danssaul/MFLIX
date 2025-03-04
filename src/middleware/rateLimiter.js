const rateLimit = new Map();

const RATE_LIMIT = 2; 
const TIME_WINDOW = 60 * 1000; 

export function rateLimiter(req, res, next) {
    if (req.method === 'GET' && req.role === 'user') {
        const user = req.user;
        const currentTime = Date.now();

        if (!rateLimit.has(user)) {
            rateLimit.set(user, { count: 1, startTime: currentTime });
        } else {
            const userData = rateLimit.get(user);
            const elapsedTime = currentTime - userData.startTime;

            if (elapsedTime < TIME_WINDOW) {
                if (userData.count >= RATE_LIMIT) {
                    return res.status(429).send({ error: 'Rate limit exceeded' });
                } else {
                    userData.count += 1;
                }
            } else {
                rateLimit.set(user, { count: 1, startTime: currentTime });
            }
        }
    }

    if (req.method === 'PATCH' && req.role === 'premium_user') {
        const user = req.user;
        const movieId = req.params.imdb;

        if (!rateLimit.has(user)) {
            rateLimit.set(user, new Set());
        }

        const ratedMovies = rateLimit.get(user);

        if (ratedMovies.has(movieId)) {
            return res.status(429).send({ error: 'You have already rated this movie' });
        } else {
            ratedMovies.add(movieId);
        }
    }
    next();
}
