const roster = require('../../data/diamitani-music/roster.json');

// Diamitani Music — royalty & recoupment calculator.
//
// This is the label's operating-model core: given gross revenue on a
// release, apply the signed artist's split profile, recoup any
// outstanding advance from the artist's share first, and return a full,
// auditable breakdown. Stateless — nothing here mutates the roster data,
// so it's safe to call as many times as you like from the calculator UI.
function round2(n) {
  return Math.round(n * 100) / 100;
}

module.exports = (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Method not allowed. Use POST.' });
    return;
  }

  let body = req.body;
  if (!body || typeof body === 'string') {
    try {
      body = JSON.parse(body || '{}');
    } catch {
      res.status(400).json({ error: 'Invalid JSON body.' });
      return;
    }
  }

  const { artistId, revenue } = body || {};

  const artist = roster.find((a) => a.id === artistId);
  if (!artist) {
    res.status(404).json({
      error: `Unknown artistId "${artistId}".`,
      knownArtists: roster.map((a) => a.id),
    });
    return;
  }

  const gross = Number(revenue);
  if (!Number.isFinite(gross) || gross <= 0) {
    res.status(400).json({ error: 'revenue must be a positive number.' });
    return;
  }

  const { artist: artistPct, label: labelPct, producer: producerPct = 0 } =
    artist.splitProfile;

  const artistGross = round2(gross * artistPct);
  const labelShare = round2(gross * labelPct);
  const producerShare = round2(gross * producerPct);

  const advanceBalance = artist.advanceBalance || 0;
  const recouped = round2(Math.min(artistGross, advanceBalance));
  const artistNet = round2(artistGross - recouped);
  const remainingAdvance = round2(advanceBalance - recouped);

  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({
    company: 'Diamitani Music',
    artistId: artist.id,
    artistName: artist.name,
    grossRevenue: round2(gross),
    splitProfile: artist.splitProfile,
    breakdown: {
      artistGross,
      labelShare,
      producerShare,
      advanceBalanceBefore: round2(advanceBalance),
      recouped,
      artistNetPayable: artistNet,
      advanceBalanceAfter: remainingAdvance,
    },
  });
};
