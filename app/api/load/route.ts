import Pusher from 'pusher';

export async function POST(req: Request) {
  try {
    const { load, channel } = await req.json();
    if (!['start', 'talk', 'listen', 'end'].includes(load)) throw new Error('Load value is invalid');
    const pusher = new Pusher({
      appId: process.env.NEXT_PUBLIC_APP_ID as string,
      key: process.env.NEXT_PUBLIC_KEY as string,
      secret: process.env.NEXT_PUBLIC_SECRET as string,
      cluster: process.env.NEXT_PUBLIC_CLUSTER as string,
    });
    const selectedChannel = process.env.NEXT_PUBLIC_CHANNEL as string;
    const event =
      (process.env.NEXT_PUBLIC_URL_EVENT as string) +
      (channel ? `-${channel}` : '');
    const push = await pusher.trigger(selectedChannel, event, { message: load });
    if (push.status === 200) {
      return Response.json({ data: load, channel }, { status: 200 });
    }
    return Response.json({ data: 'web socket error', channel }, { status: 500 });
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
}