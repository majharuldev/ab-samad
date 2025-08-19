
import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BtnSubmit from "../../components/Button/BtnSubmit";
import { FormProvider, useForm } from "react-hook-form";
import { InputField, SelectField } from "../../components/Form/FormFields";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import { FiCalendar } from "react-icons/fi";

const UpdateStockOutForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState([]);
  const [driver, setDriver] = useState([]);
  const [stockData, setStockData] = useState(null);
  const [availableStock, setAvailableStock] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [originalQuantity, setOriginalQuantity] = useState(0);
  const methods = useForm();
  const { handleSubmit, reset, register, control, watch, setError, formState: { errors } } = methods;
  const dateRef = useRef(null);
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

  // Fetch current stock data and the record to update
  useEffect(() => {
    setIsLoading(true);
    
    // Fetch the specific stock record to update
    axios.get(`${import.meta.env.VITE_BASE_URL}/api/stockOutProduct/show/${id}`)
      .then(response => {
        if (response.data.status === "Success") {
          const record = response.data.data;
          setStockData(record);
          setOriginalQuantity(Number(record.stock_out) || 0);
          
          // Pre-fill the form with existing data
          reset({
            date: record.date,
            product_category: record.product_category,
            product_name: record.product_name,
            stock_out: record.stock_out,
            vehicle_name: record.vehicle_name,
            driver_name: record.driver_name
          });
        }
      })
      .catch(error => {
        console.error("Error fetching stock record:", error);
        toast.error("Failed to load stock record");
      });

    // Fetch current stock levels
    axios.get(`${import.meta.env.VITE_BASE_URL}/api/stockOutProduct/list`)
      .then(response => {
        if (response.data.status === "Success" && response.data.data.length > 0) {
          const lastStockItem = response.data.data[response.data.data.length - 1];
          setAvailableStock(Number(lastStockItem.total_stock) + originalQuantity); // Add back the original quantity
        }
        setIsLoading(false);
      })
      .catch(error => {
        console.error("Error fetching stock data:", error);
        setIsLoading(false);
      });
  }, [id, reset, originalQuantity]);

  // Validate stock before submission
  const onSubmit = async (data) => {
    const quantityToStockOut = Number(data.stock_out);
    const quantityDifference = quantityToStockOut - originalQuantity;

    if (availableStock <= 0 && quantityDifference > 0) {
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

    if (quantityDifference > (availableStock - originalQuantity)) {
      toast.error(
        `Cannot increase stock out by ${quantityDifference}. Only ${availableStock - originalQuantity} available!`,
        { position: "top-right" }
      );
      return;
    }

    try {
      const formData = new FormData();
      for (const key in data) {
        formData.append(key, data[key]);
      }
      formData.append("_method", "POST"); // For Laravel PUT request
      formData.append("total_stock", (availableStock - quantityDifference).toString());

      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/stockOutProduct/update/${id}`,
        formData
      );

      if (response.data.success) {
        toast.success("Stock out updated successfully!", {
          position: "top-right",
        });
        navigate("/tramessy/Inventory/StockOut"); // Redirect to stock out list
      } else {
        toast.error(response.data.message || "Failed to update stock out");
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || error.message || "Failed to update stock out"
      );
    }
  };

 if (isLoading || !stockData) {
  return <p className="text-center mt-16">Loading stock data...</p>;
}

  return (
    <div className="mt-10 md:p-2">
      <Toaster position="top-center" reverseOrder={false} />
      <h3 className="px-6 py-2 bg-primary text-white font-semibold rounded-t-md">
        Update Stock Out Product Information
      </h3>
      <div className="mx-auto p-6 bg-gray-100 rounded-md shadow space-y-4">
        <div className="bg-blue-50 p-4 rounded-md mb-4">
          <p className="font-semibold">Current Available Stock: {availableStock}</p>
          <p className="font-semibold">Original Stock Out Quantity: {originalQuantity}</p>
          {watchQuantity > originalQuantity && (
            <p className="text-red-600 font-semibold mt-2">
              Warning: You're trying to increase stock out by {watchQuantity - originalQuantity}
            </p>
          )}
          {watchQuantity < originalQuantity && (
            <p className="text-green-600 font-semibold mt-2">
              You're decreasing stock out by {originalQuantity - watchQuantity}
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
                  validate={(value) => {
                    const numValue = Number(value);
                    if (numValue <= 0) return "Quantity must be greater than 0";
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
                {driverOptions.length > 0 && (
  <SelectField
    name="driver_name"
    label="Driver Name"
    required={true}
    options={driverOptions}
    control={control}
  />
)}
              </div>
            </div>

            <BtnSubmit>Update Stock Out</BtnSubmit>
          </form>
        </FormProvider>
      </div>
    </div>
  );
};

export default UpdateStockOutForm;