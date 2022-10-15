import md5 from 'md5';
import connection from '../config/config';

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

const missionss = async () => {
    const [missions] = await connection.execute('SELECT * FROM `level`');
    return missions;
};
const findOneToken = async (token) => {
    const [user] = await connection.execute('SELECT * FROM users WHERE token = ?', [token]);
    return user[0];
};

const listMission = async (token) => {
    let missions = await missionss();
    let { roses_user } = await findOneToken(token);
    return { missions, roses_user };
};

const listBanner = async () => {
    const [banner] = await connection.execute('SELECT * FROM banner ORDER BY id DESC');
    return banner;
};

const myMission = async (token, id_mission) => {
    let { username, money, roses_user } = await findOneToken(token);
    const [missions] = await connection.execute('SELECT * FROM level WHERE id_level = ?', [id_mission]);

    let [name_level_u] = await connection.execute(
        'SELECT level.name_level FROM users INNER JOIN level ON level.id_level = users.roses_user WHERE username = ?',
        [username],
    );
    if (missions.length <= 0) return { type: 4 };

    let [amount] = await connection.execute(
        'SELECT count(mission_done.id) as amount FROM mission INNER JOIN mission_done ON mission.id_mission = mission_done.id_mission WHERE mission_done.username = ? AND level_mission = ? AND mission_done.status != ?',
        [username, id_mission, 2],
    );

    let pattern = /[0-9]/g;
    let level_client = id_mission.match(pattern);
    let level_user = roses_user.match(pattern);

    let type = '';
    if (Number(level_client[0]) <= Number(level_user[0])) {
        type = 1;
    } else {
        type = 2;
    }

    let { name_level } = name_level_u[0];
    return { missions, roses_user, name_level, money, type, amount: amount[0].amount };
};

const newMission = async (token, level) => {
    let { username, money, roses_user } = await findOneToken(token);
    const [levels] = await connection.execute('SELECT * FROM level WHERE id_level = ?', [level]);
    if (levels.length <= 0) return { type: 4 };

    let pattern = /[0-9]/g;
    let level_client = level.match(pattern); // Client gửi lên id
    let level_user = roses_user.match(pattern); // level users

    let today = timerJoin(); //  VD: 2022-10-04

    const [missions_done] = await connection.execute(
        'SELECT * FROM mission_done WHERE create_at = ? AND username = ?',
        [today, username],
    );
    const [missions_list] = await connection.execute(
        'SELECT * FROM mission WHERE level_mission = ? ORDER BY price ASC',
        [level],
    );
    let list_mission_done = missions_done.map((data) => {
        return data.id_mission;
    });
    let list_mission = [];
    if (list_mission_done.length > 0) {
        list_mission = missions_list.filter((data) => {
            return !list_mission_done.includes(data.id_mission);
        });
    } else {
        list_mission = missions_list;
    }

    // let index = random(0, list_mission.length - 1);

    if (list_mission.length > 0) return { type: 1, mission: list_mission[0] };
    return { type: 2, mission: [] };
};

const confirmMission = async (token, id_mission) => {
    let { username, money, roses_user } = await findOneToken(token);
    const [missions] = await connection.execute('SELECT * FROM mission WHERE id_mission = ?', [id_mission]);

    return missions;
};

const confirmMissionID = async (token, id_mission) => {
    let { username, money, roses_user } = await findOneToken(token);
    const [missions] = await connection.execute('SELECT * FROM mission WHERE id_mission = ?', [id_mission]);

    if (missions.length <= 0) return { type: 2 }; // Nhiệm vụ không tồn tại

    let today = timerJoin(); //  VD: 2022-10-04
    const [missions_done] = await connection.execute(
        'SELECT * FROM mission_done WHERE id_mission = ? AND create_at = ? AND username = ?',
        [id_mission, today, username],
    );

    if (missions_done.length > 0) return { type: 3 }; // Bạn đã làm nhiệm vụ này rồi

    let pattern = /[0-9]/g;
    let level_client = missions[0].level_mission.match(pattern);
    let level_user = roses_user.match(pattern);
    if (level_client > level_user) return { type: 4 }; // Cấp bậc của bạn không đủ

    if (money - missions[0].price >= 0) {
        await connection.execute(
            'INSERT INTO mission_done SET username = ?, id_mission = ?, status = ?, create_at = ?, time = ?',
            [username, id_mission, 0, today, Date.now()],
        );

        await connection.execute('UPDATE users SET money = money - ? WHERE username = ?', [
            missions[0].price,
            username,
        ]);

        return { type: 1 }; // Thành công
    } else {
        return { type: 0 }; // Số dư không đủ để làm nhiệm vụ
    }
};

const historyMission = async (token, type_history) => {
    let arr = ['all', 'pending', 'success', 'fail']; // Đại diện status all 0 1 2
    let checkType = arr.includes(type_history);
    if (!checkType) return { type: 4 };
    let { username, roses_user } = await findOneToken(token);
    if (type_history == 'all') {
        var [missions] = await connection.execute(
            'SELECT mission.*, mission_done.* FROM mission INNER JOIN mission_done ON mission.id_mission = mission_done.id_mission WHERE mission_done.username = ? ORDER BY mission_done.id DESC',
            [username],
        );
    } else if (type_history == 'pending') {
        var [missions] = await connection.execute(
            'SELECT mission.*, mission_done.* FROM mission INNER JOIN mission_done ON mission.id_mission = mission_done.id_mission WHERE mission_done.username = ? AND mission_done.status = ? ORDER BY mission_done.id DESC',
            [username, 0],
        );
    } else if (type_history == 'success') {
        var [missions] = await connection.execute(
            'SELECT mission.*, mission_done.* FROM mission INNER JOIN mission_done ON mission.id_mission = mission_done.id_mission WHERE mission_done.username = ? AND mission_done.status = ? ORDER BY mission_done.id DESC',
            [username, 1],
        );
    } else {
        var [missions] = await connection.execute(
            'SELECT mission.*, mission_done.* FROM mission INNER JOIN mission_done ON mission.id_mission = mission_done.id_mission WHERE mission_done.username = ? AND mission_done.status = ? ORDER BY mission_done.id DESC',
            [username, 2],
        );
    }
    return missions; // Thanhf coong
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
