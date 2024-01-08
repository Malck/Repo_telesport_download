// TODO: create here a typescript interface for an olympic country
import { Participation } from "./Participation";

/**
 * Olympic model.
 */
export interface Olympic {
    id: number;
    country: string;
    participations: Participation[];
}
