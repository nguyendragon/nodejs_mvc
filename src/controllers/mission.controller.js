import createError from 'http-errors';
import Mission from '../models/mission.model';

const random = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

function randomStr(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

const listMission = async (req, res, next) => {
    try {
        let token = req.headers['x-access-token'];
        let data = await Mission.listMission(token);

        // let { money, username, money_2, id_user, ...other } = data[0];
        return res.status(200).json({
            status: 'ok',
            data,
            message: 'Success',
        });
    } catch (error) {
        next(error);
    }
};

const listBanner = async (req, res, next) => {
    try {
        let data = await Mission.listBanner();
        return res.status(200).json({
            status: 'ok',
            data,
            message: 'Success',
        });
    } catch (error) {
        next(error);
    }
};

const myMission = async (req, res, next) => {
    try {
        let id_mission = req.query.id_mission;
        let token = req.headers['x-access-token'];
        let data = await Mission.myMission(token, id_mission);

        // let { money, username, money_2, id_user, ...other } = data[0];
        return res.status(200).json({
            status: 'ok',
            data,
            message: 'Success',
        });
    } catch (error) {
        next(error);
    }
};

const newMission = async (req, res, next) => {
    try {
        let level = req.body.level;
        let token = req.headers['x-access-token'];
        let data = await Mission.newMission(token, level);

        // let { money, username, money_2, id_user, ...other } = data[0];
        return res.status(200).json({
            status: 'ok',
            data,
            message: 'Success',
        });
    } catch (error) {
        next(error);
    }
};

const confirmMission = async (req, res, next) => {
    try {
        let id_mission = req.query.id_mission;
        let token = req.headers['x-access-token'];
        let data = await Mission.confirmMission(token, id_mission);

        // let { money, username, money_2, id_user, ...other } = data[0];
        return res.status(200).json({
            status: 'ok',
            data,
            message: 'Success',
        });
    } catch (error) {
        next(error);
    }
};

const confirmMissionID = async (req, res, next) => {
    try {
        let id_mission = req.body.id_mission;
        let token = req.headers['x-access-token'];
        let data = await Mission.confirmMissionID(token, id_mission);
        return res.status(200).json({
            status: 'ok',
            data,
            message: 'Success',
        });
    } catch (error) {
        next(error);
    }
};

const historyMission = async (req, res, next) => {
    try {
        let type_history = req.query.type;
        let token = req.headers['x-access-token'];
        let data = await Mission.historyMission(token, type_history);
        return res.status(200).json({
            status: 'ok',
            data,
            message: 'Success',
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    listMission,
    myMission,
    newMission,
    confirmMission,
    confirmMissionID,
    historyMission,
    listBanner,
};
