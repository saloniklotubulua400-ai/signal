import { useState } from 'react';
import StatsTab from './StatsTab.jsx';
import OrdersTab from './OrdersTab.jsx';
import DeliveriesTab from './DeliveriesTab.jsx';
import ProductsTab from './ProductsTab.jsx';

const TABS = [
  ['stats', 'Overview', StatsTab],
  ['orders', 'Orders', OrdersTab],
  ['deliveries', 'Deliveries', DeliveriesTab],
  ['products', 'Products', ProductsTab],
];

export default function Admin() {
  const [tab, setTab] = useState('stats');
  const Active = TABS.find(([key]) => key === tab)[2];

  return (
    <div className="page container">
      <h1 className="page-title">Admin</h1>
      <div className="tabs" role="tablist">
        {TABS.map(([key, label]) => (
          <button key={key} role="tab" aria-selected={tab === key} className="tab" onClick={() => setTab(key)}>{label}</button>
        ))}
      </div>
      <Active />
    </div>
  );
}
