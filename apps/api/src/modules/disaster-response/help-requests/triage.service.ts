import { Injectable } from '@nestjs/common';

export type TriageCategory =
  | 'MEDICAL'
  | 'TRAPPED'
  | 'FLOOD_WATER'
  | 'INFRASTRUCTURE_DAMAGE'
  | 'OTHER';

export type HelpUrgency = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

const URGENCY_ORDER: HelpUrgency[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

function urgencyLevel(u: HelpUrgency): number {
  const i = URGENCY_ORDER.indexOf(u);
  return i >= 0 ? i : -1;
}

export interface TriageResult {
  category: TriageCategory;
  suggestedUrgency: HelpUrgency;
}

/**
 * Rule-based triage for help request descriptions.
 * Classifies into script categories: medical, trapped, flood, infrastructure
 * and suggests urgency so responders can prioritize.
 */
@Injectable()
export class TriageService {
  triage(description: string, hazardType?: string): TriageResult {
    const text = (description || '').toLowerCase().trim();
    if (!text) {
      return { category: 'OTHER', suggestedUrgency: 'MEDIUM' };
    }

    const results: { category: TriageCategory; urgency: HelpUrgency }[] = [];

    // Medical: ambulance, heart, stroke, injury, sick, hospital, medicine, bleed, unconscious, etc.
    const medicalKeywords =
      /\b(ambulance|heart|stroke|injury|injured|sick|hospital|medicine|medication|bleed|bleeding|unconscious|critical\s*condition|pregnant|baby|child\s*hurt|diabetic|asthma|allergic)\b/i;
    if (medicalKeywords.test(text)) {
      results.push({
        category: 'MEDICAL',
        urgency: /(critical|unconscious|bleed|stroke|heart\s*attack)/i.test(text)
          ? 'CRITICAL'
          : 'HIGH',
      });
    }

    // Trapped: stuck, cannot leave, roof, building collapse, trapped
    const trappedKeywords =
      /\b(trapped|stuck|cannot\s*leave|can't\s*leave|roof|building\s*collapse|collapsed|stranded|evacuat)\b/i;
    if (trappedKeywords.test(text)) {
      results.push({
        category: 'TRAPPED',
        urgency: 'CRITICAL',
      });
    }

    // Flood/water: flood, water rising, submerged, drowning
    const floodKeywords =
      /\b(flood|flooding|water\s*rising|rising\s*water|submerged|drowning|floodwater|flooded)\b/i;
    if (floodKeywords.test(text)) {
      results.push({
        category: 'FLOOD_WATER',
        urgency: /(drowning|submerged|trapped)/i.test(text) ? 'CRITICAL' : 'HIGH',
      });
    }

    // Infrastructure: bridge, road, power, building damage, etc.
    const infraKeywords =
      /\b(bridge|road|power|electricity|building\s*damage|collapse|landslide|blocked\s*road|fallen\s*tree)\b/i;
    if (infraKeywords.test(text)) {
      results.push({
        category: 'INFRASTRUCTURE_DAMAGE',
        urgency: 'MEDIUM',
      });
    }

    if (results.length === 0) {
      return { category: 'OTHER', suggestedUrgency: 'MEDIUM' };
    }

    // Take highest urgency and first matching category (priority: medical > trapped > flood > infra)
    const byPriority: TriageCategory[] = [
      'MEDICAL',
      'TRAPPED',
      'FLOOD_WATER',
      'INFRASTRUCTURE_DAMAGE',
      'OTHER',
    ];
    const best = results.reduce((acc, r) => {
      if (urgencyLevel(r.urgency) > urgencyLevel(acc.urgency)) return r;
      if (urgencyLevel(r.urgency) === urgencyLevel(acc.urgency)) {
        if (byPriority.indexOf(r.category) < byPriority.indexOf(acc.category))
          return r;
      }
      return acc;
    });

    return {
      category: best.category,
      suggestedUrgency: best.urgency,
    };
  }
}
