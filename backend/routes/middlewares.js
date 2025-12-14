exports.isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.status(403).send('로그인이 필요합니다.');
    }
};
exports.isNotLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()) {
        next();
    } else {
        res.status(302).send('이미 로그인한 상태입니다.');
    }
};
exports.checkType = (req, res, next) => {
    if(req.params.type === 'short' || req.params.type === 'long') {
        next();
    } else {
        res.status(400).send('유효하지 않은 게임 타입입니다. (short, long) 둘 중 하나여야 합니다.')
    }
};