import { HTMLAttributes } from 'react';

// Extend React's HTMLAttributes to support webkitdirectory
declare module 'react' {
  interface InputHTMLAttributes<T> extends HTMLAttributes<T> {
    webkitdirectory?: string | boolean;
    directory?: string | boolean;
  }
}

export enum AppMode {
  Chat = 'chat',
  Live = 'live',
  Image = 'image',
  Video = 'video',
  DevOps = 'devops',
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
  images?: string[];
  groundingUrls?: Array<{title: string, uri: string}>;
}

export enum ModelType {
  Flash = 'gemini-2.5-flash',
  Pro = 'gemini-3-pro-preview',
}

export interface VeoConfig {
  prompt: string;
  aspectRatio: '16:9' | '9:16';
  resolution: '720p' | '1080p';
}

export interface ImagenConfig {
  prompt: string;
  aspectRatio: '1:1' | '16:9' | '4:3' | '3:4' | '9:16';
  count: number;
}