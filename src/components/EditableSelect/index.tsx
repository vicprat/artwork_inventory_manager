import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

export type Props = {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}
export const EditableSelect: React.FC<Props> =(({ value, onChange, options, className }) => (
  <Select value={value} onValueChange={onChange}>
    <SelectTrigger className={className}><SelectValue /></SelectTrigger>
    <SelectContent>
      {options.map((option) => (
        <SelectItem key={option.value} value={option.value}>
          {option.label}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
));
