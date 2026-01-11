import { useEffect, useRef, useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import "react-datepicker/dist/react-datepicker.css";
import { FiCalendar } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";
import BtnSubmit from "../components/Button/BtnSubmit";
import { InputField, SelectField } from "../components/Form/FormFields";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../utils/axiosConfig";
import { useTranslation } from "react-i18next";

const AddDriverForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const methods = useForm();
  const { handleSubmit, register, reset, control } = methods;
  const [previewImage, setPreviewImage] = useState(null);
  const driverDateRef = useRef(null);

  // single driver set field for edit
  useEffect(() => {
    if (id) {
      const fetchDriver = async () => {
        try {
          const res = await api.get(`/driver/${id}`);
          const driverData = res.data;

          // Pre-fill form
          reset(driverData);

          if (driverData.lincense_image) {
            setPreviewImage(driverData.lincense_image);
          }
        } catch (error) {
          console.error(error);
          // toast.error("Failed to load driver data");
        }
      };
      fetchDriver();
    }
  }, [id, reset]);

  const onSubmit = async (data) => {
    try {
      // const formData = new FormData();
      // for (const key in data) {
      //   if (data[key] !== undefined && data[key] !== null) {
      //     // যদি তারিখ হয়, তাহলে string বানাও
      //     if (data[key] instanceof Date) {
      //       formData.append(key, data[key].toISOString().split("T")[0]);
      //     } else {
      //       formData.append(key, data[key]);
      //     }
      //   }
      // }

      let response;
      if (!id) {
        response = await api.post(`/driver`, data);
      } else {
        response = await api.put(`/driver/${id}`, data);
      }

      toast.success(
        !id ? t("Driver added successfully") : t("Driver updated successfully"),
        { position: "top-right" }
      );

      reset();
      navigate("/tramessy/DriverList");
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
      <div className="mx-auto p-6 rounded-md shadow border-t-2 border-primary">
        <h3 className=" pb-4 text-primary font-semibold ">
          {!id ? t("Create Driver") : t("Update Driver")}
        </h3>
        <FormProvider {...methods} className="">
          <form onSubmit={handleSubmit(onSubmit)} className="">
            {/* Name & Contact */}
            <div className="md:flex justify-between gap-3">
              <div className="w-full">
                <InputField name="driver_name" label={`${t("Driver")} ${t("Name")}`} required />
              </div>
              <div className="mt-2 md:mt-0 w-full">
                <InputField
                  name="driver_mobile"
                  label={`${t("Driver")} ${t("Mobile")}`}
                  type="number"
                  required={!id}
                />
              </div>
            </div>

            {/* NID & Emergency Contact */}
            <div className="md:flex justify-between gap-3">
              <div className="w-full">
                <InputField name="address" label={t("Address")} required={!id} />
              </div>
              <div className="mt-2 md:mt-0 w-full">
                <InputField
                  name="emergency_contact"
                  label={t("Emergency Contact")}
                  type="number"
                />
              </div>
            </div>

            {/* Address & Note */}
            <div className="md:flex justify-between gap-3">
              <div className="w-full">
                <InputField
                  name="nid"
                  label={`${t("NID Number")}`}
                  type="number"
                  required={!id}
                />
              </div>
              <div className="mt-2 md:mt-0 w-full">
                <InputField name="lincense" label={t("License No")} required={!id} />
              </div>
            </div>

            {/* License & Expiry */}
            <div className="md:flex justify-between gap-3">
              <div className="w-full">
                <InputField
                  name="expire_date"
                  label={t("License Expired Date")}
                  type="date"
                  required={!id}
                  inputRef={(e) => {
                    register("expire_date").ref(e);
                    driverDateRef.current = e;
                  }}
                  icon={
                    <span
                      className="py-[11px] absolute right-0 px-3 top-[22px] transform -translate-y-1/2  rounded-r"
                      onClick={() => driverDateRef.current?.showPicker?.()}
                    >
                      <FiCalendar className="text-gray-700 cursor-pointer" />
                    </span>
                  }
                />
              </div>
              <div className="mt-2 md:mt-0 w-full relative">
                <InputField name="note" label={t("Note")} />
              </div>
            </div>

            {/* Status & License Image */}
            <div className="md:flex justify-between gap-3">
              <div className="w-full relative">
                <SelectField
                name="vehicle_category"
                label={`${t("Vehicle")} ${t("Category")}`}
                required={id? false:true}
                options={[
                  // { value: "", label: "Select Vehicle category..." },
                  { value: "pickup", label: t("Pickup") },
                  { value: "covered_van", label: t("Covered Van") },
                  { value: "open_truck", label: t("Open Truck") },
                  { value: "trailer", label: t("Trailer") },
                  { value: "freezer_van", label: t("Freezer Van") },
                  { value: "Oil Tanker", label: t("Oil Tanker") },
                ]}
           
              />
              </div>
              <div className="mt-2 md:mt-0 w-full relative">
                <InputField name="opening_balance" label={t("Opening Balance")} />
              </div>
              <div className="w-full relative">
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

              {/* <div className="mt-3 md:mt-0 w-full">
                <label className="text-gray-700 text-sm font-semibold">
                  Upload License Image {!id?<span className="text-red-500">*</span>: ""}
                </label>
                <div className="relative">
                  <Controller
                    name="lincense_image"
                    control={control}
                    rules={{ required: "This field is required" }}
                    render={({
                      field: { onChange, ref },
                      fieldState: { error },
                    }) => (
                      <div className="relative">
                        <label
                          htmlFor="lincense_image"
                          className="border p-2 rounded w-full block bg-white text-gray-500 text-sm cursor-pointer"
                        >
                          {previewImage ? "Image selected" : "Choose image"}
                        </label>
                        <input
                          id="lincense_image"
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
                            } else {
                              setPreviewImage(null);
                              onChange(null);
                            }
                          }}
                        />
                        {error && (
                          <span className="text-red-600 text-sm">
                            {error.message}
                          </span>
                        )}
                      </div>
                    )}
                  />
                </div>
              </div> */}
            </div>

            {/* Preview */}
            {/* {previewImage && (
              <div className="mt-3 relative flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setPreviewImage(null);
                    document.getElementById("lincense_image").value = "";
                  }}
                  className="absolute top-2 right-2 text-red-600 bg-white shadow rounded-sm hover:text-white hover:bg-secondary transition-all duration-300 cursor-pointer font-bold text-xl p-[2px]"
                  title="Remove image"
                >
                  <IoMdClose />
                </button>
                <img
                  src={previewImage}
                  alt="License Preview"
                  className="max-w-xs h-auto rounded border border-gray-300"
                />
              </div>
            )} */}

            <div className="mt-6 text-left">
              <BtnSubmit>Submit</BtnSubmit>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
};

export default AddDriverForm;
