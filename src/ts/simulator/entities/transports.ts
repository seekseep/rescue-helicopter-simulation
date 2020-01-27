export type TransportID = number

export interface Transport {
  id: TransportID;
  speed: number;
  displayName: string;
  maxInjuredsCount: number;
  useRescueRate: boolean;
}

export type Helicopter = Transport
