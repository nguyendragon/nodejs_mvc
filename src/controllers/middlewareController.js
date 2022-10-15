import Users from '../models/users.model';

const middlewareController = async (req, res, next) => {
    let token = req.headers['x-access-token'];
    if (token) {
        let data = await Users.findOneToken(token);
        if (data.length <= 0) {
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

export default middlewareController;
