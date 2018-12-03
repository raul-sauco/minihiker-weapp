/**
 * Contains all the details for a Trip entry
 */
export class Trip {
  id: number;
  name: string;
  description: string;
  location: string;
  cover?: URL;
  registering: boolean;
  minAge: number;
  maxAge: number;
  period?: string;
}