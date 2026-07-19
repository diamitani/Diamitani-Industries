const roster = require('../../data/diamitani-music/roster.json');

// Diamitani Music — roster endpoint.
// Read-only view of the label's signed/scouted artists and their split
// profiles. Advance balances are included for transparency — the same
// "no black-box accounting" standard the label's operating model promises.
module.exports = (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
  res.status(200).json({
    company: 'Diamitani Music',
    count: roster.length,
    roster,
  });
};
