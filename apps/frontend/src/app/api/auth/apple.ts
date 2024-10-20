import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import jwt from 'jsonwebtoken'; // To decode Apple's ID token

const APPLE_CLIENT_ID = process.env.NEXT_PUBLIC_APPLE_CLIENT_ID;
const APPLE_CLIENT_SECRET = process.env.APPLE_CLIENT_SECRET;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'No code provided' });
    }

    try {
      // Exchange the authorization code for an access token
      const params = new URLSearchParams();
      params.append('client_id', APPLE_CLIENT_ID || '');
      params.append('client_secret', APPLE_CLIENT_SECRET || '');
      params.append('grant_type', 'authorization_code');
      params.append('code', code);

      const tokenResponse = await axios.post(
        'https://appleid.apple.com/auth/token',
        params.toString(), // Convert URLSearchParams to a string
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      const { access_token, id_token } = tokenResponse.data;

      if (!access_token || !id_token) {
        return res.status(401).json({ error: 'Failed to get access token' });
      }

      // Decode the ID token to extract user info
      const decodedToken: any = jwt.decode(id_token);

      const user = {
        email: decodedToken.email,
        sub: decodedToken.sub, // Apple’s user identifier
        name: decodedToken.name || '', // Name may be unavailable in some cases
      };

      // Handle user session and login here
      // For example, you can check if the user exists in your database and log them in

      res.status(200).json({ user, token: access_token });
    } catch (error) {
      console.error('Error during Apple login:', error);
      res.status(500).json({ error: 'Apple login failed' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
