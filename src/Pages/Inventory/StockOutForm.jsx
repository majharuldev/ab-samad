// import { useEffect, useRef, useState } from "react";
// import BtnSubmit from "../../components/Button/BtnSubmit";
// import { FormProvider, useForm } from "react-hook-form";
// import { InputField, SelectField } from "../../components/Form/FormFields";
// import toast, { Toaster } from "react-hot-toast";
// import axios from "axios";
// import useRefId from "../../hooks/useRef";
// import { FiCalendar } from "react-icons/fi";

// const StockOutForm = () => {
//   const [vehicle, setVehicle] = useState([]);
//   const [driver, setDriver] = useState([]);
//   const [lastTotalStock, setLastTotalStock] = useState(null);
//   const methods = useForm();
//   const { handleSubmit, reset, register, control, watch } = methods;
//   const dateRef = useRef(null);
//   const generateRefId = useRefId();
//   // select vehicle from api
//   useEffect(() => {
//     fetch("${import.meta.env.VITE_BASE_URL}/api/vehicle/list")
//       .then((response) => response.json())
//       .then((data) => setVehicle(data.data))
//       .catch((error) => console.error("Error fetching vehicle data:", error));
//   }, []);
//   const vehicleOptions = vehicle.map((dt) => ({
//     value: dt.vehicle_name,
//     label: dt.vehicle_name,
//   }));
//   // select driver from api
//   useEffect(() => {
//     fetch("${import.meta.env.VITE_BASE_URL}/api/driver/list")
//       .then((response) => response.json())
//       .then((data) => setDriver(data.data))
//       .catch((error) => console.error("Error fetching driver data:", error));
//   }, []);
//   const driverOptions = driver.map((dt) => ({
//     value: dt.driver_name,
//     label: dt.driver_name,
//   }));
//   // get total stock
//   useEffect(() => {
//     fetch("${import.meta.env.VITE_BASE_URL}/api/stockOutProduct/list")
//       .then((response) => response.json())
//       .then((data) => {
//         const stockData = data.data;
//         if (stockData.length > 0) {
//           const lastStockItem = stockData[stockData.length - 1];
//           setLastTotalStock(lastStockItem.total_stock);
//         }
//       })
//       .catch((error) => console.error("Error fetching stock data:", error));
//   }, []);
//   // console.log("lastTotalStock", lastTotalStock);
//   // post on server
//   const onSubmit = async (data) => {
//     const qty = Number(watch("quantity"));
//     try {
//       const formData = new FormData();
//       if (qty > lastTotalStock) {
//         toast.error("Quantity cannot be greater than the available stock.", {
//           position: "top-right",
//         });
//         return;
//       }
//       for (const key in data) {
//         formData.append(key, data[key]);
//       }
//       formData.append("ref_id", generateRefId());
//       const response = await axios.post(
//         "${import.meta.env.VITE_BASE_URL}/api/stockOutProduct/create",
//         formData
//       );
//       const resData = response.data;
//       if (resData.success) {
//         toast.success("Stock out product saved successfully!", {
//           position: "top-right",
//         });
//         reset();
//       } else {
//         toast.error("Server error: " + (resData.message || "Unknown issue"));
//       }
//     } catch (error) {
//       console.error(error);
//       const errorMessage =
//         error.response?.data?.message || error.message || "Unknown error";
//       toast.error("Server error: " + errorMessage);
//     }
//   };
//   return (
//     <div className="mt-10">
//       <Toaster position="top-center" reverseOrder={false} />
//       <h3 className="px-6 py-2 bg-primary text-white font-semibold rounded-t-md">
//         Add Stock Out Product Information
//       </h3>
//       <FormProvider {...methods} className="">
//         <form
//           onSubmit={handleSubmit(onSubmit)}
//           className="mx-auto p-6 bg-gray-100 rounded-md shadow space-y-4"
//         >
//           {/*  */}
//           <div className="md:flex justify-between gap-3">
//             <div className="w-full">
//               <InputField
//                 name="date"
//                 label="Date"
//                 type="date"
//                 required
//                 inputRef={(e) => {
//                   register("date").ref(e);
//                   dateRef.current = e;
//                 }}
//                 icon={
//                   <span
//                     className="py-[11px] absolute right-0 px-3 top-[22px] transform -translate-y-1/2 bg-primary rounded-r"
//                     onClick={() => dateRef.current?.showPicker?.()}
//                   >
//                     <FiCalendar className="text-white cursor-pointer" />
//                   </span>
//                 }
//               />
//             </div>
//             <div className="w-full">
//               <SelectField
//                 name="product_category"
//                 label="Product Category"
//                 required
//                 options={[{ value: "engine_oil", label: "Engine Oil" }]}
//               />
//             </div>
//             <div className="w-full">
//               <InputField name="product_name" label="Product Name" required />
//             </div>
//           </div>
//           {/*  */}
//           <div className="md:flex justify-between gap-3">
//             <div className="w-full">
//               <InputField
//                 name="stock_out"
//                 label="Quantity"
//                 required
//                 type="number"
//               />
//             </div>
//             <div className="w-full">
//               <SelectField
//                 name="vehicle_name"
//                 label="Vehicle Name"
//                 required={true}
//                 options={vehicleOptions}
//                 control={control}
//               />
//             </div>
//           </div>
//           {/*  */}
//           <div className="md:flex justify-between gap-3">
//             <div className="w-full">
//               <SelectField
//                 name="driver_name"
//                 label="Driver Name"
//                 required={true}
//                 options={driverOptions}
//                 control={control}
//               />
//             </div>
//           </div>
//           <BtnSubmit>Submit</BtnSubmit>
//         </form>
//       </FormProvider>
//     </div>
//   );
// };

