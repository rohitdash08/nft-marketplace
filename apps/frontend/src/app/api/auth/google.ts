import { NextApiRequest, NextApiResponse } from 'next';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { token } = req.body;
        console.log(token)
        try {
            const ticket = await client.verifyIdToken({
                idToken: token,
                audience: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
            });
            const payload = ticket.getPayload();
            // Handle user session and login here
            res.status(200).json({ user: payload });
        } catch (error) {
            console.error('Error verifying Google token:', error);
            res.status(401).json({ error: 'Invalid token' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
