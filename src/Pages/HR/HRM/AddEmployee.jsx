import { useEffect, useRef, useState } from "react";
import BtnSubmit from "../../../components/Button/BtnSubmit";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { InputField, SelectField } from "../../../components/Form/FormFields";
import { FiCalendar } from "react-icons/fi";
import { IoMdClose } from "react-icons/io";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../../utils/axiosConfig";
import { useTranslation } from "react-i18next";

const EmployeeForm = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // param থেকে employee id নেওয়া
  const isEditMode = Boolean(id);
const { t } = useTranslation();
  const methods = useForm();
  const { handleSubmit, register, control, reset, setValue } = methods;

  const dateRef = useRef(null);
  const joinDateRef = useRef(null);

  const [branch, setBranch] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);

  // Branch load
  useEffect(() => {
    const fetchBranch = async () => {
      try {
        const res = await api.get(`/office`);
        setBranch(res.data.data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load office data");
      }
    };
    fetchBranch();
  }, []);

  const branchOptions = branch.map((dt) => ({
    value: dt.branch_name,
    label: dt.branch_name,
  }));

  // যদি edit mode হয় তাহলে employee data আনতে হবে
  useEffect(() => {
    if (isEditMode) {
      const fetchEmployee = async () => {
        try {
          const res = await api.get(`/employee/${id}`);
          if (res.data.success) {
            const employee = res.data.data;
            reset(employee); // form এর মধ্যে data বসানো
            if (employee.image) {
  setPreviewImage(`https://ajenterprise.tramessy.com/backend/uploads/employee/${employee.image}`);
}
          } else {
            toast.error("Employee not found!");
          }
        } catch (error) {
          console.error(error);
          // toast.error("Failed to load employee data");
        }
      };
      fetchEmployee();
    }
  }, [id, isEditMode, reset]);

  // Submit Handler
  const onSubmit = async (data) => {
    try {
      const formData = new FormData();

      // সব ফর্ম ফিল্ড ফর্মডাটায় যোগ করা
      for (const key in data) {
        if (key === "image" && data.image instanceof File) {
          formData.append("image", data.image);
        } else {
          formData.append(key, data[key]);
        }
      }

      let response;
      if (isEditMode) {
        // Update employee (multipart সহ)
        response = await api.post(`/employee/${id}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        // Add new employee (multipart সহ)
        response = await api.post(`/employee`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }

      if (response.data.status=== "Success") {
        toast.success(
          isEditMode
            ? t("Employee updated successfully!")
            : t("Employee added successfully!")
        );
        navigate("/tramessy/HR/HRM/employee-list");
      } else {
        toast.error(t("Server Error:") + (response.data.message || t("Unknown issue")));
      }
    } catch (error) {
      console.error(error);
      const errorMessage =
        error.response?.data?.message || error.message || t("Unknown error");
      toast.error(t("Server Error:") + errorMessage);
    }
  };

  return (
    <div className="mt-5 p-2">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="mx-auto p-6 rounded-md shadow border-t-2 border-primary">
        <FormProvider {...methods}>
          <h3 className="pb-4 text-primary font-semibold rounded-t-md">
            {isEditMode ? (t("Update Employee Information")) : t("Add Employee Information")}
          </h3>
          <form onSubmit={handleSubmit(onSubmit)} className="mx-auto space-y-4">
            {/* Row 1: Full Name, Email, Mobile */}
            <div className="md:flex justify-between gap-3">
              {/* <div className="w-full">
                <SelectField
                  name="branch_name"
                  label="Branch Name"
                  required={isEditMode? false:true}
                  options={branchOptions}
                  control={control}
                />
              </div> */}
              <div className="w-full">
                <InputField name="employee_name" label={t("Full Name")} required={isEditMode ? false : true} />
              </div>
              <div className="w-full">
                <InputField name="email" label={t("Email")} required={false} />
              </div>
            </div>

            {/* Row 2: Gender, Birth Date, Join Date */}
            <div className="md:flex justify-between gap-3">
              <div className="w-full">
                <InputField name="mobile" label={t("Mobile")} type="number" required={isEditMode ? false : true} />
              </div>
              <div className="w-full relative">
                <SelectField
                  name="gender"
                  label={t("Gender")}
                  required={isEditMode ? false : true}
                  options={[
                    { value: "Male", label: t("Male") },
                    { value: "Female", label: t("Female") },
                    { value: "Others", label: t("Others") },
                  ]}
                />
              </div>
              <div className="w-full relative">
                <SelectField
                  name="blood_group"
                  label={t("Blood Group")}
                  required={isEditMode ? false : true}
                  options={[
                    { value: "A+", label: "A+" },
                    { value: "A-", label: "A-" },
                    { value: "B+", label: "B+" },
                    { value: "B-", label: "B-" },
                    { value: "AB+", label: "AB+" },
                    { value: "AB-", label: "AB-" },
                    { value: "O+", label: "O+" },
                    { value: "O-", label: "O-" },
                  ]}
                />
              </div>
              <div className="w-full">
                <InputField
                  name="birth_date"
                  label={t("Birth Date")}
                  type="date"
                  required={isEditMode ? false : true}
                  inputRef={(e) => {
                    register("birth_date").ref(e);
                    dateRef.current = e;
                  }}
                  icon={
                    <span
                      className="py-[11px] absolute right-0 px-3 top-[22px] transform -translate-y-1/2 rounded-r"
                      onClick={() => dateRef.current?.showPicker?.()}
                    >
                      <FiCalendar className="text-gray-700 cursor-pointer" />
                    </span>
                  }
                />
              </div>
            </div>

            {/* Row 3: Designation, Salary, Address */}
            <div className="md:flex justify-between gap-3">
              <div className="w-full">
                <InputField
                  name="join_date"
                  label={t("Join Date")}
                  type="date"
                  required={isEditMode ? false : true}
                  inputRef={(e) => {
                    register("join_date").ref(e);
                    joinDateRef.current = e;
                  }}

                />
              </div>
              <div className="w-full">
                <InputField name="nid" label={t("NID")} required={isEditMode ? false : true} type="number" />
              </div>
              <div className="w-full">
                <InputField name="designation" label={t("Designation")} required={isEditMode ? false : true} />
              </div>

              <div className="w-full">
                <InputField name="address" label={t("Address")} required={isEditMode ? false : true} />
              </div>
            </div>

            {/* Row 4: Image */}
            <div className="md:flex justify-between gap-3">
              {/* <div className="w-full">
                <InputField name="salary" label="Salary" type="number" required={isEditMode? false:true} />
              </div> */}
              <div className="w-full">
                <InputField name="basic" label={t("Basic Salary")} type="number" required={isEditMode ? false : true} />
              </div>
              <div className="w-full">
                <InputField name="house_rent" label={t("House Rent")} type="number" required={isEditMode ? false : true} />
              </div>
              <div className="w-full">
                <InputField name="medical" label={t("Medical")} type="number" required={isEditMode ? false : true} />
              </div>
              <div className="w-full">
                <InputField name="allowan" label={t("Allowance")} type="number" required={isEditMode ? false : true} />
              </div>
            </div>
            <div className="md:flex justify-between gap-3">

              <div className="w-full">
                <InputField name="conv" label={t("Conveyane")} type="number" required={isEditMode ? false : true} />
              </div>
              <div className="w-full">
                <label className="text-gray-700 text-sm font-semibold">{t("Image")}</label>
                <div className="relative">
                  <Controller
                    name="image"
                    control={control}
                    render={({ field: { onChange, ref } }) => (
                      <div className="relative">
                        <label
                          htmlFor="image"
                          className="border p-2 rounded w-full block bg-white text-gray-500 text-sm cursor-pointer"
                        >
                          {previewImage ? t("Image selected") : t("Choose image")}
                        </label>
                        <input
                          id="image"
                          type="file"
                          accept="image/*"
                          ref={ref}
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                              const url = URL.createObjectURL(file);
                              setPreviewImage(url);
                              onChange(file);
                            }
                          }}
                        />
                      </div>
                    )}
                  />
                </div>
              </div>
              <div className="w-full">
                <SelectField
                  name="status"
                  label={t("Status")}
                  required={isEditMode ? false : true}
                  options={[
                    { value: "Active", label: t("Active") },
                    { value: "Inactive", label: t("Inactive") },
                  ]}
                />
              </div>
            </div>

            {/* Preview */}
            {previewImage && (
              <div className="mt-3 relative flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setPreviewImage(null);
                    document.getElementById("image").value = "";
                  }}
                  className="absolute top-2 right-2 text-red-600 bg-white shadow rounded-sm hover:text-white hover:bg-secondary transition-all duration-300 cursor-pointer font-bold text-xl p-[2px]"
                  title="Remove image"
                >
                  <IoMdClose />
                </button>
                <img
                  src={previewImage}
                  alt="Employee"
                  className="max-w-xs h-auto rounded border border-gray-300"
                />
              </div>
            )}

            <BtnSubmit>{isEditMode ? t("Update") : t("Submit")}</BtnSubmit>
          </form>
        </FormProvider>
      </div>
    </div>
  );
};

export default EmployeeForm;
