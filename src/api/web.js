import userRoute from '../routes/users';
import missionRoute from '../routes/mission';
import adminRoute from '../routes/admin';

const initWebRouter = (app) => {
    userRoute(app);
    missionRoute(app);
    adminRoute(app);
};

export default initWebRouter;
