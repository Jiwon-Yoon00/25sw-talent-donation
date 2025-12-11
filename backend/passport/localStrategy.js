const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

passport.use('local',new LocalStrategy({    //서버 실행시 한번만 수행되서 local 로그인 전략을 등록함.
    usernameField: 'username', // req.body.username에서 찾아옴.(frontend에서 axios로 보낼 때의 키 값)
    passwordField: 'password', // req.body.password에서 찾아옴.(frontend에서 axios로 보낼 때의 키 값)
}, async (username, password, done) => {
    try {
        const authuser = await User.findOne({ where: { username } });
        if(authuser){
            const result = await bcrypt.compare(password, authuser.password);
            if(result){
                return done(null, authuser);
            } else {
                done(null, false, { message: '비밀번호가 일치하지 않습니다.' });
            }
        }
    }
    catch (err){
        console.error(err);
        done(err);
    }
}));

passport.serializeUser((user, done) => {  
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findOne({ where: { id } })
    .then(user => done(null, user))
    .catch(err => done(err));
});