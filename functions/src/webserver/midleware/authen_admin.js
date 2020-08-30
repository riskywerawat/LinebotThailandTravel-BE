/* eslint-disable promise/always-return */
const passport = require("passport");
//ใช้ในการ decode jwt ออกมา
const db = require("../../config/firestore");
const ExtractJwt = require("passport-jwt").ExtractJwt;
//ใช้ในการประกาศ Strategy
const JwtStrategy = require("passport-jwt").Strategy;
const SECRET = "LINEBOT_KMUTNB";
//สร้าง Strategy
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromHeader("authorization"),
  secretOrKey: SECRET
};
// eslint-disable-next-line consistent-return
const jwtAuth = new JwtStrategy(jwtOptions, (payload, done) => {
  try {
    // eslint-disable-next-line promise/catch-or-return
    db.collection("user_web")
      .where("username", "==", payload.username)
      .get()
      // eslint-disable-next-line consistent-return
      .then(snap => {

        // eslint-disable-next-line promise/always-return
        if (snap.empty) {
          return done(null, false);
        } else {
          snap.forEach(e => {
            return done(null, e.id);
          })

        }
      });
  } catch (error) {
    return done(null, false);
  }

  passport.serializeUser((id, done) => {
    done(null, id);
  });
  // // used to deserialize the user
  passport.deserializeUser((id, done) => {
    done(null, id);
  });
  // done(null, true);
  // else done(null, false);
});
//เสียบ Strategy เข้า Passport
passport.use("admin", jwtAuth);
//ทำ Passport Middleware
const adminmiddleware = passport.authenticate("admin");

module.exports = adminmiddleware;