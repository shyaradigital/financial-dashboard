import React, { useState } from 'react';
import Card from '../Common/Card';
import Button from '../Common/Button';
import Modal from '../Common/Modal';
import { Download, Upload, AlertTriangle } from 'lucide-react';
import ConfirmDialog from '../Common/ConfirmDialog';
import AlertDialog from '../Common/AlertDialog';
import { ensureAllInputsClickable } from '../../utils/focusUtils';

const BackupRestore: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [showWipeConfirm, setShowWipeConfirm] = useState(false);
  const [showWipeDoubleConfirm, setShowWipeDoubleConfirm] = useState(false);
  const [showWipeFinalConfirm, setShowWipeFinalConfirm] = useState(false);
  const [wipeFinalText, setWipeFinalText] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertVariant, setAlertVariant] = useState<'success' | 'error' | 'warning' | 'info'>('info');
  const [pendingImportData, setPendingImportData] = useState<any>(null);

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
        
        setAlertMessage('Backup created successfully!');
        setAlertVariant('success');
        setShowAlert(true);
        ensureAllInputsClickable();
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      setAlertMessage('Failed to create backup.');
      setAlertVariant('error');
      setShowAlert(true);
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
        const file = e.target.files[0];
        const text = await file.text();
        const data = JSON.parse(text);
        setPendingImportData(data);
        setShowImportConfirm(true);
      } catch (error) {
        console.error('Error importing data:', error);
        setAlertMessage('Failed to import backup. Make sure the file is valid.');
        setAlertVariant('error');
        setShowAlert(true);
        ensureAllInputsClickable();
      }
    };
    
    input.click();
  };

  const handleWipeData = () => {
    setShowWipeConfirm(true);
  };

  const handleImportConfirm = async () => {
    setShowImportConfirm(false);
    try {
      setLoading(true);
      if (pendingImportData) {
        await window.electronAPI.importData(pendingImportData);
        setPendingImportData(null);
        setAlertMessage('Data imported successfully! Reload the application.');
        setAlertVariant('success');
        setShowAlert(true);
      }
    } catch (error) {
      console.error('Error importing data:', error);
      setAlertMessage('Failed to import backup. Make sure the file is valid.');
      setAlertVariant('error');
      setShowAlert(true);
    } finally {
      setLoading(false);
      ensureAllInputsClickable();
    }
  };

  const handleWipeConfirm = () => {
    setShowWipeConfirm(false);
    setTimeout(() => {
      setShowWipeDoubleConfirm(true);
      ensureAllInputsClickable();
    }, 100);
  };

  const handleWipeDoubleConfirm = () => {
    setShowWipeDoubleConfirm(false);
    setTimeout(() => {
      setShowWipeFinalConfirm(true);
      setWipeFinalText('');
      ensureAllInputsClickable();
    }, 100);
  };

  const handleWipeFinalConfirm = async () => {
    if (wipeFinalText !== 'YES') {
      setAlertMessage('Confirmation text does not match. Operation cancelled.');
      setAlertVariant('warning');
      setShowAlert(true);
      setShowWipeFinalConfirm(false);
      setWipeFinalText('');
      ensureAllInputsClickable();
      return;
    }

    setShowWipeFinalConfirm(false);
    try {
      setLoading(true);
      await window.electronAPI.wipeAllData();
      setAlertMessage('All data has been wiped. The application will reload.');
      setAlertVariant('success');
      setShowAlert(true);
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Error wiping data:', error);
      setAlertMessage('Failed to wipe data.');
      setAlertVariant('error');
      setShowAlert(true);
      ensureAllInputsClickable();
    } finally {
      setLoading(false);
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

      {/* Custom dialogs */}
      <ConfirmDialog
        isOpen={showImportConfirm}
        onClose={() => {
          setShowImportConfirm(false);
          setPendingImportData(null);
          ensureAllInputsClickable();
        }}
        onConfirm={handleImportConfirm}
        title="Import Data"
        message="This will import data and may overwrite existing information. Continue?"
        confirmText="Import"
        cancelText="Cancel"
        variant="warning"
        loading={loading}
      />

      <ConfirmDialog
        isOpen={showWipeConfirm}
        onClose={() => {
          setShowWipeConfirm(false);
          ensureAllInputsClickable();
        }}
        onConfirm={handleWipeConfirm}
        title="Wipe All Data"
        message="⚠️ WARNING: This will permanently delete ALL your financial data. This action CANNOT be undone. Are you absolutely sure?"
        confirmText="Yes, Continue"
        cancelText="Cancel"
        variant="danger"
      />

      <ConfirmDialog
        isOpen={showWipeDoubleConfirm}
        onClose={() => {
          setShowWipeDoubleConfirm(false);
          ensureAllInputsClickable();
        }}
        onConfirm={handleWipeDoubleConfirm}
        title="Second Confirmation"
        message="This is your last chance. You will be asked to type YES in the next step to confirm."
        confirmText="Continue"
        cancelText="Cancel"
        variant="danger"
      />

      <Modal
        isOpen={showWipeFinalConfirm}
        onClose={() => {
          setShowWipeFinalConfirm(false);
          setWipeFinalText('');
          ensureAllInputsClickable();
        }}
        title="Final Confirmation"
        size="sm"
      >
        <div style={{ padding: '8px 0' }}>
          <p style={{ marginBottom: '16px', color: 'var(--text-primary)', fontSize: '14px' }}>
            Type <strong>YES</strong> to confirm deletion of all data:
          </p>
          <input
            type="text"
            value={wipeFinalText}
            onChange={(e) => setWipeFinalText(e.target.value)}
            placeholder="Type YES here"
            style={{ width: '100%', marginBottom: '16px' }}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter' && wipeFinalText === 'YES') {
                handleWipeFinalConfirm();
              }
            }}
          />
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={() => {
              setShowWipeFinalConfirm(false);
              setWipeFinalText('');
              ensureAllInputsClickable();
            }}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleWipeFinalConfirm}
              disabled={loading || wipeFinalText !== 'YES'}
            >
              {loading ? 'Please wait...' : 'Confirm Wipe'}
            </Button>
          </div>
        </div>
      </Modal>

      <AlertDialog
        isOpen={showAlert}
        onClose={() => {
          setShowAlert(false);
          ensureAllInputsClickable();
        }}
        title={alertVariant === 'success' ? 'Success' : alertVariant === 'error' ? 'Error' : 'Notice'}
        message={alertMessage}
        variant={alertVariant}
      />
    </div>
  );
};

export default BackupRestore;


