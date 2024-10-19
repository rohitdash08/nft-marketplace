import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';



export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'No code provided' });
    }

    try {
      // Exchange the authorization code for an access token
      const tokenResponse = await axios.post(
        'https://github.com/login/oauth/access_token',
        {
          client_id: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code,
        },
        {
          headers: {
            Accept: 'application/json',
          },
        }
      );

      const { access_token } = tokenResponse.data;

      if (!access_token) {
        return res.status(401).json({ error: 'Failed to get access token' });
      }

      // Use the access token to get the GitHub user's profile
      const userResponse = await axios.get('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });

      const user = userResponse.data;

      // Handle user session and login here
      // For example, you can check if the user exists in your database and log them in

      res.status(200).json({ user, token: access_token });
    } catch (error) {
      console.error('Error during GitHub login:', error);
      res.status(500).json({ error: 'GitHub login failed' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
