import { Injectable } from '@angular/core';
import content from '../content/en.json';

export type AppContent = typeof content;

@Injectable({ providedIn: 'root' })
export class ContentService {
  readonly c: AppContent = content;
}
