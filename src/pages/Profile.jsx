import { usePageTitle } from '../hooks/usePageTitle';

export default function Profile() {
  // Set page title
  usePageTitle('Profile Settings');

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Profile</h1>
      <div className="card">
        <p>Profile management functionality coming soon...</p>
      </div>
    </div>
  );
}
