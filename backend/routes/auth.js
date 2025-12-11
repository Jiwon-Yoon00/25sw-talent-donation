const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const User = require('../models/user');

const router = express.Router();

router.post('/join', async (req, res, next) => {
    const { email, password, team } = req.body;
    try {
        const exUser = await User.findOne({ where: { email } });
        if (!exUser) {
            const hash = await bcrypt.hash(password, 12);
            await User.create({
                email,
                password: hash,
                team,
            });
            return res.redirect('/');
        }
        else {
            return res.redirect('/join?error=exist');
        }
    }
    catch (err){
        console.error(err);
        return next(err);
    }
})
router.post('/', (req, res, next) => {
    passport.authenticate('local', (authError, user, info) => {
        if (authError) {
            console.error(authError);
            return next(authError);
        }
        if (!user) {    //비밀번호가 틀려서 로그인에 실패하는 경우.
            return res.redirect(`/?loginError=${info.message}`);
        }
        return req.login(user, (loginError) => {
            if (loginError) {
                console.error(loginError);
                return next(loginError);
            }
            return res.redirect('/');
        });
    })(req, res, next);
});

router.get('/logout', (req, res) => {
    req.logout();
    req.session.destroy();
    // 프런트에 json 형태로 session 종료 알림 전송
    res.json({ message: '로그아웃 되었습니다.' });
});
module.exports = router;