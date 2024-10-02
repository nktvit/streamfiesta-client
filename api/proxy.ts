import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(request: VercelRequest, response: VercelResponse) {
  const { method } = request;

  switch (method) {
    case 'GET':
      response.status(200).json({ message: 'Hello from Vercel serverless function!' });
      break;
    case 'POST':
      const body = request.body;
      response.status(200).json({ message: 'Received POST request', data: body });
      break;
    default:
      response.setHeader('Allow', ['GET', 'POST']);
      response.status(405).end(`Method ${method} Not Allowed`);
  }
}
