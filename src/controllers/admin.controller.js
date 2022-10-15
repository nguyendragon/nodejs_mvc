import createError from 'http-errors';
import Admin from '../models/admin.model';

const random = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

const Login = async (req, res, next) => {
    try {
        const data = req.body;
        let result = await Admin.Login(data);
        return res.status(200).json({
            status: 'ok',
            data: result,
            message: 'Đăng nhập thành công',
        });
    } catch (error) {
        next(error);
    }
};

const CheckAdmin = async (req, res, next) => {
    try {
        let token = req.headers['x-access-token'];
        let result = await Admin.CheckAdmin(token);
        return res.status(200).json({
            status: 'ok',
            type: result.type,
        });
    } catch (error) {
        next(error);
    }
};

const listLevel = async (req, res, next) => {
    try {
        let result = await Admin.listLevel();
        return res.status(200).json({
            status: 'ok',
            result,
        });
    } catch (error) {
        next(error);
    }
};

const listMission = async (req, res, next) => {
    try {
        let result = await Admin.listMission();
        return res.status(200).json({
            status: 'ok',
            result,
        });
    } catch (error) {
        next(error);
    }
};

const listRecharge = async (req, res, next) => {
    try {
        let result = await Admin.listRecharge();
        return res.status(200).json({
            status: 'ok',
            result,
        });
    } catch (error) {
        next(error);
    }
};

const listRechargeAll = async (req, res, next) => {
    try {
        let result = await Admin.listRechargeAll();
        return res.status(200).json({
            status: 'ok',
            result,
        });
    } catch (error) {
        next(error);
    }
};

const listWithdrawAll = async (req, res, next) => {
    try {
        let result = await Admin.listWithdrawAll();
        return res.status(200).json({
            status: 'ok',
            result,
        });
    } catch (error) {
        next(error);
    }
};

const listWithdraw = async (req, res, next) => {
    try {
        let result = await Admin.listWithdraw();
        return res.status(200).json({
            status: 'ok',
            result,
        });
    } catch (error) {
        next(error);
    }
};

const listUsers = async (req, res, next) => {
    try {
        let result = await Admin.listUsers();
        return res.status(200).json({
            status: 'ok',
            result,
        });
    } catch (error) {
        next(error);
    }
};

const listSettings = async (req, res, next) => {
    try {
        let result = await Admin.listSettings();
        return res.status(200).json({
            status: 'ok',
            result,
        });
    } catch (error) {
        next(error);
    }
};

const listAnalytics = async (req, res, next) => {
    try {
        let result = await Admin.listAnalytics();
        return res.status(200).json({
            status: 'ok',
            result,
        });
    } catch (error) {
        next(error);
    }
};

const editMission = async (req, res, next) => {
    try {
        let token = req.headers['x-access-token'];
        let data = req.body;
        let result = await Admin.editMission(data, token);
        return res.status(200).json({
            status: 'ok',
            result,
        });
    } catch (error) {
        next(error);
    }
};

const editRecharge = async (req, res, next) => {
    try {
        let token = req.headers['x-access-token'];
        let data = req.body;
        let result = await Admin.editRecharge(data, token);
        return res.status(200).json({
            status: 'ok',
            result,
        });
    } catch (error) {
        next(error);
    }
};

const editWithdraw = async (req, res, next) => {
    try {
        let token = req.headers['x-access-token'];
        let data = req.body;
        let result = await Admin.editWithdraw(data, token);
        return res.status(200).json({
            status: 'ok',
            result,
        });
    } catch (error) {
        next(error);
    }
};

const editUser = async (req, res, next) => {
    try {
        let data = req.body;
        let result = await Admin.editUser(data);
        return res.status(200).json({
            status: 'ok',
            result,
        });
    } catch (error) {
        next(error);
    }
};

const editBanner = async (req, res, next) => {
    try {
        let data = req.body;
        let result = await Admin.editBanner(data);
        return res.status(200).json({
            status: 'ok',
            result,
        });
    } catch (error) {
        next(error);
    }
};

const editSettings = async (req, res, next) => {
    try {
        let data = req.body;
        let result = await Admin.editSettings(data);
        return res.status(200).json({
            status: 'ok',
            result,
        });
    } catch (error) {
        next(error);
    }
};

const addProduct = async (req, res, next) => {
    try {
        let token = req.headers['x-access-token'];
        let data = req.body;
        let result = await Admin.addProduct(data, token);
        return res.status(200).json({
            status: 'ok',
            result,
        });
    } catch (error) {
        next(error);
    }
};

const addBanner = async (req, res, next) => {
    try {
        let token = req.headers['x-access-token'];
        let data = req.body;
        let result = await Admin.addBanner(data, token);
        return res.status(200).json({
            status: 'ok',
            result,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    Login,
    CheckAdmin,
    listLevel,
    listMission,
    listRecharge,
    editMission,
    editRecharge,
    listWithdraw,
    editWithdraw,
    listRechargeAll,
    listWithdrawAll,
    addProduct,
    listUsers,
    editUser,
    editBanner,
    addBanner,
    listSettings,
    editSettings,
    listAnalytics,
};
