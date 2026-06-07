import React from 'react';
import { useSettings } from '../contexts/SettingsContext';

const Settings = () => {
    const { isDarkMode, toggleTheme } = useSettings();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 text-gray-900 dark:text-gray-100 transition-colors duration-200">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Account Settings</h1>
                
                <div className="space-y-6">
                    {/* Theme Preference */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 flex justify-between items-center shadow-sm">
                        <div>
                            <h3 className="font-bold">Dark Mode</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Switch between light and dark themes.</p>
                        </div>
                        <button 
                            onClick={toggleTheme}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isDarkMode ? 'bg-blue-600' : 'bg-gray-300'}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>

                    {/* Placeholder for future email settings */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 flex justify-between items-center shadow-sm opacity-60">
                        <div>
                            <h3 className="font-bold">Email Notifications</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Manage your subscription preferences.</p>
                        </div>
                        <input type="checkbox" className="toggle" disabled />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;