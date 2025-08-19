import { InputField, SelectField } from "../components/Form/FormFields";
import BtnSubmit from "../components/Button/BtnSubmit";
import { FormProvider, useForm } from "react-hook-form";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { useEffect, useRef, useState } from "react";
import { FiCalendar } from "react-icons/fi";
import useRefId from "../hooks/useRef";
import { useNavigate } from "react-router-dom";

const AddTripForm = () => {
  const dateRef = useRef(null);
  const methods = useForm();
  const { watch, handleSubmit, reset, register, setValue, control } = methods;
  const selectedCustomer = watch("customer");
  const selectedTransport = watch("transport_type");
  const navigate = useNavigate();

  // select customer from api
  const [customers, setCustomers] = useState([]);
  useEffect(() => {
    fetch(`${import.meta.env.VITE_BASE_URL}/api/customer/list`)
      .then((response) => response.json())
      .then((data) => setCustomers(data.data))
      .catch((error) => console.error("Error fetching customer data:", error));
  }, []);

  const customerOptions = customers.map((customer) => ({
    value: customer.customer_name,
    label: customer.customer_name,
  }));

   // select customer from api
  const [branch, setBranch] = useState([]);
  useEffect(() => {
    fetch(`${import.meta.env.VITE_BASE_URL}/api/office/list`)
      .then((response) => response.json())
      .then((data) =>{ setBranch(data.data)})
      .catch((error) => console.error("Error fetching customer data:", error));
  }, []);

  const branchOptions = branch.map((branch) => ({
    value: branch.branch_name,
    label: branch.branch_name,
  }));
  // select Vehicle No. from api
  const [vehicle, setVehicle] = useState([]);
  useEffect(() => {
    fetch(`${import.meta.env.VITE_BASE_URL}/api/vehicle/list`)
      .then((response) => response.json())
      .then((data) => setVehicle(data.data))
      .catch((error) => console.error("Error fetching vehicle data:", error));
  }, []);
  const vehicleOptions = vehicle.map((dt) => ({
    value: `${dt.registration_zone} ${dt.registration_serial} ${dt.registration_number} `,
    label: `${dt.registration_zone} ${dt.registration_serial} ${dt.registration_number} `,
  }));
  // select vendor Vehicle No. from api
  const [vendorVehicle, setVendorVehicle] = useState([]);
  useEffect(() => {
    fetch(`${import.meta.env.VITE_BASE_URL}/api/rent/list`)
      .then((response) => response.json())
      .then((data) => setVendorVehicle(data.data))
      .catch((error) => console.error("Error fetching vehicle data:", error));
  }, []);
  const vendorVehicleOptions = vendorVehicle.map((dt) => ({
    value: `${dt.registration_zone} ${dt.registration_serial} ${dt.registration_number} `,
    label: `${dt.registration_zone} ${dt.registration_serial} ${dt.registration_number} `,
  }));
  // select own driver from api
  const [drivers, setDrivers] = useState([]);
  useEffect(() => {
    fetch(`${import.meta.env.VITE_BASE_URL}/api/driver/list`)
      .then((response) => response.json())
      .then((data) => setDrivers(data.data))
      .catch((error) => console.error("Error fetching driver data:", error));
  }, []);
  const ownDriverOptions = drivers.map((driver) => ({
    value: driver.driver_name,
    label: driver.driver_name,
    contact: driver.driver_mobile,
  }));
  // select vendor from api
  const [vendor, setVendor] = useState([]);
  useEffect(() => {
    fetch(`${import.meta.env.VITE_BASE_URL}/api/vendor/list`)
      .then((response) => response.json())
      .then((data) => setVendor(data.data))
      .catch((error) => console.error("Error fetching vendor data:", error));
  }, []);
  const vendorOptions = vendor.map((dt) => ({
    value: dt.vendor_name,
    label: dt.vendor_name,
  }));
  // select vendor driver from api
  const [vendorDriver, setVendorDrivers] = useState([]);
  useEffect(() => {
    fetch(`${import.meta.env.VITE_BASE_URL}/api/rent/list`)
      .then((response) => response.json())
      .then((data) => setVendorDrivers(data.data))
      .catch((error) =>
        console.error("Error fetching vendor driver data:", error)
      );
  }, []);
  const vendorDriverOptions = vendorDriver.map((dt) => ({
    value: dt.vendor_name,
    label: dt.vendor_name,
    contact: dt.mobile,
  }));

  // calculate Total Expense
  const driverCommision = parseFloat(watch("driver_commission") || 0);
  const roadCost = parseFloat(watch("road_cost") || 0);
  const labourCost = parseFloat(watch("labor") || 0);
  const parkingCost = parseFloat(watch("parking_cost") || 0);
  const guardCost = parseFloat(watch("night_guard") || 0);
  const tollCost = parseFloat(watch("toll_cost") || 0);
  const feriCost = parseFloat(watch("feri_cost") || 0);
  const policeCost = parseFloat(watch("police_cost") || 0);
  const chadaCost = parseFloat(watch("chada") || 0);
   const fuelCost = parseFloat(watch("fuel_cost") || 0);
  const callanCost = parseFloat(watch("callan_cost") || 0);
  const othersCost = parseFloat(watch("others_cost") || 0);

  const totalExpense =
    driverCommision +
    roadCost +
    labourCost +
    parkingCost +
    guardCost +
    tollCost +
    feriCost +
    policeCost +
    chadaCost+
    fuelCost +
    callanCost +
    othersCost;

  useEffect(() => {
    const total =
      driverCommision +
      roadCost +
      labourCost +
      parkingCost +
      guardCost +
      tollCost +
      feriCost +
      policeCost +
      chadaCost+
      fuelCost+
    callanCost+
    othersCost;
    setValue("total_exp", total);
  }, [
    driverCommision,
    roadCost,
    labourCost,
    parkingCost,
    guardCost,
    tollCost,
    feriCost,
    policeCost,
    chadaCost,
    fuelCost,
    callanCost,
    othersCost,
    setValue,
  ]);
  // calculate Total Expense of honda
  const noOfTrip = watch("no_of_trip") || 0;
  const perTruckRent = watch("per_truck_rent") || 0;
  const totalRentHonda = Number(noOfTrip) * Number(perTruckRent);
  useEffect(() => {
    const total = Number(noOfTrip) * Number(perTruckRent);
    setValue("total_rent", total || 0);
  }, [noOfTrip, perTruckRent, setValue]);

  // post data on server
  const generateRefId = useRefId();

  const onSubmit = async (data) => {
    const refId = generateRefId();
    try {
      const tripFormData = new FormData();
      // Append form fields
      for (const key in data) {
        tripFormData.append(key, data[key]);
      }
      // Additional fields
      tripFormData.append("ref_id", refId);
      // tripFormData.append("status", "Pending");
      await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/trip/create`,
        tripFormData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      toast.success("Trip submitted successfully!", { position: "top-right" });
      reset();
      navigate("/tramessy/TripList")
    } catch (error) {
      console.error(error);
      const errorMessage =
        error.response?.data?.message || error.message || "Unknown error";
      toast.error("Server issue: " + errorMessage);
    }
  };
  return (
    <div className="md:p-2">
      <Toaster position="top-center" reverseOrder={false} />
      <h3 className="px-6 py-2 bg-primary text-white font-semibold rounded-t-md">
        Add Trip
      </h3>
      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-3 mx-auto bg-gray-100 rounded-md shadow"
        >
          <div className="border border-gray-300 p-3 md:p-5 rounded-b-md">
            <h5 className="text-3xl font-bold text-center text-[#EF9C07]">
              {selectedCustomer}
            </h5>
            {/* Common Input Fields */}
            <div>
              <div className="border border-gray-300 p-5 rounded-md mt-3">
                <h5 className="text-primary font-semibold text-center pb-5">
                  <span className="py-2 border-b-2 border-primary">
                    Customer and Destination
                  </span>
                </h5>
                <div className="mt-5 md:flex justify-between gap-3">
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
                  {/* Customer Dropdown */}
                  <div className="w-full relative">                    
                    <SelectField
                      name="customer"
                      label="Customer"
                      required={true}
                      options={customerOptions}
                      control={control}
                    />
                  </div>
                  
                  <div className="w-full relative">
                    <SelectField
                      name="branch_name"
                      label="Branch"
                      required={true}
                      options={branchOptions}
                      control={control}
                    />
                  </div>
                </div>
                <div className="mt-5 md:mt-1 md:flex justify-between gap-3">
                  <div className="w-full">
                    <InputField name="load_point" label="Load Point" required />
                  </div>
                  <div className="w-full">
                    <InputField
                      name="unload_point"
                      label="Unload Point"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Conditionally Show Yamaha Fields */}
            {selectedCustomer === "Yamaha" && (
              <div className="">
                <div className="border border-gray-300 p-5 rounded-md mt-3">
                  <h5 className="text-primary font-semibold text-center pb-5">
                    <span className="py-2 border-b-2 border-primary">
                      Transport and Driver section
                    </span>
                  </h5>
                  <div className="mt-5 md:mt-1 md:flex justify-between gap-3">
                    <div className="w-full relative">
                      <SelectField
                        name="transport_type"
                        label="Transport Type"
                        required
                        options={[
                          { value: "own_transport", label: "Own Transport" },
                          {
                            value: "vendor_transport",
                            label: "Vendor Transport",
                          },
                        ]}
                      />
                    </div>
                    {selectedTransport === "vendor_transport" ? (
                      <div className="w-full">
                        <SelectField
                          name="vendor_name"
                          label="Vendor Name"
                          required={true}
                          options={vendorOptions}
                          control={control}
                        />
                      </div>
                    ) : (
                      ""
                    )}
                    <div className="w-full">
                      {selectedTransport === "own_transport" ? (
                        <SelectField
                          name="vehicle_no"
                          label="Vehicle No."
                          required={true}
                          options={vehicleOptions}
                          control={control}
                        />
                      ) : selectedTransport === "vendor_transport" ? (
                        <SelectField
                          name="vehicle_no"
                          label="Vehicle No."
                          required={true}
                          options={vendorVehicleOptions}
                          control={control}
                        />
                      ) : (
                        <SelectField
                          name="vehicle_no"
                          label="Vehicle No."
                          defaultValue={"Please select transport first"}
                          required={true}
                          options={[
                            {
                              label: "Please select transport first",
                              value: "",
                              disabled: true,
                            },
                          ]}
                          control={control}
                        />
                      )}
                    </div>
                  </div>
                  <div className="mt-5 md:mt-1 md:flex justify-between gap-3">
                    <div className="w-full">
                      {selectedTransport === "own_transport" ? (
                        <SelectField
                          name="driver_name"
                          label="Driver Name"
                          required
                          control={control}
                          options={ownDriverOptions}
                          onSelectChange={(selectedOption) => {
                            setValue(
                              "driver_mobile",
                              selectedOption?.contact || ""
                            );
                          }}
                        />
                      ) : selectedTransport === "vendor_transport" ? (
                        <SelectField
                          name="driver_name"
                          label="Driver Name"
                          required
                          control={control}
                          options={vendorDriverOptions}
                        />
                      ) : (
                        <SelectField
                          name="driver_name"
                          label="Driver Name"
                          required
                          control={control}
                          options={[
                            {
                              label: "Please select transport first",
                              value: "",
                              disabled: true,
                            },
                          ]}
                        />
                      )}
                    </div>
                    <div className="w-full">
                      <InputField
                        name="driver_mobile"
                        label="Driver Mobile"
                        type="number"
                        required
                      />
                    </div>
                    <div className="w-full">
                      <InputField name="challan" label="Challan" required />
                    </div>
                  </div>
                </div>
                <div className="border border-gray-300 p-5 rounded-md mt-3">
                  <h5 className="text-primary font-semibold text-center pb-5">
                    <span className="py-2 border-b-2 border-primary">
                      Product and Expense
                    </span>
                  </h5>
                  <div className="mt-5 md:mt-1 md:flex justify-between gap-3">
                    <div className="w-full">
                      <InputField name="model_no" label="Model No." required />
                    </div>
                    <div className="w-full">
                      <InputField
                        name="quantity"
                        label="Quantity"
                        type="number"
                        required
                      />
                    </div>
                  </div>

                  <div className="mt-5 md:mt-1 md:flex justify-between gap-3">
                    <div className="w-full">
                      <InputField
                        name="total_rent"
                        label="Total Rent/Bill Amount"
                        type="number"
                        required
                      />
                    </div>
                    {/* <div className="w-full">
                      <InputField
                        name="fuel_cost"
                        label="Fuel Cost"
                        type="number"
                        required
                      />
                    </div> */}
                    <div className="w-full">
                      <InputField
                        name="body_fare"
                        label="Body Fare"
                        type="number"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Conditionally Show Hatim Fields */}
            {(selectedCustomer === "Hatim Pubail" ||
              selectedCustomer === "Hatim Rupgonj") && (
              <div className="border border-gray-300 p-5 rounded-md mt-3">
                <h5 className="text-primary font-semibold text-center pb-5">
                  <span className="py-2 border-b-2 border-primary">
                    Transport and Driver section
                  </span>
                </h5>
                <div className="mt-5 md:mt-1 md:flex justify-between gap-3">
                  <div className="w-full relative">
                    <SelectField
                      name="transport_type"
                      label="Transport Type"
                      required
                      options={[
                        { value: "own_transport", label: "Own Transport" },
                        {
                          value: "vendor_transport",
                          label: "Vendor Transport",
                        },
                      ]}
                    />
                  </div>
                  {selectedTransport === "vendor_transport" ? (
                    <div className="w-full">
                      <SelectField
                        name="vendor_name"
                        label="Vendor Name"
                        required={true}
                        options={vendorOptions}
                        control={control}
                      />
                    </div>
                  ) : (
                    ""
                  )}
                  <div className="w-full">
                    {selectedTransport === "own_transport" ? (
                      <SelectField
                        name="vehicle_no"
                        label="Vehicle No."
                        required={true}
                        options={vehicleOptions}
                        control={control}
                      />
                    ) : selectedTransport === "vendor_transport" ? (
                      <SelectField
                        name="vehicle_no"
                        label="Vehicle No."
                        required={true}
                        options={vendorVehicleOptions}
                        control={control}
                      />
                    ) : (
                      <SelectField
                        name="vehicle_no"
                        label="Vehicle No."
                        required={true}
                        options={[
                          {
                            label: "Please select transport first",
                            value: "",
                            disabled: true,
                          },
                        ]}
                        control={control}
                      />
                    )}
                  </div>
                </div>
                <div className="mt-5 md:mt-1 md:flex justify-between gap-3">
                  <div className="w-full">
                    {selectedTransport === "own_transport" ? (
                      <SelectField
                        name="driver_name"
                        label="Driver Name"
                        required
                        control={control}
                        options={ownDriverOptions}
                        onSelectChange={(selectedOption) => {
                          setValue(
                            "driver_mobile",
                            selectedOption?.contact || ""
                          );
                        }}
                      />
                    ) : selectedTransport === "vendor_transport" ? (
                      <SelectField
                        name="driver_name"
                        label="Driver Name"
                        required
                        control={control}
                        options={vendorDriverOptions}
                      />
                    ) : (
                      <SelectField
                        name="driver_name"
                        label="Driver Name"
                        required
                        control={control}
                        options={[
                          {
                            label: "Please select transport first",
                            value: "",
                            disabled: true,
                          },
                        ]}
                      />
                    )}
                  </div>
                  <div className="w-full">
                    <InputField
                      name="driver_mobile"
                      label="Driver Mobile"
                      type="number"
                      required
                    />
                  </div>
                  <div className="w-full">
                    <InputField name="challan" label="Challan" required />
                  </div>
                  <div className="w-full">
                    <InputField name="goods" label="Goods" required />
                  </div>
                </div>
                <div className="mt-5 md:mt-1 md:flex justify-between gap-3">
                  <div className="w-full">
                    <InputField
                      name="distribution_name"
                      label="Distribution Name"
                      required
                    />
                  </div>
                  <div className="w-full">
                    <InputField
                      name="total_rent"
                      label="Total Rent/Bill Amount"
                      type="number"
                      required
                    />
                  </div>
                  <div className="w-full">
                    <InputField name="remarks" label="Remarks" required />
                  </div>
                </div>
              </div>
            )}

            {/* Conditionally Show Suzuki Fields */}
            {selectedCustomer === "Suzuki" && (
              <div className="border border-gray-300 p-5 rounded-md mt-3">
                <div className="mt-5 md:mt-1 md:flex justify-between gap-3">
                  <div className="w-full relative">
                    <SelectField
                      name="transport_type"
                      label="Transport Type"
                      required
                      options={[
                        { value: "own_transport", label: "Own Transport" },
                        {
                          value: "vendor_transport",
                          label: "Vendor Transport",
                        },
                      ]}
                    />
                  </div>
                  {selectedTransport === "vendor_transport" ? (
                    <div className="w-full">
                      <SelectField
                        name="vendor_name"
                        label="Vendor Name"
                        required={true}
                        options={vendorOptions}
                        control={control}
                      />
                    </div>
                  ) : (
                    ""
                  )}
                  <div className="w-full">
                    <InputField
                      name="dealer_name"
                      label="Dealer Name"
                      required
                    />
                  </div>
                </div>
                <div className="mt-5 md:mt-1 md:flex justify-between gap-3">
                  <div className="w-full">
                    {selectedTransport === "own_transport" ? (
                      <SelectField
                        name="vehicle_no"
                        label="Vehicle No."
                        required={true}
                        options={vehicleOptions}
                        control={control}
                      />
                    ) : selectedTransport === "vendor_transport" ? (
                      <SelectField
                        name="vehicle_no"
                        label="Vehicle No."
                        required={true}
                        options={vendorVehicleOptions}
                        control={control}
                      />
                    ) : (
                      <SelectField
                        name="vehicle_no"
                        label="Vehicle No."
                        defaultValue={"Please select transport first"}
                        required={true}
                        options={[
                          {
                            label: "Please select transport first",
                            value: "",
                            disabled: true,
                          },
                        ]}
                        control={control}
                      />
                    )}
                  </div>
                  <div className="w-full">
                    {selectedTransport === "own_transport" ? (
                      <SelectField
                        name="driver_name"
                        label="Driver Name"
                        required
                        control={control}
                        options={ownDriverOptions}
                        onSelectChange={(selectedOption) => {
                          setValue(
                            "driver_mobile",
                            selectedOption?.contact || ""
                          );
                        }}
                      />
                    ) : selectedTransport === "vendor_transport" ? (
                      <SelectField
                        name="driver_name"
                        label="Driver Name"
                        required
                        control={control}
                        options={vendorDriverOptions}
                      />
                    ) : (
                      <SelectField
                        name="driver_name"
                        label="Driver Name"
                        required
                        control={control}
                        options={[
                          {
                            label: "Please select transport first",
                            value: "",
                            disabled: true,
                          },
                        ]}
                      />
                    )}
                  </div>
                  <div className="w-full">
                    <InputField name="do_si" label="Do(SI)" required />
                  </div>
                  <div className="w-full">
                    <InputField name="co_u" label="CO(U)" required />
                  </div>
                </div>
                <div className="mt-5 md:mt-1 md:flex justify-between gap-3">
                  <div className="w-full">
                    <InputField
                      name="quantity"
                      label="Bike/Quantity"
                      type="number"
                      required
                    />
                  </div>
                  <div className="w-full">
                    <InputField name="masking" label="Masking" required />
                  </div>
                  <div className="w-full">
                    <InputField
                      name="unload_charge"
                      label="Unload Charge"
                      type="number"
                      required
                    />
                  </div>
                </div>
                <div className="mt-5 md:mt-1 md:flex justify-between gap-3">
                  <div className="w-full">
                    <InputField
                      name="extra_fare"
                      label="Extra Fare"
                      type="number"
                      required
                    />
                  </div>

                  <div className="w-full">
                    <InputField
                      name="total_rent"
                      label="Total Rent/Bill Amount"
                      type="number"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Conditionally Show Honda Fields */}
            {selectedCustomer === "Honda" && (
              <div className="border border-gray-300 p-5 rounded-md mt-3">
                <div className="mt-5 md:mt-1 md:flex justify-between gap-3">
                  <div className="w-full relative">
                    <SelectField
                      name="transport_type"
                      label="Transport Type"
                      required
                      options={[
                        { value: "own_transport", label: "Own Transport" },
                        {
                          value: "vendor_transport",
                          label: "Vendor Transport",
                        },
                      ]}
                    />
                  </div>
                  {selectedTransport === "vendor_transport" ? (
                    <div className="w-full">
                      <SelectField
                        name="vendor_name"
                        label="Vendor Name"
                        required={true}
                        options={vendorOptions}
                        control={control}
                      />
                    </div>
                  ) : (
                    ""
                  )}
                  <div className="w-full">
                    <InputField
                      name="dealer_name"
                      label="Dealer Name"
                      required
                    />
                  </div>
                </div>
                <div className="mt-5 md:mt-1 md:flex justify-between gap-3">
                  <div className="w-full">
                    {selectedTransport === "own_transport" ? (
                      <SelectField
                        name="vehicle_no"
                        label="Vehicle No."
                        required={true}
                        options={vehicleOptions}
                        control={control}
                      />
                    ) : selectedTransport === "vendor_transport" ? (
                      <SelectField
                        name="vehicle_no"
                        label="Vehicle No."
                        required={true}
                        options={vendorVehicleOptions}
                        control={control}
                      />
                    ) : (
                      <SelectField
                        name="vehicle_no"
                        label="Vehicle No."
                        defaultValue={"Please select transport first"}
                        required={true}
                        options={[
                          {
                            label: "Please select transport first",
                            value: "",
                            disabled: true,
                          },
                        ]}
                        control={control}
                      />
                    )}
                  </div>
                  <div className="w-full">
                    {selectedTransport === "own_transport" ? (
                      <SelectField
                        name="driver_name"
                        label="Driver Name"
                        required
                        control={control}
                        options={ownDriverOptions}
                        onSelectChange={(selectedOption) => {
                          setValue(
                            "driver_mobile",
                            selectedOption?.contact || ""
                          );
                        }}
                      />
                    ) : selectedTransport === "vendor_transport" ? (
                      <SelectField
                        name="driver_name"
                        label="Driver Name"
                        required
                        control={control}
                        options={vendorDriverOptions}
                      />
                    ) : (
                      <SelectField
                        name="driver_name"
                        label="Driver Name"
                        required
                        control={control}
                        options={[
                          {
                            label: "Please select transport first",
                            value: "",
                            disabled: true,
                          },
                        ]}
                      />
                    )}
                  </div>
                  <div className="w-full">
                    <InputField
                      name="driver_mobile"
                      label="Driver Mobile"
                      type="number"
                      required
                    />
                  </div>
                </div>
                <div className="mt-5 md:mt-1 md:flex justify-between gap-3">
                  <div className="w-full">
                    <InputField name="do_si" label="DO(SI)" required />
                  </div>
                  <div className="w-full">
                    <InputField name="no_of_trip" label="No of Trip" required />
                  </div>
                  <div className="w-full">
                    <InputField
                      name="quantity"
                      label="Quantity"
                      type="number"
                      required
                    />
                  </div>
                </div>
                <div className="mt-5 md:mt-1 md:flex justify-between gap-3">
                  <div className="w-full">
                    <InputField
                      name="vehicle_mode"
                      label="Vehicle Mode"
                      required
                    />
                  </div>
                  <div className="w-full">
                    <InputField
                      name="per_truck_rent"
                      label="Per Truck Rent"
                      type="number"
                      required
                    />
                  </div>
                  <div className="w-full">
                    <InputField
                      name="total_rent"
                      label="Total Rent/Bill Amount"
                      type="number"
                      required
                      readOnly
                      defaultValue={totalRentHonda}
                      value={totalRentHonda}
                    />
                  </div>
                  <div className="w-full">
                    <InputField name="vat" label="Vat" type="number" required />
                  </div>
                </div>
              </div>
            )}
            {/* Conditionally Show Guest Fields */}
            {selectedCustomer === "Guest" && (
              <div className="border border-gray-300 p-5 rounded-md mt-3">
                <div className="mt-5 md:mt-1 md:flex justify-between gap-3">
                  <div className="w-full relative">
                    <SelectField
                      name="transport_type"
                      label="Transport Type"
                      required
                      options={[
                        { value: "own_transport", label: "Own Transport" },
                        {
                          value: "vendor_transport",
                          label: "Vendor Transport",
                        },
                      ]}
                    />
                  </div>
                  <div className="w-full">
                    {selectedTransport === "own_transport" ? (
                      <SelectField
                        name="vehicle_no"
                        label="Vehicle No."
                        required={true}
                        options={vehicleOptions}
                        control={control}
                      />
                    ) : selectedTransport === "vendor_transport" ? (
                      <SelectField
                        name="vehicle_no"
                        label="Vehicle No."
                        required={true}
                        options={vendorVehicleOptions}
                        control={control}
                      />
                    ) : (
                      <SelectField
                        name="vehicle_no"
                        label="Vehicle No."
                        defaultValue={"Please select transport first"}
                        required={true}
                        options={[
                          {
                            label: "Please select transport first",
                            value: "",
                            disabled: true,
                          },
                        ]}
                        control={control}
                      />
                    )}
                  </div>
                </div>
                <div className="mt-5 md:mt-1 md:flex justify-between gap-3">
                  <div className="w-[50%]">
                    {selectedTransport === "own_transport" ? (
                      <SelectField
                        name="driver_name"
                        label="Driver Name"
                        required
                        control={control}
                        options={ownDriverOptions}
                        onSelectChange={(selectedOption) => {
                          setValue(
                            "driver_mobile",
                            selectedOption?.contact || ""
                          );
                        }}
                      />
                    ) : selectedTransport === "vendor_transport" ? (
                      <SelectField
                        name="driver_name"
                        label="Driver Name"
                        required
                        control={control}
                        options={vendorDriverOptions}
                      />
                    ) : (
                      <SelectField
                        name="driver_name"
                        label="Driver Name"
                        required
                        control={control}
                        options={[
                          {
                            label: "Please select transport first",
                            value: "",
                            disabled: true,
                          },
                        ]}
                      />
                    )}
                  </div>
                  {/* <div className="w-full">
                    <InputField
                      name="fuel_cost"
                      label="Fuel Cost"
                      type="number"
                      required
                    />
                  </div> */}
                </div>
              </div>
            )}
            {/* transport type input field */}
            {selectedTransport === "own_transport" && (
              <div className="border border-gray-300 p-5 rounded-md mt-5">
                <div className="mt-5 md:mt-1 md:flex justify-between gap-3">
                  <div className="w-full">
                    <InputField
                      name="driver_adv"
                      label="Driver Advance"
                      required
                      type="number"
                    />
                  </div>
                  <div className="w-full">
                    <InputField
                      name="driver_commission"
                      label="Driver Commission"
                      required
                      type="number"
                    />
                  </div>
                  <div className="w-full">
                    <InputField
                      name="labor"
                      label="Labour Cost"
                      type="number"
                    />
                  </div>
                  <div className="w-full">
                    <InputField
                      name="parking_cost"
                      label="Parking Cost"
                      type="number"
                    />
                  </div>
                </div>
                <div className="mt-5 md:mt-1 md:flex justify-between gap-3">
                  <div className="w-full">
                    <InputField
                      name="night_guard"
                      label="Night Guard Cost"
                      type="number"
                    />
                  </div>
                  <div className="w-full">
                    <InputField
                      name="toll_cost"
                      label="Toll Cost"
                      type="number"
                    />
                  </div>
                  <div className="w-full">
                    <InputField
                      name="feri_cost"
                      label="Feri Cost"
                      type="number"
                    />
                  </div>
                  <div className="w-full">
                    <InputField
                      name="police_cost"
                      label="Police Cost"
                      type="number"
                    />
                  </div>
                </div>
                <div className="mt-5 md:mt-1 md:flex justify-between gap-3">
                  <div className="w-full">
                    <InputField name="chada" label="Chada" type="number" />
                  </div>
                  <div className="w-full">
          <InputField
            name="fuel_cost"
            label="Fuel Cost"
            type="number"
          />
        </div>
        <div className="w-full">
          <InputField
            name="callan_cost"
            label="Callan Cost"
            type="number"
          />
        </div>
        <div className="w-full">
          <InputField
            name="others_cost"
            label="Others Cost"
            type="number"
          />
        </div>

                  <div className="w-full">
                    <InputField
                      name="total_exp"
                      label="Total Expense"
                      readOnly
                      defaultValue={totalExpense}
                      value={totalExpense}
                      required
                    />
                  </div>
                </div>
              </div>
            )}
            {selectedTransport === "vendor_transport" && (
              <div className="border border-gray-300 p-5 rounded-md mt-5 md:mt-3 md:flex justify-between gap-3">
                <div className="w-full">
                  <InputField
                    name="total_exp"
                    label="Trip Rent"
                    required
                    type="number"
                  />
                </div>
                <div className="w-full">
                  <InputField
                    name="advance"
                    label="Advance"
                    type="number"
                    required
                  />
                </div>
                <div className="w-full">
                  <InputField
                    name="due_amount"
                    label="Due Amount"
                    type="number"
                    required
                  />
                </div>
              </div>
            )}
            {/* Submit Button */}
            <div className="text-left p-5">
              <BtnSubmit>Submit</BtnSubmit>
            </div>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};

export default AddTripForm;
