import axios from 'axios';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const b64 = Buffer.from(response.data).toString('base64');
    return Response.json({
      data: b64
    }, { status: 200 });
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 422 });
  }
}