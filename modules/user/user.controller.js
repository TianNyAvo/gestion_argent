var userServices = require('./user.service')

exports.insertUser = async (req, res) => {
    try {
        const user = req.body;
        const result = await userServices.insertUser(user);
        res.status(200).json(result);
    } catch (error) {
        console.error('Error inserting user:', error);
        res.status(500).json({ error: error });
    }
}

exports.loginUser = async (req, res) => {
    try {
        const user = req.body;
        const result = await userServices.loginUser(user);
        // console.log('Result:', result);
        return result;
        // res.status(200).json(result);
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ error: error });
    }
}
