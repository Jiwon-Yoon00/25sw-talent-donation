const express = require('express');
const Score = require('../models/score');
const User = require('../models/user');
const { fn, col, literal } = require('sequelize');
const { isLoggedIn, checkType } = require('./middlewares')

const router = express.Router();

//프런트의 DB 요청을 처리하는 라우터입니다.

//랭킹정보를 요청했을때, 상위 10명을 반환합니다.
router.get('/info', isLoggedIn, async (req, res, next) => {
    try {
        const school = req.user.school;
        const top10 = await Score.findAll({
            attributes: [
                'user_id',
                [fn('MAX', col('avg_wpm')), 'maxAvgWpm'],
            ],
            // include: [{
            //     model: User,
            //     as: 'user',
            //     attributes: ['username', 'name', 'school'],
            //     where: { school },
            //     required: true,
            // }],
            // group: ['Score.user_id', 'user.user_id', 'user.school'],
            group: ['Score.user_id'],
            order: [[literal('maxAvgWpm'), 'DESC']],
            limit: 10,
            raw: true,
            // nest: true,
        });
        return res.status(200).json(top10)
    } catch (err) {
        console.error(err);
        return next(err);
    }
});

//긴 글, 짧은 글(long, short) 타입별로 요약(통계)정보를 반환합니다.
//프런트에서 요청해주실 때, api/summaryCards/short나 api/summaryCards/long 형태로 요청해주시면 됩니다.
router.get('/summaryCards/:type', isLoggedIn, checkType, async (req, res, next) => {
  try {
    const { type } = req.params;
    const user_id = req.user.user_id;

    const stats = await Score.findOne({
      where: { user_id, type },
      attributes: [
        'user_id',
        'avg_wpm',
        'max_wpm',
        'accuracy',
        'elapsedTime',
        'createdAt',    
      ],
        order: [["createdAt", 'DESC']],
        limit: 10,
        raw: true,
    });

    return res.status(200).json(stats);
  } catch (err) {
    console.error(err);
    return next(err);
  }
});

//api/practice 경로로 post 요청해주시면, 해당 요청을 받아서 데이터베이스에 저장합니다.
router.post('/practice', isLoggedIn, async (req, res, next) => {
    try {
        const { avgWpm, maxWpm, elapsedTime, accuracy, type } = req.body;
        await Score.create({
            user_id: req.user.user_id,
            avgWpm,
            maxWpm,
            elapsedTime,
            accuracy,
            type,
        });
        return res.status(201).json({
            message: '연습 기록 저장 완료',
        })
    }catch (err){
        console.error(err);
        return next(err);
    }
});
// router.get('/summaryCards/:type', isLoggedIn, checkType, async (req, res, next) => {
//   try {
//     const { type } = req.params;
//     const user_id = req.user.user_id;

//     const stats = await Score.findOne({
//       where: { user_id, type },
//       attributes: [
//         [fn('COUNT', col('id')), 'totalGames'],     
//         [fn('MAX', col('avg_wpm')), 'bestAvgWpm'],  
//         [fn('AVG', col('avg_wpm')), 'avgWpm'],
//         [fn('AVG', col('accuracy')), 'avgAccuracy'],
//       ],
//       raw: true,
//     });

//     return res.status(200).json({
//       totalGames: Number(stats?.totalGames ?? 0),
//       bestavgWpmData: Number(stats?.bestAvgWpm ?? 0),
//       avgWpmData: Number(stats?.avgWpm ?? 0),
//       avgAccuracyData: Number(stats?.avgAccuracy ?? 0),
//     });
//   } catch (err) {
//     console.error(err);
//     return next(err);
//   }
// });
module.exprorts = router;