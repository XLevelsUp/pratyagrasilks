import { NextRequest, NextResponse } from 'next/server';

// Ensure this route is always treated as dynamic
export const dynamic = 'force-dynamic';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
    try {
        const { state } = await request.json();

        if (!state) {
            return NextResponse.json(
                { error: 'State is required' },
                { status: 400 }
            );
        }

        const supabase = createClient();

        // Find shipping zone that includes this state
        const { data: zones, error } = await supabase
            .from('shipping_zones')
            .select('*')
            .eq('is_active', true);

        if (error) {
            console.error('Error fetching shipping zones:', error);
            return NextResponse.json(
                { error: 'Failed to fetch shipping zones' },
                { status: 500 }
            );
        }

        // Find the zone that contains this state
        const matchingZone = zones?.find((zone) =>
            zone.states.includes(state)
        );

        if (!matchingZone) {
            return NextResponse.json(
                { error: 'Shipping not available for this state' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            id: matchingZone.id,
            name: matchingZone.name,
            base_charge: matchingZone.base_charge,
            per_kg_charge: matchingZone.per_kg_charge,
            free_shipping_threshold: matchingZone.free_shipping_threshold,
            estimated_days: matchingZone.estimated_days,
        });
    } catch (error) {
        console.error('Shipping calculation error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
