import Pusher from 'pusher';

export async function POST(req: Request) {
  try {
    const { message, channel } = await req.json();
    const pusher = new Pusher({
      appId: process.env.NEXT_PUBLIC_APP_ID as string,
      key: process.env.NEXT_PUBLIC_KEY as string,
      secret: process.env.NEXT_PUBLIC_SECRET as string,
      cluster: process.env.NEXT_PUBLIC_CLUSTER as string,
    });
    const selectedChannel = process.env.NEXT_PUBLIC_CHANNEL as string;
    const event =
      (process.env.NEXT_PUBLIC_CAPTION_EVENT as string) +
      (channel ? `-${channel}` : '');
    const push = await pusher.trigger(selectedChannel, event, { message });
    if (push.status === 200) {
      return Response.json({ data: message, channel }, { status: 200 });
    }
    return Response.json({ data: 'error', channel }, { status: 500 });
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
}