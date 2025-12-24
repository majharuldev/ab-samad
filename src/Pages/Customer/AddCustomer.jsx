import BtnSubmit from "../../components/Button/BtnSubmit";
import { FiCalendar } from "react-icons/fi";
import { FormProvider, useForm } from "react-hook-form";
import { InputField, SelectField } from "../../components/Form/FormFields";
import { useEffect, useRef } from "react";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import useRefId from "../../hooks/useRef";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../utils/axiosConfig";
import { useTranslation } from "react-i18next";

const AddCustomer = () => {
  const {t} = useTranslation();
  const navigate = useNavigate()
  const {id} = useParams();
  const dateRef = useRef(null);
  const methods = useForm();
  const { handleSubmit, reset, register } = methods;
  const generateRefId = useRefId();

  // single customer set value for update customer
  useEffect(() => {
    if ( id) {
      const fetchCustomer = async () => {
        try {
          const res = await api.get(`/customer/${id}`);
          const customerData = res.data;
          reset(customerData)
        } catch (error) {
          console.error(error);
          // toast.error("Failed to load customer data");
        }
      };
      fetchCustomer();
    }
  }, [ id, reset]);

  // Add & update handler function
   const onSubmit = async (data) => {
    try {
      const payload = { ...data };

    // ref_id only generate if not in update mode
    if (!id) {
      payload.ref_id = generateRefId();
    }

      let response;
      if (id) {
        // Update
        response = await api.put(`/customer/${id}`, payload);
      } else {
        response = await api.post(`/customer`, payload);
      }

      toast.success(
        !id ? t("Customer added successfully") : t("Customer updated successfully"),
        { position: "top-right" }
      );

      reset();
      navigate("/tramessy/Customer");
    } catch (error) {
      console.error(error);
      const errorMessage =
        error.response?.data?.message || error.message || t("Unknown error");
      toast.error(t("Server issue:") + errorMessage);
    }
  };

  return (
    <div className="mt-5 md:p-2">
      <Toaster />
      
      <div className="mx-auto p-6 border-t-2 border-primary rounded-md shadow">
        <h3 className="pb-4 text-primary font-semibold rounded-t-md">
        {!id ? t("Create Customer") : t("Update Customer")}
      </h3>
        <FormProvider {...methods} className="">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="md:flex justify-between gap-3">
              {/* <div className="w-full">
                <InputField
                  name="date"
                  label="Date"
                  type="date"
                  required={!id}
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
              <div className="w-full relative">
                <InputField
                  name="customer_name"
                  label={`${t("Customer")} ${t("Name")}`}
                  required={!id}
                />
              </div>
              <div className="mt-3 md:mt-0 w-full relative">
                <InputField
                  name="mobile"
                  label={t("Mobile")}
                  type="number"
                  required={!id}
                />
              </div>
            </div>
            {/*  */}
            <div className="mt-1 md:flex justify-between gap-3">
              
              <div className="mt-3 md:mt-0 w-full relative">
                <InputField name="email" label={t("Email")} />
              </div>
              <div className="w-full relative">
                <InputField name="address" label={t("Address")} required={!id} />
              </div>
            </div>
            {/*  */}
            <div className="mt-1 md:flex justify-between gap-3">
              <div className="w-full">
                <SelectField
                  name="rate"
                  label={t("Rate status")}
                  required={!id}
                  options={[
                    { value: "Fixed", label: t("Fixed") },
                    { value: "Unfixed", label: t("Unfixed") },
                  ]}
                />
              </div>
              <div className="w-full relative">
                <InputField
                  name="opening_balance"
                  label={t("Opening Balance")}
                  type="number"
                  required={!id}
                />
              </div>
              <div className="w-full">
                <SelectField
                  name="status"
                  label={t("Status")}
                  required={!id}
                  options={[
                    { value: "Active", label: t("Active") },
                    { value: "Inactive", label: t("Inactive") },
                  ]}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="text-left">
              <BtnSubmit>{t("Submit")}</BtnSubmit>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
};

export default AddCustomer;
