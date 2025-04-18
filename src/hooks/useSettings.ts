import { useState, useEffect } from 'react';
import { db } from '@/lib/supabase/client';
import { BarcodeSettings, AppSettings } from '@/lib/types/settings';
import { BarcodeSettings as BarcodeSettingsUI } from '@/lib/utils/barcodeUtils';
import { ReceiptSettings } from '@/lib/utils/receiptUtils';

export function useSettings() {
  // State for settings
  const [appSettings, setAppSettings] = useState<AppSettings | null>(null);
  const [barcodeSettings, setBarcodeSettings] = useState<BarcodeSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  // Fetch settings from the database
  const fetchSettings = async () => {
    setLoading(true);
    setSaveStatus('idle');
    try {
      // Fetch app settings
      const { data: appData, error: appError } = await db.appSettings.getSettings();

      if (appError) {
        console.error('Error fetching app settings:', appError);
      }

      if (appData) {
        setAppSettings(appData);
      }

      // Fetch barcode settings
      const { data: barcodeData, error: barcodeError } = await db.barcodeSettings.getSettings();

      if (barcodeError) {
        console.error('Error fetching barcode settings:', barcodeError);
      }

      if (barcodeData) {
        setBarcodeSettings(barcodeData);
      }

    } catch (err) {
      console.error('Error fetching settings:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch settings'));
    } finally {
      setLoading(false);
    }
  };

  // Save app settings
  const saveAppSettings = async (settings: Partial<AppSettings>) => {
    setSaveStatus('saving');
    try {
      if (appSettings?.id) {
        // Update existing settings
        const { error } = await db.appSettings.updateSettings(appSettings.id, settings);

        if (error) {
          throw new Error(error.message);
        }

        // Update local state
        setAppSettings(prev => prev ? { ...prev, ...settings } : null);
        setSaveStatus('success');
        return { success: true };
      } else {
        // Create new settings
        const newSettings = {
          temple_name: settings.temple_name || 'ISKCON Temple',
          receipt_header: settings.receipt_header || 'ISKCON Temple Book Stall',
          receipt_footer: settings.receipt_footer || 'Thank you for your purchase! Hare Krishna!',
          show_logo: settings.show_logo !== undefined ? settings.show_logo : true,
          show_barcode: settings.show_barcode !== undefined ? settings.show_barcode : true,
          custom_message: settings.custom_message || 'Hare Krishna! Thank you for supporting ISKCON Temple.'
        };

        const { data, error } = await db.appSettings.createSettings(newSettings);

        if (error) {
          throw new Error(error.message);
        }

        if (data && data.length > 0) {
          setAppSettings(data[0]);
        }

        setSaveStatus('success');
        return { success: true };
      }
    } catch (err) {
      console.error('Error saving app settings:', err);
      setSaveStatus('error');
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to save app settings'
      };
    }
  };

  // Save barcode settings
  const saveBarcodeSettings = async (settings: Partial<BarcodeSettings>) => {
    setSaveStatus('saving');
    try {
      if (barcodeSettings?.id) {
        // Update existing settings
        const { error } = await db.barcodeSettings.updateSettings(barcodeSettings.id, settings);

        if (error) {
          throw new Error(error.message);
        }

        // Update local state
        setBarcodeSettings(prev => prev ? { ...prev, ...settings } : null);
        setSaveStatus('success');
        return { success: true };
      } else {
        // Create new settings
        const newSettings = {
          type: settings.type || 'CODE128',
          size: settings.size || '50x25',
          include_price: settings.include_price !== undefined ? settings.include_price : true,
          include_title: settings.include_title !== undefined ? settings.include_title : true,
          include_language: settings.include_language !== undefined ? settings.include_language : true,
          custom_heading: settings.custom_heading || 'ISKCON Temple'
        };

        const { data, error } = await db.barcodeSettings.createSettings(newSettings);

        if (error) {
          throw new Error(error.message);
        }

        if (data && data.length > 0) {
          setBarcodeSettings(data[0]);
        }

        setSaveStatus('success');
        return { success: true };
      }
    } catch (err) {
      console.error('Error saving barcode settings:', err);
      setSaveStatus('error');
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to save barcode settings'
      };
    }
  };

  // Convert database AppSettings to UI ReceiptSettings
  const getReceiptSettings = (): ReceiptSettings => {
    if (!appSettings) {
      return {
        header: 'ISKCON Temple Book Stall',
        footer: 'Thank you for your purchase! Hare Krishna!',
        showLogo: true,
        showBarcode: true,
        customMessage: 'Hare Krishna! Thank you for supporting ISKCON Temple.',
        size: '80mm',
        printerType: 'browser',
        printerIp: '',
        printerPort: 9100,
        showPrintPreview: true
      };
    }

    return {
      header: appSettings.receipt_header,
      footer: appSettings.receipt_footer,
      showLogo: appSettings.show_logo,
      showBarcode: appSettings.show_barcode,
      customMessage: appSettings.custom_message || '',
      size: appSettings.receipt_size || '80mm',
      printerType: appSettings.printer_type || 'browser',
      printerIp: appSettings.printer_ip || '',
      printerPort: appSettings.printer_port || 9100,
      showPrintPreview: appSettings.show_print_preview !== undefined ? appSettings.show_print_preview : true
    };
  };

  // Convert database BarcodeSettings to UI BarcodeSettings
  const getBarcodeSettingsUI = (): BarcodeSettingsUI => {
    if (!barcodeSettings) {
      return {
        type: 'CODE128',
        size: '50x25',
        includePrice: true,
        includeTitle: true,
        includeLanguage: true,
        customHeading: 'ISKCON Temple'
      };
    }

    return {
      type: barcodeSettings.type,
      size: barcodeSettings.size,
      includePrice: barcodeSettings.include_price,
      includeTitle: barcodeSettings.include_title,
      includeLanguage: barcodeSettings.include_language,
      customHeading: barcodeSettings.custom_heading
    };
  };

  // Convert UI ReceiptSettings to database AppSettings updates
  const convertReceiptSettingsToAppSettings = (settings: ReceiptSettings): Partial<AppSettings> => {
    return {
      receipt_header: settings.header,
      receipt_footer: settings.footer,
      show_logo: settings.showLogo,
      show_barcode: settings.showBarcode,
      custom_message: settings.customMessage,
      receipt_size: settings.size,
      printer_type: settings.printerType,
      printer_ip: settings.printerIp,
      printer_port: settings.printerPort,
      show_print_preview: settings.showPrintPreview
    };
  };

  // Convert UI BarcodeSettings to database BarcodeSettings updates
  const convertBarcodeSettingsUIToDatabase = (settings: BarcodeSettingsUI): Partial<BarcodeSettings> => {
    return {
      type: settings.type,
      size: settings.size,
      include_price: settings.includePrice,
      include_title: settings.includeTitle,
      include_language: settings.includeLanguage,
      custom_heading: settings.customHeading
    };
  };

  // Save receipt settings (converts to app settings and saves)
  const saveReceiptSettings = async (settings: ReceiptSettings) => {
    const appSettingsUpdates = convertReceiptSettingsToAppSettings(settings);
    const result = await saveAppSettings(appSettingsUpdates);
    return result;
  };

  // Save barcode settings UI (converts to database format and saves)
  const saveBarcodeSettingsUI = async (settings: BarcodeSettingsUI) => {
    const barcodeSettingsUpdates = convertBarcodeSettingsUIToDatabase(settings);
    const result = await saveBarcodeSettings(barcodeSettingsUpdates);
    return result;
  };

  // Fetch settings on component mount
  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    appSettings,
    barcodeSettings,
    loading,
    error,
    saveStatus,
    fetchSettings,
    saveAppSettings,
    saveBarcodeSettings,
    getReceiptSettings,
    getBarcodeSettingsUI,
    saveReceiptSettings,
    saveBarcodeSettingsUI
  };
}
