const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

passport.use('local',new LocalStrategy({    //서버 실행시 한번만 수행되서 local 로그인 전략을 등록함.
    usernameField: 'email', // req.body.email에서 찾아옴.(input의 name 속성과 일치하는 이름(폼데이터가 서버로 전송되니까))
    passwordField: 'password', // req.body.password에서 찾아옴.(input의 name 속성과 일치하는 이름(폼데이터가 서버로 전송되니까))
}, async (email, password, done) => {
    try {
        const authuser = await User.findOne({ where: { email } });
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