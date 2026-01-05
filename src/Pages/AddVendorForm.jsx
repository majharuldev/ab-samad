
import { useRef, useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import BtnSubmit from "../components/Button/BtnSubmit";
import { InputField, SelectField } from "../components/Form/FormFields";
import api from "../../utils/axiosConfig";
import { useTranslation } from "react-i18next";

const AddVendorForm = () => {
  const { t } = useTranslation();
  const { id } = useParams(); // ID প্যারামিটার
  const isUpdateMode = !!id; // Update mode চেক
  const navigate = useNavigate();
  const dateRef = useRef(null);

  const methods = useForm({
    defaultValues: {
      vendor_name: "",
      mobile: "",
      email: "",
      rent_category: "",
      work_area: "",
      opening_balance: "",
      date: "",
      status: "",
    },
  });

  const { handleSubmit, register, reset, setValue } = methods;
  const [loading, setLoading] = useState(false);

  // Update mode হলে ডেটা লোড
  useEffect(() => {
    if (isUpdateMode) {
      const fetchVendorData = async () => {
        try {
          const response = await api.get(`/vendor/${id}`);
          const data = response.data.data;
          if (data) {
            reset({
              vendor_name: data.vendor_name,
              mobile: data.mobile,
              email: data.email,
              rent_category: data.rent_category
    ? data.rent_category.split(",") 
    : [],
              work_area: data.work_area,
              opening_balance: data.opening_balance,
              date: data.date,
              status: data.status,
            });
          } else {
            // toast.error("Vendor information not found.");
            console.log("Vendor data not found in response.");
            navigate("/tramessy/VendorList");
          }
        } catch (error) {
          console.error("Error loading vendor data:", error);
          // toast.error("Failed to load data.");
          navigate("/tramessy/VendorList");
        }
      };
      fetchVendorData();
    }
  }, [id, isUpdateMode, reset, navigate]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => formData.append(key, value));

      let response;
      if (isUpdateMode) {
        formData.append("_method", "PUT");
        response = await api.post(`/vendor/${id}`, formData);
      } else {
        response = await api.post(`/vendor`, formData);
      }

      if (response.data.success) {
        toast.success(isUpdateMode ? t("Vendor updated successfully!") : (t("Vendor added successfully!")), {
          position: "top-right",
        });
        reset();
        navigate("/tramessy/VendorList");
      } else {
        toast.error(t("Server error: ") + (response.data.message || t("Unknown error")));
      }
    } catch (error) {
      const msg = error.response?.data?.message || error.message || t("Unknown error");
      toast.error(t("Server error: ") + msg);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-5 p-2">
      <div className="mx-auto p-6 rounded-md shadow border-t-2 border-primary">
        <h3 className="pt-1 pb-4 text-primary font-semibold rounded-t-md">
          {isUpdateMode ? (t("Update Vendor")) : t("Add New Vendor")}
        </h3>
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Toaster position="top-center" reverseOrder={false} />
            {/* Row 1 */}
            <div className="md:flex justify-between gap-3">
              <div className="w-full relative">
                <InputField name="vendor_name" label={`${t("Vendor")} ${t("Name")}`} required={!isUpdateMode} />
              </div>
              <div className="mt-3 md:mt-0 w-full relative">
                <InputField name="mobile" label={t("Mobile")} type="number" required={!isUpdateMode} />
              </div>
            </div>

            {/* Row 2 */}
            <div className="mt-3 md:flex justify-between gap-3">
               <div className="w-full">
                <InputField
                  name="date"
                  label={t("Date")}
                  type="date"
                  required={!isUpdateMode}
                  inputRef={(e) => {
                    register("date").ref(e);
                    dateRef.current = e;
                  }}
                />
              </div>
              <div className="w-full relative">
                <SelectField
                  name="rent_category"
                  label={t("Rent Category")}
                  isMulti={true}
                  required={!isUpdateMode}
                options={[
                  // { value: "", label: "Select Vehicle category..." },
                  { value: "pickup", label: t("Pickup" )},
                  { value: "covered_van", label: t("Covered Van") },
                  { value: "open_truck", label: t("Open Truck") },
                  { value: "trailer", label: t("Trailer") },
                  { value: "freezer_van", label: t("Freezer Van") },
                  { value: "Oil Tanker", label: t("Oil Tanker") },
                ]}
                />
              </div>
            </div>

            {/* Row 3 */}
            <div className="mt-3 md:flex justify-between gap-3">
              <div className="w-full relative">
                <InputField name="work_area" label={t("Work Area")} />
              </div>
              <div className="w-full relative">
                <InputField type="number" name="opening_balance" label={t("Opening Balance")} />
              </div>
            </div>

            {/* Row 4 */}
            <div className="mt-3 md:flex justify-between gap-3">
             
              <div className="w-[50%] relative">
                <SelectField
                  name="status"
                  label={t("Status")}
                  required={!isUpdateMode}
                  options={[
                    { value: "", label: `${t("Status")} ${t("Select")}...` },
                    { value: "Active", label: t("Active") },
                    { value: "Inactive", label: t("Inactive") },
                  ]}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="text-left mt-4">
              <BtnSubmit loading={loading}>{isUpdateMode ? t("Update") : t("Submit")}</BtnSubmit>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
};

export default AddVendorForm;

