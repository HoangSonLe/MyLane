import { LabeledField, type LabeledFieldProps } from '@/components/ui/form'

export type InputFieldProps = LabeledFieldProps

export function InputField(props: InputFieldProps) {
  return <LabeledField {...props} />
}
