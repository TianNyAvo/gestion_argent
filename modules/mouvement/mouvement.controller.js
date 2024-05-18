var mouvementService = require('./mouvement.service');

exports.insertMouvement = async (req, res) => {
    try {
        const mouvement = req.body;
        const result = await mouvementService.insertMouvement(mouvement);
        res.status(200).json(result);
    } catch (error) {
        console.error('Error inserting mouvement:', error);
        res.status(500).json({ error: error });
    }
};