export interface LiveEvent {
  id: string;
  name: string;
  startTime: number;
  endTime: number;
  bonusMultiplier: number;
  cosmeticSkinId?: string;
}

export const SAMPLE_EVENTS: LiveEvent[] = [
  {
    id: 'nile_festival',
    name: 'Nile Festival',
    startTime: 0,
    endTime: 0,
    bonusMultiplier: 1.5,
    cosmeticSkinId: 'festival_banner'
  }
];

export class EventScheduler {
  constructor(private events: LiveEvent[] = SAMPLE_EVENTS) {}

  getActiveEvent(now: number = Date.now()): LiveEvent | null {
    return this.events.find(event => now >= event.startTime && now < event.endTime) ?? null;
  }
}
