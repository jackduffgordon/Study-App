import React, { useState, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useDropzone } from 'react-dropzone';
import {
  Upload,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  Trash2,
  Zap,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useModules } from '../contexts/ModuleContext';
import { ACCEPTED_FILE_TYPES, MAX_FILE_SIZE, TIER_LIMITS } from '../lib/constants';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const UploadPage = () => {
  const { user, profile } = useAuth();
  const { modules, fetchModules } = useModules();
  const [selectedModuleId, setSelectedModuleId] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadHistory, setUploadHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usageStats, setUsageStats] = useState({
    uploadsUsed: 0,
    uploadLimit: 5,
  });

  useEffect(() => {
    const loadUploadHistory = async () => {
      try {
        setLoading(true);
        await fetchModules();

        if (!user) return;

        const { data: files } = await supabase
          .from('files')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);

        setUploadHistory(files || []);

        const userTier = profile?.tier || 'free';
        const tierLimits = TIER_LIMITS[userTier.toLowerCase()] || TIER_LIMITS.free;

        setUsageStats({
          uploadsUsed: files?.length || 0,
          uploadLimit: tierLimits.uploads,
        });
      } catch (error) {
        console.error('Error loading upload history:', error);
        toast.error('Failed to load upload history');
      } finally {
        setLoading(false);
      }
    };

    loadUploadHistory();
  }, [user, profile]);

  const onDrop = useCallback(
    async (acceptedFiles) => {
      if (!selectedModuleId) {
        toast.error('Please select a module first');
        return;
      }

      const userTier = profile?.tier || 'free';
      const tierLimits = TIER_LIMITS[userTier.toLowerCase()] || TIER_LIMITS.free;

      if (usageStats.uploadsUsed >= tierLimits.uploads) {
        toast.error(`Upload limit reached for your ${userTier} plan`);
        return;
      }

      for (const file of acceptedFiles) {
        if (file.size > MAX_FILE_SIZE) {
          toast.error(
            `File ${file.name} exceeds maximum size of ${MAX_FILE_SIZE / 1024 / 1024}MB`
          );
          continue;
        }

        await uploadFile(file);
      }
    },
    [selectedModuleId, usageStats, profile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    disabled: uploading,
  });

  const uploadFile = async (file) => {
    try {
      setUploading(true);
      setUploadProgress(0);

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const filePath = `${user.id}/${selectedModuleId}/${fileName}`;

      const { data, error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      setUploadProgress(50);

      const { data: fileRecord, error: dbError } = await supabase
        .from('files')
        .insert([
          {
            user_id: user.id,
            module_id: selectedModuleId,
            file_name: file.name,
            file_type: file.name.endsWith('.pdf') ? 'pdf' : file.name.endsWith('.pptx') ? 'pptx' : 'video',
            file_size_bytes: file.size,
            storage_path: filePath,
            mime_type: file.type,
            processing_status: 'pending',
          },
        ])
        .select()
        .single();

      if (dbError) throw dbError;

      setUploadProgress(100);
      toast.success(`File ${file.name} uploaded successfully!`);

      setUploadHistory((prev) => [fileRecord, ...prev]);
      setUsageStats((prev) => ({
        ...prev,
        uploadsUsed: prev.uploadsUsed + 1,
      }));

      setTimeout(() => setUploadProgress(0), 1000);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(`Failed to upload ${file.name}`);
    } finally {
      setUploading(false);
    }
  };

  const handleProcessFile = async (fileId) => {
    try {
      toast.loading('Processing file with AI...');

      const { error } = await supabase.functions.invoke('process-file', {
        body: { fileId },
      });

      if (error) throw error;

      toast.success('File processing started!');

      const { data: updatedFile } = await supabase
        .from('files')
        .select('*')
        .eq('id', fileId)
        .single();

      setUploadHistory((prev) =>
        prev.map((f) => (f.id === fileId ? updatedFile : f))
      );
    } catch (error) {
      console.error('Processing error:', error);
      toast.error('Failed to process file');
    }
  };

  const handleDeleteFile = async (fileId) => {
    try {
      const { error } = await supabase
        .from('files')
        .delete()
        .eq('id', fileId);

      if (error) throw error;

      toast.success('File deleted');
      setUploadHistory((prev) => prev.filter((f) => f.id !== fileId));
      setUsageStats((prev) => ({
        ...prev,
        uploadsUsed: Math.max(0, prev.uploadsUsed - 1),
      }));
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete file');
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '600px',
        }}
      >
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const pageStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  };

  const titleStyle = {
    fontSize: '32px',
    fontWeight: '700',
    color: '#ffffff',
    margin: '0',
  };

  const subtitleStyle = {
    fontSize: '14px',
    color: '#a0a0b0',
  };

  const dropzoneStyle = {
    ...getRootProps(),
    padding: '40px',
    border: isDragActive ? '2px dashed #6c5ce7' : '2px dashed #252532',
    borderRadius: '12px',
    backgroundColor: isDragActive ? 'rgba(108, 92, 231, 0.05)' : '#1a1a24',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    textAlign: 'center',
    userSelect: 'none',
  };

  const dropzoneContentStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    pointerEvents: 'none',
  };

  const uploadIconStyle = {
    width: '48px',
    height: '48px',
    color: isDragActive ? '#6c5ce7' : '#a0a0b0',
    transition: 'color 0.3s ease',
  };

  const dropzoneTextStyle = {
    fontSize: '16px',
    fontWeight: '500',
    color: '#ffffff',
  };

  const dropzoneHintStyle = {
    fontSize: '14px',
    color: '#a0a0b0',
  };

  const selectorStyle = {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  };

  const selectStyle = {
    flex: 1,
    padding: '12px 16px',
    backgroundColor: '#252532',
    border: '1px solid #6c6c7c',
    borderRadius: '8px',
    color: '#ffffff',
    fontSize: '14px',
    fontFamily: 'system-ui, Avenir, Helvetica, Arial, sans-serif',
    cursor: 'pointer',
  };

  const usageStyle = {
    padding: '16px',
    backgroundColor: '#1a1a24',
    border: '1px solid #252532',
    borderRadius: '8px',
  };

  const usageLabelStyle = {
    fontSize: '14px',
    color: '#a0a0b0',
    marginBottom: '8px',
  };

  const usageBarStyle = {
    display: 'flex',
    height: '8px',
    backgroundColor: '#252532',
    borderRadius: '4px',
    overflow: 'hidden',
  };

  const usageFilledStyle = {
    height: '100%',
    backgroundColor:
      usageStats.uploadsUsed >= usageStats.uploadLimit
        ? '#ff6b6b'
        : usageStats.uploadsUsed / usageStats.uploadLimit > 0.7
        ? '#F7DC6F'
        : '#00d2d3',
    width: `${Math.min(
      100,
      (usageStats.uploadsUsed / usageStats.uploadLimit) * 100
    )}%`,
    transition: 'width 0.3s ease',
  };

  const historyItemStyle = {
    padding: '16px',
    backgroundColor: '#1a1a24',
    border: '1px solid #252532',
    borderRadius: '8px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const fileInfoStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flex: 1,
  };

  const statusBadgeStyle = (status) => {
    const colors = {
      completed: { bg: '#252532', color: '#00d2d3', icon: CheckCircle },
      failed: { bg: '#252532', color: '#ff6b6b', icon: AlertCircle },
      pending: { bg: '#252532', color: '#a0a0b0', icon: Clock },
    };

    const config = colors[status] || colors.pending;
    const Icon = config.icon;

    return {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      padding: '4px 8px',
      backgroundColor: config.bg,
      borderRadius: '4px',
      fontSize: '12px',
      color: config.color,
      icon: Icon,
    };
  };

  return (
    <div style={pageStyle}>
      <div>
        <h1 style={titleStyle}>Upload Study Materials</h1>
        <p style={subtitleStyle}>
          Upload PDFs, presentations, and videos to generate flashcards and questions
        </p>
      </div>

      <Card style={{ padding: '20px' }}>
        <div style={selectorStyle}>
          <label style={{ color: '#a0a0b0', fontSize: '14px' }}>
            Select Module:
          </label>
          <select
            value={selectedModuleId}
            onChange={(e) => setSelectedModuleId(e.target.value)}
            style={selectStyle}
          >
            <option value="">-- Choose a module --</option>
            {modules.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {selectedModuleId && (
        <div {...dropzoneStyle}>
          <input {...getInputProps()} />
          <div style={dropzoneContentStyle}>
            <Upload style={uploadIconStyle} />
            <div>
              <div style={dropzoneTextStyle}>
                {isDragActive ? 'Drop your files here' : 'Drag files here or click to select'}
              </div>
              <div style={dropzoneHintStyle}>
                Supported: PDF, PowerPoint, MP4, MOV, WebM (Max 100MB)
              </div>
            </div>
          </div>
        </div>
      )}

      {uploading && (
        <Card style={{ padding: '20px' }}>
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '14px', fontWeight: '500', color: '#ffffff', marginBottom: '8px' }}>
              Uploading...
            </div>
            <div style={usageBarStyle}>
              <div
                style={{
                  ...usageFilledStyle,
                  width: `${uploadProgress}%`,
                  backgroundColor: '#6c5ce7',
                }}
              />
            </div>
            <div style={{ fontSize: '12px', color: '#a0a0b0', marginTop: '8px' }}>
              {uploadProgress}%
            </div>
          </div>
        </Card>
      )}

      <div>
        <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#ffffff', margin: '0 0 16px 0' }}>
          Upload Usage
        </h2>
        <div style={usageStyle}>
          <div style={usageLabelStyle}>
            {usageStats.uploadsUsed} / {usageStats.uploadLimit} uploads used
          </div>
          <div style={usageBarStyle}>
            <div style={usageFilledStyle} />
          </div>
          {usageStats.uploadsUsed >= usageStats.uploadLimit && (
            <div
              style={{
                fontSize: '12px',
                color: '#ff6b6b',
                marginTop: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <AlertCircle size={14} />
              Upload limit reached. Upgrade your plan for more uploads.
            </div>
          )}
        </div>
      </div>

      <div>
        <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#ffffff', margin: '0 0 16px 0' }}>
          Recent Uploads
        </h2>
        {uploadHistory.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {uploadHistory.map((file) => {
              const statusConfig = statusBadgeStyle(file.processing_status);
              const StatusIcon = statusConfig.icon;

              return (
                <div key={file.id} style={historyItemStyle}>
                  <div style={fileInfoStyle}>
                    <FileText size={20} style={{ color: '#6c5ce7' }} />
                    <div>
                      <div
                        style={{
                          fontSize: '14px',
                          fontWeight: '500',
                          color: '#ffffff',
                          marginBottom: '4px',
                        }}
                      >
                        {file.file_name}
                      </div>
                      <div style={{ fontSize: '12px', color: '#a0a0b0' }}>
                        {formatDistanceToNow(new Date(file.created_at), {
                          addSuffix: true,
                        })}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ ...statusConfig }}>
                      <StatusIcon size={14} />
                      {file.processing_status}
                    </div>

                    {file.processing_status === 'pending' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleProcessFile(file.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <Zap size={14} />
                        Process
                      </Button>
                    )}

                    <button
                      onClick={() => handleDeleteFile(file.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#ff6b6b',
                        cursor: 'pointer',
                        padding: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      onMouseEnter={(e) => (e.target.style.opacity = '0.8')}
                      onMouseLeave={(e) => (e.target.style.opacity = '1')}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <Card
            style={{
              padding: '32px 24px',
              textAlign: 'center',
              backgroundColor: '#1a1a24',
            }}
          >
            <div style={{ color: '#a0a0b0' }}>No uploads yet</div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default UploadPage;
