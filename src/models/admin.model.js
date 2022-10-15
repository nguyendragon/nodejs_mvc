import e from 'express';
import md5 from 'md5';
import connection from '../config/config';

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

function formateT(params) {
    let result = params < 10 ? '0' + params : params;
    return result;
}

function timerJoin(params = '') {
    let date = '';
    if (params) {
        date = new Date(Number(params));
    } else {
        date = new Date();
    }
    let years = formateT(date.getFullYear());
    let months = formateT(date.getMonth() + 1);
    let days = formateT(date.getDate());
    return years + '-' + months + '-' + days;
}

const Login = async ({ username, password }) => {
    const [users] = await connection.execute('SELECT * FROM users WHERE username = ? AND password = ? AND level = 1', [
        username,
        md5(password),
    ]);
    if (users.length <= 0) return { type: 2 };
    if (users.length > 0) return { type: 1, auth: users[0].token };
};

const CheckAdmin = async (token) => {
    const [users] = await connection.execute('SELECT * FROM users WHERE token = ? AND level = 1', [token]);
    if (users.length <= 0) return { type: 2 };
    if (users.length > 0) return { type: 1 };
};
const listLevel = async () => {
    const [listMission] = await connection.execute('SELECT * FROM level');
    return listMission;
};

const listMission = async () => {
    const [listMission] = await connection.execute('SELECT * FROM mission ORDER BY id DESC');
    return listMission;
};

const listRecharge = async () => {
    const [listMission] = await connection.execute('SELECT * FROM recharge WHERE status = 0 ORDER BY id DESC');
    return listMission;
};

const listRechargeAll = async () => {
    const [listMission] = await connection.execute('SELECT * FROM recharge ORDER BY id DESC');
    return listMission;
};

const listWithdrawAll = async () => {
    const [listMission] = await connection.execute('SELECT * FROM withdraw  ORDER BY id DESC');
    return listMission;
};

const listWithdraw = async () => {
    const [listMission] = await connection.execute('SELECT * FROM withdraw WHERE status = 0 ORDER BY id ASC');
    return listMission;
};

const listUsers = async () => {
    const [listMission] = await connection.execute('SELECT * FROM users ORDER BY id DESC');
    return listMission;
};

const listSettings = async () => {
    const [listSettings] = await connection.execute('SELECT * FROM settings');
    return listSettings;
};

const listAnalytics = async () => {
    const [total_users] = await connection.execute('SELECT COUNT(id) as total FROM users');
    const [total_recharge] = await connection.execute('SELECT SUM(amount) as total FROM recharge WHERE status = 1');
    const [total_withdraw] = await connection.execute('SELECT SUM(amount) as total FROM withdraw WHERE status = 1');
    let today = timerJoin();
    const [today_withdraw] = await connection.execute(
        'SELECT SUM(amount) as total FROM withdraw WHERE status = 1 AND create_at = ?',
        [today],
    );
    const [today_recharge] = await connection.execute(
        'SELECT SUM(amount) as total FROM recharge WHERE status = 1 AND create_at = ?',
        [today],
    );
    const [today_users] = await connection.execute('SELECT COUNT(id) as total FROM users WHERE time = ?', [today]);

    let data = {
        total_users: total_users[0].total || 0,
        total_recharge: total_recharge[0].total || 0,
        total_withdraw: total_withdraw[0].total || 0,

        today_recharge: today_recharge[0].total || 0,
        today_withdraw: today_withdraw[0].total || 0,
        today_users: today_users[0].total || 0,
    };

    return data;
};

const editMission = async ({ id_mission, name_new, roses_new, price_new, vip_new, img_new, type }) => {
    if (type == 'edit') {
        await connection.execute(
            'UPDATE mission SET  name_mission = ?, price = ?, receive = ?, level_mission = ?, image = ? WHERE id_mission = ?',
            [name_new, price_new, roses_new, vip_new, img_new, id_mission],
        );
        return { type: 1 };
    } else {
        await connection.execute('DELETE FROM mission WHERE id_mission = ?', [id_mission]);
        return { type: 0 };
    }
};

