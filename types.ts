
export type MessageSide = 'left' | 'right';

export interface ReactionGroup {
  emoji: string;
  names: string[];
}

export interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: string;
  side: MessageSide;
  reactions: ReactionGroup[];
  type: 'text' | 'image' | 'like';
}

export interface Participant {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
}

export interface ChatState {
  participants: Participant[];
  messages: Message[];
  activeChatTitle: string;
}
