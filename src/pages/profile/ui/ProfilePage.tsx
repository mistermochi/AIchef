import React from 'react';
import { Save } from 'lucide-react';
import { PageLayout, ViewHeader } from '../../../shared/ui';
import { Button } from "@/shared/ui/button";
import { useAuthContext } from '../../../entities/user/model/AuthContext';
import { AuthForm } from '../../../features/auth-form/ui/AuthForm';
import { HouseholdManagement } from '../../../features/household-management/ui/HouseholdManagement';
import { ProfileSettings } from '../../../features/profile-settings/ui/ProfileSettings';
import { StudioSettings } from '../../../features/profile-settings/ui/StudioSettings';
import { DataManagement } from '../../../features/data-management/ui/DataManagement';
import { AIConnectivity } from '../../../features/profile-settings/ui/AIConnectivity';

/**
 * @view ProfilePage
 * @description The user profile and settings view.
 * Composed of multiple features for managing account, household, and culinary preferences.
 */
export const ProfilePage: React.FC = () => {
  const { saveProfile } = useAuthContext();

  return (
    <PageLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <ViewHeader
          title="Chef Identity"
          subtitle="Customize your AI kitchen companion."
          actions={
            <Button onClick={saveProfile} size="sm">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start pb-20">

          {/* LEFT COLUMN: CONTEXT */}
          <div className="space-y-6">
            <AuthForm />
            <ProfileSettings />
          </div>

          {/* RIGHT COLUMN: SETTINGS */}
          <div className="space-y-6">
            <HouseholdManagement />
            <StudioSettings />
            <DataManagement />
            <AIConnectivity />
          </div>
        </div>
      </div>
    </PageLayout>
  );
};
