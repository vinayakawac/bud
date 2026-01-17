'use client';

import { useState, ReactNode } from 'react';

interface Tab {
  id: string;
  label: string;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  children: (activeTab: string) => ReactNode;
}

export function Tabs({ tabs, defaultTab, children }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id || '');

  return (
    <div>
      <div className="border-b border-border mb-6">
        <nav className="flex gap-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                pb-3 px-1 border-b-2 transition-colors relative
                ${
                  activeTab === tab.id
                    ? 'border-accent text-accent'
                    : 'border-transparent text-textSecondary hover:text-textPrimary'
                }
              `}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className="ml-2 text-xs px-2 py-0.5 bg-white/5 rounded">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>
      <div>{children(activeTab)}</div>
    </div>
  );
}
