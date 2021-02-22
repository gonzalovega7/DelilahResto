// ------------------------------------------------------------------------------ //
//     File:       authorization.middleware.js ---------------------------------- //
//     Author:     Gonzalo Vega ------------------------------------------------- //
// ------------------------------------------------------------------------------ //

const authorization = async (req, res, next) => {
  const { profile } = req.profile;
  if (profile !== "admin") {
    res
      .status(400)
      .json(
        "You don't have profiles of admin to continue with this action"
      );
  } else {
    next();
  }
};

module.exports = authorization;
