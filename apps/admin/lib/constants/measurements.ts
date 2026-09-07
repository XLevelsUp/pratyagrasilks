/**
 * Tailoring measurement fields — single source of truth, mirrored from the
 * printed "Pratyagra Designer — Customised Measurement Sheet".
 * The Zod schema, form, list display, and DB column mapping all derive from
 * this array; adding a measurement here (+ a DECIMAL(5,2) column in
 * measurement_profiles) is the only change needed.
 */

export const MEASUREMENT_GROUPS = [
    'Upper Body',
    'Torso',
    'Lower Body',
    'Garment Lengths',
] as const;

export type MeasurementGroup = (typeof MEASUREMENT_GROUPS)[number];

export interface MeasurementField {
    /** camelCase key used in forms/types */
    key: string;
    /** snake_case column in measurement_profiles */
    column: string;
    label: string;
    group: MeasurementGroup;
}

export const MEASUREMENT_FIELDS = [
    // ── Upper Body ────────────────────────────────────────────────
    { key: 'armHole', column: 'arm_hole', label: 'Arm Hole', group: 'Upper Body' },
    { key: 'bicep', column: 'bicep', label: 'Bicep', group: 'Upper Body' },
    { key: 'neckDeepFront', column: 'neck_deep_front', label: 'Neck Deep Front', group: 'Upper Body' },
    { key: 'neckDeepBack', column: 'neck_deep_back', label: 'Neck Deep Back', group: 'Upper Body' },
    { key: 'sleeveLength', column: 'sleeve_length', label: 'Sleeve Length', group: 'Upper Body' },
    { key: 'wrist', column: 'wrist', label: 'Wrist', group: 'Upper Body' },
    { key: 'shoulderFront', column: 'shoulder_front', label: 'Shoulder Front', group: 'Upper Body' },
    { key: 'shoulderBack', column: 'shoulder_back', label: 'Shoulder Back', group: 'Upper Body' },
    // ── Torso ─────────────────────────────────────────────────────
    { key: 'shoulderToApex', column: 'shoulder_to_apex', label: 'Shoulder to Apex', group: 'Torso' },
    { key: 'shoulderToBust', column: 'shoulder_to_bust', label: 'Shoulder to Bust', group: 'Torso' },
    { key: 'shoulderToUnderBust', column: 'shoulder_to_under_bust', label: 'Shoulder to Under Bust', group: 'Torso' },
    { key: 'upperBust', column: 'upper_bust', label: 'Upper Bust', group: 'Torso' },
    { key: 'bust', column: 'bust', label: 'Bust', group: 'Torso' },
    { key: 'lowerBust', column: 'lower_bust', label: 'Lower Bust', group: 'Torso' },
    { key: 'waist', column: 'waist', label: 'Waist', group: 'Torso' },
    { key: 'hip', column: 'hip', label: 'Hip', group: 'Torso' },
    { key: 'seat', column: 'seat', label: 'Seat', group: 'Torso' },
    // ── Lower Body ────────────────────────────────────────────────
    { key: 'upperThighRound', column: 'upper_thigh_round', label: 'Upper Thigh Round', group: 'Lower Body' },
    { key: 'midThighRound', column: 'mid_thigh_round', label: 'Mid Thigh Round', group: 'Lower Body' },
    { key: 'knee', column: 'knee', label: 'Knee', group: 'Lower Body' },
    { key: 'calf', column: 'calf', label: 'Calf', group: 'Lower Body' },
    { key: 'ankle', column: 'ankle', label: 'Ankle', group: 'Lower Body' },
    { key: 'crotch', column: 'crotch', label: 'Crotch', group: 'Lower Body' },
    // ── Garment Lengths ───────────────────────────────────────────
    { key: 'blouseLength', column: 'blouse_length', label: 'Blouse Length', group: 'Garment Lengths' },
    { key: 'shirtLength', column: 'shirt_length', label: 'Shirt Length', group: 'Garment Lengths' },
    { key: 'pantLength', column: 'pant_length', label: 'Pant Length', group: 'Garment Lengths' },
    { key: 'topLength', column: 'top_length', label: 'Top / Kurta Length', group: 'Garment Lengths' },
] as const satisfies readonly MeasurementField[];

export type MeasurementKey = (typeof MEASUREMENT_FIELDS)[number]['key'];

export const MEASUREMENT_COUNT = MEASUREMENT_FIELDS.length;

/** Fields grouped in display order, for fieldsets and read-only grids */
export function fieldsByGroup(): { group: MeasurementGroup; fields: MeasurementField[] }[] {
    return MEASUREMENT_GROUPS.map((group) => ({
        group,
        fields: MEASUREMENT_FIELDS.filter((f) => f.group === group),
    }));
}
