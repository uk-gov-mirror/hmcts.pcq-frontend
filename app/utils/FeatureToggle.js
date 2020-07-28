'use strict';

const logger = require('app/components/logger');
const config = require('config');
const LaunchDarkly = require('app/components/launch-darkly');

class FeatureToggle {
    constructor() {
        this.launchDarkly = new LaunchDarkly().getInstance();
    }

    callCheckToggle(req, res, next, featureToggleKey, callback, redirectPage) {
        try {
            this.checkToggle(featureToggleKey, (err, showFeature) => {
                if (err) {
                    next();
                } else {
                    callback({
                        req: req,
                        res: res,
                        next: next,
                        redirectPage: redirectPage,
                        isEnabled: showFeature,
                        featureToggleKey: featureToggleKey
                    });
                }
            }, req, res);
        } catch (err) {
            next();
        }
    }

    checkToggle(featureToggleKey, callback, req, res) {
        const ldUser = config.featureToggles.launchDarklyUser;
        const toggleKey = config.featureToggles[featureToggleKey];
        const sessionId = req.session.id;

        const ftValue = res.locals ? res.locals.launchDarkly.ftValue : null;
        const defaultValue = ftValue && ftValue[featureToggleKey] ? ftValue[featureToggleKey] : false;

        this.launchDarkly.variation(toggleKey, ldUser, defaultValue, (err, enabled) => {
            logger(sessionId).info(`Checking feature toggle: ${toggleKey}, isEnabled: ${enabled}`);
            callback(err, enabled);
        });
    }

    checkTogglePromise(featureToggleKey, req, res) {
        const ldUser = config.featureToggles.launchDarklyUser;
        const toggleKey = config.featureToggles[featureToggleKey];
        const sessionId = req.session ? req.session.id : 'Init';

        const ftValue = res.locals ? res.locals.launchDarkly.ftValue : null;
        const defaultValue = ftValue && ftValue[featureToggleKey] ? ftValue[featureToggleKey] : false;

        return new Promise((resolve, reject) => {
            this.launchDarkly.variation(toggleKey, ldUser, defaultValue, (err, enabled) => {
                logger(sessionId).info(`Checking feature toggle: ${toggleKey}, isEnabled: ${enabled}`);

                if (err) {
                    logger(sessionId).error(`ERROR checking feature toggle: ${toggleKey}, err: ${err}`);
                    reject(err);
                } else {
                    resolve(enabled);
                }
            });
        });
    }

    togglePage(params) {
        if (params.isEnabled) {
            params.next();
        } else {
            params.res.redirect(params.redirectPage);
        }
    }

    toggleExistingPage(params) {
        if (params.isEnabled) {
            params.res.redirect(params.redirectPage);
        } else {
            params.next();
        }
    }

    toggleFeature(params) {
        if (!params.req.session.featureToggles) {
            params.req.session.featureToggles = {};
        }
        params.req.session.featureToggles[params.featureToggleKey] = params.isEnabled;
        params.next();
    }

    static appwideToggles(req, ctx, appwideToggles) {
        if (appwideToggles.length) {
            ctx.featureToggles = {};
            appwideToggles.forEach((toggleKey) => {
                ctx.featureToggles[toggleKey] = FeatureToggle.isEnabled(req.session.featureToggles, toggleKey).toString();
            });
        }

        return ctx;
    }

    static isEnabled(featureToggles, key) {
        if (featureToggles && featureToggles[key]) {
            return true;
        }
        return false;
    }
}

module.exports = FeatureToggle;
