const killCookie = (res) => {
  res.clearCookie("jwt");
};

module.exports = killCookie;
