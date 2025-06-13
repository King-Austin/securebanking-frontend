import { usePageTitle } from '../hooks/usePageTitle';

export default function Beneficiaries() {
  // Set page title
  usePageTitle('Beneficiaries');

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Beneficiaries</h1>
      <div className="card">
        <p>Beneficiaries management functionality coming soon...</p>
      </div>
    </div>
  );
}
