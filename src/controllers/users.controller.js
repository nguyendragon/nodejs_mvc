import createError from 'http-errors';

import Users from '../models/users.model';

const isNumber = (params) => {
    let pattern = /^[0-9]*\d$/;
    return pattern.test(params);
};

const Login = async (req, res, next) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) throw new createError.BadRequest();
        if (!isNumber(username)) throw new createError.Conflict('Tài khoản không đúng định dạng!');

        let data = await Users.checkAcount(req.body);
        if (data.user.length <= 0) {
            return res.status(200).json({
                status: 'error',
                message: 'Tài khoản hoặc mật khẩu không chính xác',
            });
        }
        if (data.user.length > 0 && data.user[0].status == 2) {
            return res.status(200).json({
                status: 'error',
                message: 'Tài khoản đã bị khóa !',
            });
        }
        return res.status(200).json({
            status: 'ok',
            auth: data.token,
            message: 'Đăng nhập thành công',
        });
    } catch (error) {
        next(error);
    }
};

const Register = async (req, res, next) => {
    try {
        const ip = req.socket.remoteAddress;
        const { username, password, invite } = req.body;
        req.body.ip = ip;
        if (!username || !password) throw new createError.BadRequest('Có lỗi xảy ra');
        if (!isNumber(username)) throw new createError.Conflict('Tài khoản không đúng định dạng!');

        let user = await Users.findOne({ username });
        let checkInvite = await Users.findInvite(invite);

        if (checkInvite.length <= 0) {
            return res.status(200).json({
                status: 'error',
                message: 'Mã giới thiệu không tồn tại !',
            });
        }

        if (user.length > 0) {
            return res.status(200).json({
                status: 'error',
                message: 'Tài khoản này đã tồn tại trong hệ thống!',
            });
        }
        let auth = await Users.save(req.body);
        return res.status(200).json({
            status: 'ok',
            auth: auth.token,
            message: 'Đăng ký thành công',
        });
    } catch (error) {
        next(error);
    }
};

const userInfo = async (req, res, next) => {
    try {
        let token = req.headers['x-access-token'];
        let data = await Users.findOneToken(token);
        let mission = await Users.list_mission(token);

        let { money, username, money_2, id_user, roses_user, ...other } = data[0];
        return res.status(200).json({
            status: 'ok',
            mission,
            data: [{ username, money, money_2, id_user, roses_user }],
            message: 'Success',
        });
    } catch (error) {
        next(error);
    }
};

const Me = async (req, res, next) => {
    try {
        let token = req.headers['x-access-token'];
        let data = await Users.findOneToken(token);

        let { username } = data[0];
        return res.status(200).json({
            status: 'ok',
            data: [{ username }],
            message: 'Success',
        });
    } catch (error) {
        next(error);
    }
};

const addRecharge = async (req, res, next) => {
    try {
        let token = req.headers['x-access-token'];
        let data = await Users.addRecharge(req.body, token);

        if (data.type == 0) {
            return res.status(200).json({
                status: 2,
                id_txn: data.id,
                message: 'Có đơn hàng chưa duyệt',
            });
        }

        return res.status(200).json({
            status: 1,
            id_txn: data.id,
            message: 'Tạo đơn nạp thành công',
        });
    } catch (error) {
        next(error);
    }
};

const getRecharge = async (req, res, next) => {
    try {
        let id = req.params.id;
        let token = req.headers['x-access-token'];
        let data = await Users.getRecharge(token, id);
        return res.status(200).json({
            status: 'ok',
            data: data,
            message: 'Success',
        });
    } catch (error) {
        next(error);
    }
};

const changePassword = async (req, res, next) => {
    try {
        let data = req.body;
        let token = req.headers['x-access-token'];
        let result = await Users.changePassword(data, token);
        return res.status(200).json({
            status: 'ok',
            data: result.type,
            message: 'Success',
        });
    } catch (error) {
        next(error);
    }
};

const changePasswordTransaction = async (req, res, next) => {
    try {
        let data = req.body;
        let token = req.headers['x-access-token'];
        let result = await Users.changePasswordTransaction(data, token);
        return res.status(200).json({
            status: 'ok',
            data: result.type,
            message: 'Success',
        });
    } catch (error) {
        next(error);
    }
};

const addBanking = async (req, res, next) => {
    try {
        let data = req.body;
        let token = req.headers['x-access-token'];
        let result = await Users.addBanking(data, token);
        return res.status(200).json({
            status: 'ok',
            data: result.type,
            message: 'Success',
        });
    } catch (error) {
        next(error);
    }
};

const checkBanking = async (req, res, next) => {
    try {
        let token = req.headers['x-access-token'];
        let data = await Users.checkBanking(token);
        return res.status(200).json({
            status: 'ok',
            data: data,
            message: 'Success',
        });
    } catch (error) {
        next(error);
    }
};

const withdraw = async (req, res, next) => {
    try {
        let data = req.body;
        let token = req.headers['x-access-token'];
        let result = await Users.withdraw(data, token);
        return res.status(200).json({
            status: 'ok',
            data: result,
            message: 'Success',
        });
    } catch (error) {
        next(error);
    }
};

const financial = async (req, res, next) => {
    try {
        let token = req.headers['x-access-token'];
        let result = await Users.financial(token);
        return res.status(200).json({
            status: 'ok',
            data: result,
            message: 'Success',
        });
    } catch (error) {
        next(error);
    }
};

const upgrade = async (req, res, next) => {
    try {
        let data = req.body;
        let token = req.headers['x-access-token'];
        let result = await Users.upgrade(data, token);
        return res.status(200).json({
            status: 'ok',
            data: result,
            message: 'Success',
        });
    } catch (error) {
        next(error);
    }
};

const listBanner = async (req, res, next) => {
    try {
        let data = await Users.listBanner();
        return res.status(200).json({
            status: 'ok',
            data,
            message: 'Success',
        });
    } catch (error) {
        next(error);
    }
};

const listSupport = async (req, res, next) => {
    try {
        let data = await Users.listSupport();
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
    Register,
    Login,
    userInfo,
    addRecharge,
    getRecharge,
    changePassword,
    changePasswordTransaction,
    addBanking,
    checkBanking,
    Me,
    withdraw,
    financial,
    upgrade,
    listBanner,
    listSupport,
};
