import AccountService from '../service/AccountService.js'

export async function rateLimiter(req, res, next) {
    try {
        const account = await AccountService.getAccountByEmail(req.user);
        if (!account) {
            return res.status(404).send({ error: 'Account not found' });
        }
        const isUser = req.role === 'user';
        const hasVoted = account.moviesVoted.includes(Number(req.params.imdb));
        if (isUser && hasVoted) {
            return res.status(429).send({ error: 'Rate limit exceeded' });
        }
        next();
    } catch (error) {
        res.status(500).send({ error: 'Internal server error' });
    }
}
