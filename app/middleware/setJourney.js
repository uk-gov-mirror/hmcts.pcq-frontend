'use strict';

const setJourney = (req, res, next) => {
    const journey = req.session.servicdeId || 'DEFAULT';

    req.session.journey = require(`app/journeys/${journey.toLowerCase()}`);
    next();
};

module.exports = setJourney;