const session = require('express-session');
require('dotenv').config();

// const pgSession = require('connect-pg-simple')(session);
var SequelizeStore = require("connect-session-sequelize")(session.Store);
// const { Client } = require('pg');
const { logger } = require('../logger');
const { Sequelize } = require('sequelize');
const { InBoundGupshup } = require('../gupshup/InBound');
const POSTGRES_URL = process.env.POSTGRES_URL;
const oneDay = 1000 * 60 * 60 * 24;
const sequelize = new Sequelize(POSTGRES_URL, {
  dialect: 'postgres',  // Specify that you're using PostgreSQL
});

const mobileMult = 2013;
var sampleMobile = "910000000000";
var sampleUserName= "ejpu";// ejp user

const Session = sequelize.define("Session", {
  sid: {
    type: Sequelize.STRING,
    primaryKey: true,
  },
  userId: Sequelize.STRING,
  expires: Sequelize.DATE,
  data: Sequelize.TEXT,
});

function extendDefaultFields(defaults, session) {
  // console.log(defaults, session);
  return {
    data: defaults.data,
    expires: defaults.expires,
    userId: session.userId,
  };
}

const store = new SequelizeStore({
  db: sequelize,
  table: "Session",
  extendDefaultFields,
});

const init = () => {
  logger.info("⭆ Database init!");
  return session({
      secret: "ABEGkZlkMAYjAgs-sJSPdqSRIMDoHg",
      genid: function(req) {
        return genuuid(req) // use UUIDs for session IDs
      },    
      saveUninitialized: false,
      resave: false,
      store,
      cookie: { maxAge: oneDay }
  })
}

store.sync();

/**
 * Generate sessionId and userID of the whatsapp user
 * @param {} req 
 * @returns 
 */
function genuuid(req) {
  let userId;
  if(req?.body && req?.body?.payload) {
    let incomingMsg =  new InBoundGupshup(req.body);
    userId = getUseruid(incomingMsg);
  }
  
  // let userData = getData(userId);
  // // logger.info("extendDefaultFields - User old data %o", userData);
  return userId || "Unknown";
}

/**
 * Returns user session id based of incoming message data
 * @param {*} incomingMsg 
 * @returns 
 */
const getUseruid = (incomingMsg) => {
  let shortUserName, shortRandMobile;
  if(incomingMsg?.userName){
    try {
      logger.debug("getUseruid -  UserName: %s Mobile: %s", incomingMsg.userName, incomingMsg.fromMobile);
      shortUserName = incomingMsg.userName.replace(/ /g, '').toLowerCase().substr(0,4);
      let randMobile = (Number(incomingMsg.fromMobile)*mobileMult).toString(); 
      shortRandMobile = randMobile.substring(randMobile.length-4, randMobile.length);
      return shortUserName+shortRandMobile;
    } catch (err) {
      logger.warn(err, `Generating default userId: `);
      shortUserName = sampleUserName.replace(/ /g, '').toLowerCase().substr(0,4);
      let randMobile = (Number(sampleMobile)*mobileMult).toString(); 
      shortRandMobile = randMobile.substring(randMobile.length-4, randMobile.length);
      return shortUserName+shortRandMobile;
    }
  }
}

/**
 * 
 * @param {text: "sql query $1", values: ["value1"]} queryObj 
 * @returns 
 */
const getData = async (userId) => {
  try {
    let userSess = await Session.findOne({where: {sid: userId} });
    // logger.info("User session already exist: %o ", userSess)
    return userSess;
  } catch (error) {
    logger.error(error, "Database query - Get user session failed %s", userId);
  }
}

const saveUser = async(userData) => {
  
}

module.exports = {init, getData, sequelize}

