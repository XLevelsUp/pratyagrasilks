import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Ensure this route is always treated as dynamic
export const dynamic = 'force-dynamic';

/**
 * GET /api/auth/me
 * Get current authenticated user/customer information
 * Returns 401 if not authenticated
 */
export async function GET(request: NextRequest) {
    try {
        const supabase = createClient();

        // Get the current authenticated user
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                {
                    authenticated: false,
                    error: 'Not authenticated',
                    message: 'Please log in to continue',
                },
                { status: 401 }
            );
        }

        // Fetch customer details from the customers table
        const { data: customer, error: customerError } = await supabase
            .from('customers')
            .select(`
                id,
                email,
                full_name,
                phone,
                created_at,
                updated_at,
                is_active
            `)
            .eq('id', user.id)
            .single();

        if (customerError && customerError.code !== 'PGRST116') {
            console.error('Error fetching customer:', customerError);
            return NextResponse.json(
                { error: 'Failed to fetch customer details' },
                { status: 500 }
            );
        }

        // If customer doesn't exist in customers table, return auth user info
        if (!customer) {
            return NextResponse.json({
                authenticated: true,
                user: {
                    id: user.id,
                    email: user.email,
                    user_metadata: user.user_metadata || {},
                },
                customer: null,
                message: 'User is authenticated but no customer profile found',
            });
        }

        // Fetch default addresses
        const { data: addresses } = await supabase
            .from('addresses')
            .select('*')
            .eq('customer_id', customer.id)
            .eq('is_default', true)
            .limit(1);

        // Fetch wishlist count
        const { count: wishlistCount } = await supabase
            .from('wishlist')
            .select('*', { count: 'exact', head: true })
            .eq('customer_id', customer.id);

        // Fetch cart count
        const { count: cartCount } = await supabase
            .from('cart_items')
            .select('*', { count: 'exact', head: true })
            .eq('customer_id', customer.id);

        // Fetch recent orders count
        const { count: ordersCount } = await supabase
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .eq('customer_id', customer.id);

        return NextResponse.json({
            authenticated: true,
            customer: {
                id: customer.id,
                email: customer.email,
                full_name: customer.full_name,
                phone: customer.phone,
                is_active: customer.is_active,
                created_at: customer.created_at,
                updated_at: customer.updated_at,
                default_address: addresses?.[0] || null,
            },
            stats: {
                wishlisted_products: wishlistCount || 0,
                cart_items: cartCount || 0,
                total_orders: ordersCount || 0,
            },
        });
    } catch (error) {
        console.error('Auth ME error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
