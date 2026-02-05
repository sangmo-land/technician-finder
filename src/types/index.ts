export type Skill = 'Plumber' | 'Electrician' | 'Carpenter' | 'Mason' | 'Painter';

export interface Technician {
  id: string;
  name: string;
  skill: Skill;
  phone: string;
  location: string;
  experienceYears: number;
}

export type TechnicianFormData = Omit<Technician, 'id'>;

export const SKILLS: Skill[] = ['Plumber', 'Electrician', 'Carpenter', 'Mason', 'Painter'];

export const LOCATIONS = [
  'Douala',
  'Yaoundé',
  'Bamenda',
  'Bafoussam',
  'Garoua',
  'Maroua',
  'Ngaoundéré',
  'Bertoua',
  'Limbe',
  'Buea',
  'Kribi',
  'Ebolowa',
];
