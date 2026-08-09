export interface ContactMessage {
  readonly name: string;
  readonly email: string;
  readonly subject?: string;
  readonly message: string;
}
