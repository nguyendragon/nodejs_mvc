import connection from '../config/config';
import cron from 'node-cron';
const cronJob = () => {
    cron.schedule(
        '*/4 * * * *',
        async () => {
            let [mission_done] = await connection.execute('SELECT * FROM mission_done WHERE status = 0');
            for (let i = 0; i < mission_done.length; i++) {
                try {
                    const info_mission = mission_done[i];
                    let [mission] = await connection.execute(
                        'SELECT receive, price FROM mission WHERE id_mission = ?',
                        [info_mission.id_mission],
                    );

                    let { receive, price } = mission[0];
                    await connection.execute(
                        'INSERT INTO financial_details SET username = ?, type = ?, amount = ?, status = ?, time = ?',
                        [info_mission.username, 'roses', receive + price, 'in', Date.now()],
                    );
                    await connection.execute('UPDATE users SET money = money + ? WHERE username = ?', [
                        receive + price,
                        info_mission.username,
                    ]);
                    await connection.execute('UPDATE mission_done SET status = 1 WHERE id_mission = ?', [
                        info_mission.id_mission,
                    ]);
                } catch (error) {
                    console.log(error);
                }
            }
        },
        {
            scheduled: true,
            timezone: 'Asia/Ho_Chi_Minh',
        },
    );
};

export default cronJob;
