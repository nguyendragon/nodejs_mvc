import Users from '../models/users.model';

const middlewareAdminController = async (req, res, next) => {
    let token = req.headers['x-access-token'];
    if (token) {
        let data = await Users.findOneToken(token);
        if (data.length <= 0 || data[0].level !== 1) {
            return res.json({
                status: 'error',
                message: 'Invalid token',
            });
        } else {
            next();
        }
    } else {
        return res.json({
            status: 'error',
            message: 'Access denied!',
        });
    }
};

export default middlewareAdminController;
