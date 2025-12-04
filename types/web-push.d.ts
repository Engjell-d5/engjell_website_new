declare module 'web-push' {
  export interface VapidKeys {
    publicKey: string;
    privateKey: string;
  }

  export interface PushSubscription {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  }

  export interface SendResult {
    statusCode: number;
    body: string;
    headers: { [key: string]: string };
  }

  export function setVapidDetails(
    subject: string,
    publicKey: string,
    privateKey: string
  ): void;

  export function generateVAPIDKeys(): VapidKeys;

  export function sendNotification(
    subscription: PushSubscription,
    payload: string | Buffer,
    options?: {
      TTL?: number;
      urgency?: 'very-low' | 'low' | 'normal' | 'high';
      topic?: string;
    }
  ): Promise<SendResult>;

  interface WebPush {
    setVapidDetails(subject: string, publicKey: string, privateKey: string): void;
    generateVAPIDKeys(): VapidKeys;
    sendNotification(
      subscription: PushSubscription,
      payload: string | Buffer,
      options?: {
        TTL?: number;
        urgency?: 'very-low' | 'low' | 'normal' | 'high';
        topic?: string;
      }
    ): Promise<SendResult>;
  }

  const webpush: WebPush;
  export default webpush;
}
