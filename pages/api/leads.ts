import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    if (!process.env.SHEET_ID) {
      return res.status(500).json({ error: 'SHEET_ID is missing' });
    }

    const doc = new GoogleSpreadsheet(process.env.SHEET_ID, serviceAccountAuth);
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0];
    const rows = await sheet.getRows();

    const leads = rows.map((r, index) => {
      const link = r.get('Lead_Link') || r.get('Link') || '';
      let platform = 'Web';
      if (link.includes('reddit.com')) platform = 'Reddit';
      else if (link.includes('indiehackers.com')) platform = 'IndieHackers';
      else if (link.includes('twitter.com') || link.includes('x.com')) platform = 'Twitter/X';

      return {
        id: index + 1,
        date: r.get('Date') || 'Recently',
        link,
        pitch: r.get('Pitch') || 'Pitch details pending...',
        status: r.get('Status') || 'New',
        platform,
      };
    });

    // Return reversed so newest leads appear at the top
    res.status(200).json(leads.reverse());
  } catch (error: any) {
    console.error('Failed to fetch leads:', error);
    res.status(500).json({ error: error.message || 'Failed to load leads from Sheet' });
  }
}
