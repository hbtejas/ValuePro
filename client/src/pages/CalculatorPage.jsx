import { useParams, Navigate } from 'react-router-dom';
import { getCalculatorComponent } from '../routes/calculatorRegistry';
import { getCalculatorInfo } from '../utils/calculatorData';

export default function CalculatorPage() {
  const { calculatorId } = useParams();
  const Component = getCalculatorComponent(calculatorId);
  const info = getCalculatorInfo(calculatorId);

  if (!Component || !info) {
    return <Navigate to="/" replace />;
  }

  return <Component />;
}
