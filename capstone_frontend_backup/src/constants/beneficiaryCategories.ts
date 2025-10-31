/**
 * Beneficiary Categories for Campaign Creation
 * Structured dropdown options for campaign beneficiaries
 */

export interface BeneficiaryOption {
  value: string;
  label: string;
}

export interface BeneficiaryGroup {
  group: string;
  options: BeneficiaryOption[];
}

export const BENEFICIARY_CATEGORIES: BeneficiaryGroup[] = [
  {
    group: "Education & Youth",
    options: [
      { value: "students", label: "Students" },
      { value: "out_of_school_youth", label: "Out-of-school youth" },
      { value: "teachers_schools", label: "Teachers & schools" },
      { value: "educational_institutions", label: "Educational institutions" },
    ],
  },
  {
    group: "Health & Medical",
    options: [
      { value: "patients_hospitals", label: "Patients in hospitals" },
      { value: "children_disabilities", label: "Children with disabilities" },
      { value: "elderly_individuals", label: "Elderly individuals" },
      { value: "chronic_illness", label: "People with chronic illnesses" },
    ],
  },
  {
    group: "Poverty & Hunger",
    options: [
      { value: "low_income_families", label: "Low-income families" },
      { value: "homeless", label: "Homeless individuals" },
      { value: "malnourished_children", label: "Malnourished children" },
      { value: "rural_communities", label: "Rural communities" },
    ],
  },
  {
    group: "Environment & Animals",
    options: [
      { value: "environmental_conservation", label: "Environmental conservation programs" },
      { value: "stray_animals", label: "Stray animals" },
      { value: "endangered_species", label: "Endangered species" },
      { value: "farming_communities", label: "Agricultural/farming communities" },
    ],
  },
  {
    group: "Emergency & Relief",
    options: [
      { value: "disaster_affected", label: "Disaster-affected families" },
      { value: "conflict_victims", label: "Conflict/displacement victims" },
      { value: "flood_typhoon_survivors", label: "Flood/typhoon survivors" },
    ],
  },
  {
    group: "Advocacy & Social Causes",
    options: [
      { value: "women_empowerment", label: "Women empowerment groups" },
      { value: "lgbtq_support", label: "LGBTQ+ support programs" },
      { value: "indigenous_peoples", label: "Indigenous peoples" },
      { value: "senior_citizens", label: "Senior citizens" },
    ],
  },
];

// Flat list of all beneficiary options (for filtering and validation)
export const ALL_BENEFICIARY_OPTIONS: BeneficiaryOption[] = BENEFICIARY_CATEGORIES.flatMap(
  (group) => group.options
);

// Helper to get label from value
export const getBeneficiaryLabel = (value: string): string => {
  const option = ALL_BENEFICIARY_OPTIONS.find((opt) => opt.value === value);
  return option?.label || value;
};

// Helper to get group from value
export const getBeneficiaryGroup = (value: string): string | null => {
  const group = BENEFICIARY_CATEGORIES.find((g) =>
    g.options.some((opt) => opt.value === value)
  );
  return group?.group || null;
};
