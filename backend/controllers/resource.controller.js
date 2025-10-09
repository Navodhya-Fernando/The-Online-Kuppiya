const Resource = require('../models/Resource.model');

exports.listResources = async (req, res) => {
    try {
        const resources = await Resource.find({});
        res.status(200).json(resources);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching resources.' });
    }
};

exports.getResourceDetails = async (req, res) => {
    res.status(501).json({ message: 'Feature not implemented yet.' });
};

exports.deleteResource = async (req, res) => {
    res.status(501).json({ message: 'Feature not implemented yet.' });
};