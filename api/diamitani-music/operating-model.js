const model = require('../../data/diamitani-music/operating-model.json');

// Diamitani Music — operating model endpoint.
// Serves the label's sign → release → collect → split → reinvest flow so
// the front end never has to hardcode business logic it doesn't own.
module.exports = (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
  res.status(200).json(model);
};
