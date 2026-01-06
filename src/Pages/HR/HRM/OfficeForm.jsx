
import React, { useEffect, useRef } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { InputField } from "../../../components/Form/FormFields";
import BtnSubmit from "../../../components/Button/BtnSubmit";
import toast, { Toaster } from "react-hot-toast";
import useRefId from "../../../hooks/useRef";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../../../utils/axiosConfig";
import { useTranslation } from "react-i18next";

const OfficeForm = () => {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams(); // URL params থেকে id নেয়া
  const isEditMode = Boolean(id);

  const methods = useForm();
  const { handleSubmit, register, reset } = methods;
  const generateRefId = useRefId();

  // যদি edit mode হয় তাহলে data load করে form-এ বসানো
  useEffect(() => {
    if (isEditMode) {
      const fetchOffice = async () => {
        try {
          const res = await api.get(`/office/${id}`);
          if (res.data.success) {
            reset(res.data.data); // form এর মধ্যে পুরাতন ডেটা বসানো
          } else {
            toast.error(t("Office not found!"));
          }
        } catch (error) {
          console.error(error);
          toast.error(t("Failed to load office data"));
        }
      };
      fetchOffice();
    }
  }, [id, isEditMode, reset]);

  const onSubmit = async (data) => {
    try {
      const payload = { ...data };

    // ref_id only generate if not in update mode
    if (!id) {
      payload.ref_id = generateRefId();
    }

      let response;
      if (isEditMode) {
        response = await api.put(`/office/${id}`, payload);
      } else {
        response = await api.post(`/office`, payload);
      }

      if (response.data.success) {
        toast.success(
          isEditMode
            ? t("Office updated successfully!")
            : t("Office info saved successfully!"),
          { position: "top-right" }
        );
        reset();
        navigate("/tramessy/HR/HRM/Office");
      } else {
        toast.error("Server Error: " + (response.data.message || t("Unknown issue")));
      }
    } catch (error) {
      console.error(error);
      const errorMessage =
        error.response?.data?.message || error.message || t("Unknown error");
      toast.error(t("Server Error:") + errorMessage);
    }
  };

  return (
    <div className="mt-10 p-2">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="mx-auto p-6 border-t-2 border-primary rounded-md shadow">
        <h3 className="pb-4 text-primary font-semibold">
          {isEditMode ? t("Edit Office") : t("Add New Office")}
        </h3>
        <FormProvider {...methods}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-3 mx-auto "
          >
            <div className=" p-3 ">
              <div className="mt-5 md:mt-1 md:flex justify-between gap-3">
                <div className="w-full">
                  <InputField name="branch_name" label={`${t("Branch")} ${t("Name")}`} required />
                </div>
                {/* <div className="w-full">
                  <InputField
                    name="factory_name"
                    label="Factory / Company Name"
                    required
                  />
                </div> */}
              </div>
              <div className="mt-5 md:mt-1 md:flex justify-between gap-3">
                <div className="w-full">
                  <InputField
                    type="number"
                    name="opening_balance"
                    label={`${t("Opening Balance")}`}
                    required
                  />
                </div>
                <div className="w-full">
                  <InputField name="address" label={`${t("Address")}`} required />
                </div>
              </div>
              <div className="text-left p-5">
                <BtnSubmit>{isEditMode ? "Update" : "Submit"}</BtnSubmit>
              </div>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
};

export default OfficeForm;