import React, { useState } from 'react';
import { CustomerOrders } from './CustomerOrders';
import { CustomerCapacityExplorer } from './CustomerCapacityExplorer';
import { CustomerNewRequestModal } from './CustomerNewRequestModal';
import { ProductCategory } from '../../types';

interface CustomerPortalProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
}

export const CustomerPortal: React.FC<CustomerPortalProps> = ({ activeTab, onSelectTab }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleBookCategory = (category: ProductCategory) => {
    setIsModalOpen(true);
  };

  return (
    <>
      {activeTab === 'explorer' && (
        <CustomerCapacityExplorer onSelectCategoryToBook={handleBookCategory} />
      )}
      {activeTab === 'orders' && (
        <CustomerOrders onOpenNewRequestModal={() => setIsModalOpen(true)} />
      )}
      {activeTab === 'new-request' && (
        <div className="py-6">
          <CustomerCapacityExplorer onSelectCategoryToBook={handleBookCategory} />
          {/* Automatically open modal if on new-request tab */}
        </div>
      )}

      <CustomerNewRequestModal
        isOpen={isModalOpen || activeTab === 'new-request'}
        onClose={() => {
          setIsModalOpen(false);
          if (activeTab === 'new-request') {
            onSelectTab('orders');
          }
        }}
        onSubmitted={() => {
          onSelectTab('orders');
        }}
      />
    </>
  );
};
