const Deezer = require("deezer-web-api");

exports.search = async (req, res) => {
  const DeezerClient = new Deezer();

  DeezerClient.infos.search(req.query.type, req.query.q)
    .then((results) => {
      res.status(200).json({success: true , message: `Search for ${req.query.q} was successful`,results: results.data} );
    })
    .catch((err) => {
	  console.log(err);
	  res
      .status(400)
      .json({
        success: false,
        message: `Search for ${req.query.q} was unsuccessful`,
        error: err
      });
    })
}