// export default StockOutForm;

import { useEffect, useRef, useState } from "react";
import BtnSubmit from "../../components/Button/BtnSubmit";
import { FormProvider, useForm } from "react-hook-form";
import { InputField, SelectField } from "../../components/Form/FormFields";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import useRefId from "../../hooks/useRef";
import { FiCalendar } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const StockOutForm = () => {
  const navigate = useNavigate()
  const [vehicle, setVehicle] = useState([]);
  const [driver, setDriver] = useState([]);
  const [availableStock, setAvailableStock] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const methods = useForm();
  const { handleSubmit, reset, register, control, watch, setError, formState: { errors } } = methods;
  const dateRef = useRef(null);
  const generateRefId = useRefId();
  const watchQuantity = watch("stock_out", 0);

  // Fetch vehicle data
  useEffect(() => {
    fetch(`${import.meta.env.VITE_BASE_URL}/api/vehicle/list`)
      .then((response) => response.json())
      .then((data) => setVehicle(data.data))
      .catch((error) => console.error("Error fetching vehicle data:", error));
  }, []);

  const vehicleOptions = vehicle.map((dt) => ({
    value: dt.vehicle_name,
    label: dt.vehicle_name,
  }));

  // Fetch driver data
  useEffect(() => {
    fetch(`${import.meta.env.VITE_BASE_URL}/api/driver/list`)
      .then((response) => response.json())
      .then((data) => setDriver(data.data))
      .catch((error) => console.error("Error fetching driver data:", error));
  }, []);

  const driverOptions = driver.map((dt) => ({
    value: dt.driver_name,
    label: dt.driver_name,
  }));

  // Fetch current stock data
  useEffect(() => {
    setIsLoading(true);
    fetch(`${import.meta.env.VITE_BASE_URL}/api/stockOutProduct/list`)
      .then((response) => response.json())
      .then((data) => {
        if (data.status === "Success" && data.data.length > 0) {
          const lastStockItem = data.data[data.data.length - 1];
          setAvailableStock(Number(lastStockItem.total_stock) || 0);
        } else {
          setAvailableStock(0);
        }
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching stock data:", error);
        setIsLoading(false);
      });
  }, []);

  // Validate stock before submission
  const onSubmit = async (data) => {
    const quantityToStockOut = Number(data.stock_out);
    
    if (availableStock <= 0) {
      toast.error("No available stock to stock out!", {
        position: "top-right",
      });
      return;
    }

    if (quantityToStockOut <= 0) {
      setError("stock_out", {
        type: "manual",
        message: "Quantity must be greater than 0",
      });
      return;
    }

    if (quantityToStockOut > availableStock) {
      toast.error(
        `Cannot stock out ${quantityToStockOut}. Only ${availableStock} available!`,
        { position: "top-right" }
      );
      return;
    }

    try {
      const formData = new FormData();
      for (const key in data) {
        formData.append(key, data[key]);
      }
      formData.append("ref_id", generateRefId());
      formData.append("total_stock", (availableStock - quantityToStockOut).toString());

      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/stockOutProduct/create`,
        formData
      );

      if (response.data.success) {
        toast.success("Stock out recorded successfully!", {
          position: "top-right",
        });
        reset();
        navigate("/tramessy/Inventory/StockOut")
        // Refresh available stock after successful submission
        const stockResponse = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/stockOutProduct/list`
        );
        if (stockResponse.data.status === "Success" && stockResponse.data.data.length > 0) {
          const lastItem = stockResponse.data.data[stockResponse.data.data.length - 1];
          setAvailableStock(Number(lastItem.total_stock));
        }
      } else {
        toast.error(response.data.message || "Failed to record stock out");
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || error.message || "Failed to record stock out"
      );
    }
  };

  if (isLoading) return <p className="text-center mt-16">Loading stock data...</p>;

  return (
    <div className="mt-10 md:p-2">
      <Toaster position="top-center" reverseOrder={false} />
      <h3 className="px-6 py-2 bg-primary text-white font-semibold rounded-t-md">
        Add Stock Out Product Information
      </h3>
      <div className="mx-auto p-6 bg-gray-100 rounded-md shadow space-y-4">
        <div className="bg-blue-50 p-4 rounded-md mb-4">
          <p className="font-semibold">Current Available Stock: {availableStock}</p>
          {watchQuantity > 0 && (
            <p className="mt-2">
              After this stock out: {availableStock - watchQuantity}
            </p>
          )}
          {watchQuantity > availableStock && (
            <p className="text-red-600 font-semibold mt-2">
              Warning: You're trying to stock out more than available!
            </p>
          )}
        </div>

        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="md:flex justify-between gap-3">
              <div className="w-full">
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
                      className="py-[11px] absolute right-0 px-3 top-[22px] transform -translate-y-1/2 bg-primary rounded-r"
                      onClick={() => dateRef.current?.showPicker?.()}
                    >
                      <FiCalendar className="text-white cursor-pointer" />
                    </span>
                  }
                />
              </div>
              <div className="w-full">
                <SelectField
                  name="product_category"
                  label="Product Category"
                  required
                  options={[{ value: "engine_oil", label: "Engine Oil" }]}
                />
              </div>
              <div className="w-full">
                <InputField name="product_name" label="Product Name" required />
              </div>
            </div>

            <div className="md:flex justify-between gap-3">
              <div className="w-full">
                <InputField
                  name="stock_out"
                  label="Quantity"
                  required
                  type="number"
                  min={1}
                  max={availableStock}
                  validate={(value) => {
                    const numValue = Number(value);
                    if (numValue <= 0) return "Quantity must be greater than 0";
                    if (numValue > availableStock) return `Maximum ${availableStock} available`;
                    return true;
                  }}
                />
                {errors.stock_out && (
                  <p className="text-red-500 text-sm mt-1">{errors.stock_out.message}</p>
                )}
              </div>
              <div className="w-full">
                <SelectField
                  name="vehicle_name"
                  label="Vehicle Name"
                  required={true}
                  options={vehicleOptions}
                  control={control}
                />
              </div>
            </div>

            <div className="md:flex justify-between gap-3">
              <div className="w-full">
                <SelectField
                  name="driver_name"
                  label="Driver Name"
                  required={true}
                  options={driverOptions}
                  control={control}
                />
              </div>
            </div>

            <BtnSubmit disabled={availableStock <= 0}>
              {availableStock <= 0 ? "No Stock Available" : "Submit"}
            </BtnSubmit>
          </form>
        </FormProvider>
      </div>
    </div>
  );
};

export default StockOutForm;
