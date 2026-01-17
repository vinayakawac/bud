'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Grid3x3, Plus, MapPin, Linkedin } from 'lucide-react';
import { ProjectCard } from '@/components/projects/ProjectCard';
import type { Project } from '@/types';

interface Creator {
  id: string;
  name: string;
  email: string;
  username: string;
  termsAccepted: boolean;
  projectCount: number;
  createdAt: string;
  bio?: string;
  website?: string;
  expertise?: string;
}

export default function CreatorDashboardPage() {
  const router = useRouter();
  const [creator, setCreator] = useState<Creator | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    bio: '',
    pronouns: '',
    location: '',
    website: '',
    showProBadge: false,
    showLocalTime: false,
    socialLinks: ['', '', '', '']
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch creator data
        const creatorResponse = await fetch('/api/creator/me');

        if (!creatorResponse.ok) {
          if (creatorResponse.status === 401) {
            router.push('/creator/login');
            return;
          }
          throw new Error('Failed to fetch creator data');
        }

        const creatorData = await creatorResponse.json();

        if (!creatorData.data.creator.termsAccepted) {
          router.push('/creator/terms');
          return;
        }

        const creator = creatorData.data.creator;
        setCreator(creator);

        // Initialize edit form with creator data
        setEditForm({
          name: creator.name || '',
          bio: creator.bio || '',
          pronouns: creator.pronouns || 'they/them',
          location: creator.location || '',
          website: creator.website || '',
          showProBadge: false,
          showLocalTime: creator.showLocalTime ?? true,
          socialLinks: creator.socialLinks || ['', '', '', '']
        });

        // Fetch projects
        const projectsResponse = await fetch('/api/creator/projects');
        if (projectsResponse.ok) {
          const projectsData = await projectsResponse.json();
          setProjects(projectsData.data.projects || []);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-textPrimary">Loading...</div>
      </div>
    );
  }

  if (error || !creator) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-red-500">{error || 'Failed to load creator data'}</div>
      </div>
    );
  }

  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatMemberSince = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const handleEditToggle = () => {
    setIsEditMode(!isEditMode);
  };

  const handleSaveProfile = async () => {
    try {
      const response = await fetch('/api/creator/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editForm.name,
          bio: editForm.bio,
          pronouns: editForm.pronouns,
          website: editForm.website,
          location: editForm.location,
          socialLinks: editForm.socialLinks,
          showLocalTime: editForm.showLocalTime
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const data = await response.json();
      setCreator(data.data.creator);
      setIsEditMode(false);
    } catch (err) {
      console.error('Error saving profile:', err);
      alert('Failed to save profile');
    }
  };

  const handleCancelEdit = () => {
    // Reset form to current creator data
    if (creator) {
      setEditForm({
        name: creator.name,
        bio: creator.bio || 'Student. Enthusiastic Programmer.',
        pronouns: 'they/them',
        location: 'Bangalore, Karnataka, India',
        website: creator.website || '',
        showProBadge: false,
        showLocalTime: true,
        socialLinks: ['https://www.linkedin.com/in/vinayakahshankara', '', '', '']
      });
    }
    setIsEditMode(false);
  };

  const handleInputChange = (field: string, value: any) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSocialLinkChange = (index: number, value: string) => {
    setEditForm(prev => ({
      ...prev,
      socialLinks: prev.socialLinks.map((link, i) => i === index ? value : link)
    }));
  };

  return (
    <div className="min-h-screen bg-bg flex">
      {/* Left Sidebar - Profile Section */}
      <aside className="w-64 border-r border-border bg-bg flex-shrink-0 overflow-auto">
        <div className="p-6">
          {!isEditMode ? (
            <>
              {/* Profile Avatar */}
              <div className="relative w-32 h-32 mx-auto mb-4">
                <div className="w-full h-full rounded-full bg-neutral-900 border border-border flex items-center justify-center">
                  <span className="text-5xl font-bold text-accent">
                    O
                  </span>
                </div>
              </div>

              {/* Creator Info */}
              <div className="text-center mb-4">
                <h2 className="text-lg font-bold text-textPrimary mb-1">
                  {creator?.name || 'oFive'}
                </h2>
                <p className="text-xs text-textSecondary mb-3">
                  {creator?.username || 'vinayakawac'} · {editForm.pronouns || 'they/them'}
                </p>
                <p className="text-xs text-textPrimary mb-4 px-2">
                  {editForm.bio || 'Student. Enthusiastic Programmer.'}
                </p>
                <button
                  onClick={handleEditToggle}
                  className="inline-block w-full px-4 py-2 bg-neutral-900 border border-border rounded-md text-xs font-medium text-textPrimary hover:bg-neutral-800 transition-colors"
                >
                  Edit profile
                </button>
              </div>

              {/* Additional Info */}
              <div className="space-y-2">
                {editForm.location && (
                  <div className="flex items-start gap-2 text-xs text-textSecondary">
                    <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                    <span>{editForm.location}</span>
                  </div>
                )}
                {editForm.socialLinks[0] && (
                  <div className="flex items-center gap-2 text-xs text-textSecondary">
                    <Linkedin className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{editForm.socialLinks[0].replace('https://www.linkedin.com/', '')}</span>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Edit Mode */
            <div className="space-y-4">
              {/* Name Field */}
              <div>
                <label className="block text-xs font-semibold text-textPrimary mb-2">Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-900 border border-border rounded-md text-xs text-textPrimary focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
              </div>

              {/* Bio Field */}
              <div>
                <label className="block text-xs font-semibold text-textPrimary mb-2">Bio</label>
                <textarea
                  value={editForm.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-neutral-900 border border-border rounded-md text-xs text-textPrimary focus:outline-none focus:ring-2 focus:ring-accent/50 resize-none"
                  placeholder="Tell us about yourself"
                />
              </div>

              {/* Pronouns */}
              <div>
                <label className="block text-xs font-semibold text-textPrimary mb-2">Pronouns</label>
                <select
                  value={editForm.pronouns}
                  onChange={(e) => handleInputChange('pronouns', e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-900 border border-border rounded-md text-xs text-textPrimary focus:outline-none focus:ring-2 focus:ring-accent/50"
                >
                  <option value="he/him">he/him</option>
                  <option value="she/her">she/her</option>
                  <option value="they/them">they/them</option>
                </select>
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-semibold text-textPrimary mb-2">Location</label>
                <input
                  type="text"
                  value={editForm.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-900 border border-border rounded-md text-xs text-textPrimary focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
              </div>

              {/* Website */}
              <div>
                <label className="block text-xs font-semibold text-textPrimary mb-2">Website</label>
                <input
                  type="url"
                  value={editForm.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-900 border border-border rounded-md text-xs text-textPrimary focus:outline-none focus:ring-2 focus:ring-accent/50"
                />
              </div>

              {/* Social Accounts */}
              <div>
                <label className="block text-xs font-semibold text-textPrimary mb-2">Social accounts</label>
                <div className="space-y-2">
                  {editForm.socialLinks.map((link, index) => (
                    <input
                      key={index}
                      type="url"
                      value={link}
                      onChange={(e) => handleSocialLinkChange(index, e.target.value)}
                      placeholder={`Link to social profile ${index + 1}`}
                      className="w-full px-3 py-2 bg-neutral-900 border border-border rounded-md text-xs text-textPrimary focus:outline-none focus:ring-2 focus:ring-accent/50"
                    />
                  ))}
                </div>
              </div>

              {/* Save/Cancel Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleSaveProfile}
                  className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-xs font-medium transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="flex-1 px-3 py-2 bg-neutral-900 hover:bg-neutral-800 border border-border text-textPrimary rounded-md text-xs font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-[1400px] mx-auto px-8 py-8">
            {/* Welcome Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-textPrimary mb-2">
                Welcome back, oFive
              </h1>
              <p className="text-sm text-textSecondary">
                Manage your projects and account settings
              </p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-6 mb-10">
              {/* Total Projects */}
              <div className="bg-neutral-900/50 border border-border rounded-lg p-6">
                <div className="flex items-center gap-2 text-accent mb-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span className="text-xs font-medium">Total Projects</span>
                </div>
                <div className="text-3xl font-bold text-textPrimary">
                  {creator.projectCount}
                </div>
              </div>

              {/* Account Status */}
              <div className="bg-neutral-900/50 border border-border rounded-lg p-6">
                <div className="flex items-center gap-2 text-green-500 mb-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-xs font-medium">Account Status</span>
                </div>
                <div className="inline-block px-3 py-1 bg-green-500/10 border border-green-500/30 rounded text-sm font-semibold text-green-500">
                  Active
                </div>
              </div>

              {/* Member Since */}
              <div className="bg-neutral-900/50 border border-border rounded-lg p-6">
                <div className="flex items-center gap-2 text-accent mb-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-xs font-medium">Member Since</span>
                </div>
                <div className="text-xl font-bold text-textPrimary">
                  {formatMemberSince(creator.createdAt)}
                </div>
              </div>
            </div>

            {/* Projects Section */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-textPrimary">Your Projects</h2>
                <Link
                  href="/creator/projects/new"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-md hover:bg-accent/90 transition-colors font-medium text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add new project
                </Link>
              </div>

              {/* Search and Filter */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textSecondary" />
                  <input
                    type="text"
                    placeholder="Search Projects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-transparent border border-border rounded-md text-sm text-textPrimary placeholder:text-textSecondary focus:outline-none focus:ring-2 focus:ring-accent/50"
                  />
                </div>
                <button className="p-2.5 bg-transparent border border-border rounded-md hover:bg-neutral-900 transition-colors">
                  <Grid3x3 className="w-4 h-4 text-textSecondary" />
                </button>
              </div>

              {/* Projects Grid */}
              {filteredProjects.length === 0 ? (
                <div className="text-center py-20 bg-neutral-900/30 border border-border rounded-lg">
                  <div className="text-6xl mb-4">📂</div>
                  <h3 className="text-lg font-semibold text-textPrimary mb-2">
                    {searchQuery ? 'No projects found' : 'No projects yet'}
                  </h3>
                  <p className="text-textSecondary mb-6">
                    {searchQuery ? 'Try adjusting your search' : 'Create your first project to get started'}
                  </p>
                  {!searchQuery && (
                    <Link
                      href="/creator/projects/new"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-md hover:bg-accent/90 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Create Your First Project
                    </Link>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-6">
                  {filteredProjects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
  );
}
