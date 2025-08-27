import { NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';
// Static export configuration for Next.js
export const dynamic = 'force-static';
export const revalidate = false;



// GET - Fetch system settings
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    let query = supabase
      .from('system_settings')
      .select('*')
      .eq('is_active', true)
      .order('category', { ascending: true })
      .order('setting_key', { ascending: true });

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    const { data: settings, error } = await query;

    if (error) {
      console.error('Error fetching settings:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Group settings by category
    const groupedSettings = settings.reduce((acc, setting) => {
      if (!acc[setting.category]) {
        acc[setting.category] = [];
      }
      acc[setting.category].push(setting);
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      settings: groupedSettings,
      allSettings: settings
    });

  } catch (error) {
    console.error('Settings fetch error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update system settings
export async function PUT(request) {
  try {
    const body = await request.json();
    const { settings, adminUserId } = body;

    if (!settings || !Array.isArray(settings)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Settings array is required' 
      }, { status: 400 });
    }

    const updatedSettings = [];
    const errors = [];

    // Process each setting update
    for (const setting of settings) {
      const { setting_key, setting_value, description, category } = setting;

      if (!setting_key) {
        errors.push(`Missing setting_key for setting: ${JSON.stringify(setting)}`);
        continue;
      }

      try {
        const { data: updatedSetting, error } = await supabase
          .from('system_settings')
          .update({
            setting_value,
            description,
            category,
            updated_at: new Date().toISOString()
          })
          .eq('setting_key', setting_key)
          .select()
          .single();

        if (error) {
          errors.push(`Failed to update ${setting_key}: ${error.message}`);
        } else {
          updatedSettings.push(updatedSetting);
        }
      } catch (err) {
        errors.push(`Error updating ${setting_key}: ${err.message}`);
      }
    }

    // Log admin action
    if (adminUserId && updatedSettings.length > 0) {
      await supabase
        .from('admin_logs')
        .insert({
          admin_user_id: adminUserId,
          action_type: 'settings_changed',
          resource_type: 'settings',
          details: { 
            updatedCount: updatedSettings.length,
            settingKeys: updatedSettings.map(s => s.setting_key),
            errors: errors.length > 0 ? errors : undefined
          }
        });
    }

    return NextResponse.json({
      success: errors.length === 0,
      updatedSettings,
      errors: errors.length > 0 ? errors : undefined,
      message: errors.length === 0 
        ? `Successfully updated ${updatedSettings.length} setting(s)` 
        : `Updated ${updatedSettings.length} setting(s) with ${errors.length} error(s)`
    });

  } catch (error) {
    console.error('Settings update error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new system setting
export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      setting_key, 
      setting_value, 
      description, 
      category,
      adminUserId 
    } = body;

    if (!setting_key || setting_value === undefined) {
      return NextResponse.json({ 
        success: false, 
        error: 'Setting key and value are required' 
      }, { status: 400 });
    }

    // Check if setting already exists
    const { data: existingSetting } = await supabase
      .from('system_settings')
      .select('setting_key')
      .eq('setting_key', setting_key)
      .single();

    if (existingSetting) {
      return NextResponse.json({ 
        success: false, 
        error: 'Setting already exists' 
      }, { status: 409 });
    }

    // Create new setting
    const { data: newSetting, error } = await supabase
      .from('system_settings')
      .insert({
        setting_key,
        setting_value,
        description,
        category: category || 'general'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating setting:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Log admin action
    if (adminUserId) {
      await supabase
        .from('admin_logs')
        .insert({
          admin_user_id: adminUserId,
          action_type: 'setting_created',
          resource_type: 'settings',
          resource_id: newSetting.id,
          details: { setting_key, category }
        });
    }

    return NextResponse.json({
      success: true,
      setting: newSetting,
      message: 'Setting created successfully'
    });

  } catch (error) {
    console.error('Setting creation error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete system setting
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const settingKey = searchParams.get('settingKey');
    const adminUserId = searchParams.get('adminUserId');

    if (!settingKey) {
      return NextResponse.json({ 
        success: false, 
        error: 'Setting key is required' 
      }, { status: 400 });
    }

    // Delete setting
    const { error } = await supabase
      .from('system_settings')
      .delete()
      .eq('setting_key', settingKey);

    if (error) {
      console.error('Error deleting setting:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Log admin action
    if (adminUserId) {
      await supabase
        .from('admin_logs')
        .insert({
          admin_user_id: adminUserId,
          action_type: 'setting_deleted',
          resource_type: 'settings',
          details: { setting_key: settingKey }
        });
    }

    return NextResponse.json({
      success: true,
      message: 'Setting deleted successfully'
    });

  } catch (error) {
    console.error('Setting deletion error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
