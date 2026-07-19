const discography = require('../../data/diamitani-music/discography.json');

// Diamitani Music — full discography endpoint.
// Covers both artist identities in the catalog (Pat Dia, Patrick Diamitani).
// Every track carries a `confidence` field ("metadata-informed" | "listened")
// set by the catalog-track-critic skill — see skills/catalog-track-critic/SKILL.md.
module.exports = (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { artist } = req.query || {};
  let artists = discography.artists;
  if (artist) {
    artists = artists.filter((a) => a.id === artist || a.slug === artist);
    if (!artists.length) {
      res.status(404).json({
        error: `Unknown artist "${artist}".`,
        knownArtists: discography.artists.map((a) => ({ id: a.id, slug: a.slug })),
      });
      return;
    }
  }

  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
  res.status(200).json({
    generatedBy: discography.generatedBy,
    lastVerified: discography.lastVerified,
    note: discography.note,
    count: artists.length,
    artists,
  });
};
