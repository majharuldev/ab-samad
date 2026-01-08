
import { Controller, FormProvider, useForm } from "react-hook-form";
import { InputField, SelectField } from "../../components/Form/FormFields";
import BtnSubmit from "../../components/Button/BtnSubmit";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import useRefId from "../../hooks/useRef";
import { FiCalendar } from "react-icons/fi";
import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../utils/axiosConfig";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { IoMdClose } from "react-icons/io";

const PaymentReceiveForm = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const dateRef = useRef(null);
  const methods = useForm();
  const { handleSubmit, reset, register, control, setValue } = methods;
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [existingImage, setExistingImage] = useState(null);

  // Fetch data if in edit mode
  useEffect(() => {
    if (id) {
      setIsEditing(true);
      fetchPaymentData();
    }
  }, [id]);

  const fetchPaymentData = async () => {
    try {
      setLoading(true);
      const response = await api.get(
        `/payment-recieve/${id}`
      );
      const data = response.data.data;

      // Set form values
      methods.reset({
        date: data.date,
        customer_name: data.customer_name,
        branch_name: data.branch_name,
        bill_ref: data.bill_ref,
        amount: data.amount,
        cash_type: data.cash_type,
        remarks: data.remarks,
        created_by: data.created_by,
        status: data.status,
        ref_id: data.ref_id
      });
      if (data.image) {
        const imageUrl = `${import.meta.env.VITE_IMAGE_URL}/paymentRc/${data.image}`
        setPreviewImage(imageUrl)
        setExistingImage(data.image)
      }
    } catch (error) {
      console.error("Error fetching payment data:", error);
      toast.error(t("Failed to load payment data"));
    } finally {
      setLoading(false);
    }
  };

  // select customer from api
  const [customer, setCustomer] = useState([]);
  useEffect(() => {
    api.get(`/customer`)
      .then((response) => setCustomer(response.data))
      .catch((error) => console.error("Error fetching customer data:", error));
  }, []);

  const customerOptions = customer.map((dt) => ({
    value: dt.customer_name,
    label: dt.customer_name,
  }));

  // select branch office from api
  const [branch, setBranch] = useState([]);
  useEffect(() => {
    api.get(`/office`)
      .then((response) => setBranch(response.data.data))
      .catch((error) => console.error("Error fetching branch data:", error));
  }, []);

  const branchOptions = branch.map((dt) => ({
    value: dt.branch_name,
    label: dt.branch_name,
  }));

  const generateRefId = useRefId();

  // remove image
  // Preview image or PDF remove
  const removePreview = () => {
    setPreviewImage(null);
    setExistingImage(null);
    setValue("bill_image", null);
  };
  // handleFileChange ফাংশন আপডেট করুন
  const handleFileChange = (e) => {
  const file = e.target.files?.[0]
  if (!file) return

  setValue("bill_image", file)

  if (
    file.type.startsWith("image/") ||
    file.type === "application/pdf"
  ) {
    setPreviewImage(URL.createObjectURL(file))
  } else {
    toast.error("Only image or PDF allowed")
  }
}


  // submit handler
  const onSubmit = async (data) => {
    setLoading(true)
  console.log(data)
    try {
      const formData = new FormData()
  
       Object.entries(data).forEach(([key, value]) => {
        if (
          key !== "bill_image" &&
          value !== undefined &&
          value !== null &&
          value !== ""
        ) {
          formData.append(key, value)
        }
      })
  
      //  backend expects "image"
      if (data.bill_image instanceof File) {
        formData.append("image", data.bill_image)
      } else if (isEditing && existingImage) {
        formData.append("existing_image", existingImage)
      }
  
      const res = isEditing
        ? await api.post(`/payment-recieve/${id}`, formData)
        : await api.post(`/payment-recieve`, formData)
  
      if (res.data?.success) {
        toast.success(
          isEditing
            ? t("Payment updated successfully")
            : t("Payment saved successfully")
        )
        navigate("/tramessy/account/PaymentReceive");
      } else {
        toast.error(res.data?.message || t("Something went wrong"))
      }
  
    } catch (error) {
      console.error("Submit error:", error)
      toast.error(
        error.response?.data?.message || t("Server error")
      )
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div>{t("Loading")}...</div>;
  }

  return (
    <div className="mt-5 p-2">
      <Toaster />
      <div className="mx-auto p-6  rounded-md shadow-md border-t-2 border-primary">
        <h3 className="pb-4 text-primary font-semibold ">
          {isEditing ? t("Update Payment Receive") : t("Payment Receive Form")}
        </h3>
        <FormProvider {...methods} className="">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-3 mx-auto "
          >
            <div className="">
              <div className="mt-5 md:mt-1 md:flex justify-between gap-3">
                <div className="w-full">
                  <InputField
                    name="date"
                    label={t("Date")}
                    type="date"
                    required={!isEditing}
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
                </div>
                <div className="w-full">
                  <SelectField
                    name="customer_name"
                    label={`${t("Customer")} ${t("Name")}`}
                    required={!isEditing}
                    options={customerOptions}
                    control={control}
                  />
                </div>
                <div className="w-full">
                  <SelectField
                    name="branch_name"
                    label={`${t("Branch")} ${t("Name")}`}
                    required={!isEditing}
                    options={branchOptions}
                    control={control}
                  />
                </div>
              </div>
              <div className="mt-5 md:mt-1 md:flex justify-between gap-3">
                <div className="w-full">
                  <InputField name="bill_ref" label={t("Bill Ref")} required={!isEditing} />
                </div>
                <div className="w-full">
                  <InputField
                    name="amount"
                    label={t("Amount")}
                    type="number"
                    required={!isEditing}
                  />
                </div>
                <div className="w-full">
                  <SelectField
                    name="cash_type"
                    label={t("Cash Type")}
                    required={!isEditing}
                    options={[
                      { value: "Cash", label: t("Cash") },
                      { value: "Bank", label: t("Bank") },
                      { value: "Card", label: t("Card") },
                    ]}
                  />
                </div>
              </div>
              <div className="mt-5 md:mt-1 md:flex justify-between gap-3">
                <div className="w-full">
                  <InputField name="remarks" label={t("Note")} required={!isEditing} />
                </div>
                <div className="w-full">
                  <InputField name="created_by" label={t("Created By")} required={!isEditing} />
                </div>
                <div className="w-full">
                  <SelectField
                    name="status"
                    label={t("Status")}
                    required={!isEditing}
                    options={[
                      { value: "Paid", label: t("Paid") },
                      { value: "Unpaid", label: t("Unpaid") },
                    ]}
                  />
                </div>
              </div>
              <div className="md:flex justify-between gap-3">
                <div className="w-[50%]">
                  <label className="text-gray-700 text-sm font-semibold">
                    {t("Bill Documents")}
                  </label>
                  <Controller
                    name="bill_image"
                    control={control}
                    // rules={isEditMode ? {} : { required: "This field is required" }}
                    render={({ field: { onChange, ref }, fieldState: { error } }) => (
                      <div>
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          ref={ref}
                          onChange={(e) => {
                            const file = e.target.files[0];
                            handleFileChange(e);
                            onChange(file);
                          }}
                          className="border p-2 rounded w-full"
                        />
                        {error && (
                          <span className="text-red-600 text-sm">{error.message}</span>
                        )}
                        {id && existingImage && !previewImage && (
                          <p className="text-green-600 text-sm mt-1">
                            {t("Current file")}: {existingImage}
                          </p>
                        )}
                      </div>
                    )}
                  />
                </div>
              </div>
              {previewImage && (
                <div className="mt-3 relative  flex !justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewImage(null);
                      setValue("bill_image", null);
                      removePreview()
                      // ফাইল ইনপুট রিসেট করুন
                      const fileInput = document.querySelector('input[type="file"]');
                      if (fileInput) fileInput.value = "";

                      if (id && existingImage) {
                        // এডিট মোডে থাকলে এক্সিস্টিং ইমেজ দেখান
                        const imageUrl = `{${import.meta.env.VITE_IMAGE_URL}/paymentRc/${existingImage}`;
                        setPreviewImage(imageUrl);
                      } else {
                        setExistingImage(null);
                      }
                    }}
                    className="absolute top-2 right-2 text-red-600 bg-white shadow rounded-sm hover:text-white hover:bg-secondary transition-all duration-300 cursor-pointer font-bold text-xl p-[2px] z-10"
                    title="Remove preview"

                  >
                    <IoMdClose />
                  </button>

                  {/* PDF বা ইমেজ প্রিভিউ */}
                  {previewImage.includes("application/pdf") || previewImage.endsWith(".pdf") ? (
                    <div className="border rounded p-2 bg-gray-50">
                      <p className="text-sm text-gray-600 mb-2">{t("PDF Preview")}:</p>
                      <iframe
                        src={previewImage}
                        className="w-full h-64 border"
                        title="PDF Preview"
                      />
                      <a
                        href={previewImage}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 text-sm mt-2 inline-block"
                      >
                        {t("Open PDF in new tab")}
                      </a>
                    </div>
                  ) : (
                    <div className="border rounded p-2 bg-gray-50">
                      <p className="text-sm text-gray-600 mb-2">{t("Image Preview")}:</p>
                      <img
                        src={previewImage}
                        alt="Bill Preview"
                        className="max-w-full h-auto max-h-64 object-contain rounded"
                      />
                    </div>
                  )}
                </div>
              )}
              <div className="text-left p-5">
                <BtnSubmit>{isEditing ? t("Update") : t("Submit")}</BtnSubmit>
              </div>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
};

export default PaymentReceiveForm;