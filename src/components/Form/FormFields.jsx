import { Controller, useFormContext } from "react-hook-form";
import Select from "react-select";
import DatePicker from "react-datepicker";
import { format } from "date-fns";

import CreatableSelect from "react-select/creatable";

// select
export const SelectField = ({
  name,
  label,
  required,
  options,
  control,
  placeholder,
  defaultValue,
  onSelectChange,
  isCreatable = true,
  isMulti = false,
  // disabled = false,
}) => {
  const {
    formState: { errors },
  } = useFormContext();

  const error = errors[name]?.message;
const {t} = useTranslation()
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium mb-1 text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <Controller
        name={name}
        control={control}
        rules={{ required: required ? `${label || name} ${t("is required")}` : false }}

        render={({ field: { onChange, value, ref } }) => {
          const SelectComponent = isCreatable ? CreatableSelect : Select;

          // Correct getValue for existing + creatable
          const getValue = () => {
            if (!value) return isMulti ? [] : null;

            if (isMulti) {
              return value.map((val) => {
                return (
                  options.find((opt) => opt.value === val) || { value: val, label: val }
                );
              });
            } else {
              return (
                options.find((opt) => opt.value === value) || { value, label: value }
              );
            }
          };

          return (
            <SelectComponent
              inputRef={ref}
              isMulti={isMulti}
              value={getValue()}
              // onChange={(selectedOption) => {
              //   const selectedValue = selectedOption?.value || "";
              //   onChange(selectedValue);
              //   if (onSelectChange) {
              //     onSelectChange(selectedOption);
              //   }
              // }}
              onChange={(selectedOption) => {
                if (isMulti) {
                  const selectedValues = selectedOption
                    ? selectedOption.map((opt) => opt.value)
                    : [];
                  onChange(selectedValues);
                  onSelectChange?.(selectedOption);
                } else {
                  const selectedValue = selectedOption?.value || "";
                  onChange(selectedValue);
                  onSelectChange?.(selectedOption);
                }
              }}
              options={options}
              placeholder={placeholder || `${label}`}
              defaultValue={defaultValue}
              className="text-sm hide-scrollbar"
              menuPortalTarget={document.body}
              classNamePrefix="react-select"
              isClearable
              // Add these props for better creatable experience
              formatCreateLabel={(inputValue) => `Add "${inputValue}"`}
              onCreateOption={(inputValue) => {
                onChange(inputValue);
                // Also add the new option to the options array for display
                // This is optional but provides better UX
                if (onSelectChange) {
                  onSelectChange({ value: inputValue, label: inputValue });
                }
              }}
            />
          );
        }}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
};

// // input
import { useTranslation } from "react-i18next";
import "react-datepicker/dist/react-datepicker.css";
import { FiCalendar } from "react-icons/fi";

export const InputField = ({
  name,
  label,
  type = "text",
  placeholder = "",
  defaultValue = null,
  required = false,
  readOnly = false,
}) => {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext();

  const error = errors[name]?.message;
const {t} = useTranslation()
  //  DATE PICKER ONLY
  if (type === "date") {
    return (
      <div className="mb-4">
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}

        <div className="relative">
          <Controller
            name={name}
            control={control}
            defaultValue={defaultValue}
            rules={{
              required: required ? `${label} ${t("is required")}` : false,
            }}
            render={({ field }) => (
              <DatePicker
                selected={field.value ? new Date(field.value) : null}
                onChange={(date) => field.onChange(date)}
                dateFormat="dd-MM-yyyy"
                placeholderText={placeholder || `${t("Select")} ${label}`}
                className="mt-1 w-full text-sm border border-gray-300 px-3 py-2 rounded outline-none pr-10"
                readOnly={readOnly}
                showPopperArrow={false}
                autoComplete="off"
              />
            )}
          />

          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
            <FiCalendar />
          </span>
        </div>

        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
    );
  }

  //  NORMAL INPUT
  const { ref, ...rest } = register(name, {
    required: required ? `${label} ${t("is required")}` : false,
  });

  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <input
        {...rest}
        ref={ref}
        type={type}
        placeholder={placeholder || `${label} ${t("Enter")}`}
        readOnly={readOnly}
        className="mt-1 w-full text-sm border border-gray-300 px-3 py-2 rounded outline-none"
      />

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
};


// text area
const TextAreaField = ({
  name,
  label,
  required = false,
  placeholder = ""
}) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();
const {t} = useTranslation()
  return (
    <div className="mb-4 w-full">
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-700"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <textarea
        id={name}
        rows={2}
        {...register(name, {
          required: required ? `${label || name} ${t("is required")}` : false,
        })}
        placeholder={placeholder || `${label || name}`} // 👈 placeholder
        className="w-full border border-gray-300 p-2 rounded text-sm"
      />

      {errors[name] && (
        <p className="text-xs text-red-500 mt-1">{errors[name]?.message}</p>
      )}
    </div>
  );
};

export default TextAreaField;

