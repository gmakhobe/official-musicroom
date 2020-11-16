const Deezer = require("deezer-web-api");

exports.search = async (req, res) => {
  const DeezerClient = new Deezer();

  DeezerClient.infos.search(req.query.type, req.query.q)
    .then((results) => {
      res.json({results: results.data} );
    })
    .catch((err) => {
      console.log(err);
    });
}
