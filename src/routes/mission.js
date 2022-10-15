import missionController from '../controllers/mission.controller';
import middlewareController from '../controllers/middlewareController';

import express from 'express';
const router = express.Router();

const userRoute = (app) => {
    router.get('/mission/list', middlewareController, missionController.listMission);
    router.get('/mission/my', middlewareController, missionController.myMission);
    router.get('/mission/confirm', middlewareController, missionController.confirmMission);
    router.get('/mission/history', middlewareController, missionController.historyMission);
    router.post('/mission/confirm/id', middlewareController, missionController.confirmMissionID);
    router.post('/mission/new', middlewareController, missionController.newMission);
    router.get('/list/banner', missionController.listBanner);

    return app.use('/api/webapi', router);
};

export default userRoute;
