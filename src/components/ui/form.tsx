import * as React from 'react';
import { useForm as useReactHookForm, type FieldValues, type UseFormProps } from 'react-hook-form';

export function useForm<TFormValues extends FieldValues = FieldValues>(options?: UseFormProps<TFormValues>) {
  return useReactHookForm<TFormValues>(options);
}

export * from 'react-hook-form';
