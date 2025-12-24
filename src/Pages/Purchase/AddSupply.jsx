
import BtnSubmit from "../../components/Button/BtnSubmit";
import { FormProvider, useForm } from "react-hook-form";
import { InputField, SelectField } from "../../components/Form/FormFields";
import { useEffect, useRef, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { FiCalendar } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../utils/axiosConfig";
import useRefId from "../../hooks/useRef";
import { useTranslation } from "react-i18next";
import FormSkeleton from "../../components/Form/FormSkeleton";

const SupplyForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams(); // id from params
  const methods = useForm();
  const { handleSubmit, reset, register, setValue } = methods;
  const dateRef = useRef(null);
  const generateRefId = useRefId();
  const [loading, setLoading] = useState(false);

  // fetch supply data if update mode
  useEffect(() => {
    if (id) {
      setLoading(true);
      api
        .get(`/supplier/${id}`)
        .then((res) => {
          if (res.data.success) {
            const supply = res.data.data;
            Object.keys(supply).forEach((key) => {
              if (supply[key] !== null && supply[key] !== undefined) {
                setValue(key, supply[key]);
              }
            });
          } else {
            toast.error(t("Failed to fetch supplier info!"));
          }
        })
        .catch((err) => {
          toast.error("Error: " + (err.response?.data?.message || err.message));
        })
        .finally(() => setLoading(false));
    }
  }, [id, setValue]);

  // submit handler
  const onSubmit = async (data) => {
    try {
      const payload = { ...data };

      // ref_id only generate if not in update mode
      if (!id) {
        payload.ref_id = generateRefId();
      }

      const response = id
        ? await api.put(`/supplier/${id}`, payload)
        : await api.post(`/supplier`, payload);

      const resData = response.data;
      if (resData.success) {
        toast.success(
          id
            ? (t("Supplier updated successfully!"))
            : t("Supplier added successfully!"),
          { position: "top-right" }
        );
        reset();
        navigate("/tramessy/Purchase/SupplierList");
      } else {
        toast.error(t("Server Error:") + (resData.message || t("Unknown issue")));
      }
    } catch (error) {
      console.error(error);
      const errorMessage =
        error.response?.data?.message || error.message || t("Unknown error");
      toast.error(t("Server Error:") + errorMessage);
    }
  };

  return (
    <div className="mt-5 md:p-2">
      <Toaster />
      <div className="mx-auto p-6 border-t-2 border-primary rounded-md shadow">
        <h3 className="pb-4 text-primary font-semibold ">
          {id ? t("Update Supplier Information") : t("Add Supplier Information")}
        </h3>

        {loading ? (
          <div className="p-4 bg-white rounded-md shadow border-t-2 border-primary">
            <FormSkeleton />
          </div>
        ) : (
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="mx-auto space-y-4">
              {/* row 1 */}
              <div className="md:flex justify-between gap-3">
                {/* <div className="w-full">
                  <InputField
                    name="date"
                    label="Date"
                    type="date"
                    required
                    inputRef={(e) => {
                      register("date").ref(e);
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
                </div> */}
                <div className="w-full">
                  <InputField
                    name="supplier_name"
                    label={`${t("Supplier")} ${t("Name")}`}
                    required
                  />
                </div>
                <div className="w-full">
                  <InputField
                    name="business_category"
                    label={t("Business Category")}
                    required
                  />
                </div>
                <div className="w-full">
                  <InputField name="phone" label={t("Mobile")} type="number" required />
                </div>
              </div>
              {/* row 2 */}
              <div className="md:flex justify-between gap-3">
                <div className="w-full">
                  <InputField name="address" label={t("Address")} required />
                </div>
                <div className="w-full">
                  <InputField
                    name="opening_balance"
                    label={t("Opening Balance")}
                    type="number"
                    required
                  />
                </div>
                <div className="w-full">
                  <InputField
                    name="contact_person_name"
                    label={t("Contact Person")}
                    required
                  />
                </div>
                <div className="relative w-full">
                  <SelectField
                    name="status"
                    label={t("Status")}
                    required
                    options={[
                      // { value: "", label: "Select Status..." },
                      { value: "Active", label: t("Active") },
                      { value: "Inactive", label: t("Inactive") },
                    ]}
                  />
                </div>
              </div>

              <BtnSubmit>{id ? (t("Update")) : t("Submit")}</BtnSubmit>
            </form>
          </FormProvider>
        )}
      </div>
    </div>
  );
};

export default SupplyForm;
