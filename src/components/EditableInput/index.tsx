import { Input } from "../ui/input";

export type Props = {
  value: string | number | undefined;
  onChange: (value: string) => void;
  type?: 'text' | 'number';
  placeholder?: string;
  className?: string;
  step?: string;
}

export const EditableInput: React.FC<Props> = (({ value, onChange, type = 'text', placeholder, className, step }) => (
  <Input 
    type={type} 
    value={value || ''} 
    onChange={(e) => onChange(e.target.value)} 
    placeholder={placeholder} 
    className={className} 
    step={step} 
  />
));