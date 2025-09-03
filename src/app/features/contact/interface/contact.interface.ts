export interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
  honeypot?: string;
}

export interface ContactFormResponse {
  success: boolean;
  message: string;
  status?: number;
  error?: string;
}

export interface ContactCard {
  id: string;
  title: string;
  icon: string;
  content: string;
  link?: string;
}

export interface ContactCardGroup {
  id: string;
  title: string;
  items: ContactCard[];
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ContactMessageCount {
  count: number;
}
