
import { Controller, Control } from "react-hook-form";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { FieldConfig } from "../form-fields-config";
import { ProductForm } from "../product-form-schema";



type Props = {
  fieldConfig: FieldConfig;
  control: Control<ProductForm>;
};

export function DynamicFormField({ fieldConfig, control }: Props) {
  const { name, label, type = "text", placeholder, rows } = fieldConfig;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={name}>{label}</FieldLabel>

          {type === "textarea" ? (
            <InputGroup>
              <InputGroupTextarea
                id={name}
                placeholder={placeholder}
                rows={rows}
                className="min-h-28 resize-none"
                value={
                  typeof field.value === "boolean"
                    ? String(field.value)
                    : ((field.value as string | number | undefined) ?? "")
                }
                onChange={(e) => field.onChange(e.target.value)}
                onBlur={field.onBlur}
                name={field.name}
                ref={field.ref}
              />
              <InputGroupAddon align="block-end">
                <InputGroupText className="tabular-nums">
                  {String(field.value ?? "").length || 0}/500
                </InputGroupText>
              </InputGroupAddon>
            </InputGroup>
          ) : (
            <Input
              type={type}
              id={name}
              placeholder={placeholder}
              value={
                typeof field.value === "boolean"
                  ? String(field.value)
                  : ((field.value as string | number | readonly string[] | undefined) ?? "")
              }
              onChange={
                type === "number"
                  ? (e) =>
                      field.onChange(
                        e.target.value === "" ? undefined : Number(e.target.value)
                      )
                  : (e) => field.onChange(e.target.value)
              }
              onBlur={field.onBlur}
              name={field.name}
              ref={field.ref}
              aria-invalid={fieldState.invalid}
            />
          )}

          {fieldState.error && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}