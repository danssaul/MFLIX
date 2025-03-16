import AccountService from '../service/AccountService.js'
const REQS_LIMIT = 2;
const TIME_WINDOW = 60 * 1000;

export async function reqLimiter(req, res, next) {
    try {
        const account = await AccountService.getAccountByEmail(req.user);
        if (!account) {
            return res.status(404).send({ error: 'Account not found' });
        }
        
        const currentTime = Date.now();
        
        if (currentTime - account.lastResetTime > TIME_WINDOW) {
            await AccountService.resetRequestCount(account.email, currentTime);
            account.numRequest = 0;
            account.lastResetTime = currentTime;
        }

        if (req.role === 'user' && account.numRequest >= REQS_LIMIT) {
            return res.status(429).send({ error: 'Number of requests exceeded' });
        }
        
        await AccountService.incrementRequestCount(account.email);
        next();
    } catch (error) {
        res.status(500).send({ error: 'Internal server error' });
    }
}
