import { NextResponse } from 'next/server';
import { getAuthenticatedAdmin } from '@/lib/server/adminAuth';
import { supabaseAdmin } from '@/lib/server/supabaseAdmin';

export async function GET() {
  try {
    const admin = await getAuthenticatedAdmin();
    if (!admin) {
      return NextResponse.json({ success: false, message: 'No autenticado' }, { status: 401 });
    }

    const [
      ordersCountRes,
      customersCountRes,
      productsCountRes,
      farmersCountRes,
      pendingApplicationsCountRes,
      pendingOrdersCountRes,
      lowStockCountRes,
      paidOrdersRes,
      recentOrdersRes,
      recentApplicationsRes
    ] = await Promise.all([
      supabaseAdmin.from('orders').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('customers').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('products').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('farmers').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('farmer_applications').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabaseAdmin.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabaseAdmin.from('products').select('id', { count: 'exact', head: true }).lte('stock_quantity', 5),
      supabaseAdmin.from('orders').select('total_amount').eq('payment_status', 'paid'),
      supabaseAdmin
        .from('orders')
        .select('id, order_number, customer_email, total_amount, status, created_at')
        .order('created_at', { ascending: false })
        .limit(5),
      supabaseAdmin
        .from('farmer_applications')
        .select('id, first_name, last_name, email, status, created_at')
        .order('created_at', { ascending: false })
        .limit(5)
    ]);

    const totalRevenue = (paidOrdersRes.data || []).reduce((sum, row) => sum + Number(row.total_amount || 0), 0);

    return NextResponse.json({
      success: true,
      stats: {
        total_products: productsCountRes.count || 0,
        total_orders: ordersCountRes.count || 0,
        total_customers: customersCountRes.count || 0,
        total_farmers: farmersCountRes.count || 0,
        pending_applications: pendingApplicationsCountRes.count || 0,
        total_revenue: totalRevenue,
        pending_orders: pendingOrdersCountRes.count || 0,
        low_stock_products: lowStockCountRes.count || 0,
        recent_orders: recentOrdersRes.data || [],
        recent_applications: recentApplicationsRes.data || []
      }
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
