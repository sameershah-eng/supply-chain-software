import React from 'react';
import { CMLinesList } from './CMLinesList';
import { CMCalendar } from './CMCalendar';
import { CMIncomingJobs } from './CMIncomingJobs';
import { CMActiveProduction } from './CMActiveProduction';

interface CMPortalProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
}

export const CMPortal: React.FC<CMPortalProps> = ({ activeTab }) => {
  switch (activeTab) {
    case 'lines':
      return <CMLinesList />;
    case 'calendar':
      return <CMCalendar />;
    case 'incoming':
      return <CMIncomingJobs />;
    case 'production':
      return <CMActiveProduction />;
    default:
      return <CMActiveProduction />;
  }
};
