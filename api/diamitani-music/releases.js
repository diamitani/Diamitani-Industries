const releases = require('../../data/diamitani-music/releases.json');
const roster = require('../../data/diamitani-music/roster.json');

// Diamitani Music — catalog endpoint.
// Joins each release to its artist name so the storefront doesn't have to
// ship a second round trip just to render a byline.
module.exports = (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const artistsById = Object.fromEntries(roster.map((a) => [a.id, a.name]));
  const enriched = releases.map((r) => ({
    ...r,
    artistName: artistsById[r.artistId] || 'Unknown',
  }));

  const byStatus = enriched.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});

  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
  res.status(200).json({
    company: 'Diamitani Music',
    count: enriched.length,
    byStatus,
    releases: enriched,
  });
};
