import connection from '../config/config';
import md5 from 'md5';

const random = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

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

function timerJoin2(params = '') {
    let date = '';
    if (params) {
        date = new Date(Number(params));
    } else {
        date = new Date();
    }
    let years = formateT(date.getFullYear());
    let months = formateT(date.getMonth() + 1);
    let days = formateT(date.getDate());

    let hours = formateT(date.getHours());
    let minutes = formateT(date.getMinutes());
    let seconds = formateT(date.getSeconds());
    return years + '-' + months + '-' + days + ' ' + hours + ':' + minutes + ':' + seconds;
}

function randomStr(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

const findOne = async ({ username }) => {
    const [user] = await connection.execute('SELECT `id` FROM users WHERE username = ?', [username]);
    return user;
};

const findInvite = async (invite) => {
    const [user] = await connection.execute('SELECT `id` FROM users WHERE id_user = ?', [invite]);
    return user;
};

const checkAcount = async ({ username, password }) => {
    let [user] = await connection.execute('SELECT * FROM users WHERE username = ? AND password = ?', [
        username,
        md5(password),
    ]);
    let token = md5(username + password + Date.now());
    if (user.length > 0) {
        await connection.execute('UPDATE users SET token = ? WHERE username = ?', [token, username]);
    }
    return { token, user };
};

const findOneToken = async (token) => {
    const [user] = await connection.execute('SELECT * FROM users WHERE token = ?', [token]);
    return user;
};

const list_mission = async (token) => {
    const [user] = await connection.execute('SELECT * FROM users WHERE token = ?', [token]);
    let { username, money, roses_user } = user[0];
    let today = timerJoin();
    let [amount] = await connection.execute(
        'SELECT count(mission_done.id) as amount FROM mission INNER JOIN mission_done ON mission.id_mission = mission_done.id_mission WHERE mission_done.username = ? AND mission_done.status != ?',
        [username, 2],
    ); // tổng Số nhiệm vụ
    let [amountToday] = await connection.execute(
        'SELECT count(mission_done.id) as amountToday FROM mission INNER JOIN mission_done ON mission.id_mission = mission_done.id_mission WHERE mission_done.username = ? AND mission_done.status != ? AND mission_done.create_at = ?',
        [username, 2, today],
    ); // nhiệm vụ hôm nay

    let [result] = await connection.execute(
        'SELECT SUM(mission.receive) as result FROM mission INNER JOIN mission_done ON mission.id_mission = mission_done.id_mission WHERE mission_done.username = ? AND mission_done.status = ?',
        [username, 1],
    ); // Tổng tiền nhiệm vụ

    let [resultToday] = await connection.execute(
        'SELECT SUM(mission.receive) as resultToday FROM mission INNER JOIN mission_done ON mission.id_mission = mission_done.id_mission WHERE mission_done.username = ? AND mission_done.status = ? AND mission_done.create_at = ?',
        [username, 1, today],
    ); // tổng tiền nv hôm nay

    let [pending] = await connection.execute(
        'SELECT SUM(mission.receive) as pending FROM mission INNER JOIN mission_done ON mission.id_mission = mission_done.id_mission WHERE mission_done.username = ? AND mission_done.status = ?',
        [username, 0],
    ); // Số dư bị đóng băng

    return {
        amount: amount[0].amount || 0,
        amountToday: amountToday[0].amountToday || 0,
        result: result[0].result || 0,
        resultToday: resultToday[0].resultToday || 0,
        pending: pending[0].pending || 0,
    };
};

const save = async ({ username, password, invite, ip }) => {
    await connection.execute(
        'INSERT INTO users SET id_user = ?, username = ?, password = ?, ip = ?, invite = ?, create_at = ?, time = ?',
        [Date.now(), username, md5(password), ip, invite, Date.now(), timerJoin()],
    );
    let token = md5(username + password + Date.now());
    await connection.execute('UPDATE users SET token = ? WHERE username = ?', [token, username]);

    return { token };
};

const addRecharge = async ({ money, select }, token) => {
    const [user] = await findOneToken(token);
    let username = user.username;
    let id_txn = randomStr(16);
    let timeEnd = +new Date() + 1000 * (60 * 10 + 0) + 500; // +new Date() + 1000 * (60 * 10 phuts + 0) + 500;
    let now = Date.now();

    let create_at = timerJoin();

    let [recharge] = await connection.execute('SELECT * FROM recharge WHERE username = ? AND status = 0', [username]);

    if (recharge.length <= 0) {
        await connection.execute(
            'INSERT INTO recharge SET username = ?, id_txn = ?, amount = ?, type = ?,status = ?, time = ?, create_at = ?',
            [username, id_txn, money, select, 0, timeEnd, create_at],
        );
        return { type: 1, id: id_txn };
    }
    if (recharge.length > 0 && Number(recharge[0].time) - now <= 0) {
        await connection.execute('UPDATE recharge SET status = 2 WHERE username = ? AND status = 0', [username]);
        await connection.execute(
            'INSERT INTO recharge SET username = ?, id_txn = ?, amount = ?, type = ?,status = ?, time = ?, create_at = ?',
            [username, id_txn, money, select, 0, timeEnd, create_at],
        );
        return { type: 1, id: id_txn };
    } else {
        return { type: 0, id: recharge[0].id_txn };
    }
};

const getRecharge = async (token, id) => {
    const [user] = await findOneToken(token);
    let username = user.username;
    let [recharge] = await connection.execute(
        'SELECT * FROM recharge WHERE username = ? AND status = 0 AND id_txn = ?',
        [username, id],
    );
    let [settings] = await connection.execute(
        'SELECT `stk_bank`, `name_bank`, `name_u_bank`, `stk_momo`, `name_momo`, `name_u_momo` FROM settings',
    );
    return { recharge, settings };
};

const changePassword = async ({ passwordOld, newPassword }, token) => {
    const [user] = await findOneToken(token);
    let { username, password } = user;
    if (md5(passwordOld) != password) return { type: 2 };
    await connection.execute('UPDATE users SET password = ? WHERE username = ?', [md5(newPassword), username]);
    return { type: 1 };
};

const changePasswordTransaction = async ({ passwordOld, newPassword }, token) => {
    const [user] = await findOneToken(token);
    let { username, password } = user;
    if (md5(passwordOld) != password) return { type: 2 };
    await connection.execute('UPDATE users SET password_v2 = ? WHERE username = ?', [md5(newPassword), username]);
    return { type: 1 };
};

const addBanking = async ({ nameuser, stk, nameBank, sdt }, token) => {
    const [user] = await findOneToken(token);
    let username = user.username;
    let [users_bank] = await connection.execute('SELECT * FROM users_bank WHERE username = ?', [username]);
    if (users_bank.length > 0) {
        await connection.execute(
            'UPDATE users_bank SET name_bank = ?, name_u_bank = ?, stk_bank = ?, phone = ?, time = ? WHERE username = ?',
            [nameBank, nameuser, stk, sdt, Date.now(), username],
        );
        return { type: 2 };
    } else {
        await connection.execute(
            'INSERT INTO users_bank SET username = ?, name_bank = ?, name_u_bank = ?, stk_bank = ?, phone = ?, time = ?',
            [username, nameBank, nameuser, stk, sdt, Date.now()],
        );
        return { type: 1 };
    }
};

const checkBanking = async (token) => {
    const [user] = await findOneToken(token);
    let username = user.username;
    let [recharge] = await connection.execute(
        `SELECT users.money, users.money_2, users_bank.* FROM users INNER JOIN users_bank ON users.username = users_bank.username WHERE users.username = ? `,
        [username],
    );
    let [pending] = await connection.execute(
        'SELECT SUM(mission.receive) as pending FROM mission INNER JOIN mission_done ON mission.id_mission = mission_done.id_mission WHERE mission_done.username = ? AND mission_done.status = ?',
        [username, 0],
    ); // Số dư bị đóng băng
    return { recharge, pending: pending[0].pending || '0' };
};

const withdraw = async ({ money, password }, token) => {
    const [user] = await findOneToken(token);
    let username = user.username;
    let money_user = user.money; // SỐ tiền của user
    let password_user = user.password_v2; // SỐ tiền của user

    let [settings] = await connection.execute('SELECT * FROM settings');
    let [myBank] = await connection.execute('SELECT * FROM users_bank WHERE username = ?', [username]);
    if (myBank.length <= 0) return { type: 'error' }; // Chưa liên kết ngân hàng

    let fee = settings[0].fee; //Phí rút tiền
    let min_withdraw = settings[0].min_withdraw; // Min rút
    let { name_bank, stk_bank, name_u_bank } = myBank[0];

    let total = Number(money) + fee;
    if (password_user != md5(password)) return { type: 2 }; // Sai mật khẩu rút tiền
    if (Number(total) < min_withdraw) return { type: 4, min: min_withdraw }; // Min rút tối thiểu là
    if (Number(money_user) - Number(total) < 0) return { type: 3 }; // SỐ dư không đủ

    let id_txn = randomStr(16);
    let create_at = timerJoin2();

    await connection.execute(
        'INSERT INTO withdraw SET id_txn = ?, username = ?, name_bank = ?, name_u_bank = ?, stk = ?, amount = ?, fee = ?, status = ?, time = ?, create_at = ?',
        [id_txn, username, name_bank, name_u_bank, stk_bank, money, fee, 0, Date.now(), create_at],
    );

    await connection.execute(
        'INSERT INTO financial_details SET username = ?, type = ?, amount = ?, status = ?, time = ?',
        [username, 'withdraw', total, 'out', Date.now()],
    );

    await connection.execute('UPDATE users SET money = money - ? WHERE username = ?', [total, username]);
    return { type: 1, money: money_user - total };
};

const financial = async (token) => {
    const [user] = await findOneToken(token);
    let username = user.username;
    let [financial] = await connection.execute(
        'SELECT * FROM financial_details WHERE username = ? ORDER BY id DESC LIMIT 100',
        [username],
    );
    return financial;
};

const upgrade = async ({ level }, token) => {
    const [user] = await findOneToken(token);
    let username = user.username;
    let money = user.money;
    let [levels] = await connection.execute('SELECT * FROM level WHERE id_level = ?', [level]);
    if (levels.length <= 0) return { type: 'error' };

    let { price } = levels[0];
    if (money - price < 0) return { type: 2 };

    await connection.execute(
        'INSERT INTO financial_details SET username = ?, type = ?, amount = ?, status = ?, time = ?',
        [username, 'upgrade', price, 'out', Date.now()],
    );

    await connection.execute('UPDATE users SET money = money - ?, roses_user = ? WHERE username = ?', [
        price,
        level,
        username,
    ]);
    return { type: 1 };
};

const listBanner = async () => {
    const [banner] = await connection.execute('SELECT * FROM banner WHERE status = 1 ORDER BY id DESC');
    return banner;
};

const listSupport = async () => {
    const [support] = await connection.execute('SELECT `zalo`, `telegram` FROM settings');
    let { telegram, zalo } = support[0];
    return { telegram, zalo };
};

module.exports = {
    findOne,
    save,
    findOneToken,
    checkAcount,
    addRecharge,
    getRecharge,
    changePassword,
    changePasswordTransaction,
    addBanking,
    checkBanking,
    list_mission,
    withdraw,
    financial,
    upgrade,
    listBanner,
    findInvite,
    listSupport,
};
