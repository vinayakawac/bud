'use client';

import { useState } from 'react';

interface PulledData {
  title: string;
  description: string;
  techStack: string[];
  externalLink: string;
  version?: string;
  lastUpdated: string;
}

interface FormData {
  title: string;
  description: string;
  techStack: string;
  externalLink: string;
}

interface Props {
  onDataPulled: (data: Partial<FormData>) => void;
  currentFormData: FormData;
}

export default function PullDetailsSection({ onDataPulled, currentFormData }: Props) {
  const [projectUrl, setProjectUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pulledData, setPulledData] = useState<PulledData | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const hasExistingData = (): string[] => {
    const fields: string[] = [];
    if (currentFormData.title.trim()) fields.push('Title');
    if (currentFormData.description.trim()) fields.push('Description');
    if (currentFormData.techStack.trim()) fields.push('Tech Stack');
    if (currentFormData.externalLink.trim()) fields.push('External Link');
    return fields;
  };

  const handlePullDetails = async () => {
    setError('');
    setSuccess('');
    setPulledData(null);
    setShowConfirm(false);

    if (!projectUrl.trim()) {
      setError('Please enter a project URL');
      return;
    }

    if (!isValidUrl(projectUrl)) {
      setError('Please enter a valid URL');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/creator/pull-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: projectUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to pull project details');
      }

      const pulled: PulledData = data.data;
      setPulledData(pulled);

      // Check if any fields would be overwritten
      const existingFields = hasExistingData();
      if (existingFields.length > 0) {
        setShowConfirm(true);
      } else {
        // Auto-fill if no existing data
        applyPulledData(pulled);
        setSuccess('Project details pulled successfully!');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to pull project details');
    } finally {
      setLoading(false);
    }
  };

  const applyPulledData = (data: PulledData) => {
    const formattedData: Partial<FormData> = {
      title: data.title || '',
      description: data.description || '',
      techStack: data.techStack.join(', ') || '',
      externalLink: data.externalLink || '',
    };
    onDataPulled(formattedData);
    setShowConfirm(false);
    setSuccess('Project details applied successfully!');
  };

  const handleConfirm = () => {
    if (pulledData) {
      applyPulledData(pulledData);
    }
  };

  const handleCancel = () => {
    setShowConfirm(false);
    setPulledData(null);
    setSuccess('');
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 mb-6">
      <h2 className="text-xl font-semibold text-textPrimary mb-4">
        Pull Project Details
      </h2>
      <p className="text-textSecondary text-sm mb-4">
        Paste a GitHub repository URL or project website to auto-populate project fields.
      </p>

      <div className="flex gap-3">
        <input
          type="url"
          value={projectUrl}
          onChange={(e) => setProjectUrl(e.target.value)}
          placeholder="https://github.com/username/repo"
          className="flex-1 px-4 py-3 bg-bg border border-border rounded-lg text-textPrimary focus:outline-none focus:ring-2 focus:ring-accent"
          disabled={loading}
        />
        <button
          onClick={handlePullDetails}
          disabled={!projectUrl.trim() || !isValidUrl(projectUrl) || loading}
          className="px-6 py-3 bg-accent text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Pulling...' : 'Pull Details'}
        </button>
      </div>

      {error && (
        <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm">
          {error}
        </div>
      )}

      {success && !showConfirm && (
        <div className="mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded text-sm">
          {success}
        </div>
      )}

      {showConfirm && pulledData && (
        <div className="mt-4 bg-yellow-50 border border-yellow-400 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">
            Confirm Data Replacement
          </h3>
          <p className="text-yellow-700 text-sm mb-3">
            The following fields will be replaced: <strong>{hasExistingData().join(', ')}</strong>
          </p>
          <div className="bg-white border border-yellow-200 rounded p-3 mb-3 text-sm">
            <div className="mb-2">
              <span className="font-medium text-textPrimary">Title:</span>{' '}
              <span className="text-textSecondary">{pulledData.title || 'N/A'}</span>
            </div>
            <div className="mb-2">
              <span className="font-medium text-textPrimary">Description:</span>{' '}
              <span className="text-textSecondary">
                {pulledData.description ? `${pulledData.description.substring(0, 80)}...` : 'N/A'}
              </span>
            </div>
            <div className="mb-2">
              <span className="font-medium text-textPrimary">Tech Stack:</span>{' '}
              <span className="text-textSecondary">
                {pulledData.techStack.length > 0 ? pulledData.techStack.join(', ') : 'N/A'}
              </span>
            </div>
            {pulledData.version && (
              <div className="mb-2">
                <span className="font-medium text-textPrimary">Version:</span>{' '}
                <span className="text-textSecondary">{pulledData.version}</span>
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleConfirm}
              className="flex-1 px-4 py-2 bg-accent text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              Replace Existing Values
            </button>
            <button
              onClick={handleCancel}
              className="px-6 py-2 border border-border text-textPrimary rounded-lg hover:bg-bg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="mt-4 text-xs text-textSecondary">
        <p className="font-medium mb-1">Supported sources:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>GitHub repositories (recommended)</li>
          <li>Public project websites (basic metadata only)</li>
        </ul>
      </div>
    </div>
  );
}