const editRecharge = async ({ id_txn, type }) => {
    if (type == 'edit') {
        const [recharge] = await connection.execute('SELECT * FROM recharge WHERE id_txn = ?', [id_txn]);
        let { amount, username, status } = recharge[0];
        if (status == 0) {
            await connection.execute('UPDATE recharge SET status = 1 WHERE id_txn = ?', [id_txn]);
            await connection.execute('UPDATE users SET money = money + ? WHERE username = ?', [amount, username]);
            await connection.execute(
                'INSERT INTO financial_details SET username = ?, type = ?, amount = ?, status = ?, time = ?',
                [username, 'recharge', amount, 'in', Date.now()],
            );
            return { type: 1 };
        } else {
            return { type: 2 };
        }
    } else {
        await connection.execute('UPDATE recharge SET status = 2 WHERE id_txn = ?', [id_txn]);
        return { type: 0 };
    }
};

const editWithdraw = async ({ id_txn, type }) => {
    const [withdraw] = await connection.execute('SELECT * FROM withdraw WHERE id_txn = ?', [id_txn]);
    let { amount, fee, username, status } = withdraw[0];
    if (type == 'edit') {
        if (status == 0) {
            await connection.execute('UPDATE withdraw SET status = 1 WHERE id_txn = ?', [id_txn]);
            return { type: 1 };
        } else {
            return { type: 2 };
        }
    } else {
        await connection.execute('UPDATE withdraw SET status = 2 WHERE id_txn = ?', [id_txn]);
        await connection.execute('UPDATE users SET money = money + ? WHERE username = ?', [amount + fee, username]);
        return { type: 0 };
    }
};

const editUser = async ({ username, money_new, password_new, vip_new, level_new, type, delete_bank }) => {
    if (type == 'edit') {
        if (!password_new) {
            await connection.execute('UPDATE users SET money = ?, roses_user = ?, level = ? WHERE username = ?', [
                money_new,
                vip_new,
                level_new,
                username,
            ]);
        } else {
            await connection.execute(
                'UPDATE users SET money = ?, password = ?, roses_user = ?, level = ? WHERE username = ?',
                [money_new, md5(password_new), vip_new, level_new, username],
            );
        }
        if (delete_bank == '1') {
            await connection.execute('DELETE FROM users_bank WHERE username = ?', [username]);
        }
        return { type: 1 };
    }
    if (type == 'banned') {
        await connection.execute('UPDATE users SET status = ? WHERE username = ?', ['2', username]);
        return { type: 2 };
    }
    if (type == 'open') {
        await connection.execute('UPDATE users SET status = ? WHERE username = ?', ['1', username]);
        return { type: 3 };
    }
};

const editBanner = async ({ status, id }) => {
    await connection.execute('UPDATE banner SET status = ? WHERE id = ?', [status, id]);
    return { type: 1 };
};

const editSettings = async ({
    stk_bank,
    name_bank,
    name_u_bank,
    stk_momo,
    name_momo,
    name_u_momo,
    fee,
    min_withdraw,
    zalo,
    telegram,
}) => {
    await connection.execute(
        'UPDATE settings SET stk_bank = ?, name_bank = ?, name_u_bank = ?, stk_momo = ?, name_momo = ?, name_u_momo = ?, fee = ?, min_withdraw = ?, zalo = ?, telegram = ?',
        [stk_bank, name_bank, name_u_bank, stk_momo, name_momo, name_u_momo, fee, min_withdraw, zalo, telegram],
    );
    return { type: 1 };
};

const addProduct = async ({ name, price, rosess, vip, imgsss }, token) => {
    let id_mission = randomStr(16);
    await connection.execute(
        'INSERT INTO mission SET id_mission = ?, name_mission = ?, price = ?, receive = ?, level_mission = ?, image = ?, time = ?',
        [id_mission, name, price, rosess, vip, imgsss, Date.now()],
    );
    return { type: 1 };
};

const addBanner = async ({ link }, token) => {
    await connection.execute('INSERT INTO banner SET link = ?, time = ?', [link, Date.now()]);
    return { type: 1 };
};

module.exports = {
    Login,
    CheckAdmin,
    listLevel,
    listMission,
    editMission,
    listRecharge,
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
