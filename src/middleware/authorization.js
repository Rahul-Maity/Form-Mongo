const jwt = require("jsonwebtoken");
const authorization = async (req, res, next) => {
    const token = await req.cookies.usertoken;
    // console.log(token);
    const matchToken = jwt.verify(token, "hfguerytgfdjhdgncgftjahgdtjfujfisjfuehksj");
    // console.log(matchToken);
    next();
};
module.exports = authorization;