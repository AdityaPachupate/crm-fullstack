import { useParams } from 'react-router-dom';
import LeadForm from './LeadForm';

export default function LeadEdit() {
  const { id } = useParams<{ id: string }>();
  return <LeadForm editId={id} />;
}
