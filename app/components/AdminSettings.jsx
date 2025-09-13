"use client";

import { useState, useEffect } from 'react';

const AdminSettings = () => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeCategory, setActiveCategory] = useState('general');
  const [showNewSetting, setShowNewSetting] = useState(false);
  const [newSetting, setNewSetting] = useState({
    setting_key: '',
    setting_value: '',
    description: '',
    category: 'general'
  });

  const categories = [
    { id: 'general', name: 'General', icon: '⚙️' },
    { id: 'betting', name: 'Betting', icon: '🎲' },
    { id: 'currency', name: 'Currency', icon: '💰' },
    { id: 'notifications', name: 'Notifications', icon: '🔔' }
  ];

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    setLoading(true);
    fetch('/api/admin/settings', {
      signal: AbortSignal.timeout(10000) // 10 second timeout
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        setSettings(data.settings);
      }
    })
    .catch(error => {
      console.error('Failed to load settings:', error);
    })
    .finally(() => {
      setLoading(false);
    });
  };

  const saveSettings = () => {
    setSaving(true);
    // Prepare settings array for update
    const settingsToUpdate = [];
    Object.entries(settings).forEach(([category, categorySettings]) => {
      categorySettings.forEach(setting => {
        settingsToUpdate.push({
          setting_key: setting.setting_key,
          setting_value: setting.setting_value,
          description: setting.description,
          category: setting.category
        });
      });
    });

    fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(10000), // 10 second timeout
      body: JSON.stringify({
        settings: settingsToUpdate,
        adminUserId: 'admin-user-id' // This should come from auth context
      })
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        alert('Settings saved successfully!');
        if (data.errors && data.errors.length > 0) {
          alert(`Some settings had issues: ${data.errors.join(', ')}`);
        }
      } else {
        alert(`Error saving settings: ${data.error}`);
      }
    })
    .catch(error => {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings');
    })
    .finally(() => {
      setSaving(false);
    });
  };

  const createNewSetting = () => {
    if (!newSetting.setting_key || !newSetting.setting_value) {
      alert('Setting key and value are required');
      return;
    }

    fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(10000), // 10 second timeout
      body: JSON.stringify({
        ...newSetting,
        adminUserId: 'admin-user-id'
      })
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        // Add new setting to local state
        const category = data.setting.category;
        setSettings(prev => ({
          ...prev,
          [category]: [...(prev[category] || []), data.setting]
        }));
        
        setShowNewSetting(false);
        setNewSetting({
          setting_key: '',
          setting_value: '',
          description: '',
          category: 'general'
        });
        alert('Setting created successfully!');
      } else {
        alert(`Error creating setting: ${data.error}`);
      }
    })
    .catch(error => {
      console.error('Failed to create setting:', error);
      alert('Failed to create setting');
    });
  };

  const deleteSetting = (settingKey) => {
    if (!confirm(`Are you sure you want to delete the setting "${settingKey}"?`)) {
      return;
    }

    fetch(`/api/admin/settings?settingKey=${settingKey}&adminUserId=admin-user-id`, {
      method: 'DELETE',
      signal: AbortSignal.timeout(10000) // 10 second timeout
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        // Remove setting from local state
        setSettings(prev => {
          const newSettings = { ...prev };
          Object.keys(newSettings).forEach(category => {
            newSettings[category] = newSettings[category].filter(s => s.setting_key !== settingKey);
          });
          return newSettings;
        });
        alert('Setting deleted successfully!');
      } else {
        alert(`Error deleting setting: ${data.error}`);
      }
    })
    .catch(error => {
      console.error('Failed to delete setting:', error);
      alert('Failed to delete setting');
    });
  };

  const updateSettingValue = (category, settingKey, newValue) => {
    setSettings(prev => ({
      ...prev,
      [category]: prev[category].map(setting =>
        setting.setting_key === settingKey
          ? { ...setting, setting_value: newValue }
          : setting
      )
    }));
  };

  const renderSettingInput = (setting, category) => {
    const value = typeof setting.setting_value === 'string' 
      ? setting.setting_value.replace(/^"|"$/g, '') // Remove quotes if present
      : setting.setting_value;

    // Determine input type based on setting key and value
    const getInputType = () => {
      if (setting.setting_key.includes('password')) return 'password';
      if (setting.setting_key.includes('email')) return 'email';
      if (setting.setting_key.includes('url')) return 'url';
      if (typeof value === 'number' || setting.setting_key.includes('amount') || setting.setting_key.includes('percentage')) return 'number';
      if (value === 'true' || value === 'false' || value === true || value === false) return 'checkbox';
      return 'text';
    };

    const inputType = getInputType();

    if (inputType === 'checkbox') {
      return (
        <input
          type="checkbox"
          checked={value === 'true' || value === true}
          onChange={(e) => updateSettingValue(category, setting.setting_key, e.target.checked)}
          className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
        />
      );
    }

    if (setting.setting_key.includes('description') || setting.description?.includes('long')) {
      return (
        <textarea
          value={value}
          onChange={(e) => updateSettingValue(category, setting.setting_key, e.target.value)}
          className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md text-sm"
          rows="3"
        />
      );
    }

    return (
      <input
        type={inputType}
        value={value}
        onChange={(e) => updateSettingValue(category, setting.setting_key, e.target.value)}
        className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md text-sm"
        step={inputType === 'number' ? '0.01' : undefined}
        min={inputType === 'number' && setting.setting_key.includes('percentage') ? '0' : undefined}
        max={inputType === 'number' && setting.setting_key.includes('percentage') ? '100' : undefined}
      />
    );
  };

  const formatSettingKey = (key) => {
    return key
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-400">Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">System Settings</h2>
        <div className="flex gap-3">
          <button
            onClick={() => setShowNewSetting(true)}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold"
          >
            + Add Setting
          </button>
          <button
            onClick={saveSettings}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Category Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Categories</h3>
            <div className="space-y-2">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg font-medium transition-colors ${
                    activeCategory === category.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <span className="mr-2">{category.icon}</span>
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-6 capitalize">
              {activeCategory} Settings
            </h3>

            {settings[activeCategory] && settings[activeCategory].length > 0 ? (
              <div className="space-y-6">
                {settings[activeCategory].map((setting) => (
                  <div key={setting.setting_key} className="border-b border-gray-700 pb-4 last:border-b-0">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          {formatSettingKey(setting.setting_key)}
                        </label>
                        {setting.description && (
                          <p className="text-xs text-gray-500 mb-2">{setting.description}</p>
                        )}
                      </div>
                      <button
                        onClick={() => deleteSetting(setting.setting_key)}
                        className="text-red-400 hover:text-red-300 text-sm ml-4"
                      >
                        Delete
                      </button>
                    </div>
                    
                    {renderSettingInput(setting, activeCategory)}
                    
                    <div className="mt-1 text-xs text-gray-500">
                      Key: <code className="bg-gray-700 px-1 rounded">{setting.setting_key}</code>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                No settings found for this category.
                <br />
                <button
                  onClick={() => setShowNewSetting(true)}
                  className="mt-2 text-blue-400 hover:text-blue-300"
                >
                  Add your first setting
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Setting Modal */}
      {showNewSetting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-lg">
            <h3 className="text-xl font-bold text-white mb-4">Add New Setting</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Category
                </label>
                <select
                  value={newSetting.category}
                  onChange={(e) => setNewSetting({...newSetting, category: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md"
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Setting Key *
                </label>
                <input
                  type="text"
                  value={newSetting.setting_key}
                  onChange={(e) => setNewSetting({...newSetting, setting_key: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md"
                  placeholder="e.g., max_bet_amount"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Setting Value *
                </label>
                <input
                  type="text"
                  value={newSetting.setting_value}
                  onChange={(e) => setNewSetting({...newSetting, setting_value: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md"
                  placeholder="e.g., 1000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={newSetting.description}
                  onChange={(e) => setNewSetting({...newSetting, description: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-md"
                  rows="2"
                  placeholder="Brief description of what this setting does..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowNewSetting(false)}
                className="px-4 py-2 text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={createNewSetting}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold"
              >
                Create Setting
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Confirmation */}
      {saving && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-white">Saving settings...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSettings;
