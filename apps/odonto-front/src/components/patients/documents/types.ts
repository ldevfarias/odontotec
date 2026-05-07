export interface PatientDocumentItem {
  id: number;
  date?: string;
  type: 'ATESTADO' | 'RECEITA' | 'OUTRO' | string;
  title: string;
  content: string;
  dentist?: {
    name?: string;
  };
}
