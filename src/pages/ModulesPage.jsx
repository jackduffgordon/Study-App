import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Plus,
  Search,
  File,
  Layers,
  BookOpen,
  Lightbulb,
  Beaker,
  Code,
  Music,
  Palette,
  Globe,
  Target,
  X,
  ChevronDown,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useModules } from '../contexts/ModuleContext';
import { MODULE_COLORS, MODULE_ICONS } from '../lib/constants';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const iconMap = {
  BookOpen,
  Lightbulb,
  Beaker,
  Code,
  Music,
  Palette,
  Globe,
  Target,
};

const ModulesPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { modules, fetchModules, createModule, loading } = useModules();
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('my');
  const [fileCounts, setFileCounts] = useState({});
  const [flashcardCounts, setFlashcardCounts] = useState({});
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    color: MODULE_COLORS[0],
    icon: MODULE_ICONS[0],
  });
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchModules();
  }, []);

  useEffect(() => {
    const loadCounts = async () => {
      if (!user || modules.length === 0) return;

      const moduleIds = modules.map((m) => m.id);

      const { data: files } = await supabase
        .from('files')
        .select('module_id', { count: 'exact' });

      const { data: flashcards } = await supabase
        .from('flashcards')
        .select('module_id', { count: 'exact' });

      const fileCounts = {};
      const flashcardCounts = {};

      files?.forEach((f) => {
        fileCounts[f.module_id] = (fileCounts[f.module_id] || 0) + 1;
      });

      flashcards?.forEach((f) => {
        flashcardCounts[f.module_id] = (flashcardCounts[f.module_id] || 0) + 1;
      });

      setFileCounts(fileCounts);
      setFlashcardCounts(flashcardCounts);
    };

    loadCounts();
  }, [modules, user]);

  const handleCreateModule = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Module title is required');
      return;
    }

    setIsCreating(true);

    try {
      const { module, error } = await createModule(
        formData.title,
        formData.description,
        formData.color,
        formData.icon
      );

      if (error) {
        toast.error(error);
      } else {
        toast.success('Module created successfully!');
        setShowModal(false);
        setFormData({
          title: '',
          description: '',
          color: MODULE_COLORS[0],
          icon: MODULE_ICONS[0],
        });
      }
    } catch (error) {
      console.error('Error creating module:', error);
      toast.error('Failed to create module');
    } finally {
      setIsCreating(false);
    }
  };

  const filteredModules = modules.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.description || '').toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === 'my') {
      return matchesSearch && !m.isShared;
    } else {
      return matchesSearch && m.isShared;
    }
  });

  const pageStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
  };

  const titleStyle = {
    fontSize: '32px',
    fontWeight: '700',
    color: '#ffffff',
    margin: '0',
  };

  const searchBarStyle = {
    flex: 1,
    maxWidth: '400px',
    padding: '12px 16px',
    backgroundColor: '#252532',
    border: '1px solid #6c6c7c',
    borderRadius: '8px',
    color: '#ffffff',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontFamily: 'system-ui, Avenir, Helvetica, Arial, sans-serif',
  };

  const tabsStyle = {
    display: 'flex',
    gap: '8px',
    borderBottom: '1px solid #252532',
  };

  const tabStyle = (active) => ({
    padding: '12px 16px',
    backgroundColor: 'transparent',
    border: 'none',
    borderBottom: active ? '2px solid #6c5ce7' : '2px solid transparent',
    color: active ? '#6c5ce7' : '#a0a0b0',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
  });

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
  };

  const moduleCardStyle = {
    padding: '20px',
    backgroundColor: '#1a1a24',
    border: '1px solid #252532',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  };

  const colorAccentStyle = (color) => ({
    width: '4px',
    height: '40px',
    backgroundColor: color,
    borderRadius: '2px',
    marginBottom: '12px',
  });

  const moduleHeaderStyle = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    marginBottom: '12px',
  };

  const moduleIconStyle = {
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ffffff',
    flexShrink: 0,
  };

  const moduleTitleStyle = {
    fontSize: '18px',
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: '4px',
  };

  const moduleDescriptionStyle = {
    fontSize: '14px',
    color: '#a0a0b0',
    marginBottom: '16px',
    lineHeight: '1.5',
  };

  const statsRowStyle = {
    display: 'flex',
    gap: '16px',
    fontSize: '13px',
    color: '#a0a0b0',
  };

  const statStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  };

  const modalOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: showModal ? 'flex' : 'none',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  };

  const modalStyle = {
    backgroundColor: '#1a1a24',
    border: '1px solid #252532',
    borderRadius: '12px',
    padding: '24px',
    width: '100%',
    maxWidth: '500px',
    maxHeight: '90vh',
    overflowY: 'auto',
  };

  const formGroupStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '16px',
  };

  const labelStyle = {
    fontSize: '14px',
    fontWeight: '500',
    color: '#ffffff',
  };

  const inputStyle = {
    padding: '10px 12px',
    backgroundColor: '#252532',
    border: '1px solid #6c6c7c',
    borderRadius: '8px',
    color: '#ffffff',
    fontSize: '14px',
    fontFamily: 'system-ui, Avenir, Helvetica, Arial, sans-serif',
  };

  const colorGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '12px',
  };

  const colorOptionStyle = (color, selected) => ({
    width: '100%',
    aspectRatio: '1',
    backgroundColor: color,
    border: selected ? '2px solid #ffffff' : '2px solid transparent',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  });

  const iconGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '12px',
  };

  const iconOptionStyle = (selected) => ({
    padding: '12px',
    backgroundColor: selected ? 'rgba(108, 92, 231, 0.2)' : '#252532',
    border: selected ? '2px solid #6c5ce7' : '1px solid #6c6c7c',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ffffff',
    transition: 'all 0.2s ease',
  });

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>My Modules</h1>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={searchBarStyle}>
            <Search size={18} style={{ color: '#a0a0b0' }} />
            <input
              type="text"
              placeholder="Search modules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                backgroundColor: 'transparent',
                border: 'none',
                color: '#ffffff',
                outline: 'none',
                fontSize: '14px',
              }}
            />
          </div>
          <Button
            variant="primary"
            onClick={() => setShowModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Plus size={20} />
            New Module
          </Button>
        </div>
      </div>

      <div style={tabsStyle}>
        <button
          style={tabStyle(activeTab === 'my')}
          onClick={() => setActiveTab('my')}
          onMouseEnter={(e) => {
            if (activeTab !== 'my') e.target.style.color = '#b0a0ff';
          }}
          onMouseLeave={(e) => {
            if (activeTab !== 'my') e.target.style.color = '#a0a0b0';
          }}
        >
          My Modules ({modules.filter((m) => !m.isShared).length})
        </button>
        <button
          style={tabStyle(activeTab === 'shared')}
          onClick={() => setActiveTab('shared')}
          onMouseEnter={(e) => {
            if (activeTab !== 'shared') e.target.style.color = '#b0a0ff';
          }}
          onMouseLeave={(e) => {
            if (activeTab !== 'shared') e.target.style.color = '#a0a0b0';
          }}
        >
          Shared With Me ({modules.filter((m) => m.isShared).length})
        </button>
      </div>

      {loading ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px',
          }}
        >
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredModules.length > 0 ? (
        <div style={gridStyle}>
          {filteredModules.map((module) => {
            const Icon = iconMap[module.icon] || BookOpen;
            return (
              <div
                key={module.id}
                style={moduleCardStyle}
                onClick={() => navigate(`/modules/${module.id}`)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow =
                    '0 12px 24px rgba(108, 92, 231, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={colorAccentStyle(module.color)} />
                <div style={moduleHeaderStyle}>
                  <div
                    style={{
                      ...moduleIconStyle,
                      backgroundColor: module.color,
                    }}
                  >
                    <Icon size={24} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={moduleTitleStyle}>{module.title}</h3>
                  </div>
                </div>
                {module.description && (
                  <p style={moduleDescriptionStyle}>{module.description}</p>
                )}
                <div style={statsRowStyle}>
                  <div style={statStyle}>
                    <File size={16} />
                    {fileCounts[module.id] || 0} files
                  </div>
                  <div style={statStyle}>
                    <Layers size={16} />
                    {flashcardCounts[module.id] || 0} flashcards
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <Card
          style={{
            padding: '48px 24px',
            textAlign: 'center',
            backgroundColor: '#1a1a24',
          }}
        >
          <div style={{ color: '#a0a0b0', fontSize: '16px' }}>
            {searchQuery
              ? 'No modules match your search.'
              : activeTab === 'my'
              ? 'No modules yet. Create your first module to get started!'
              : 'No shared modules yet.'}
          </div>
        </Card>
      )}

      {showModal && (
        <div style={modalOverlayStyle} onClick={() => setShowModal(false)}>
          <div
            style={modalStyle}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
              }}
            >
              <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#ffffff', margin: '0' }}>
                Create New Module
              </h2>
              <button
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#a0a0b0',
                  cursor: 'pointer',
                  fontSize: '24px',
                }}
                onClick={() => setShowModal(false)}
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleCreateModule}>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Module Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="e.g., Biology 101"
                  style={inputStyle}
                />
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Optional description for your module"
                  style={{
                    ...inputStyle,
                    minHeight: '80px',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Color</label>
                <div style={colorGridStyle}>
                  {MODULE_COLORS.map((color) => (
                    <div
                      key={color}
                      style={colorOptionStyle(color, formData.color === color)}
                      onClick={() => setFormData({ ...formData, color })}
                    />
                  ))}
                </div>
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Icon</label>
                <div style={iconGridStyle}>
                  {MODULE_ICONS.map((iconName) => {
                    const Icon = iconMap[iconName];
                    return (
                      <div
                        key={iconName}
                        style={iconOptionStyle(formData.icon === iconName)}
                        onClick={() => setFormData({ ...formData, icon: iconName })}
                      >
                        <Icon size={24} />
                      </div>
                    );
                  })}
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: '12px',
                  marginTop: '24px',
                }}
              >
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowModal(false)}
                  fullWidth
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  loading={isCreating}
                  fullWidth
                >
                  Create Module
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModulesPage;
