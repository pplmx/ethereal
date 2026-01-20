import type { AppConfig } from '../../types/config';

export interface SettingsTabProps {
  formData: AppConfig;
  setFormData: (data: AppConfig) => void;
}
