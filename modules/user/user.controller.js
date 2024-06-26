var userServices = require('./user.service')

exports.insertUser = async (req, res) => {
    try {
        const user = req.body;
        const result = await userServices.insertUser(user);
        return result;
        // res.status(200).json(result);
    } catch (error) {
        console.error('Error inserting user:', error);
        res.status(500).json({ error: error });
    }
}

exports.listUser = async (req, res) => {
    try {
        const result = await userServices.listUser(req.body.search_matricule);
        return result;
    } catch (error) {
        console.error('Error listing user:', error);
        res.status(500).json({ error: error });
    }
};

exports.getByid = async (req, res) => {
    try {
        const user_id = req.params.user_id;
        const result = await userServices.getById(user_id);
        return result;
    } catch (error) {
        console.error('Error getting user by id:', error);
        res.status(500).json({ error: error });
    }
};

exports.getByidBody = async (req, res) => {
    try {
        const user_id = req.body.user_id;
        const result = await userServices.getById(user_id);
        return result;
    } catch (error) {
        console.error('Error getting user by id:', error);
        res.status(500).json({ error: error });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const user = req.body;
        const result = await userServices.updateUser(user);
        return result;
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: error });
    }
};

exports.updateUserGuest = async (req, res) => {
    try {
        const user = req.body;
        const result = await userServices.updateUserGuest(user);
        console.log("passage contoller", result);

        return result;
    } catch (error) {
        console.error('Error updating user guest:', error);
        res.status(500).json({ error: error });
    }
};


exports.signup = async (req, res) => {
    try {
        const user = req.body;

        if (req.body.matricule.includes(" ")) {
            return "misy espace";
        }
        const result = await userServices.signup(user);
        return result;
    } catch (error) {
        console.error('Error signing up user:', error);
        res.status(500).json({ error: error });
    }
};

exports.loginUser = async (req, res) => {
    try {
        const user = req.body;
        const result = await userServices.loginUser(user);
        // console.log('Result:', result);
        // return result;
        res.status(200).json(result);
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ error: error });
    }
}

exports.getAllUserCotisation = async (req, res) => {
    try {
        var year = "";
        if (req.body.year != "" && req.body.year != null) {
            year = Number.parseInt(req.body.year);
            console.log("year", year);
        }
        else {
            year = new Date().getFullYear();
            console.log("year", year);
        }
        var matricule = req.body.search_matricule;
        
        const result = await userServices.getAllUserCotisation(year,matricule);
        return result;
    } catch (error) {
        console.error('Error getting all user cotisation:', error);
        res.status(500).json({ error: error });
    }
};

exports.getUserCotisationPaid = async (req, res) => {
    try {
        var year = "";
        if (req.body.year != "" && req.body.year != null) {
            year = Number.parseInt(req.body.year);
            console.log("year", year);
        }
        else {
            year = new Date().getFullYear();
            console.log("year", year);
        }
        var matricule = req.body.search_matricule;
        
        const result = await userServices.getUserCotisationPaid(year,matricule);
        return result;
    } catch (error) {
        console.error('Error getting all user cotisation:', error);
        res.status(500).json({ error: error });
    }
};

exports.getUserCotisation = async (req, res) => {
    try {
        var user_id = "";
        if (req.body.user_id != "" && req.body.user_id != null) {
            user_id = req.body.user_id;
        }
        else if (req.params.user_id != "" && req.params.user_id != null) {
            user_id = req.params.user_id;
        }
        else{
            return res.status(400).json({ error: "user_id is required" });
        }
        var year = "";
        if (req.body.year != "" && req.body.year != null) {
            year = Number.parseInt(req.body.year);
        }
        else {
            year = new Date().getFullYear();
        }
        const result = await userServices.getUserCotisation(user_id, year);
        return result;
    } catch (error) {
        console.error('Error getting user cotisation:', error);
        res.status(500).json({ error: error });
    }
};

exports.getAllUserCotisationUnpaid = async (req, res) => {
    try {
        var year = "";
        if (req.body.year != "" && req.body.year != null) {
            year = Number.parseInt(req.body.year);
            console.log("year", year);
        }
        else {
            year = new Date().getFullYear();
            console.log("year", year);
        }
        var matricule = req.body.search_matricule;
        
        const result = await userServices.getAllUserCotisationUnpaid(year,matricule);
        return result;
    } catch (error) {
        console.error('Error getting all user cotisation:', error);
        res.status(500).json({ error: error });
    }
};

exports.getUserMovementsByYear = async (req, res) => {
    try {
        var year = "";
        if (req.body.year != "" && req.body.year != null) {
            year = req.body.year;
        }
        else {
            year = new Date().getFullYear();
        }
        const result = await userServices.getUserMovementsByYear(year); 
        return result;
        // res.status(200).json(result);
    } catch (error) {
        console.error('Error getting user movements by year controller:', error);
        res.status(500).json({ error: error });
    }
};

exports.getUserMovementsByMonthYear = async (req, res) => {
    try {
        var month = "";
        if (req.body.month != "" && req.body.month != null) {
            month = req.body.month;
        }
        else {
            month = new Date().getMonth() + 1;
        }
        var year = "";
        if (req.body.year != "" && req.body.year != null) {
            year = req.body.year;
        }
        else {
            year = new Date().getFullYear();
        }
        const result = await userServices.getUserMovementsByMonthYear(month, year);
        return result;
    } catch (error) {
        console.error('Error getting user movements by year controller:', error);
        res.status(500).json({ error: error });
    }
};

exports.getUnpaidUserMovementsByMonthYear = async (req, res) => {
    try {
        var month = "";
        if (req.body.month != "" && req.body.month != null) {
            month = req.body.month;
        }
        else {
            month = new Date().getMonth() + 1;
        }
        var year = "";
        if (req.body.year != "" && req.body.year != null) {
            year = req.body.year;
        }
        else {
            year = new Date().getFullYear();
        }
        const result = await userServices.getUnpaidUserMovementsByMonthYear(month, year);
        return result;
    } catch (error) {
        console.error('Error getting user movements by year controller:', error);
        res.status(500).json({ error: error });
    }
};