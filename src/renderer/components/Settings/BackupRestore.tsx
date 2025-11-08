import React, { useState } from 'react';
import Card from '../Common/Card';
import Button from '../Common/Button';
import { Download, Upload, AlertTriangle } from 'lucide-react';
import { confirmWithFocusRestore, alertWithFocusRestore, ensureAllInputsClickable } from '../../utils/focusUtils';

const BackupRestore: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    try {
      setLoading(true);
      const data = await window.electronAPI.exportData();
      
      if (data) {
        const jsonStr = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `financial-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        alertWithFocusRestore('Backup created successfully!');
        ensureAllInputsClickable();
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      alertWithFocusRestore('Failed to create backup.');
      ensureAllInputsClickable();
    } finally {
      setLoading(false);
    }
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async (e: any) => {
      try {
        setLoading(true);
        const file = e.target.files[0];
        const text = await file.text();
        const data = JSON.parse(text);
        
        const confirmed = confirmWithFocusRestore('This will import data and may overwrite existing information. Continue?');
        if (confirmed) {
          await window.electronAPI.importData(data);
          alertWithFocusRestore('Data imported successfully! Reload the application.');
        } else {
          ensureAllInputsClickable();
        }
      } catch (error) {
        console.error('Error importing data:', error);
        alertWithFocusRestore('Failed to import backup. Make sure the file is valid.');
        ensureAllInputsClickable();
      } finally {
        setLoading(false);
      }
    };
    
    input.click();
  };

  const handleWipeData = async () => {
    const confirmed = confirmWithFocusRestore('⚠️ WARNING: This will permanently delete ALL your financial data. This action CANNOT be undone. Are you absolutely sure?');
    
    if (!confirmed) {
      ensureAllInputsClickable();
      return;
    }
    
    const doubleConfirm = confirmWithFocusRestore('This is your last chance. Type YES in the next prompt to confirm.');
    
    if (!doubleConfirm) {
      ensureAllInputsClickable();
      return;
    }
    
    const finalConfirm = prompt('Type YES to confirm deletion of all data:');
    
    if (finalConfirm === 'YES') {
      try {
        setLoading(true);
        await window.electronAPI.wipeAllData();
        alertWithFocusRestore('All data has been wiped. The application will reload.');
        window.location.reload();
      } catch (error) {
        console.error('Error wiping data:', error);
        alertWithFocusRestore('Failed to wipe data.');
        ensureAllInputsClickable();
      } finally {
        setLoading(false);
      }
    } else {
      ensureAllInputsClickable();
    }
  };

  return (
    <div className="expense-tracker">
      <div className="module-header">
        <div><h1>Backup & Restore</h1><p>Export, import, or wipe your financial data</p></div>
      </div>

      <div style={{display: 'grid', gap: '20px'}}>
        <Card title="Export Data">
          <p style={{marginBottom: '16px', color: 'var(--text-secondary)', fontSize: '14px'}}>
            Download all your financial data as an encrypted JSON file. Keep this backup safe!
          </p>
          <Button onClick={handleExport} disabled={loading}>
            <Download size={16} /> Export All Data
          </Button>
        </Card>

        <Card title="Import Data">
          <p style={{marginBottom: '16px', color: 'var(--text-secondary)', fontSize: '14px'}}>
            Restore your financial data from a previously exported backup file.
          </p>
          <Button onClick={handleImport} variant="secondary" disabled={loading}>
            <Upload size={16} /> Import Data
          </Button>
        </Card>

        <Card title="Danger Zone">
          <div style={{background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', borderRadius: '8px', padding: '16px'}}>
            <div style={{display: 'flex', gap: '12px', marginBottom: '16px'}}>
              <AlertTriangle size={24} color="var(--danger)" />
              <div>
                <h3 style={{fontSize: '16px', fontWeight: 600, color: 'var(--danger)', marginBottom: '8px'}}>Wipe All Data</h3>
                <p style={{fontSize: '14px', color: 'var(--text-secondary)'}}>
                  Permanently delete all financial data, including expenses, income, investments, goals, and profile information. 
                  This action is irreversible.
                </p>
              </div>
            </div>
            <Button onClick={handleWipeData} variant="danger" disabled={loading}>
              <AlertTriangle size={16} /> Wipe All Data
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default BackupRestore;


