export interface AboutItem {
  label: string;
  value: string;
  readOnly?: boolean;
}

export interface AboutItem {
  label: string;
  value: string;
  readOnly?: boolean;
}

export interface AboutSectionProps {
  title: string;
  data: AboutItem[];
  onSave?: (data: AboutItem[]) => void | Promise<void>;
}